import Link from "next/link";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { communities, messages } from "@/db/schema";
import { requireGestor } from "@/lib/session";
import { syncCompanyMail } from "@/lib/mail-sync";
import { toggleRead } from "@/app/actions/panel";
import { ChannelChip, PageHeader, formatDate } from "@/components/page-header";
import { LogMessageForm } from "@/components/panel-forms";

const FILTERS = [
  { key: "todas", label: "Todas" },
  { key: "noleidas", label: "No leídas" },
  { key: "email", label: "Email" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "facturas", label: "Facturas" },
];

export default async function BandejaPage({ searchParams }: { searchParams: Promise<{ filtro?: string; registrar?: string }> }) {
  const { company } = await requireGestor();
  const { filtro = "todas", registrar } = await searchParams;

  // Sincronización silenciosa al abrir la bandeja (si hay IMAP y hace > 2 min)
  if (company.imapHost && company.imapUser && company.imapPassword) {
    const last = company.imapLastSync ? new Date(company.imapLastSync).getTime() : 0;
    if (Date.now() - last > 120_000) await syncCompanyMail(company).catch(() => undefined);
  }

  const conditions = [eq(messages.companyId, company.id)];
  if (filtro === "noleidas") conditions.push(eq(messages.isRead, false));
  if (filtro === "email" || filtro === "whatsapp") conditions.push(eq(messages.channel, filtro));
  if (filtro === "facturas") conditions.push(sql`${messages.tags} @> '["factura"]'::jsonb`);

  const [list, comms] = await Promise.all([
    db
      .select({ m: messages, communityName: communities.name })
      .from(messages)
      .leftJoin(communities, eq(messages.communityId, communities.id))
      .where(and(...conditions))
      .orderBy(desc(messages.createdAt))
      .limit(200),
    db.select({ id: communities.id, name: communities.name }).from(communities).where(eq(communities.companyId, company.id)),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Bandeja"
        title="Centro de comunicaciones"
        subtitle="Email, WhatsApp y llamadas de tus comunidades en un solo hilo."
        actions={
          <Link href={registrar ? "/app/bandeja" : "/app/bandeja?registrar=1"} className={`atlas-btn ${registrar ? "atlas-btn-secondary" : "atlas-btn-primary"}`}>
            {registrar ? "Cerrar" : "Registrar conversación"}
          </Link>
        }
      />

      {registrar ? (
        <section className="atlas-card atlas-card-pad mb-6">
          <p className="atlas-eyebrow">Registro manual</p>
          <h2 className="mt-1 mb-5 text-lg font-semibold text-foreground">Anotar una llamada o mensaje</h2>
          <LogMessageForm communities={comms} />
        </section>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <Link key={f.key} href={f.key === "todas" ? "/app/bandeja" : `/app/bandeja?filtro=${f.key}`} className={`atlas-chip !py-1.5 ${filtro === f.key ? "atlas-chip-primary" : ""}`}>
            {f.label}
          </Link>
        ))}
        {!company.imapHost ? (
          <Link href="/app/configuracion#correo" className="ml-auto text-xs font-semibold text-primary hover:underline">
            Conectar correo →
          </Link>
        ) : (
          <span className="ml-auto text-xs text-muted">Correo: {company.imapLastError ? "error de sincronización" : `sincronizado ${company.imapLastSync ? formatDate(company.imapLastSync) : "pendiente"}`}</span>
        )}
      </div>

      <section className="atlas-card overflow-hidden">
        {list.length === 0 ? (
          <div className="p-6">
            <div className="atlas-empty">No hay mensajes en este filtro. Conecta tu correo IMAP en Configuración o registra una conversación.</div>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {list.map(({ m, communityName }) => (
              <li key={m.id} className="px-6 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <ChannelChip channel={m.channel} />
                  {m.direction === "out" ? <span className="atlas-chip">Enviado</span> : null}
                  {m.tags.map((t) => (
                    <span key={t} className="atlas-chip capitalize">
                      {t}
                    </span>
                  ))}
                  {communityName ? <span className="atlas-chip">{communityName}</span> : null}
                  <span className="ml-auto text-xs text-muted">{formatDate(m.createdAt)}</span>
                </div>
                <div className="mt-2 flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: m.isRead ? "transparent" : "var(--atlas-primary)" }} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${m.isRead ? "font-medium text-foreground" : "font-semibold text-foreground"}`}>{m.subject}</p>
                    <p className="text-xs text-muted">{m.sender}</p>
                    {m.body ? <p className="mt-2 line-clamp-3 text-sm text-muted">{m.body}</p> : null}
                  </div>
                  <form action={toggleRead}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="read" value={m.isRead ? "0" : "1"} />
                    <button className="atlas-btn-ghost whitespace-nowrap text-xs font-semibold">{m.isRead ? "Marcar no leído" : "Marcar leído"}</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
