"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import type { Book, BookStatus, SearchResult, User } from "@/lib/types";
import { BOOK_STATUS_LABELS } from "@/lib/types";
import { BookCover } from "./book-cover";
import { Logo } from "./logo";
import { SearchPanel } from "./search-panel";
import { Stars } from "./stars";

type Filter = "todas" | BookStatus;
type Notice = { kind: "success" | "error"; text: string };
type Patch = { status?: BookStatus; rating?: number | null; note?: string | null };

const FILTERS: { key: Filter; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "quero_ler", label: "Quero ler" },
  { key: "lendo", label: "Lendo" },
  { key: "lido", label: "Lidos" },
];

function BookCard({
  book,
  busy,
  onPatch,
  onRemove,
}: {
  book: Book;
  busy: boolean;
  onPatch: (id: string, patch: Patch) => Promise<boolean>;
  onRemove: (book: Book) => void;
}) {
  const [editingNote, setEditingNote] = useState(false);
  const [draft, setDraft] = useState(book.note ?? "");
  const [savingNote, setSavingNote] = useState(false);

  async function saveNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingNote(true);
    const ok = await onPatch(book.id, { note: draft.trim() || null });
    setSavingNote(false);
    if (ok) setEditingNote(false);
  }

  return (
    <article
      className={`card group flex flex-col overflow-hidden transition ${busy ? "opacity-60" : ""}`}
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-line/40">
        <BookCover src={book.coverUrl} title={book.title} />
        <button
          type="button"
          onClick={() => onRemove(book)}
          disabled={busy}
          aria-label={`Remover ${book.title} da estante`}
          title="Remover da estante"
          className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-paper/90 text-muted opacity-0 shadow-sm backdrop-blur transition hover:text-wine focus-visible:opacity-100 group-hover:opacity-100 disabled:opacity-40"
        >
          <svg viewBox="0 0 20 20" className="size-4" fill="none" aria-hidden="true">
            <path
              d="M4 6h12M8 6V4.5A1.5 1.5 0 0 1 9.5 3h1A1.5 1.5 0 0 1 12 4.5V6m-6 0 .7 9a1.5 1.5 0 0 0 1.5 1.4h3.6a1.5 1.5 0 0 0 1.5-1.4L14 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-display text-lg font-semibold leading-snug">
          {book.title}
        </h3>
        <p className="mt-1 line-clamp-1 text-xs text-muted">
          {book.authors.length > 0 ? book.authors.join(", ") : "Autoria desconhecida"}
          {book.year ? ` · ${book.year}` : ""}
        </p>

        <div className="mt-auto space-y-3 pt-4">
          <div className="flex items-center justify-between gap-2">
            <label className="sr-only" htmlFor={`status-${book.id}`}>
              Prateleira de {book.title}
            </label>
            <select
              id={`status-${book.id}`}
              value={book.status}
              disabled={busy}
              onChange={(event) =>
                onPatch(book.id, { status: event.target.value as BookStatus })
              }
              className={`rounded-full border border-line bg-field px-2.5 py-1.5 text-[11px] font-semibold outline-none transition focus:border-wine/50 ${
                book.status === "lendo" ? "text-wine" : "text-ink"
              }`}
            >
              {(Object.keys(BOOK_STATUS_LABELS) as BookStatus[]).map((key) => (
                <option key={key} value={key}>
                  {BOOK_STATUS_LABELS[key]}
                </option>
              ))}
            </select>

            <Stars
              value={book.rating}
              disabled={busy}
              onChange={(rating) => onPatch(book.id, { rating })}
            />
          </div>

          {editingNote ? (
            <form onSubmit={saveNote} className="space-y-2">
              <label htmlFor={`note-${book.id}`} className="sr-only">
                Resenha de {book.title}
              </label>
              <textarea
                id={`note-${book.id}`}
                value={draft}
                onChange={(event) => setDraft(event.target.value.slice(0, 1000))}
                rows={3}
                maxLength={1000}
                autoFocus
                placeholder="O que você quer lembrar sobre este livro?"
                className="w-full resize-none rounded-xl border border-line bg-field px-3 py-2 text-xs leading-5 outline-none transition focus:border-wine/50 focus:ring-2 focus:ring-wine/10"
              />
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-muted">{draft.length}/1000</span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setDraft(book.note ?? "");
                      setEditingNote(false);
                    }}
                    className="btn-ghost px-2.5 py-1.5 text-[11px]"
                    disabled={savingNote}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary px-3 py-1.5 text-[11px]"
                    disabled={savingNote}
                  >
                    {savingNote ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div>
              {book.note ? (
                <p className="line-clamp-3 rounded-xl bg-cream/70 px-3 py-2 text-[11px] leading-5 text-muted">
                  “{book.note}”
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  setDraft(book.note ?? "");
                  setEditingNote(true);
                }}
                disabled={busy}
                className="mt-1.5 text-[11px] font-semibold text-wine hover:underline disabled:opacity-50"
              >
                {book.note ? "Editar resenha" : "Adicionar resenha"}
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export function Shelf({
  user,
  initialBooks,
}: {
  user: Pick<User, "name" | "email">;
  initialBooks: Book[];
}) {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [filter, setFilter] = useState<Filter>("todas");
  const [searchOpen, setSearchOpen] = useState(false);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function notify(kind: Notice["kind"], text: string) {
    setNotice({ kind, text });
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 5000);
  }

  function markBusy(id: string, busy: boolean) {
    setBusyIds((current) => {
      const next = new Set(current);
      if (busy) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function patchBook(id: string, patch: Patch) {
    markBusy(id, true);
    try {
      const response = await fetch(`/api/estante/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = (await response.json()) as { book?: Book; error?: string };

      if (!response.ok || !data.book) {
        notify("error", data.error ?? "Não foi possível atualizar o livro.");
        return false;
      }

      setBooks((current) => current.map((book) => (book.id === id ? data.book! : book)));
      return true;
    } catch {
      notify("error", "Falha de conexão ao atualizar o livro.");
      return false;
    } finally {
      markBusy(id, false);
    }
  }

  async function removeBook(book: Book) {
    if (!window.confirm(`Remover “${book.title}” da sua estante?`)) return;

    markBusy(book.id, true);
    try {
      const response = await fetch(`/api/estante/${book.id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        notify("error", data.error ?? "Não foi possível remover o livro.");
        return;
      }
      setBooks((current) => current.filter((item) => item.id !== book.id));
      notify("success", `“${book.title}” saiu da estante.`);
    } catch {
      notify("error", "Falha de conexão ao remover o livro.");
    } finally {
      markBusy(book.id, false);
    }
  }

  async function addFromSearch(result: SearchResult, status: BookStatus) {
    try {
      const response = await fetch("/api/estante", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...result, status }),
      });
      const data = (await response.json()) as { book?: Book; error?: string };

      if (!response.ok || !data.book) {
        notify("error", data.error ?? "Não foi possível adicionar o livro.");
        return false;
      }

      setBooks((current) => [data.book!, ...current]);
      notify("success", `“${data.book.title}” entrou em ${BOOK_STATUS_LABELS[data.book.status]}.`);
      return true;
    } catch {
      notify("error", "Falha de conexão ao adicionar o livro.");
      return false;
    }
  }

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/sair", { method: "POST" });
    } finally {
      router.replace("/");
      router.refresh();
    }
  }

  const counts = useMemo(
    () => ({
      todas: books.length,
      quero_ler: books.filter((book) => book.status === "quero_ler").length,
      lendo: books.filter((book) => book.status === "lendo").length,
      lido: books.filter((book) => book.status === "lido").length,
    }),
    [books],
  );

  const averageRating = useMemo(() => {
    const rated = books.filter((book) => book.rating !== null);
    if (rated.length === 0) return "-";
    const total = rated.reduce((sum, book) => sum + (book.rating ?? 0), 0);
    return (total / rated.length).toFixed(1).replace(".", ",");
  }, [books]);

  const visibleBooks = filter === "todas" ? books : books.filter((book) => book.status === filter);
  const existingExternalIds = useMemo(
    () => new Set(books.map((book) => book.externalId)),
    [books],
  );
  const firstName = user.name.split(" ")[0] || user.name;

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-line/70 bg-cream/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Logo href="/estante" />
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold leading-4">{user.name}</p>
              <p className="max-w-44 truncate text-[11px] leading-4 text-muted">{user.email}</p>
            </div>
            <span
              className="grid size-9 place-items-center rounded-full bg-wine-soft text-sm font-bold text-wine"
              aria-hidden="true"
            >
              {firstName.slice(0, 1).toUpperCase()}
            </span>
            <button
              type="button"
              onClick={logout}
              disabled={loggingOut}
              className="btn-ghost px-3 py-2 text-xs"
            >
              {loggingOut ? "Saindo..." : "Sair"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 pb-20 pt-8 sm:px-8 sm:pt-12">
        <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Sua estante</p>
            <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">
              Olá, <span className="text-wine">{firstName}</span>.
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
              {books.length === 0
                ? "Sua estante ainda está vazia. Comece buscando um livro no catálogo."
                : `Você tem ${books.length} ${books.length === 1 ? "livro" : "livros"} na estante. Continue de onde parou.`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSearchOpen((open) => !open)}
            className="btn-primary shrink-0"
            aria-expanded={searchOpen}
            aria-controls="busca-livros"
          >
            <svg viewBox="0 0 20 20" className="size-4" fill="none" aria-hidden="true">
              <path
                d="M10 4v12M4 10h12"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            {searchOpen ? "Fechar busca" : "Adicionar livro"}
          </button>
        </section>

        <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Na estante", value: String(counts.todas) },
            { label: "Quero ler", value: String(counts.quero_ler) },
            { label: "Lendo agora", value: String(counts.lendo) },
            { label: "Nota média", value: averageRating },
          ].map((stat) => (
            <div key={stat.label} className="card px-4 py-3.5 sm:px-5">
              <p className="font-display text-2xl font-semibold leading-none sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1.5 text-[11px] font-medium text-muted">{stat.label}</p>
            </div>
          ))}
        </section>

        <div id="busca-livros" className="mt-6">
          {searchOpen ? (
            <SearchPanel
              existingExternalIds={existingExternalIds}
              onAdd={addFromSearch}
              onClose={() => setSearchOpen(false)}
            />
          ) : null}
        </div>

        {notice ? (
          <p
            role="status"
            className={`mt-6 rounded-xl border px-4 py-3 text-sm ${
              notice.kind === "success"
                ? "border-line bg-cream text-ink"
                : "border-wine/20 bg-wine-soft text-wine"
            }`}
          >
            {notice.text}
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-line/70 pb-4">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={`chip ${filter === item.key ? "chip-active" : ""}`}
              aria-pressed={filter === item.key}
            >
              {item.label}
              <span
                className={`rounded-full px-1.5 text-[10px] ${
                  filter === item.key ? "bg-cream/20" : "bg-line/70"
                }`}
              >
                {counts[item.key]}
              </span>
            </button>
          ))}
        </div>

        {visibleBooks.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-paper/50 px-6 py-16 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-gold-soft text-gold">
              <svg viewBox="0 0 24 24" className="size-6" fill="none" aria-hidden="true">
                <path
                  d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v18H6.5A2.5 2.5 0 0 0 4 23V5.5Zm16 0A2.5 2.5 0 0 0 17.5 3H13v18h4.5A2.5 2.5 0 0 1 20 23V5.5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <h2 className="mt-4 text-xl font-semibold">
              {books.length === 0 ? "Sua estante está esperando" : "Nada nesta prateleira"}
            </h2>
            <p className="mt-1.5 max-w-sm text-sm text-muted">
              {books.length === 0
                ? "Busque um livro pelo título ou autor e ele aparece aqui, com capa e ano."
                : "Mude o status de um livro para vê-lo nesta prateleira."}
            </p>
            {books.length === 0 ? (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="btn-primary mt-5"
              >
                Buscar meu primeiro livro
              </button>
            ) : null}
          </div>
        ) : (
          <section
            className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
            aria-label="Livros da estante"
          >
            {visibleBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                busy={busyIds.has(book.id)}
                onPatch={patchBook}
                onRemove={removeBook}
              />
            ))}
          </section>
        )}

        <p className="mt-12 text-center text-[11px] text-muted">
          Livros e capas via Open Library · Sua estante é visível apenas para você.
        </p>
      </main>
    </div>
  );
}
