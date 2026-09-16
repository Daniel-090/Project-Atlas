import Link from "next/link";
import { redirect } from "next/navigation";
import { GestorRegisterForm } from "@/components/auth-forms";
import { PublicShell } from "@/components/public-shell";
import { getGestorSession } from "@/lib/session";
import { getVertical, isVerticalKey } from "@/verticals";

export const dynamic = "force-dynamic";

export default async function RegistroPage() {
  if (await getGestorSession()) redirect("/app");
  const configuredVertical = process.env.ATLAS_VERTICAL;
  const vertical = getVertical(isVerticalKey(configuredVertical) ? configuredVertical : "fincas");
  return (
    <PublicShell
      wide
      eyebrow={`Nueva ${vertical.company.oneLower}`}
      title="Crea tu cuenta en Atlas"
      subtitle={`En menos de dos minutos: cuenta, colores de tu marca y contactos para tus ${vertical.contact.manyLower}.`}
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
