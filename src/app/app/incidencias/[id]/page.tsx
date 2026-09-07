import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { communities, incidents, providers, residents } from "@/db/schema";
import { requireGestor } from "@/lib/session";
import { CATEGORY_OPTIONS, categoryLabel } from "@/lib/incident-ai";
import { updateIncident } from "@/app/actions/panel";
import { PageHeader, PriorityChip, StatusChip, formatDate } from "@/components/page-header";

export default async function IncidenciaDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { company } = await requireGestor();
  const { id } = await params;
  const rows = await db
    .select({ incident: incidents, community: communities, resident: residents })
    .from(incidents)
    .innerJoin(communities, eq(incidents.communityId, communities.id))
    .leftJoin(residents, eq(incidents.residentId, residents.id))
    .where(and(eq(incidents.id, Number(id)), eq(incidents.companyId, company.id)))
    .limit(1);
  const row = rows[0];
  if (!row) notFound();
  const { incident, community, resident } = row;
  const communityProviders = await db.select().from(providers).where(eq(providers.communityId, community.id));

  return (
    <>
      <div className="mb-4">
        <Link href="/app/incidencias" className="atlas-btn-ghost text-xs font-semibold">
          ← Volver a incidencias
        </Link>
      </div>
      <PageHeader
        eyebrow={incident.reference}
        title={incident.title}
        subtitle={`${community.name} · ${categoryLabel(incident.category)} · creada el ${formatDate(incident.createdAt)}`}
        actions={
          <>
            <PriorityChip priority={incident.priority} />
            <StatusChip status={incident.status} />
          </>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="grid gap-6">
          <div className="atlas-card atlas-card-pad">
            <h2 className="text-sm font-semibold text-foreground">Descripción</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{incident.description || "Sin descripción."}</p>
          </div>
          <div className="atlas-card atlas-card-pad">
            <h2 className="text-sm font-semibold text-foreground">Quién avisa</h2>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">Nombre</dt>
                <dd className="mt-0.5 text-foreground">{resident?.name ?? incident.reporterName ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">Contacto</dt>
                <dd className="mt-0.5 text-foreground">{resident?.email ?? incident.reporterContact ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">Piso</dt>
                <dd className="mt-0.5 text-foreground">{resident?.unit ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">Comunidad</dt>
                <dd className="mt-0.5 text-foreground">{community.name}</dd>
              </div>
            </dl>
          </div>
        </section>

        <aside className="atlas-card atlas-card-pad h-fit">
          <h2 className="text-sm font-semibold text-foreground">Gestión</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 rounded-lg border border-border bg-surface p-3">
            <div>
              <span className="atlas-label">Categoría (IA)</span>
              <p className="mt-1 text-sm font-semibold text-foreground">{categoryLabel(incident.category)}</p>
            </div>
            <div>
              <span className="atlas-label">Prioridad (IA)</span>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {incident.priority === "alta" ? "Alta" : incident.priority === "baja" ? "Baja" : "Media"}
              </p>
            </div>
          </div>
          <form action={updateIncident} className="mt-4 grid gap-4">
            <input type="hidden" name="id" value={incident.id} />
            <label className="block">
              <span className="atlas-label">Estado</span>
              <select name="status" defaultValue={incident.status} className="atlas-input">
                <option value="abierta">Abierta</option>
                <option value="en_curso">En curso</option>
                <option value="resuelta">Resuelta</option>
              </select>
            </label>
            <label className="block">
              <span className="atlas-label">Proveedor asignado</span>
              <select name="providerId" defaultValue={incident.providerId ?? ""} className="atlas-input">
                <option value="">Sin asignar</option>
                {communityProviders.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {categoryLabel(p.category)}
                  </option>
                ))}
              </select>
              {communityProviders.length === 0 ? (
                <p className="mt-1 text-xs text-muted">
                  Esta comunidad aún no tiene proveedores.{" "}
                  <Link href={`/app/comunidades/${community.id}`} className="underline">Añade uno aquí</Link>.
                </p>
              ) : null}
            </label>
            <label className="block">
              <span className="atlas-label">Nota interna</span>
              <textarea name="internalNote" rows={4} defaultValue={incident.internalNote ?? ""} className="atlas-input" placeholder="Solo visible para la gestoría." />
            </label>
            <button className="atlas-btn atlas-btn-primary">Guardar cambios</button>
            <p className="text-xs text-muted">Última actualización: {formatDate(incident.updatedAt)}</p>
          </form>
        </aside>
      </div>
    </>
  );
}
