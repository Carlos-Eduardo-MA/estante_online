import { z } from "zod";

const email = z
  .email({ error: "Informe um e-mail válido." })
  .max(254, { error: "E-mail longo demais." })
  .transform((value) => value.trim().toLowerCase());

const password = z
  .string({ error: "Informe uma senha." })
  .min(8, { error: "A senha precisa ter ao menos 8 caracteres." })
  .max(72, { error: "A senha pode ter no máximo 72 caracteres." })
  .regex(/[A-Za-z]/, { error: "A senha precisa ter ao menos uma letra." })
  .regex(/[0-9]/, { error: "A senha precisa ter ao menos um número." });

export const registerSchema = z.object({
  name: z
    .string({ error: "Informe seu nome." })
    .trim()
    .min(2, { error: "Informe ao menos 2 caracteres no nome." })
    .max(60, { error: "O nome pode ter no máximo 60 caracteres." }),
  email,
  password,
});

export const loginSchema = z.object({
  email,
  password: z
    .string({ error: "Informe sua senha." })
    .min(1, { error: "Informe sua senha." })
    .max(72, { error: "Senha inválida." }),
});

export const searchSchema = z.object({
  q: z
    .string({ error: "Digite o que deseja buscar." })
    .trim()
    .min(2, { error: "Digite ao menos 2 caracteres." })
    .max(80, { error: "Busca longa demais." }),
});

const coverUrl = z
  .url({ error: "Capa inválida." })
  .max(300, { error: "Capa inválida." })
  .refine(
    (value) => {
      try {
        const url = new URL(value);
        return url.protocol === "https:" && url.hostname === "covers.openlibrary.org";
      } catch {
        return false;
      }
    },
    { error: "Capa inválida." },
  );

export const addBookSchema = z.object({
  externalId: z
    .string({ error: "Livro inválido." })
    .regex(/^\/works\/[A-Za-z0-9]+$/, { error: "Livro inválido." })
    .max(80),
  title: z
    .string({ error: "Título obrigatório." })
    .trim()
    .min(1, { error: "Título obrigatório." })
    .max(300, { error: "Título longo demais." }),
  authors: z
    .array(z.string().trim().min(1).max(120), { error: "Autores inválidos." })
    .max(8, { error: "Autores demais." }),
  coverUrl: coverUrl.nullable().optional().default(null),
  year: z
    .number({ error: "Ano inválido." })
    .int({ error: "Ano inválido." })
    .min(0, { error: "Ano inválido." })
    .max(2100, { error: "Ano inválido." })
    .nullable()
    .optional()
    .default(null),
  status: z
    .enum(["quero_ler", "lendo", "lido"], { error: "Status inválido." })
    .default("quero_ler"),
});

export const updateBookSchema = z
  .object({
    status: z.enum(["quero_ler", "lendo", "lido"], { error: "Status inválido." }).optional(),
    rating: z
      .number({ error: "Nota inválida." })
      .int({ error: "Nota inválida." })
      .min(1, { error: "A nota vai de 1 a 5." })
      .max(5, { error: "A nota vai de 1 a 5." })
      .nullable()
      .optional(),
    note: z
      .string({ error: "Nota inválida." })
      .trim()
      .max(1000, { error: "A resenha pode ter no máximo 1000 caracteres." })
      .nullable()
      .optional(),
  })
  .refine(
    (value) =>
      value.status !== undefined || value.rating !== undefined || value.note !== undefined,
    { error: "Nada para atualizar." },
  );

export function firstIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "Dados inválidos.";
}
