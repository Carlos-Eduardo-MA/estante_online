"use client";

export function Stars({
  value,
  onChange,
  disabled = false,
}: {
  value: number | null;
  onChange: (rating: number | null) => void;
  disabled?: boolean;
}) {
  return (
    <div role="group" aria-label="Sua nota" className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = value !== null && star <= value;
        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange(value === star ? null : star)}
            aria-label={`${star} de 5 estrelas`}
            aria-pressed={filled}
            title={value === star ? "Remover nota" : `Dar nota ${star}`}
            className="rounded-md p-0.5 text-gold transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true">
              <path
                d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6-5.4-2.9-5.4 2.9 1-6L3.2 9.4l6.1-.9L12 3Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
                fill={filled ? "currentColor" : "none"}
              />
            </svg>
          </button>
        );
      })}
      <span className="ml-1 text-[11px] text-muted">
        {value ? `${value}/5` : "sem nota"}
      </span>
    </div>
  );
}
