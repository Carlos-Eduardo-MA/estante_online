import type { Metadata } from "next";
import { Shelf } from "@/components/shelf";
import { requireUser } from "@/lib/auth";
import { listBooks } from "@/lib/books";

export const metadata: Metadata = { title: "Minha estante" };
export const dynamic = "force-dynamic";

export default async function EstantePage() {
  const user = await requireUser("/estante");
  const books = await listBooks(user.id);

  return <Shelf user={{ name: user.name, email: user.email }} initialBooks={books} />;
}
