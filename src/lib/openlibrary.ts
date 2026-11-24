import type { SearchResult } from "./types";

const SEARCH_URL = "https://openlibrary.org/search.json";
const REQUEST_TIMEOUT_MS = 6000;
const CACHE_SECONDS = 300;

type OpenLibraryDoc = {
  key?: unknown;
  title?: unknown;
  author_name?: unknown;
  first_publish_year?: unknown;
  cover_i?: unknown;
};

type OpenLibraryResponse = {
  docs?: unknown;
};

export class OpenLibraryError extends Error {}

function coverUrl(coverId: unknown) {
  return typeof coverId === "number" && Number.isInteger(coverId) && coverId > 0
    ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
    : null;
}

/**
 * A busca acontece sempre no servidor: o navegador nunca fala com a Open Library,
 * o que evita CORS, permite cache, timeout e limitação de uso por usuário.
 */
export async function searchOpenLibrary(query: string): Promise<SearchResult[]> {
  const url = new URL(SEARCH_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "12");
  url.searchParams.set(
    "fields",
    "key,title,author_name,first_publish_year,cover_i,edition_count",
  );

  let response: Response;
  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: {
        Accept: "application/json",
        "User-Agent": "Estante/1.0 (projeto de demonstração)",
      },
      next: { revalidate: CACHE_SECONDS },
    });
  } catch {
    throw new OpenLibraryError("Não foi possível consultar o catálogo agora.");
  }

  if (!response.ok) {
    throw new OpenLibraryError("O catálogo está indisponível no momento.");
  }

  let payload: OpenLibraryResponse;
  try {
    payload = (await response.json()) as OpenLibraryResponse;
  } catch {
    throw new OpenLibraryError("O catálogo retornou uma resposta inesperada.");
  }

  if (!Array.isArray(payload.docs)) return [];

  // Normalizamos tudo: nada do payload externo chega cru ao cliente.
  return payload.docs
    .filter((doc): doc is OpenLibraryDoc => typeof doc === "object" && doc !== null)
    .map((doc) => {
      const externalId = typeof doc.key === "string" ? doc.key : "";
      const title = typeof doc.title === "string" ? doc.title.trim() : "";
      const authors = Array.isArray(doc.author_name)
        ? doc.author_name.filter((name): name is string => typeof name === "string").slice(0, 5)
        : [];
      const year =
        typeof doc.first_publish_year === "number" &&
        Number.isInteger(doc.first_publish_year) &&
        doc.first_publish_year > 0
          ? doc.first_publish_year
          : null;

      return {
        externalId,
        title,
        authors,
        year,
        coverUrl: coverUrl(doc.cover_i),
      };
    })
    .filter(
      (book) =>
        /^\/works\/[A-Za-z0-9]+$/.test(book.externalId) &&
        book.title.length > 0 &&
        book.title.length <= 300,
    );
}
