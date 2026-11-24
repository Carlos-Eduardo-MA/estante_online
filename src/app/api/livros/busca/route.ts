import { fail, json, tooManyRequests } from "@/lib/http";
import { searchOpenLibrary, OpenLibraryError } from "@/lib/openlibrary";
import { checkLimit, hitLimit } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/session";
import { firstIssue, searchSchema } from "@/lib/validation";

const WINDOW_MS = 60 * 1000;
const MAX_PER_MINUTE = 30;

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return fail(401, "Faça login para buscar livros.");

  const parsed = searchSchema.safeParse({
    q: new URL(request.url).searchParams.get("q") ?? "",
  });
  if (!parsed.success) {
    return fail(400, firstIssue(parsed.error));
  }

  const key = `busca:${user.id}`;
  const limit = await checkLimit(key, MAX_PER_MINUTE);
  if (limit.blocked) return tooManyRequests(limit.retryAfterSeconds);

  try {
    const results = await searchOpenLibrary(parsed.data.q);
    await hitLimit(key, WINDOW_MS);
    return json({ results });
  } catch (error) {
    if (error instanceof OpenLibraryError) {
      return fail(502, error.message);
    }
    return fail(500, "Erro inesperado ao buscar livros.");
  }
}
