import Link from "next/link";
import { redirect } from "next/navigation";
import { GestorRegisterForm } from "@/components/auth-forms";
import { PublicShell } from "@/components/public-shell";
import { getGestorSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function RegistroPage() {
  if (await getGestorSession()) redirect("/app");
  return (
    <PublicShell
      wide
      eyebrow="Nueva gestoría"
      title="Crea tu cuenta en Atlas"
      subtitle="En menos de dos minutos: cuenta, colores de tu marca y contactos para tus vecinos."
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link href="/acceso" className="font-semibold text-primary hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <GestorRegisterForm />
    </PublicShell>
  );
}
