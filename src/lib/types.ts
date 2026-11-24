export type BookStatus = "quero_ler" | "lendo" | "lido";

export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: number;
};

export type Book = {
  id: string;
  externalId: string;
  title: string;
  authors: string[];
  coverUrl: string | null;
  year: number | null;
  status: BookStatus;
  rating: number | null;
  note: string | null;
  createdAt: number;
  updatedAt: number;
};

export type SearchResult = {
  externalId: string;
  title: string;
  authors: string[];
  coverUrl: string | null;
  year: number | null;
};

export const BOOK_STATUS_LABELS: Record<BookStatus, string> = {
  quero_ler: "Quero ler",
  lendo: "Lendo",
  lido: "Lido",
};
