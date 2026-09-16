import Link from "next/link";
import { redirect } from "next/navigation";
import { GestorLoginForm } from "@/components/auth-forms";
import { PublicShell } from "@/components/public-shell";
import { getGestorSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AccesoPage() {
  if (await getGestorSession()) redirect("/app");
  return (
    <PublicShell
      eyebrow="Acceso inmobiliaria"
      title="Entrar a tu inmobiliaria"
      subtitle="Accede al panel de tu inmobiliaria."
      footer={
        <>
          ¿Aún no tienes cuenta?{" "}
          <Link href="/registro" className="font-semibold text-primary hover:underline">
            Crear inmobiliaria
          </Link>
          <span className="mx-2">·</span>
          <Link href="/vecino" className="font-semibold text-primary hover:underline">
            Soy propietario o inquilino
          </Link>
        </>
      }
    >
      <GestorLoginForm />
    </PublicShell>
  );
}
