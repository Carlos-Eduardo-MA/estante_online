import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { RegisterForm } from "@/components/register-form";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Criar conta" };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/estante");

  return (
    <AuthShell
      title="Monte sua estante"
      subtitle="Leva menos de um minuto. Depois é só buscar um livro e começar."
      footer={
        <>
          Já tem uma conta?{" "}
          <Link href="/entrar" className="font-semibold text-wine hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
