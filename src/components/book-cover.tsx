"use client";

import { useState } from "react";

const palettes = [
  "from-black to-black/70",
  "from-black/90 to-black/60",
  "from-black/80 to-black/50",
  "from-black/70 to-black/40",
  "from-black/60 to-black/30",
  "from-black/95 to-black/65",
];

function paletteFor(title: string) {
  const total = Array.from(title).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return palettes[total % palettes.length];
}

export function BookCover({
  src,
  title,
  className = "",
}: {
  src: string | null;
  title: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex h-full w-full flex-col justify-between bg-gradient-to-br p-4 text-cream ${paletteFor(title)} ${className}`}
        aria-hidden="true"
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cream/50">
          Estante
        </span>
        <div>
          <p className="font-display text-xl font-semibold leading-tight">{title}</p>
          <span className="mt-3 block h-px w-8 bg-cream/40" />
        </div>
      </div>
    );
  }

  return (
    // Capas vêm de uma origem whitelisted no CSP e são carregadas de forma lazy.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`Capa de ${title}`}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`h-full w-full object-cover ${className}`}
    />
  );
}
