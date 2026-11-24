"use client";

import { useEffect, useRef, useState } from "react";
import type { BookStatus, SearchResult } from "@/lib/types";
import { BOOK_STATUS_LABELS } from "@/lib/types";
import { BookCover } from "./book-cover";

type SearchState = "idle" | "loading" | "ready" | "error";

export function SearchPanel({
  existingExternalIds,
  onAdd,
  onClose,
}: {
  existingExternalIds: Set<string>;
  onAdd: (result: SearchResult, status: BookStatus) => Promise<boolean>;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [status, setStatus] = useState<SearchState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [targetStatus, setTargetStatus] = useState<BookStatus>("quero_ler");
  const [addingId, setAddingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setStatus("idle");
      setError(null);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setStatus("loading");
      setError(null);

      try {
        const response = await fetch(`/api/livros/busca?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        const data = (await response.json()) as { results?: SearchResult[]; error?: string };

        if (!response.ok) {
          throw new Error(data.error ?? "Não foi possível buscar.");
        }

        setResults(data.results ?? []);
        setStatus("ready");
      } catch (caught) {
        if (controller.signal.aborted) return;
        setStatus("error");
        setError(caught instanceof Error ? caught.message : "Não foi possível buscar.");
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  async function handleAdd(result: SearchResult) {
    setAddingId(result.externalId);
    await onAdd(result, targetStatus);
    setAddingId(null);
  }

  return (
    <section className="card animate-fade-up p-5 sm:p-6" aria-label="Buscar livros">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Buscar no catálogo</h2>
          <p className="mt-1 text-xs text-muted">
            Pesquisa por título ou autor na Open Library, processada no servidor.
          </p>
        </div>
        <button type="button" onClick={onClose} className="btn-ghost" aria-label="Fechar busca">
          <svg viewBox="0 0 20 20" className="size-4.5" fill="none" aria-hidden="true">
            <path
              d="m5 5 10 10M15 5 5 15"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
        <div className="relative flex-1">
          <svg
            viewBox="0 0 20 20"
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="m17 17-3.6-3.6M15 9a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="input pl-10"
            placeholder="Ex.: Machado de Assis, Dune, Clarice Lispector"
            maxLength={80}
            aria-label="Buscar livros por título ou autor"
          />
        </div>
        <label className="flex items-center gap-2 rounded-xl border border-line bg-field px-3 text-xs font-medium text-muted">
          Adicionar em
          <select
            value={targetStatus}
            onChange={(event) => setTargetStatus(event.target.value as BookStatus)}
            className="rounded-lg bg-transparent py-2 text-xs font-semibold text-ink outline-none"
            aria-label="Prateleira de destino"
          >
            {(Object.keys(BOOK_STATUS_LABELS) as BookStatus[]).map((key) => (
              <option key={key} value={key}>
                {BOOK_STATUS_LABELS[key]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5" aria-live="polite">
        {status === "idle" ? (
          <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-xs text-muted">
            Digite ao menos 2 caracteres para buscar no catálogo.
          </p>
        ) : null}

        {status === "loading" ? (
          <div className="space-y-2">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="flex animate-pulse items-center gap-3 rounded-xl border border-line/60 p-2.5"
              >
                <div className="h-16 w-11 rounded-md bg-line/60" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-2/3 rounded bg-line/60" />
                  <div className="h-2.5 w-1/3 rounded bg-line/50" />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {status === "error" ? (
          <p className="rounded-xl border border-wine/20 bg-wine-soft px-4 py-3 text-sm text-wine">
            {error}
          </p>
        ) : null}

        {status === "ready" && results.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-xs text-muted">
            Nenhum livro encontrado para “{query.trim()}”. Tente outro termo.
          </p>
        ) : null}

        {status === "ready" && results.length > 0 ? (
          <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {results.map((result) => {
              const alreadyAdded = existingExternalIds.has(result.externalId);
              const adding = addingId === result.externalId;

              return (
                <li
                  key={result.externalId}
                  className="flex items-center gap-3 rounded-xl border border-line/70 bg-field p-2.5"
                >
                  <div className="h-16 w-11 shrink-0 overflow-hidden rounded-md bg-line/40">
                    <BookCover src={result.coverUrl} title={result.title} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{result.title}</p>
                    <p className="truncate text-xs text-muted">
                      {result.authors.length > 0 ? result.authors.join(", ") : "Autoria desconhecida"}
                      {result.year ? ` · ${result.year}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAdd(result)}
                    disabled={alreadyAdded || adding}
                    className="btn-secondary shrink-0 px-3 py-2 text-xs"
                  >
                    {alreadyAdded ? "Na estante" : adding ? "..." : "Adicionar"}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
