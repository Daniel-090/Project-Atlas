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
      eyebrow="Acceso gestoría"
      title="Entrar como administrador"
      subtitle="Accede al panel de tu gestoría."
      footer={
        <>
          ¿Aún no tienes cuenta?{" "}
          <Link href="/registro" className="font-semibold text-primary hover:underline">
            Crear gestoría
          </Link>
          <span className="mx-2">·</span>
          <Link href="/vecino" className="font-semibold text-primary hover:underline">
            Soy vecino
          </Link>
        </>
      }
    >
      <GestorLoginForm />
    </PublicShell>
  );
}
