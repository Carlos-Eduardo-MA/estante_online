import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { ReadingIllustration } from "@/components/reading-illustration";
import { getCurrentUser } from "@/lib/session";

const features = [
  {
    title: "Encontre seu próximo livro",
    text: "Pesquise por título ou autor e descubra livros com capa, autoria e ano de publicação.",
    icon: (
      <path
        d="m21 21-4.35-4.35M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    ),
  },
  {
    title: "Uma estante para cada etapa",
    text: "Separe os livros que quer ler, os que está lendo e os que já terminou.",
    icon: (
      <path
        d="M4 7.5h16M4 12h16M4 16.5h10"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    ),
  },
  {
    title: "Seu histórico de leitura",
    text: "Acompanhe os livros concluídos e guarde suas avaliações e impressões sobre cada leitura.",
    icon: (
      <path
        d="M12 3 5 6v5c0 4.4 3 8.4 7 9.5 4-1.1 7-5.1 7-9.5V6l-7-3Zm-2.4 8.6 1.7 1.7 3.4-3.4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect("/estante");

  return (
    <div className="overflow-hidden">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <Logo />
        <nav className="flex items-center gap-1.5 sm:gap-3">
          <Link href="/entrar" className="btn-ghost px-4 py-2.5">
            Entrar
          </Link>
          <Link href="/criar-conta" className="btn-primary px-5 py-2.5">
            Criar conta
          </Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid w-full max-w-6xl items-center gap-14 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-16">
          <div className="animate-fade-up">
            <p className="eyebrow flex items-center gap-2.5">
              <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true">
                <path
                  d="M12 6.5c-2.2-1.6-5.3-2-8-1v12c2.7-1 5.8-.6 8 1 2.2-1.6 5.3-2 8-1v-12c-2.7-1-5.8-.6-8 1Zm0 0v12"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="h-px w-7 bg-ink" aria-hidden="true" />
              Sua biblioteca pessoal
            </p>
            <h1 className="mt-5 max-w-xl text-[2.55rem] leading-[1.08] font-semibold sm:text-6xl">
              Cada leitura
              <em className="mt-1 block font-normal text-ink">encontra seu lugar.</em>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-muted">
              Descubra novos livros, acompanhe cada leitura e guarde suas notas e
              resenhas na sua biblioteca pessoal.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/criar-conta" className="btn-primary px-6 py-3.5 text-base">
                Montar minha estante
                <svg viewBox="0 0 20 20" className="size-4" fill="none" aria-hidden="true">
                  <path
                    d="M4 10h11m-4.5-4.5L15 10l-4.5 4.5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <Link href="/entrar" className="btn-secondary px-6 py-3.5 text-base">
                Já tenho conta
              </Link>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md animate-fade-up [animation-delay:120ms]">
            <ReadingIllustration />
          </div>
        </section>

        <section className="border-y border-line/70 bg-paper/60">
          <div className="mx-auto grid w-full max-w-6xl gap-5 px-5 py-14 sm:px-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-transparent p-5 transition hover:border-line hover:bg-paper"
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-xl bg-wine-soft text-wine">
                    <svg viewBox="0 0 24 24" className="size-5.5" fill="none" aria-hidden="true">
                      {feature.icon}
                    </svg>
                  </span>
                  <span className="font-sans text-sm text-gold">0{index + 1}</span>
                </div>
                <h2 className="mt-5 text-xl font-semibold">{feature.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
          <div className="overflow-hidden rounded-[2rem] bg-wine px-7 py-10 text-cream sm:px-12 sm:py-12">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold-soft/80">
                  Seu espaço de leitura
                </p>
                <h2 className="mt-3 max-w-md text-3xl font-semibold leading-tight sm:text-4xl">
                  Acompanhe cada livro no seu próprio ritmo.
                </h2>
                <p className="mt-4 max-w-md text-sm leading-6 text-cream/70">
                  Organize o que deseja ler, acompanhe suas leituras em andamento e
                  registre os livros que já terminou. Suas notas e resenhas ficam junto
                  de cada livro.
                </p>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {[
                  "Encontre livros pelo título ou autor",
                  "Guarde títulos para ler depois",
                  "Acompanhe o que está lendo agora",
                  "Marque os livros que já concluiu",
                  "Registre notas e resenhas pessoais",
                  "Filtre a estante por etapa de leitura",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 rounded-xl border border-cream/10 bg-cream/5 px-4 py-3.5 text-sm leading-5 text-cream/85"
                  >
                    <svg
                      viewBox="0 0 20 20"
                      className="mt-0.5 size-4 shrink-0 text-gold-soft"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="m4 10.5 3.5 3.5L16 5.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-4 border-t border-line/70 px-5 py-8 text-xs text-muted sm:flex-row sm:items-center sm:px-8">
        <p>Estante · sua biblioteca pessoal de leituras.</p>
        <p>
          Dados de livros via{" "}
          <a
            href="https://openlibrary.org/developers/api"
            className="font-semibold text-ink underline decoration-gold/50 underline-offset-2"
            rel="noreferrer noopener"
            target="_blank"
          >
            Open Library
          </a>
          .
        </p>
      </footer>
    </div>
  );
}
