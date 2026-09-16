import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { communities, companies } from "@/db/schema";
import { ResidentLoginForm, ResidentRegisterForm } from "@/components/auth-forms";
import { PublicShell } from "@/components/public-shell";
import { getResidentSession } from "@/lib/session";
import { getVertical } from "@/verticals";

export const dynamic = "force-dynamic";

export default async function VecinoPage({ searchParams }: { searchParams: Promise<{ modo?: string; c?: string }> }) {
  if (await getResidentSession()) redirect("/vecino/portal");
  const { modo, c } = await searchParams;
  const registro = modo === "registro";

  // Si llega un código por la URL (?c=RES-…), sabemos de qué empresa es y podemos
  // adaptar el formulario (idioma de la vertical, rol propietario/inquilino…).
  const code = c ? String(c).toUpperCase() : undefined;
  let verticalKey: string | undefined;
  if (code) {
    const [row] = await db
      .select({ vertical: companies.vertical })
      .from(communities)
      .innerJoin(companies, eq(communities.companyId, companies.id))
      .where(eq(communities.accessCode, code))
      .limit(1);
    if (row) verticalKey = row.vertical;
  }
  const v = getVertical(verticalKey ?? "inmobiliarias");
  const hasCode = Boolean(code && verticalKey);

  return (
    <PublicShell
      eyebrow={v.portalName}
      title={registro ? `Regístrate con el código de tu ${v.entity.oneLower}` : v.portalName}
      subtitle={
        registro
          ? `Una vez dentro podrás crear ${v.request.manyLower} y ver tus documentos.`
          : `Crea ${v.request.manyLower} y consulta documentos de tu ${v.entity.oneLower}.`
      }
      footer={
        registro ? (
          <>
            ¿Ya estás registrado?{" "}
            <Link href={code ? `/vecino?c=${code}` : "/vecino"} className="font-semibold text-primary hover:underline">
              Entrar
            </Link>
          </>
        ) : (
          <>
            ¿Primera vez?{" "}
            <Link href={code ? `/vecino?modo=registro&c=${code}` : "/vecino?modo=registro"} className="font-semibold text-primary hover:underline">
              Registrarme con mi código
            </Link>
          </>
        )
      }
    >
      <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl border border-border bg-surface-soft p-1 text-center text-xs font-semibold">
        <Link href={code ? `/vecino?c=${code}` : "/vecino"} className={`rounded-lg py-2 ${!registro ? "bg-surface text-foreground" : "text-muted"}`}>
          Entrar
        </Link>
        <Link href={code ? `/vecino?modo=registro&c=${code}` : "/vecino?modo=registro"} className={`rounded-lg py-2 ${registro ? "bg-surface text-foreground" : "text-muted"}`}>
          Registrarme
        </Link>
      </div>
      {registro ? (
        <ResidentRegisterForm code={code} vertical={hasCode ? verticalKey : undefined} />
      ) : (
        <ResidentLoginForm companyNoun={v.company.oneLower} />
      )}
    </PublicShell>
  );
}
