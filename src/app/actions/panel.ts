"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { communities, companies, incidents, messages } from "@/db/schema";
import { generateCode, incidentReference } from "@/lib/codes";
import { classifyIncidentAI } from "@/lib/incident-ai";
import { notifyHighPriority } from "@/lib/notify";
import { providers } from "@/db/schema";
import { users } from "@/db/schema";
import { autoTags, detectCommunity, syncCompanyMail, testImap } from "@/lib/mail-sync";
import { classifyMessage } from "@/lib/classify";
import { requireGestor, requireResident } from "@/lib/session";
import { normalizeHex } from "@/lib/theme";
import type { ActionState } from "./auth";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

// ─── Comunidades ──────────────────────────────────────────────────────────────
export async function createCommunity(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { company } = await requireGestor();
  const name = str(fd, "name");
  const address = str(fd, "address");
  if (!name) return { error: "El nombre de la comunidad es obligatorio." };
  await db.insert(communities).values({ companyId: company.id, name, address, accessCode: generateCode("RES") });
  revalidatePath("/app/comunidades");
  revalidatePath("/app");
  return {};
}

export async function deleteCommunity(fd: FormData) {
  const { company } = await requireGestor();
  const id = Number(fd.get("id"));
  await db.delete(communities).where(and(eq(communities.id, id), eq(communities.companyId, company.id)));
  revalidatePath("/app/comunidades");
  revalidatePath("/app");
}

// ─── Incidencias ──────────────────────────────────────────────────────────────
export async function createIncidentAsGestor(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { company } = await requireGestor();
  const communityId = Number(fd.get("communityId"));
  const title = str(fd, "title");
  const description = str(fd, "description");
  if (!communityId || !title) return { error: "Indica comunidad y título." };
  const [c] = await db
    .select({ id: communities.id })
    .from(communities)
    .where(and(eq(communities.id, communityId), eq(communities.companyId, company.id)))
    .limit(1);
  if (!c) return { error: "Comunidad no válida." };
  const ai = await classifyIncidentAI(title, description);
  const [row] = await db
    .insert(incidents)
    .values({
      companyId: company.id,
      communityId,
      reference: "INC-PENDING",
      title,
      description,
      category: str(fd, "category") || ai.category,
      priority: ai.priority,
      reporterName: str(fd, "reporterName") || null,
      reporterContact: str(fd, "reporterContact") || null,
    })
    .returning({ id: incidents.id });
  await db.update(incidents).set({ reference: incidentReference(row.id) }).where(eq(incidents.id, row.id));

  if (ai.priority === "alta") {
    const teamEmails = await db.select({ email: users.email }).from(users).where(eq(users.companyId, company.id));
    const [comm] = await db.select({ name: communities.name }).from(communities).where(eq(communities.id, communityId)).limit(1);
    notifyHighPriority({
      emails: [...teamEmails.map((u) => u.email), ...company.emailsJson],
      reference: incidentReference(row.id),
      title,
      communityName: comm?.name ?? "",
      incidentId: row.id,
    });
  }

  revalidatePath("/app/incidencias");
  revalidatePath("/app");
  redirect(`/app/incidencias/${row.id}`);
}

export async function updateIncident(fd: FormData) {
  const { company } = await requireGestor();
  const id = Number(fd.get("id"));
  const status = str(fd, "status");
  const category = str(fd, "category");
  const internalNote = str(fd, "internalNote");
  await db
    .update(incidents)
    .set({
      ...(status ? { status } : {}),
      ...(category ? { category } : {}),
      internalNote: internalNote || null,
      updatedAt: new Date(),
    })
    .where(and(eq(incidents.id, id), eq(incidents.companyId, company.id)));
  revalidatePath(`/app/incidencias/${id}`);
  revalidatePath("/app/incidencias");
  revalidatePath("/app");
}

export async function createIncidentAsResident(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { resident } = await requireResident();
  const title = str(fd, "title");
  const description = str(fd, "description");
  if (!title || !description) return { error: "Describe la incidencia con un título y un detalle." };
  const ai = await classifyIncidentAI(title, description);
  const [row] = await db
    .insert(incidents)
    .values({
      companyId: resident.companyId,
      communityId: resident.communityId,
      residentId: resident.id,
      reference: "INC-PENDING",
      title,
      description,
      category: ai.category,
      priority: ai.priority,
      reporterName: resident.name,
      reporterContact: resident.email,
    })
    .returning({ id: incidents.id });
  await db.update(incidents).set({ reference: incidentReference(row.id) }).where(eq(incidents.id, row.id));

  if (ai.priority === "alta") {
    const [comp] = await db.select().from(companies).where(eq(companies.id, resident.companyId)).limit(1);
    const teamEmails = await db.select({ email: users.email }).from(users).where(eq(users.companyId, resident.companyId));
    const [comm] = await db.select({ name: communities.name }).from(communities).where(eq(communities.id, resident.communityId)).limit(1);
    notifyHighPriority({
      emails: [...teamEmails.map((u) => u.email), ...(comp?.emailsJson ?? [])],
      reference: incidentReference(row.id),
      title,
      communityName: comm?.name ?? "",
      incidentId: row.id,
    });
  }

  revalidatePath("/vecino/portal");
  redirect("/vecino/portal?creada=1");
}

// ─── Bandeja ──────────────────────────────────────────────────────────────────
export async function logMessage(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { company } = await requireGestor();
  const channel = str(fd, "channel");
  const sender = str(fd, "sender");
  const subject = str(fd, "subject");
  const body = str(fd, "body");
  const communityIdRaw = Number(fd.get("communityId"));
  if (!["email", "whatsapp", "llamada"].includes(channel) || !sender || !subject) {
    return { error: "Indica canal, remitente y asunto." };
  }
  const tags = autoTags(subject, body);
  if (fd.get("factura") === "on" && !tags.includes("factura")) tags.push("factura");
  const communityId = communityIdRaw || (await detectCommunity(company.id, sender.includes("@") ? sender : null, `${subject} ${body}`));
  const direction = str(fd, "direction") === "out" ? "out" : "in";
  const [inserted] = await db.insert(messages).values({
    companyId: company.id,
    communityId,
    channel,
    direction,
    sender,
    subject,
    body,
    tags,
    isRead: true,
  }).returning({ id: messages.id });

  if (direction === "in" && inserted) {
    classifyMessage(inserted.id, body, subject);
  }

  revalidatePath("/app/bandeja");
  revalidatePath("/app");
  return {};
}

export async function toggleRead(fd: FormData) {
  const { company } = await requireGestor();
  const id = Number(fd.get("id"));
  const read = fd.get("read") === "1";
  await db.update(messages).set({ isRead: read }).where(and(eq(messages.id, id), eq(messages.companyId, company.id)));
  revalidatePath("/app/bandeja");
  revalidatePath("/app");
}

export async function syncMailNow(): Promise<ActionState> {
  const { company } = await requireGestor();
  const r = await syncCompanyMail(company);
  revalidatePath("/app/bandeja");
  revalidatePath("/app/configuracion");
  return r.ok ? { error: `Sincronización correcta: ${r.imported} mensajes nuevos.` } : { error: r.error };
}

// ─── Configuración ────────────────────────────────────────────────────────────
export async function saveCustomization(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { company } = await requireGestor();
  const theme = str(fd, "theme") === "dark" ? "dark" : "light";
  await db
    .update(companies)
    .set({
      name: str(fd, "companyName") || company.name,
      primaryColor: normalizeHex(str(fd, "primaryColor"), company.primaryColor),
      secondaryColor: normalizeHex(str(fd, "secondaryColor"), company.secondaryColor),
      backgroundColor: theme === "dark" ? "#111111" : "#ffffff",
      theme,
      logoUrl: str(fd, "logoUrl") || null,
    })
    .where(eq(companies.id, company.id));
  revalidatePath("/app", "layout");
  return { error: "Personalización guardada." };
}

function parseList(raw: string): string[] {
  return raw
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 10);
}

export async function saveContacts(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { company } = await requireGestor();
  await db
    .update(companies)
    .set({
      phone: str(fd, "phone") || null,
      whatsappJson: parseList(str(fd, "whatsapp")),
      emailsJson: parseList(str(fd, "emails")),
    })
    .where(eq(companies.id, company.id));
  revalidatePath("/app", "layout");
  return { error: "Contactos guardados." };
}

export async function saveImap(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { company } = await requireGestor();
  const host = str(fd, "imapHost");
  const port = Number(fd.get("imapPort")) || 993;
  const user = str(fd, "imapUser");
  const passwordRaw = str(fd, "imapPassword").replace(/\s+/g, "");
  const password = passwordRaw || company.imapPassword || "";
  const folder = str(fd, "imapFolder") || "INBOX";
  const intent = str(fd, "intent");

  await db
    .update(companies)
    .set({ imapHost: host || null, imapPort: port, imapUser: user || null, imapPassword: password || null, imapFolder: folder })
    .where(eq(companies.id, company.id));
  revalidatePath("/app/configuracion");

  if (intent === "test") {
    if (!host || !user || !password) return { error: "Faltan datos para probar la conexión." };
    const r = await testImap({ host, port, user, password });
    return { error: r.ok ? "Conexión IMAP correcta." : r.error };
  }
  if (intent === "sync") {
    const [fresh] = await db.select().from(companies).where(eq(companies.id, company.id)).limit(1);
    const r = await syncCompanyMail(fresh);
    revalidatePath("/app/bandeja");
    return { error: r.ok ? `Sincronización correcta: ${r.imported} mensajes nuevos.` : r.error };
  }
  return { error: "Configuración de correo guardada." };
}

// ─── Wizard de bienvenida ─────────────────────────────────────────────────────
export async function finishOnboarding(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { company } = await requireGestor();
  const theme = str(fd, "theme") === "dark" ? "dark" : "light";
  await db
    .update(companies)
    .set({
      primaryColor: normalizeHex(str(fd, "primaryColor"), company.primaryColor),
      secondaryColor: normalizeHex(str(fd, "secondaryColor"), company.secondaryColor),
      backgroundColor: normalizeHex(str(fd, "backgroundColor"), company.backgroundColor),
      theme,
      logoUrl: str(fd, "logoUrl") || null,
      whatsappJson: parseList(str(fd, "whatsapp")),
      emailsJson: parseList(str(fd, "emails")),
      onboardingDone: true,
    })
    .where(eq(companies.id, company.id));
  revalidatePath("/app", "layout");
  redirect("/app");
}


// ─── Proveedores ──────────────────────────────────────────────────────────────
export async function createProvider(fd: FormData) {
  const { company } = await requireGestor();
  const communityId = Number(fd.get("communityId"));
  const [c] = await db.select({ id: communities.id }).from(communities).where(and(eq(communities.id, communityId), eq(communities.companyId, company.id))).limit(1);
  if (!c) return;
  await db.insert(providers).values({
    companyId: company.id,
    communityId,
    category: str(fd, "category"),
    name: str(fd, "name"),
    phone: str(fd, "phone") || null,
    email: str(fd, "email") || null,
    notes: str(fd, "notes") || null,
  });
  revalidatePath(`/app/comunidades/${communityId}`);
}

export async function deleteProvider(fd: FormData) {
  const { company } = await requireGestor();
  const id = Number(fd.get("id"));
  const communityId = Number(fd.get("communityId"));
  await db.delete(providers).where(and(eq(providers.id, id), eq(providers.companyId, company.id)));
  revalidatePath(`/app/comunidades/${communityId}`);
}
