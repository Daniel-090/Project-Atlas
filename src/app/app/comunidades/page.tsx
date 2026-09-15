import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { communities, incidents, residents, users } from "@/db/schema";
import { requireGestor } from "@/lib/session";
import { deleteCommunity } from "@/app/actions/panel";
import { PageHeader } from "@/components/page-header";
import { CommunityForm } from "@/components/panel-forms";
import { getVertical, formatPrice, listingStatusLabel, operationTypeLabel, propertyTypeLabel } from "@/verticals";

const STATUS_FILTERS = [
  { key: "todas", label: "Todas" },
  { key: "disponible", label: "Disponible" },
  { key: "reservado", label: "Reservado" },
  { key: "alquilado", label: "Alquilado" },
  { key: "vendido", label: "Vendido" },
  { key: "no_disponible", label: "No disponible" },
];

export default async function EntidadesPage({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const { company } = await requireGestor();
  const v = getVertical(company.vertical);
  const { estado = "todas" } = await searchParams;
  const portfolio = v.features.portfolio;

  const [list, residentCounts, incidentCounts, agents] = await Promise.all([
    db.select().from(communities).where(eq(communities.companyId, company.id)).orderBy(desc(communities.createdAt)),
    db.select({ communityId: residents.communityId, value: count() }).from(residents).where(eq(residents.companyId, company.id)).groupBy(residents.communityId),
    db.select({ communityId: incidents.communityId, value: count() }).from(incidents).where(eq(incidents.companyId, company.id)).groupBy(incidents.communityId),
    db.select({ id: users.id, name: users.name }).from(users).where(eq(users.companyId, company.id)),
  ]);

  const rc = new Map(residentCounts.map((r) => [r.communityId, r.value]));
  const ic = new Map(incidentCounts.map((r) => [r.communityId, r.value]));
  const agentName = new Map(agents.map((a: { id: number; name: string }) => [a.id, a.name]));

  const visible = portfolio && estado !== "todas" ? list.filter((c) => c.listingStatus === estado) : list;

  return (
    <>
      <PageHeader
        eyebrow={v.entity.many}
        title={portfolio ? `Cartera de ${v.entity.manyLower}` : `Tus ${v.entity.manyLower}`}
        subtitle={
          portfolio
            ? `Cada ${v.entity.oneLower} tiene su propio código RES- para que ${v.contact.manyLower} accedan a su portal.`
            : `Cada ${v.entity.oneLower} tiene su propio código RES- para que los ${v.contact.manyLower} se registren.`
        }
      />

      {portfolio ? (
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1 sm:mb-4 sm:flex-wrap sm:overflow-visible sm:pb-0">
          {STATUS_FILTERS.map((f) => (
            <Link
              key={f.key}
              href={f.key === "todas" ? "/app/comunidades" : `/app/comunidades?estado=${f.key}`}
              className={`atlas-chip shrink-0 !py-2 ${estado === f.key ? "atlas-chip-primary" : ""}`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-6">
        <section className="grid gap-4 sm:grid-cols-2">
          {visible.length === 0 ? (
            <div className="atlas-empty sm:col-span-2">
              {list.length === 0
                ? `Aún no hay ${v.entity.manyLower}. Crea el primero desde el formulario.`
                : `No hay ${v.entity.manyLower} en este estado.`}
            </div>
          ) : (
            visible.map((c) => (
              <article key={c.id} className="atlas-card atlas-card-pad flex min-w-0 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/app/comunidades/${c.id}`} className="hover:underline">
                    <h2 className="text-base font-semibold text-foreground">{c.name}</h2>
                  </Link>
                  {portfolio ? <span className="atlas-chip atlas-chip-primary shrink-0">{listingStatusLabel(c.listingStatus)}</span> : null}
                </div>
                <p className="mt-1 text-sm text-muted">{c.address || "Sin dirección"}</p>

                {portfolio ? (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="atlas-chip">{propertyTypeLabel(c.propertyType)}</span>
                    <span className="atlas-chip">{operationTypeLabel(c.operationType)}</span>
                    {c.m2 ? <span className="atlas-chip">{c.m2} m²</span> : null}
                    {c.rooms ? <span className="atlas-chip">{c.rooms} hab.</span> : null}
                    {formatPrice(c.priceCents ? Math.round(c.priceCents / 100) : null) ? (
                      <span className="atlas-chip">
                        {formatPrice(c.priceCents ? Math.round(c.priceCents / 100) : null)}
                        {c.operationType === "alquiler" ? "/mes" : ""}
                      </span>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="atlas-chip">{rc.get(c.id) ?? 0} {v.contact.manyLower}</span>
                  <span className="atlas-chip">{ic.get(c.id) ?? 0} {v.request.manyLower}</span>
                  {portfolio && c.agentUserId ? <span className="atlas-chip">Agente: {agentName.get(c.agentUserId)}</span> : null}
                </div>

                <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                      Código de acceso {v.contact.manyLower}
                    </p>
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
          <p className="atlas-eyebrow">{portfolio ? "Nuevo inmueble" : "Nueva comunidad"}</p>
          <h2 className="mt-1 mb-5 text-lg font-semibold text-foreground">Dar de alta</h2>
          <CommunityForm vertical={v.key} agents={agents} />
        </aside>
      </div>
    </>
  );
}
