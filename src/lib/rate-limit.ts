import { getDB } from "./db";

export type LimitCheck = {
  blocked: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

type LimitRow = { count: number; reset_at: number };

/** Confere sem incrementar, usado antes de validar credenciais. */
export async function checkLimit(key: string, limit: number): Promise<LimitCheck> {
  const db = await getDB();
  const row = db
    .prepare("SELECT count, reset_at FROM rate_limits WHERE key = ?")
    .get(key) as LimitRow | undefined;

  const now = Date.now();
  if (!row || row.reset_at <= now) {
    return { blocked: false, remaining: limit, retryAfterSeconds: 0 };
  }

  const retryAfterSeconds = Math.ceil((row.reset_at - now) / 1000);
  return {
    blocked: row.count >= limit,
    remaining: Math.max(0, limit - row.count),
    retryAfterSeconds,
  };
}

/** Registra uma tentativa (normalmente uma falha) na janela atual. */
export async function hitLimit(key: string, windowMs: number) {
  const db = await getDB();
  const now = Date.now();
  const row = db
    .prepare("SELECT count, reset_at FROM rate_limits WHERE key = ?")
    .get(key) as LimitRow | undefined;

  if (!row || row.reset_at <= now) {
    db.prepare(
      `INSERT INTO rate_limits (key, count, reset_at) VALUES (?, 1, ?)
       ON CONFLICT(key) DO UPDATE SET count = 1, reset_at = excluded.reset_at`,
    ).run(key, now + windowMs);
    return;
  }

  db.prepare("UPDATE rate_limits SET count = count + 1 WHERE key = ?").run(key);
}

export async function resetLimit(key: string) {
  const db = await getDB();
  db.prepare("DELETE FROM rate_limits WHERE key = ?").run(key);
}
