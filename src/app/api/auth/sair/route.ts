import { fail, isSameOrigin, json } from "@/lib/http";
import { destroySession } from "@/lib/session";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return fail(403, "Origem não permitida.");
  }

  await destroySession();
  return json({ ok: true });
}
