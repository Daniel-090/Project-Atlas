import Link from "next/link";
import { redirect } from "next/navigation";
import { ResidentLoginForm, ResidentRegisterForm } from "@/components/auth-forms";
import { PublicShell } from "@/components/public-shell";
import { getResidentSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function VecinoPage({ searchParams }: { searchParams: Promise<{ modo?: string }> }) {
  if (await getResidentSession()) redirect("/vecino/portal");
  const { modo } = await searchParams;
  const registro = modo === "registro";
  return (
    <PublicShell
      eyebrow="Acceso vecino"
      title={registro ? "Regístrate con el código de tu comunidad" : "Portal del vecino"}
      subtitle={registro ? "Una vez dentro podrás crear incidencias y ver tus documentos." : "Crea incidencias y consulta documentos de tu comunidad."}
      footer={
        registro ? (
          <>
            ¿Ya estás registrado?{" "}
            <Link href="/vecino" className="font-semibold text-primary hover:underline">
              Entrar
            </Link>
          </>
        ) : (
          <>
            ¿Primera vez?{" "}
            <Link href="/vecino?modo=registro" className="font-semibold text-primary hover:underline">
              Registrarme con mi código
            </Link>
          </>
        )
      }
    >
      <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl border border-border bg-surface-soft p-1 text-center text-xs font-semibold">
        <Link href="/vecino" className={`rounded-lg py-2 ${!registro ? "bg-surface text-foreground" : "text-muted"}`}>
          Entrar
        </Link>
        <Link href="/vecino?modo=registro" className={`rounded-lg py-2 ${registro ? "bg-surface text-foreground" : "text-muted"}`}>
          Registrarme
        </Link>
      </div>
      {registro ? <ResidentRegisterForm /> : <ResidentLoginForm />}
    </PublicShell>
  );
}
