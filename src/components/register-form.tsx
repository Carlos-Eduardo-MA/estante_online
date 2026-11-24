"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" className="size-4.5" fill="none" aria-hidden="true">
      <path
        d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="size-4.5" fill="none" aria-hidden="true">
      <path
        d="M4 4l16 16M9.5 6.4A9.7 9.7 0 0 1 12 6c5.5 0 9 6 9 6a15 15 0 0 1-2.3 2.9M6 7.7C4 9.4 3 12 3 12s3.5 6 9 6c1.2 0 2.3-.3 3.3-.7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const passwordChecks = [
    { label: "8 caracteres ou mais", ok: password.length >= 8 },
    { label: "ao menos uma letra", ok: /[A-Za-z]/.test(password) },
    { label: "ao menos um número", ok: /[0-9]/.test(password) },
  ];

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    if (password !== confirm) {
      setError("As senhas não conferem.");
      return;
    }
    if (!passwordChecks.every((check) => check.ok)) {
      setError("Sua senha ainda não atende aos requisitos.");
      return;
    }

    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/cadastrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Não foi possível criar sua conta.");
        return;
      }

      router.replace("/estante");
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-wine/20 bg-wine-soft px-3.5 py-3 text-sm text-wine"
        >
          {error}
        </p>
      ) : null}

      <div>
        <label htmlFor="name" className="label">
          Nome
        </label>
        <input
          id="name"
          name="name"
          autoComplete="name"
          required
          maxLength={60}
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="input"
          placeholder="Como devemos te chamar?"
        />
      </div>

      <div>
        <label htmlFor="email" className="label">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="input"
          placeholder="voce@exemplo.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="label">
          Senha
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            maxLength={72}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="input pr-11"
            placeholder="Crie uma senha"
            aria-describedby="password-rules"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-muted transition hover:bg-ink/5 hover:text-ink"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={showPassword}
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>
        <ul id="password-rules" className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
          {passwordChecks.map((check) => (
            <li
              key={check.label}
              className={`flex items-center gap-1.5 text-[11px] font-medium ${
                check.ok ? "text-ink" : "text-muted"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${check.ok ? "bg-ink" : "bg-line"}`}
                aria-hidden="true"
              />
              {check.label}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <label htmlFor="confirm" className="label">
          Confirmar senha
        </label>
        <input
          id="confirm"
          name="confirm"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          required
          maxLength={72}
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          className="input"
          placeholder="Repita a senha"
        />
      </div>

      <button type="submit" className="btn-primary w-full py-3.5" disabled={pending}>
        {pending ? "Criando conta..." : "Criar minha estante"}
      </button>

      <p className="text-center text-[11px] leading-5 text-muted">
        Sua senha é guardada com scrypt. A sessão fica em um cookie httpOnly e não é
        acessível por JavaScript.
      </p>
    </form>
  );
}
