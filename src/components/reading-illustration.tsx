export function ReadingIllustration() {
  return (
    <div
      className="reading-scene"
      role="img"
      aria-label="Livro aberto com uma página virando e etapas da leitura."
    >
      <div className="open-book" aria-hidden="true">
        <div className="open-book__page open-book__page--left">
          <span className="open-book__running-head">MINHA BIBLIOTECA</span>
          <span className="open-book__lines" />
          <span className="open-book__folio">12</span>
        </div>
        <div className="open-book__page open-book__page--right">
          <span className="open-book__running-head">O HOBBIT</span>
          <span className="open-book__lines open-book__lines--short" />
          <span className="open-book__folio">13</span>
        </div>
        <div className="open-book__page-turn">
          <span className="open-book__running-head">CAPÍTULO III</span>
          <span className="open-book__lines open-book__lines--short" />
        </div>
        <span className="open-book__spine" />
      </div>

      <div className="reading-note reading-note--top" aria-hidden="true">
        <span className="reading-note__mark">
          <svg viewBox="0 0 24 24" className="size-5" fill="none">
            <path
              d="M12 6.5c-2.2-1.6-5.3-2-8-1v12c2.7-1 5.8-.6 8 1 2.2-1.6 5.3-2 8-1v-12c-2.7-1-5.8-.6-8 1Zm0 0v12"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="reading-note__copy">
          <span className="reading-note__eyebrow">LEITURA ATUAL</span>
          <strong>O Hobbit</strong>
          <span>J. R. R. Tolkien</span>
        </span>
      </div>

      <div className="reading-index" aria-hidden="true">
        <span>
          <small>01</small>
          Quero ler
        </span>
        <span>
          <small>02</small>
          Em leitura
        </span>
        <span>
          <small>03</small>
          Concluídos
        </span>
      </div>
    </div>
  );
}
