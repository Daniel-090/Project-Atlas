import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { communities, providers, users } from "@/db/schema";
import { requireGestor } from "@/lib/session";
import { categoryOptions } from "@/lib/incident-ai";
import { createProvider, deleteProvider } from "@/app/actions/panel";
import { PageHeader } from "@/components/page-header";
import { PropertyForm } from "@/components/panel-forms";
import { getVertical, formatPrice, listingStatusLabel, operationTypeLabel, propertyTypeLabel } from "@/verticals";

export default async function EntidadDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { company } = await requireGestor();
  const v = getVertical(company.vertical);
  const { id } = await params;
  const [community] = await db
    .select()
    .from(communities)
    .where(and(eq(communities.id, Number(id)), eq(communities.companyId, company.id)))
    .limit(1);
  if (!community) notFound();

  const [list, agents] = await Promise.all([
    db
      .select()
      .from(providers)
      .where(and(eq(providers.communityId, community.id), eq(providers.companyId, company.id)))
      .orderBy(desc(providers.createdAt)),
    db.select({ id: users.id, name: users.name }).from(users).where(eq(users.companyId, company.id)),
  ]);

  const portfolio = v.features.propertyAttributes;
  const categories = categoryOptions(v);

  return (
    <>
      <div className="mb-4">
        <Link href="/app/comunidades" className="atlas-btn-ghost text-xs font-semibold">
          ← Volver a {v.entity.manyLower}
        </Link>
      </div>
      <PageHeader
        eyebrow={v.entity.one}
        title={community.name}
        subtitle={community.address || "Sin dirección"}
        actions={portfolio ? <span className="atlas-chip atlas-chip-primary">{listingStatusLabel(community.listingStatus)}</span> : undefined}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-6">
        <section className="grid gap-4">
          {portfolio ? (
            <article className="atlas-card atlas-card-pad">
              <h2 className="text-sm font-semibold text-foreground">Ficha del {v.entity.oneLower}</h2>
              <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
                <div>
                  <dt className="atlas-label">Tipo</dt>
                  <dd className="mt-0.5 text-foreground">{propertyTypeLabel(community.propertyType)}</dd>
                </div>
                <div>
                  <dt className="atlas-label">Operación</dt>
                  <dd className="mt-0.5 text-foreground">{operationTypeLabel(community.operationType)}</dd>
                </div>
                <div>
                  <dt className="atlas-label">Estado</dt>
                  <dd className="mt-0.5 text-foreground">{listingStatusLabel(community.listingStatus)}</dd>
                </div>
                <div>
                  <dt className="atlas-label">{community.operationType === "alquiler" ? "Renta mensual" : "Precio"}</dt>
                  <dd className="mt-0.5 text-foreground">
                    {formatPrice(community.priceCents ? Math.round(community.priceCents / 100) : null) ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="atlas-label">Superficie</dt>
                  <dd className="mt-0.5 text-foreground">{community.m2 ? `${community.m2} m²` : "—"}</dd>
                </div>
                <div>
                  <dt className="atlas-label">Habitaciones / baños</dt>
                  <dd className="mt-0.5 text-foreground">
                    {community.rooms ?? "—"} / {community.baths ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="atlas-label">Llaves</dt>
                  <dd className="mt-0.5 text-foreground">{community.keyCode || "—"}</dd>
                </div>
                <div>
                  <dt className="atlas-label">Agente responsable</dt>
                  <dd className="mt-0.5 text-foreground">
                    {agents.find((a) => a.id === community.agentUserId)?.name ?? "Sin asignar"}
                  </dd>
                </div>
                <div>
                  <dt className="atlas-label">Código de acceso</dt>
                  <dd className="mt-0.5 font-mono text-primary">{community.accessCode}</dd>
                </div>
              </dl>
              {community.notes ? (
                <p className="mt-4 whitespace-pre-wrap border-t border-border pt-4 text-sm text-muted">{community.notes}</p>
              ) : null}
            </article>
          ) : null}

          <h2 className="text-sm font-semibold text-foreground">{v.provider.many}</h2>
          {list.length === 0 ? (
            <div className="atlas-empty">Aún no hay {v.provider.manyLower} para este {v.entity.oneLower}.</div>
          ) : (
            list.map((p) => (
              <article key={p.id} className="atlas-card atlas-card-pad flex min-w-0 flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="atlas-chip">{categoryLabelOf(categories, p.category)}</span>
                    <h3 className="mt-2 text-base font-semibold text-foreground">{p.name}</h3>
                  </div>
                  <form action={deleteProvider}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="communityId" value={community.id} />
                    <button className="atlas-btn-ghost text-xs">Eliminar</button>
                  </form>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                  {p.phone ? <span>📞 {p.phone}</span> : null}
                  {p.email ? <span>✉️ {p.email}</span> : null}
                </div>
                {p.notes ? <p className="text-xs text-muted">{p.notes}</p> : null}
              </article>
            ))
          )}
        </section>

        <aside className="grid gap-5">
          {portfolio ? (
            <div className="atlas-card atlas-card-pad h-fit">
              <p className="atlas-eyebrow">Editar ficha</p>
              <h2 className="mt-1 mb-5 text-lg font-semibold text-foreground">{v.entity.one}</h2>
              <PropertyForm
                initial={{
                  id: community.id,
                  name: community.name,
                  address: community.address,
                  propertyType: community.propertyType ?? "",
                  operationType: community.operationType ?? "",
                  listingStatus: community.listingStatus,
                  price: community.priceCents ? Math.round(community.priceCents / 100) : 0,
                  m2: community.m2 ?? 0,
                  rooms: community.rooms ?? 0,
                  baths: community.baths ?? 0,
                  keyCode: community.keyCode ?? "",
                  notes: community.notes ?? "",
                  agentUserId: community.agentUserId ?? 0,
                }}
                agents={agents}
              />
            </div>
          ) : null}

          <div className="atlas-card atlas-card-pad h-fit xl:sticky xl:top-6">
            <p className="atlas-eyebrow">Nuevo {v.provider.oneLower}</p>
            <h2 className="mt-1 mb-5 text-lg font-semibold text-foreground">Añadir</h2>
            <form action={createProvider} className="grid gap-4">
              <input type="hidden" name="communityId" value={community.id} />
              <label className="block">
                <span className="atlas-label">Categoría</span>
                <select name="category" className="atlas-input" required>
                  {categories.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="atlas-label">Nombre del {v.provider.oneLower}</span>
                <input name="name" className="atlas-input" required placeholder="Ascensores Pérez" />
              </label>
              <label className="block">
                <span className="atlas-label">Teléfono</span>
                <input name="phone" className="atlas-input" placeholder="600 000 000" />
              </label>
              <label className="block">
                <span className="atlas-label">Email</span>
                <input name="email" type="email" className="atlas-input" placeholder="contacto@proveedor.com" />
              </label>
              <label className="block">
                <span className="atlas-label">Notas</span>
                <textarea name="notes" rows={3} className="atlas-input" placeholder="Horario, contrato, condiciones..." />
              </label>
              <button className="atlas-btn atlas-btn-primary">Añadir {v.provider.oneLower}</button>
            </form>
          </div>
        </aside>
      </div>
    </>
  );
}

function categoryLabelOf(options: Array<{ key: string; label: string }>, key: string): string {
  return options.find((o) => o.key === key)?.label ?? "General";
}
