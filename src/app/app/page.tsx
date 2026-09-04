import Link from "next/link";
import { redirect } from "next/navigation";
import { and, count, desc, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { communities, incidents, messages, residents } from "@/db/schema";
import { requireGestor } from "@/lib/session";
import { categoryLabel } from "@/lib/incident-ai";
import { ChannelChip, PageHeader, PriorityChip, StatusChip, formatDate } from "@/components/page-header";

export default async function ResumenPage() {
  const { company, user } = await requireGestor();
  if (!company.onboardingDone) redirect("/app/bienvenida");

  const [openIncidents, communityCount, residentCount, unread, recent, recentMessages] = await Promise.all([
    db.select({ value: count() }).from(incidents).where(and(eq(incidents.companyId, company.id), ne(incidents.status, "resuelta"))),
    db.select({ value: count() }).from(communities).where(eq(communities.companyId, company.id)),
    db.select({ value: count() }).from(residents).where(eq(residents.companyId, company.id)),
    db.select({ value: count() }).from(messages).where(and(eq(messages.companyId, company.id), eq(messages.isRead, false))),
    db
      .select({ incident: incidents, communityName: communities.name })
      .from(incidents)
      .innerJoin(communities, eq(incidents.communityId, communities.id))
      .where(eq(incidents.companyId, company.id))
      .orderBy(desc(incidents.createdAt))
      .limit(6),
    db.select().from(messages).where(eq(messages.companyId, company.id)).orderBy(desc(messages.createdAt)).limit(4),
  ]);

  const metrics = [
    { label: "Incidencias abiertas", value: openIncidents[0].value, href: "/app/incidencias" },
    { label: "Comunidades", value: communityCount[0].value, href: "/app/comunidades" },
    { label: "Vecinos registrados", value: residentCount[0].value, href: "/app/residentes" },
    { label: "Mensajes sin leer", value: unread[0].value, href: "/app/bandeja?filtro=noleidas" },
  ];

  return (
    <>
      <PageHeader eyebrow="Resumen" title={`Hola, ${user.name.split(" ")[0]}`} subtitle={`Estado general de ${company.name}.`} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => (
          <Link key={m.label} href={m.href} className="atlas-card atlas-card-pad transition hover:border-primary">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">{m.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{m.value}</p>
          </Link>
        ))}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="atlas-card">
          <div className="flex flex-col gap-2 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <h2 className="text-sm font-semibold text-foreground">Incidencias recientes</h2>
            <Link href="/app/incidencias" className="atlas-btn-ghost text-xs font-semibold">
              Ver todas →
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="p-5 sm:p-6">
              <div className="atlas-empty">Todavía no hay incidencias. Cuando un vecino cree una desde su portal, aparecerá aquí.</div>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map(({ incident, communityName }) => (
                <li key={incident.id}>
                  <Link href={`/app/incidencias/${incident.id}`} className="flex flex-col gap-3 px-5 py-4 transition hover:bg-surface-soft sm:flex-row sm:items-center sm:gap-4 sm:px-6">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{incident.title}</p>
                      <p className="mt-0.5 truncate text-xs text-muted">
                        {incident.reference} · {communityName} · {categoryLabel(incident.category)} · {formatDate(incident.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <PriorityChip priority={incident.priority} />
                      <StatusChip status={incident.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="atlas-card">
          <div className="flex flex-col gap-2 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <h2 className="text-sm font-semibold text-foreground">Últimas comunicaciones</h2>
            <Link href="/app/bandeja" className="atlas-btn-ghost text-xs font-semibold">
              Abrir bandeja →
            </Link>
          </div>
          {recentMessages.length === 0 ? (
            <div className="p-5 sm:p-6">
              <div className="atlas-empty">Sin mensajes. Conecta tu correo en Configuración o registra una llamada en la Bandeja.</div>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recentMessages.map((m) => (
                <li key={m.id} className="px-6 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <ChannelChip channel={m.channel} />
                    {!m.isRead ? <span className="h-2 w-2 rounded-full" style={{ background: "var(--atlas-primary)" }} /> : null}
                  </div>
                  <p className="mt-2 truncate text-sm font-medium text-foreground">{m.subject}</p>
                  <p className="truncate text-xs text-muted">
                    {m.sender} · {formatDate(m.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
