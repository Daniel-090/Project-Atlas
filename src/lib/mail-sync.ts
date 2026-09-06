import { classifyMessage } from "@/lib/classify";
import "server-only";
import { ImapFlow } from "imapflow";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { communities, companies, messages, residents, type Company } from "@/db/schema";

export const FACTURA_WORDS = ["factura", "recibo", "invoice", "cuota", "derrama"];

export function autoTags(subject: string, body: string): string[] {
  const t = `${subject} ${body}`.toLowerCase();
  const tags: string[] = [];
  if (FACTURA_WORDS.some((w) => t.includes(w))) tags.push("factura");
  if (/\baviso\b|comunicado|convocatoria/.test(t)) tags.push("aviso");
  if (/adjunto|documento|acta|certificado/.test(t)) tags.push("documento");
  return tags;
}

/** Detecta la comunidad por el email del remitente (residente) o por nombre citado en el texto. */
export async function detectCommunity(companyId: number, senderEmail: string | null, text: string): Promise<number | null> {
  if (senderEmail) {
    const r = await db
      .select({ communityId: residents.communityId })
      .from(residents)
      .where(and(eq(residents.companyId, companyId), eq(residents.email, senderEmail.toLowerCase())))
      .limit(1);
    if (r[0]) return r[0].communityId;
  }
  const list = await db.select({ id: communities.id, name: communities.name }).from(communities).where(eq(communities.companyId, companyId));
  const haystack = normalizeText(text);
  for (const c of list) {
    const needle = normalizeText(c.name).replace(/^(c\s?p|comunidad de propietarios|comunidad|cdad)\s+/, "").trim();
    if (needle.length >= 4 && haystack.includes(needle)) return c.id;
  }
  return null;
}

function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function translateImapError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/AUTHENTICATIONFAILED|Invalid credentials|Application-specific password/i.test(msg)) {
    return "Gmail rechazó las credenciales. Usa una contraseña de aplicación (16 letras, sin espacios) y activa IMAP en Gmail.";
  }
  if (/ENOTFOUND|ECONNREFUSED|getaddrinfo/i.test(msg)) return "No se pudo conectar al servidor IMAP. Revisa host y puerto.";
  if (/timeout|ETIMEDOUT/i.test(msg)) return "Tiempo de espera agotado al conectar con el servidor IMAP.";
  return msg.slice(0, 240);
}

// Extracción naive de texto plano desde el MIME completo (sin dependencias extra).
function extractPlainText(source: Buffer): string {
  const raw = source.toString("utf8");
  const sep = raw.indexOf("\r\n\r\n");
  const headers = sep >= 0 ? raw.slice(0, sep) : "";
  let body = sep >= 0 ? raw.slice(sep + 4) : raw;
  const boundaryMatch = headers.match(/boundary="?([^";\r\n]+)"?/i);
  if (boundaryMatch) {
    const parts = body.split(`--${boundaryMatch[1]}`);
    const plain = parts.find((p) => /content-type:\s*text\/plain/i.test(p));
    const html = parts.find((p) => /content-type:\s*text\/html/i.test(p));
    const chosen = plain ?? html ?? "";
    const psep = chosen.indexOf("\r\n\r\n");
    body = psep >= 0 ? chosen.slice(psep + 4) : chosen;
    if (!plain && html) body = body.replace(/<[^>]+>/g, " ");
  }
  if (/quoted-printable/i.test(headers) || /=\r?\n/.test(body)) {
    body = body.replace(/=\r?\n/g, "").replace(/=([0-9A-F]{2})/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
  } else if (/base64/i.test(headers)) {
    try {
      body = Buffer.from(body.replace(/\s+/g, ""), "base64").toString("utf8");
    } catch {
      /* dejar tal cual */
    }
  }
  return body.replace(/\s+/g, " ").trim().slice(0, 4000);
}

export interface SyncResult {
  ok: boolean;
  imported: number;
  error?: string;
}

export async function testImap(cfg: { host: string; port: number; user: string; password: string }): Promise<{ ok: boolean; error?: string }> {
  const client = new ImapFlow({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 993,
    auth: { user: cfg.user, pass: cfg.password },
    logger: false,
  });
  try {
    await client.connect();
    await client.logout();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: translateImapError(err) };
  }
}

export async function syncCompanyMail(company: Company): Promise<SyncResult> {
  if (!company.imapHost || !company.imapUser || !company.imapPassword) {
    return { ok: false, imported: 0, error: "IMAP no configurado" };
  }
  const client = new ImapFlow({
    host: company.imapHost,
    port: company.imapPort ?? 993,
    secure: (company.imapPort ?? 993) === 993,
    auth: { user: company.imapUser, pass: company.imapPassword },
    logger: false,
  });
  let imported = 0;
  try {
    await client.connect();
    const lock = await client.getMailboxLock(company.imapFolder || "INBOX");
    try {
      const status = await client.status(company.imapFolder || "INBOX", { uidNext: true });
      const uidNext = status.uidNext ?? 1;
      const from = Math.max(1, uidNext - 50);
      const candidates: Array<{ externalId: string; sender: string; senderEmail: string | null; subject: string; source: Buffer | undefined; date: Date }> = [];
      for await (const msg of client.fetch(`${from}:*`, { uid: true, envelope: true, source: { maxLength: 200_000 } }, { uid: true })) {
        const env = msg.envelope;
        const fromAddr = env?.from?.[0];
        const senderEmail = fromAddr?.address?.toLowerCase() ?? null;
        const sender = fromAddr?.name ? `${fromAddr.name} <${fromAddr.address ?? ""}>` : (fromAddr?.address ?? "Desconocido");
        candidates.push({
          externalId: env?.messageId || `uid-${company.id}-${msg.uid}`,
          sender,
          senderEmail,
          subject: env?.subject ?? "(sin asunto)",
          source: msg.source,
          date: env?.date ?? new Date(),
        });
      }
      if (candidates.length) {
        const existing = await db
          .select({ externalId: messages.externalId })
          .from(messages)
          .where(inArray(messages.externalId, candidates.map((c) => c.externalId)));
        const seen = new Set(existing.map((e) => e.externalId));
        for (const c of candidates) {
          if (seen.has(c.externalId)) continue;
          const body = c.source ? extractPlainText(c.source) : "";
          const communityId = await detectCommunity(company.id, c.senderEmail, `${c.subject} ${body}`);
          const [insertedEmail] = await db
            .insert(messages)
            .values({
              companyId: company.id,
              communityId,
              channel: "email",
              direction: "in",
              sender: c.sender,
              subject: c.subject,
              body,
              tags: autoTags(c.subject, body),
              externalId: c.externalId,
              createdAt: c.date,
            })
            .onConflictDoNothing()
            .returning({ id: messages.id });

          if (insertedEmail) {
            classifyMessage(insertedEmail.id, body, c.subject);
          }
          imported++;
        }
      }
    } finally {
      lock.release();
    }
    await client.logout();
    await db.update(companies).set({ imapLastSync: new Date(), imapLastError: null }).where(eq(companies.id, company.id));
    return { ok: true, imported };
  } catch (err) {
    const error = translateImapError(err);
    await db.update(companies).set({ imapLastError: error }).where(eq(companies.id, company.id));
    try {
      client.close();
    } catch {
      /* ignore */
    }
    return { ok: false, imported, error };
  }
}

/** Sincroniza todas las gestorías con IMAP configurado (usado por el hilo de fondo). */
export async function syncAllCompanies() {
  const list = await db.select().from(companies);
  for (const c of list) {
    if (c.imapHost && c.imapUser && c.imapPassword) {
      await syncCompanyMail(c).catch(() => undefined);
    }
  }
}
