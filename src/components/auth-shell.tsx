import Link from "next/link";
import { Logo } from "./logo";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
};

const benefits = [
  "Catálogo com mais de 40 milhões de títulos",
  "Prateleiras privadas por conta",
  "Notas e resenhas sempre à mão",
];

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[0.92fr_1.08fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-wine px-10 py-10 text-cream lg:flex">
        <div
          className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full border border-cream/10"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-20 size-96 rounded-full bg-wine-deep/60 blur-2xl"
          aria-hidden="true"
        />

        <div className="relative">
          <Logo light />
        </div>

        <div className="relative max-w-sm">
          <span className="font-display text-6xl leading-none text-gold-soft/50" aria-hidden="true">
            “
          </span>
          <blockquote className="mt-2 font-display text-3xl font-medium leading-[1.25]">
            Um leitor vive mil vidas antes de morrer. Aquele que nunca lê vive apenas uma.
          </blockquote>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-cream/50">
            George R. R. Martin
          </p>

          <ul className="mt-10 space-y-3 border-t border-cream/10 pt-7">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3 text-sm text-cream/75">
                <span className="grid size-5 place-items-center rounded-full bg-cream/10">
                  <svg viewBox="0 0 16 16" className="size-3 text-gold-soft" fill="none" aria-hidden="true">
                    <path
                      d="m3 8.5 2.5 2.5L13 4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-cream/40">Feito com Next.js e Open Library.</p>
      </aside>

      <main className="flex min-h-dvh flex-col px-5 py-6 sm:px-10">
        <div className="lg:hidden">
          <Logo />
        </div>

        <div className="m-auto w-full max-w-md animate-fade-up py-10">
          <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
          <p className="mt-2.5 text-sm leading-6 text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-sm text-muted">{footer}</div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted">
          <Link href="/" className="inline-flex items-center gap-1.5 hover:text-ink">
            <svg viewBox="0 0 16 16" className="size-3.5" fill="none" aria-hidden="true">
              <path
                d="M10 3 5 8l5 5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Voltar ao início
          </Link>
          <span className="hidden sm:inline">Sua estante, no seu ritmo.</span>
        </div>
      </main>
    </div>
  );
}
