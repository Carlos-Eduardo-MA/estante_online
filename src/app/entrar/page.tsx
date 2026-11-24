import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/login-form";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Entrar" };

function safeNext(value: string | undefined) {
  if (!value) return "/estante";
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return "/estante";
  }
  return value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  const { next } = await searchParams;
  if (user) redirect(safeNext(next));

  return (
    <AuthShell
      title="Bem-vindo de volta"
      subtitle="Entre para continuar de onde parou. Sua estante está esperando."
      footer={
        <>
          Ainda não tem uma estante?{" "}
          <Link href="/criar-conta" className="font-semibold text-wine hover:underline">
            Criar conta grátis
          </Link>
        </>
      }
    >
      <LoginForm nextPath={safeNext(next)} />
    </AuthShell>
  );
}
