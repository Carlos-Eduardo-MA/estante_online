import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { DEMO_EMAIL, DEMO_PASSWORD } from "./demo";

const SCHEMA = `
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at    INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

  CREATE TABLE IF NOT EXISTS books (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    external_id TEXT NOT NULL,
    title       TEXT NOT NULL,
    authors     TEXT NOT NULL,
    cover_url   TEXT,
    year        INTEGER,
    status      TEXT NOT NULL CHECK (status IN ('quero_ler', 'lendo', 'lido')),
    rating      INTEGER CHECK (rating BETWEEN 1 AND 5),
    note        TEXT,
    created_at  INTEGER NOT NULL,
    updated_at  INTEGER NOT NULL,
    UNIQUE (user_id, external_id)
  );
  CREATE INDEX IF NOT EXISTS idx_books_user_status ON books(user_id, status);

  CREATE TABLE IF NOT EXISTS rate_limits (
    key      TEXT PRIMARY KEY,
    count    INTEGER NOT NULL,
    reset_at INTEGER NOT NULL
  );
`;

const DEMO_USER_ID = "u_demo";

type SeedBook = {
  externalId: string;
  title: string;
  authors: string[];
  coverId: number;
  year: number;
  status: "quero_ler" | "lendo" | "lido";
  rating: number | null;
  note: string | null;
};

const DEMO_BOOKS: SeedBook[] = [
  {
    externalId: "/works/OL1003040W",
    title: "Dom Casmurro",
    authors: ["Machado de Assis"],
    coverId: 647501,
    year: 1899,
    status: "lido",
    rating: 5,
    note: "Capitu traiu? Reler com atenção às entrelinhas do Bentinho.",
  },
  {
    externalId: "/works/OL27482W",
    title: "The Hobbit",
    authors: ["J.R.R. Tolkien"],
    coverId: 14627509,
    year: 1937,
    status: "lendo",
    rating: 4,
    note: "Leitura leve para as noites de semana.",
  },
  {
    externalId: "/works/OL17075811W",
    title: "Sapiens",
    authors: ["Yuval Noah Harari"],
    coverId: 8634250,
    year: 2011,
    status: "quero_ler",
    rating: null,
    note: null,
  },
  {
    externalId: "/works/OL1168083W",
    title: "Nineteen Eighty-Four",
    authors: ["George Orwell"],
    coverId: 9267242,
    year: 1949,
    status: "lido",
    rating: 5,
    note: "Assustadoramente atual.",
  },
];

function seedDemo(db: Database.Database) {
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(DEMO_EMAIL);
  if (existing) return;

  const now = Date.now();
  db.prepare(
    "INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)",
  ).run(
    DEMO_USER_ID,
    "Leitora de Demonstração",
    DEMO_EMAIL,
    // O hash é síncrono apenas no seed; o restante da aplicação usa scrypt assíncrono.
    hashSyncForSeed(DEMO_PASSWORD),
    now,
  );

  const insertBook = db.prepare(`
    INSERT INTO books
      (id, user_id, external_id, title, authors, cover_url, year, status, rating, note, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  DEMO_BOOKS.forEach((book, index) => {
    insertBook.run(
      `b_demo_${index + 1}`,
      DEMO_USER_ID,
      book.externalId,
      book.title,
      JSON.stringify(book.authors),
      `https://covers.openlibrary.org/b/id/${book.coverId}-L.jpg`,
      book.year,
      book.status,
      book.rating,
      book.note,
      now - index * 1000,
      now - index * 1000,
    );
  });
}

// O seed roda uma única vez na inicialização, então o custo de bloquear aqui é aceitável.
function hashSyncForSeed(password: string) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return ["scrypt", 16384, 8, 1, salt.toString("base64url"), hash.toString("base64url")].join("$");
}

async function initialize() {
  const dataDir = path.join(process.cwd(), "data");
  fs.mkdirSync(dataDir, { recursive: true });

  const dbPath = process.env.DATABASE_PATH ?? path.join(dataDir, "estante.db");
  const db = new Database(dbPath);
  db.exec(SCHEMA);

  seedDemo(db);

  // Higiene: remove sessões expiradas e janelas de rate limit antigas.
  const now = Date.now();
  db.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(now);
  db.prepare("DELETE FROM rate_limits WHERE reset_at <= ?").run(now);

  return db;
}

const globalForDb = globalThis as unknown as {
  __estanteDb?: Promise<Database.Database>;
};

/** Conexão única reaproveitada entre requisições (e entre hot reloads no dev). */
export function getDB() {
  if (!globalForDb.__estanteDb) {
    globalForDb.__estanteDb = initialize();
  }
  return globalForDb.__estanteDb;
}
