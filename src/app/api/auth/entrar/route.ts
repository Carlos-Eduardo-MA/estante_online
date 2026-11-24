import { getDB } from "@/lib/db";
import { fail, getClientIp, isSameOrigin, json, readJson, tooManyRequests } from "@/lib/http";
import { getDummyHash, verifyPassword } from "@/lib/passwords";
import { checkLimit, hitLimit, resetLimit } from "@/lib/rate-limit";
import { createSession } from "@/lib/session";
import { firstIssue, loginSchema } from "@/lib/validation";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_BY_ACCOUNT = 5;
const MAX_BY_IP = 20;

type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: number;
};

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return fail(403, "Origem não permitida.");
  }

  const body = await readJson(request);
  if (!body.ok) return body.response;

  const parsed = loginSchema.safeParse(body.value);
  if (!parsed.success) {
    return fail(400, firstIssue(parsed.error));
  }

  const { email, password } = parsed.data;
  const ip = getClientIp(request);
  const accountKey = `entrar:${ip}:${email}`;
  const ipKey = `entrar:${ip}`;

  const [accountLimit, ipLimit] = await Promise.all([
    checkLimit(accountKey, MAX_BY_ACCOUNT),
    checkLimit(ipKey, MAX_BY_IP),
  ]);
  if (accountLimit.blocked || ipLimit.blocked) {
    return tooManyRequests(
      Math.max(accountLimit.retryAfterSeconds, ipLimit.retryAfterSeconds),
    );
  }

  const db = await getDB();
  const user = db
    .prepare("SELECT id, name, email, password_hash, created_at FROM users WHERE email = ?")
    .get(email) as UserRow | undefined;

  // Se o e-mail não existe, verificamos contra um hash descartável para que o
  // tempo de resposta seja parecido com o de uma senha errada.
  const storedHash = user?.password_hash ?? (await getDummyHash());
  const validPassword = await verifyPassword(storedHash, password);

  if (!user || !validPassword) {
    await Promise.all([hitLimit(accountKey, WINDOW_MS), hitLimit(ipKey, WINDOW_MS)]);
    return fail(401, "E-mail ou senha inválidos.");
  }

  await Promise.all([resetLimit(accountKey), resetLimit(ipKey)]);
  await createSession(user.id, request);

  return json({
    user: { id: user.id, name: user.name, email: user.email, createdAt: user.created_at },
  });
}
