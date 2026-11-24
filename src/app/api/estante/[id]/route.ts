import { removeBook, updateBook } from "@/lib/books";
import { fail, isSameOrigin, json, readJson, tooManyRequests } from "@/lib/http";
import { checkLimit, hitLimit } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/session";
import { firstIssue, updateBookSchema } from "@/lib/validation";

type RouteContext = { params: Promise<{ id: string }> };

async function authorize(request: Request, context: RouteContext) {
  if (!isSameOrigin(request)) return { error: fail(403, "Origem não permitida.") };

  const user = await getCurrentUser();
  if (!user) return { error: fail(401, "Faça login para continuar.") };

  const key = `estante:${user.id}`;
  const limit = await checkLimit(key, 60);
  if (limit.blocked) return { error: tooManyRequests(limit.retryAfterSeconds) };

  const { id } = await context.params;
  if (!/^b_[A-Za-z0-9-]{1,40}$/.test(id)) {
    return { error: fail(404, "Livro não encontrado.") };
  }

  return { user, id, key };
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await authorize(request, context);
  if ("error" in auth) return auth.error;
  const { user, id, key } = auth;

  const body = await readJson(request);
  if (!body.ok) return body.response;

  const parsed = updateBookSchema.safeParse(body.value);
  if (!parsed.success) return fail(400, firstIssue(parsed.error));

  const book = await updateBook(user.id, id, parsed.data);
  if (!book) return fail(404, "Livro não encontrado.");

  await hitLimit(key, 60 * 1000);
  return json({ book });
}

export async function DELETE(request: Request, context: RouteContext) {
  const auth = await authorize(request, context);
  if ("error" in auth) return auth.error;
  const { user, id, key } = auth;

  const removed = await removeBook(user.id, id);
  if (!removed) return fail(404, "Livro não encontrado.");

  await hitLimit(key, 60 * 1000);
  return json({ ok: true });
}
