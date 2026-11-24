import crypto from "node:crypto";
import { getDB } from "@/lib/db";
import { fail, isSameOrigin, json, readJson, tooManyRequests, getClientIp } from "@/lib/http";
import { hashPassword } from "@/lib/passwords";
import { checkLimit, hitLimit } from "@/lib/rate-limit";
import { createSession } from "@/lib/session";
import { firstIssue, registerSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return fail(403, "Origem não permitida.");
  }

  const ip = getClientIp(request);
  const key = `cadastro:${ip}`;
  const limit = await checkLimit(key, 5);
  if (limit.blocked) return tooManyRequests(limit.retryAfterSeconds);
  // Cada tentativa conta, inclusive as inválidas, para desencorajar automação.
  await hitLimit(key, 60 * 60 * 1000);

  const body = await readJson(request);
  if (!body.ok) return body.response;

  const parsed = registerSchema.safeParse(body.value);
  if (!parsed.success) {
    return fail(400, firstIssue(parsed.error));
  }

  const { name, email, password } = parsed.data;

  const db = await getDB();
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    return fail(409, "Este e-mail já está cadastrado. Tente entrar.");
  }

  const passwordHash = await hashPassword(password);
  const user = {
    id: `u_${crypto.randomUUID().slice(0, 12)}`,
    name,
    email,
    createdAt: Date.now(),
  };

  try {
    db.prepare(
      "INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)",
    ).run(user.id, user.name, user.email, passwordHash, user.createdAt);
  } catch {
    // Corrida entre dois cadastros simultâneos com o mesmo e-mail.
    return fail(409, "Este e-mail já está cadastrado. Tente entrar.");
  }

  await createSession(user.id, request);

  return json({ user }, 201);
}
