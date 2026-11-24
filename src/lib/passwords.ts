import crypto from "node:crypto";

const SCRYPT_COST = 16384;
const SCRYPT_BLOCK_SIZE = 8;
const SCRYPT_PARALLELIZATION = 1;
const KEY_LENGTH = 64;
const SALT_BYTES = 16;

function deriveKey(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(
      password,
      salt,
      KEY_LENGTH,
      { N: SCRYPT_COST, r: SCRYPT_BLOCK_SIZE, p: SCRYPT_PARALLELIZATION },
      (error, key) => (error ? reject(error) : resolve(key)),
    );
  });
}

/**
 * Guarda a senha no formato scrypt$N$r$p$salt$hash.
 * Nunca armazenamos a senha em texto puro nem usamos MD5/SHA puro.
 */
export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(SALT_BYTES);
  const hash = await deriveKey(password, salt);
  return [
    "scrypt",
    SCRYPT_COST,
    SCRYPT_BLOCK_SIZE,
    SCRYPT_PARALLELIZATION,
    salt.toString("base64url"),
    hash.toString("base64url"),
  ].join("$");
}

export async function verifyPassword(stored: string, password: string) {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const [, cost, blockSize, parallelization, salt, hash] = parts;
  const storedHash = Buffer.from(hash, "base64url");
  if (storedHash.length !== KEY_LENGTH) return false;

  const derived = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(
      password,
      Buffer.from(salt, "base64url"),
      KEY_LENGTH,
      {
        N: Number(cost),
        r: Number(blockSize),
        p: Number(parallelization),
      },
      (error, key) => (error ? reject(error) : resolve(key)),
    );
  });

  return crypto.timingSafeEqual(storedHash, derived);
}

/**
 * Hash descartável usado quando o e-mail não existe, para que o tempo de
 * resposta do login não revele quais e-mails estão cadastrados.
 */
let dummyHash: string | null = null;
export async function getDummyHash() {
  if (!dummyHash) dummyHash = await hashPassword("senha-inexistente-para-tempo-constante");
  return dummyHash;
}
