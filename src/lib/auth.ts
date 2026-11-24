import { redirect } from "next/navigation";
import { getCurrentUser } from "./session";

/** Garante uma sessão válida em páginas protegidas (a checagem é no servidor). */
export async function requireUser(nextPath = "/estante") {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/entrar?next=${encodeURIComponent(nextPath)}`);
  }
  return user;
}
