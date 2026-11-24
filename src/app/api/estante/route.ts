import { addBook, DuplicateBookError, listBooks } from "@/lib/books";
import { fail, isSameOrigin, json, readJson, tooManyRequests } from "@/lib/http";
import { checkLimit, hitLimit } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/session";
import { addBookSchema, firstIssue } from "@/lib/validation";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return fail(401, "Faça login para ver sua estante.");

  const books = await listBooks(user.id);
  return json({ books });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return fail(403, "Origem não permitida.");

  const user = await getCurrentUser();
  if (!user) return fail(401, "Faça login para adicionar livros.");

  const key = `estante:${user.id}`;
  const limit = await checkLimit(key, 60);
  if (limit.blocked) return tooManyRequests(limit.retryAfterSeconds);

  const body = await readJson(request);
  if (!body.ok) return body.response;

  const parsed = addBookSchema.safeParse(body.value);
  if (!parsed.success) return fail(400, firstIssue(parsed.error));

  try {
    const book = await addBook(user.id, parsed.data);
    await hitLimit(key, 60 * 1000);
    return json({ book }, 201);
  } catch (error) {
    if (error instanceof DuplicateBookError) {
      return fail(409, error.message);
    }
    return fail(500, "Não foi possível adicionar o livro.");
  }
}
