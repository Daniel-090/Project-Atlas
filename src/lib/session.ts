import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { communities, companies, residents, sessions, users } from "@/db/schema";
import { generateToken } from "@/lib/codes";

const COOKIE = "atlas_session";
const TTL_DAYS = 30;

export type SessionKind = "gestor" | "resident";

export async function createSession(kind: SessionKind, id: number) {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + TTL_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({
    token,
    kind,
    userId: kind === "gestor" ? id : null,
    residentId: kind === "resident" ? id : null,
    expiresAt,
  });
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.token, token));
  jar.delete(COOKIE);
}

async function readToken() {
  const jar = await cookies();
  return jar.get(COOKIE)?.value ?? null;
}

export async function getGestorSession() {
  const token = await readToken();
  if (!token) return null;
  const rows = await db
    .select({ user: users, company: companies })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .innerJoin(companies, eq(users.companyId, companies.id))
    .where(and(eq(sessions.token, token), eq(sessions.kind, "gestor"), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return rows[0] ?? null;
}

export async function requireGestor() {
  const s = await getGestorSession();
  if (!s) redirect("/acceso");
  return s;
}

export async function getResidentSession() {
  const token = await readToken();
  if (!token) return null;
  const rows = await db
    .select({ resident: residents, community: communities, company: companies })
    .from(sessions)
    .innerJoin(residents, eq(sessions.residentId, residents.id))
    .innerJoin(communities, eq(residents.communityId, communities.id))
    .innerJoin(companies, eq(residents.companyId, companies.id))
    .where(and(eq(sessions.token, token), eq(sessions.kind, "resident"), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return rows[0] ?? null;
}

export async function requireResident() {
  const s = await getResidentSession();
  if (!s) redirect("/vecino");
  return s;
}
