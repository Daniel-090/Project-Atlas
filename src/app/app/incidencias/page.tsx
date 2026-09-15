import Link from "next/link";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { communities, incidents } from "@/db/schema";
import { requireGestor } from "@/lib/session";
import { categoryLabel } from "@/lib/incident-ai";
import { PageHeader, PriorityChip, StatusChip, formatDate } from "@/components/page-header";
import { IncidentForm } from "@/components/panel-forms";
import { getVertical } from "@/verticals";
import { KindChip } from "@/components/page-header";

const FILTERS = [
  { key: "todas", label: "Todas" },
  { key: "abierta", label: "Abiertas" },
  { key: "en_curso", label: "En curso" },
  { key: "resuelta", label: "Resueltas" },
];

export default async function IncidenciasPage({ searchParams }: { searchParams: Promise<{ estado?: string; nueva?: string; tipo?: string }> }) {
  const { company } = await requireGestor();
  const v = getVertical(company.vertical);
  const { estado = "todas", nueva, tipo } = await searchParams;
  const conds = [eq(incidents.companyId, company.id)];
  if (estado !== "todas") conds.push(eq(incidents.status, estado));
  if (tipo && v.features.requestKinds) conds.push(eq(incidents.kind, tipo));
  const where = and(...conds);
  const [list, comms] = await Promise.all([
    db
      .select({ incident: incidents, communityName: communities.name })
      .from(incidents)
      .innerJoin(communities, eq(incidents.communityId, communities.id))
      .where(where)
      .orderBy(
        sql`CASE ${incidents.priority} WHEN 'alta' THEN 0 WHEN 'media' THEN 1 ELSE 2 END`,
        desc(incidents.createdAt)
      ),
    db.select({ id: communities.id, name: communities.name }).from(communities).where(eq(communities.companyId, company.id)),
  ]);

  return (
    <>
      <PageHeader
        eyebrow={v.request.many}
        title={v.request.many}
        subtitle={`Todas las ${v.request.manyLower} de tus ${v.entity.manyLower}, clasificadas automáticamente.`}
        actions={
          <Link href={nueva ? "/app/incidencias" : "/app/incidencias?nueva=1"} className={`atlas-btn ${nueva ? "atlas-btn-secondary" : "atlas-btn-primary"}`}>
            {nueva ? "Cerrar formulario" : v.requestCta}
          </Link>
        }
      />

      {nueva ? (
        <section className="atlas-card atlas-card-pad mb-6 sm:mb-7">
          <p className="atlas-eyebrow">Nueva {v.request.oneLower}</p>
          <h2 className="mt-1 mb-5 text-lg font-semibold text-foreground">Registrar en nombre de un {v.contact.oneLower}</h2>
          {comms.length === 0 ? <div className="atlas-empty">Primero crea {v.features.propertyAttributes ? "un inmueble" : "una comunidad"}.</div> : <IncidentForm communities={comms} vertical={v.key} />}
        </section>
      ) : null}

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 sm:mb-4 sm:flex-wrap sm:overflow-visible sm:pb-0">
        {FILTERS.map((f) => (
          <Link key={f.key} href={f.key === "todas" ? "/app/incidencias" : `/app/incidencias?estado=${f.key}`} className={`atlas-chip shrink-0 !py-2 ${estado === f.key ? "atlas-chip-primary" : ""}`}>
            {f.label}
          </Link>
        ))}
      </div>

      {v.features.requestKinds ? (
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1 sm:mb-4 sm:flex-wrap sm:overflow-visible sm:pb-0">
          {[{ key: "", label: "Todos los tipos" }, ...v.requestKinds].map((k) => (
            <Link
              key={k.key || "todos"}
              href={k.key ? `/app/incidencias?tipo=${k.key}` : "/app/incidencias"}
              className={`atlas-chip shrink-0 !py-2 ${(tipo ?? "") === k.key ? "atlas-chip-primary" : ""}`}
            >
              {k.label}
            </Link>
          ))}
        </div>
      ) : null}

      <section className="atlas-card overflow-hidden">
        {list.length === 0 ? (
          <div className="p-5 sm:p-6">
            <div className="atlas-empty">No hay {v.request.manyLower} en este filtro.</div>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {list.map(({ incident, communityName }) => (
              <li key={incident.id}>
                <Link href={`/app/incidencias/${incident.id}`} className="flex flex-col gap-3 px-5 py-4 transition hover:bg-surface-soft sm:flex-row sm:items-center sm:px-6">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{incident.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted">
                      {incident.reference} · {communityName} · {categoryLabel(incident.category, v)} · {formatDate(incident.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {v.features.requestKinds ? <KindChip kind={incident.kind} vertical={v.key} /> : null}
                    <PriorityChip priority={incident.priority} />
                    <StatusChip status={incident.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
