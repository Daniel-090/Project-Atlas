import Link from "next/link";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { incidents, messages } from "@/db/schema";
import { requireResident } from "@/lib/session";
import { categoryLabel } from "@/lib/incident-ai";
import { ChannelChip, PageHeader, StatusChip, formatDate } from "@/components/page-header";

export default async function PortalPage({ searchParams }: { searchParams: Promise<{ creada?: string }> }) {
  const { resident, community, company } = await requireResident();
  const { creada } = await searchParams;
  const [mine, docs] = await Promise.all([
    db.select().from(incidents).where(and(eq(incidents.communityId, community.id), eq(incidents.residentId, resident.id))).orderBy(desc(incidents.createdAt)),
    db
      .select()
      .from(messages)
      .where(and(eq(messages.companyId, company.id), eq(messages.communityId, community.id), sql`${messages.tags} ?| array['factura','aviso','documento']`))
      .orderBy(desc(messages.createdAt))
      .limit(30),
  ]);

  const wa = (n: string) => `https://wa.me/${n.replace(/[^\d]/g, "")}`;

  return (
    <>
      <PageHeader
        eyebrow={community.name}
        title={`Hola, ${resident.name.split(" ")[0]}`}
        subtitle={community.address || `Portal del vecino · ${company.name}`}
        actions={
          <Link href="/vecino/portal/nueva" className="atlas-btn atlas-btn-primary">
            Crear incidencia
          </Link>
        }
      />
      {creada ? <p className="atlas-alert mb-5 sm:mb-6">Incidencia enviada. Tu gestoría la ha recibido y la revisará en breve.</p> : null}

      <div className="grid gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
        <section className="grid gap-5 sm:gap-6">
          <div className="atlas-card">
            <div className="border-b border-border px-5 py-4 sm:px-6">
              <h2 className="text-sm font-semibold text-foreground">Mis incidencias</h2>
            </div>
            {mine.length === 0 ? (
              <div className="p-5 sm:p-6">
                <div className="atlas-empty">Aún no has creado ninguna incidencia.</div>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {mine.map((i) => (
                  <li key={i.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{i.title}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {i.reference} · {categoryLabel(i.category)} · {formatDate(i.createdAt)}
                      </p>
                    </div>
                    <StatusChip status={i.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="atlas-card">
            <div className="border-b border-border px-5 py-4 sm:px-6">
              <h2 className="text-sm font-semibold text-foreground">Documentos y facturas</h2>
              <p className="text-xs text-muted">Comunicados, facturas y avisos de tu comunidad.</p>
            </div>
            {docs.length === 0 ? (
              <div className="p-5 sm:p-6">
                <div className="atlas-empty">Todavía no hay documentos publicados para tu comunidad.</div>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {docs.map((d) => (
                  <li key={d.id} className="px-5 py-4 sm:px-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <ChannelChip channel={d.channel} />
                      {d.tags.map((t) => (
                        <span key={t} className="atlas-chip capitalize">
                          {t}
                        </span>
                      ))}
                      <span className="text-xs text-muted sm:ml-auto">{formatDate(d.createdAt)}</span>
                    </div>
                    <p className="mt-2 break-words text-sm font-medium text-foreground">{d.subject}</p>
                    {d.body ? <p className="mt-1 break-words line-clamp-3 text-sm text-muted">{d.body}</p> : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <aside className="atlas-card atlas-card-pad h-fit lg:sticky lg:top-6">
          <p className="atlas-eyebrow">Tu gestoría</p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">{company.name}</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {company.whatsappJson.map((n) => (
              <a key={n} href={wa(n)} target="_blank" rel="noreferrer" className="atlas-btn atlas-btn-secondary justify-start">
                <span aria-hidden>◉</span> WhatsApp {n}
              </a>
            ))}
            {company.emailsJson.map((e) => (
              <a key={e} href={`mailto:${e}`} className="atlas-btn atlas-btn-secondary justify-start">
                <span aria-hidden>✉</span> {e}
              </a>
            ))}
            {company.phone ? (
              <a href={`tel:${company.phone.replace(/\s+/g, "")}`} className="atlas-btn atlas-btn-secondary justify-start">
                <span aria-hidden>☏</span> {company.phone}
              </a>
            ) : null}
            {!company.whatsappJson.length && !company.emailsJson.length && !company.phone ? <p className="text-sm text-muted">Tu gestoría aún no ha publicado contactos.</p> : null}
          </div>
        </aside>
      </div>
    </>
  );
}
