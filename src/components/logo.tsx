import Link from "next/link";

export function Logo({ href = "/", light = false }: { href?: string; light?: boolean }) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2.5 rounded-lg ${light ? "text-cream" : "text-ink"}`}
      aria-label="Estante, página inicial"
    >
      <span
        className={`grid size-9 place-items-center rounded-xl text-cream shadow-[0_10px_24px_-14px_rgba(0,0,0,0.55)] transition ${light ? "bg-cream/15 group-hover:bg-cream/25" : "bg-wine group-hover:bg-wine-deep"}`}
      >
        <svg viewBox="0 0 24 24" className="size-4.5" fill="none" aria-hidden="true">
          <path
            d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v18H6.5A2.5 2.5 0 0 0 4 23V5.5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v18h4.5A2.5 2.5 0 0 1 20 23V5.5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="font-display text-xl font-semibold tracking-tight">
        Estante<span className="text-gold">.</span>
      </span>
    </Link>
  );
}
