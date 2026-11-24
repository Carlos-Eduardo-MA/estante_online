import crypto from "node:crypto";
import { getDB } from "./db";
import type { Book, BookStatus } from "./types";

type BookRow = {
  id: string;
  external_id: string;
  title: string;
  authors: string;
  cover_url: string | null;
  year: number | null;
  status: BookStatus;
  rating: number | null;
  note: string | null;
  created_at: number;
  updated_at: number;
};

export type NewBook = {
  externalId: string;
  title: string;
  authors: string[];
  coverUrl: string | null;
  year: number | null;
  status: BookStatus;
};

export class DuplicateBookError extends Error {}

function toBook(row: BookRow): Book {
  let authors: string[] = [];
  try {
    const parsed: unknown = JSON.parse(row.authors);
    if (Array.isArray(parsed)) {
      authors = parsed.filter((item): item is string => typeof item === "string");
    }
  } catch {
    authors = [];
  }

  return {
    id: row.id,
    externalId: row.external_id,
    title: row.title,
    authors,
    coverUrl: row.cover_url,
    year: row.year,
    status: row.status,
    rating: row.rating,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function selectBook(userId: string, id: string) {
  return getDB().then((db) => {
    const row = db
      .prepare(
        `SELECT id, external_id, title, authors, cover_url, year, status, rating, note, created_at, updated_at
         FROM books WHERE id = ? AND user_id = ?`,
      )
      .get(id, userId) as BookRow | undefined;
    return row ? toBook(row) : null;
  });
}

export async function listBooks(userId: string): Promise<Book[]> {
  const db = await getDB();
  const rows = db
    .prepare(
      `SELECT id, external_id, title, authors, cover_url, year, status, rating, note, created_at, updated_at
       FROM books WHERE user_id = ? ORDER BY created_at DESC`,
    )
    .all(userId) as BookRow[];

  return rows.map(toBook);
}

export async function addBook(userId: string, input: NewBook): Promise<Book> {
  const db = await getDB();
  const now = Date.now();
  const id = `b_${crypto.randomUUID().slice(0, 12)}`;

  try {
    db.prepare(
      `INSERT INTO books
         (id, user_id, external_id, title, authors, cover_url, year, status, rating, note, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?)`,
    ).run(
      id,
      userId,
      input.externalId,
      input.title,
      JSON.stringify(input.authors),
      input.coverUrl,
      input.year,
      input.status,
      now,
      now,
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
      throw new DuplicateBookError("Este livro já está na sua estante.");
    }
    throw error;
  }

  const book = await selectBook(userId, id);
  if (!book) throw new Error("Livro não encontrado após inserção.");
  return book;
}

export type BookPatch = {
  status?: BookStatus;
  rating?: number | null;
  note?: string | null;
};

export async function updateBook(userId: string, id: string, patch: BookPatch): Promise<Book | null> {
  const db = await getDB();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (patch.status !== undefined) {
    fields.push("status = ?");
    values.push(patch.status);
  }
  if (patch.rating !== undefined) {
    fields.push("rating = ?");
    values.push(patch.rating);
  }
  if (patch.note !== undefined) {
    fields.push("note = ?");
    values.push(patch.note);
  }
  if (fields.length === 0) return selectBook(userId, id);

  fields.push("updated_at = ?");
  values.push(Date.now());

  const result = db
    .prepare(`UPDATE books SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`)
    .run(...values, id, userId);

  if (result.changes === 0) return null;
  return selectBook(userId, id);
}

export async function removeBook(userId: string, id: string): Promise<boolean> {
  const db = await getDB();
  // O filtro por user_id impede que um ID de outra pessoa seja apagado (IDOR).
  const result = db
    .prepare("DELETE FROM books WHERE id = ? AND user_id = ?")
    .run(id, userId);
  return result.changes > 0;
}
