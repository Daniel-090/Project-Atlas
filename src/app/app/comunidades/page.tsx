import { count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { communities, incidents, residents } from "@/db/schema";
import { requireGestor } from "@/lib/session";
import { deleteCommunity } from "@/app/actions/panel";
import { PageHeader } from "@/components/page-header";
import { CommunityForm } from "@/components/panel-forms";
import Link from "next/link";

export default async function ComunidadesPage() {
  const { company } = await requireGestor();
  const list = await db.select().from(communities).where(eq(communities.companyId, company.id)).orderBy(desc(communities.createdAt));
  const residentCounts = await db.select({ communityId: residents.communityId, value: count() }).from(residents).where(eq(residents.companyId, company.id)).groupBy(residents.communityId);
  const incidentCounts = await db.select({ communityId: incidents.communityId, value: count() }).from(incidents).where(eq(incidents.companyId, company.id)).groupBy(incidents.communityId);
  const rc = new Map(residentCounts.map((r) => [r.communityId, r.value]));
  const ic = new Map(incidentCounts.map((r) => [r.communityId, r.value]));

  return (
    <>
      <PageHeader eyebrow="Comunidades" title="Tus comunidades" subtitle="Cada comunidad tiene su propio código RES- para que los vecinos se registren." />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-6">
        <section className="grid gap-4 sm:grid-cols-2">
          {list.length === 0 ? (
            <div className="atlas-empty sm:col-span-2">Aún no hay comunidades. Crea la primera desde el formulario.</div>
          ) : (
            list.map((c) => (
              <article key={c.id} className="atlas-card atlas-card-pad flex min-w-0 flex-col">
                <Link href={`/app/comunidades/${c.id}`} className="hover:underline">
                  <h2 className="text-base font-semibold text-foreground">{c.name}</h2>
                </Link>
                <p className="mt-1 text-sm text-muted">{c.address || "Sin dirección"}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="atlas-chip">{rc.get(c.id) ?? 0} vecinos</span>
                  <span className="atlas-chip">{ic.get(c.id) ?? 0} incidencias</span>
                </div>
                <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Código de acceso vecinos</p>
                    <p className="mt-1 font-mono text-sm font-semibold text-primary">{c.accessCode}</p>
                  </div>
                  <form action={deleteCommunity}>
                    <input type="hidden" name="id" value={c.id} />
                    <button className="atlas-btn-ghost self-start text-xs sm:self-auto">Eliminar</button>
                  </form>
                </div>
              </article>
            ))
          )}
        </section>
        <aside className="atlas-card atlas-card-pad h-fit xl:sticky xl:top-6">
          <p className="atlas-eyebrow">Nueva comunidad</p>
          <h2 className="mt-1 mb-5 text-lg font-semibold text-foreground">Dar de alta</h2>
          <CommunityForm />
        </aside>
      </div>
    </>
  );
}
