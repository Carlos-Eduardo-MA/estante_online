import crypto from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import { getDB } from "./db";
import {
  SESSION_COOKIE,
  SESSION_TTL_MS,
  SESSION_TTL_SECONDS,
} from "./session-cookie";
import type { User } from "./types";

type SessionRow = {
  id: string;
  name: string;
  email: string;
  created_at: number;
  expires_at: number;
};

const globalForSecret = globalThis as unknown as { __estanteSecretWarned?: boolean };

function secret() {
  const configured = process.env.SESSION_SECRET;
  if (configured && configured.length >= 16) return configured;

  if (process.env.NODE_ENV === "production" && !globalForSecret.__estanteSecretWarned) {
    globalForSecret.__estanteSecretWarned = true;
    console.warn(
      "[estante] SESSION_SECRET ausente. Defina um segredo longo em produção para proteger as sessões.",
    );
  }
  return "estante-segredo-apenas-para-desenvolvimento";
}

/**
 * O token que vai para o cookie é aleatório; o banco guarda apenas um HMAC dele.
 * Assim, um vazamento do banco não permite sequestrar sessões ativas.
 */
function tokenDigest(token: string) {
  return crypto.createHmac("sha256", secret()).update(token).digest("hex");
}

function isSecureRequest(request: Request) {
  const forwardedProto = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim()
    .toLowerCase();
  return new URL(request.url).protocol === "https:" || forwardedProto === "https";
}

export async function createSession(userId: string, request: Request) {
  const db = await getDB();
  const token = crypto.randomBytes(32).toString("base64url");
  const now = Date.now();

  db.prepare(
    "INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)",
  ).run(tokenDigest(token), userId, now, now + SESSION_TTL_MS);

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureRequest(request),
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (token) {
    const db = await getDB();
    db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenDigest(token));
  }

  store.delete(SESSION_COOKIE);
}

/** Usuário da sessão atual; memoizado por requisição. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const db = await getDB();
  const now = Date.now();
  const row = db
    .prepare(
      `SELECT u.id, u.name, u.email, u.created_at, s.expires_at
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.expires_at > ?`,
    )
    .get(tokenDigest(token), now) as SessionRow | undefined;

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
  };
});
