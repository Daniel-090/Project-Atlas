"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { communities, companies, residents, users } from "@/db/schema";
import { generateCode, generateSecret } from "@/lib/codes";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, destroySession } from "@/lib/session";
import { DEFAULT_VERTICAL, isVerticalKey, type VerticalKey } from "@/verticals";

export type ActionState = { error?: string } | undefined;

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

/**
 * Las ramas de producto pueden fijar una vertical mediante ATLAS_VERTICAL.
 * La comprobación vive en servidor: un formulario manipulado no puede crear
 * cuentas de otra vertical en el despliegue exclusivo de inmobiliarias.
 */
function registrationVertical(submitted: string): VerticalKey {
  const configured = process.env.ATLAS_VERTICAL;
  if (isVerticalKey(configured)) return configured;
  return isVerticalKey(submitted) ? submitted : DEFAULT_VERTICAL;
}

export async function registerGestor(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const name = str(fd, "name");
  const companyName = str(fd, "company");
  const verticalRaw = str(fd, "vertical");
  const vertical = registrationVertical(verticalRaw);
  const email = str(fd, "email").toLowerCase();
  const phone = str(fd, "phone");
  const password = str(fd, "password");
  if (!name || !companyName || !email || password.length < 6) {
    return { error: "Rellena todos los campos. La contraseña debe tener al menos 6 caracteres." };
  }
  const exists = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (exists.length) return { error: "Ya existe una cuenta con ese email." };

  const [company] = await db
    .insert(companies)
    .values({ name: companyName, code: generateCode("ATL"), phone: phone || null, whatsappSecret: generateSecret(), vertical })
    .returning({ id: companies.id });
  const [user] = await db
    .insert(users)
    .values({ companyId: company.id, name, email, phone: phone || null, passwordHash: hashPassword(password) })
    .returning({ id: users.id });

  await createSession("gestor", user.id); // auto-login
  redirect("/app/bienvenida");
}

export async function loginGestor(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const email = str(fd, "email").toLowerCase();
  const password = str(fd, "password");
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !verifyPassword(password, user.passwordHash)) return { error: "Email o contraseña incorrectos." };
  await createSession("gestor", user.id);
  redirect("/app");
}

export async function logout() {
  await destroySession();
  redirect("/");
}

// ─── Vecinos ──────────────────────────────────────────────────────────────────
export async function registerResident(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const code = str(fd, "code").toUpperCase();
  const name = str(fd, "name");
  const email = str(fd, "email").toLowerCase();
  const phone = str(fd, "phone");
  const unit = str(fd, "unit");
  const password = str(fd, "password");
  if (!code || !name || !email || password.length < 6) {
    return { error: "Rellena todos los campos. La contraseña debe tener al menos 6 caracteres." };
  }
  const [community] = await db.select().from(communities).where(eq(communities.accessCode, code)).limit(1);
  if (!community) return { error: "Código no válido. Pídeselo a tu empresa gestora (formato RES-XXXXXXXX)." };
  const exists = await db.select({ id: residents.id }).from(residents).where(eq(residents.email, email)).limit(1);
  if (exists.length) return { error: "Ya existe un vecino con ese email. Inicia sesión." };
  const [r] = await db
    .insert(residents)
    .values({
      companyId: community.companyId,
      communityId: community.id,
      name,
      email,
      phone: phone || null,
      unit: unit || null,
      role: str(fd, "role") || "propietario",
      passwordHash: hashPassword(password),
    })
    .returning({ id: residents.id });
  await createSession("resident", r.id);
  redirect("/vecino/portal");
}

export async function loginResident(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const email = str(fd, "email").toLowerCase();
  const password = str(fd, "password");
  const [r] = await db.select().from(residents).where(eq(residents.email, email)).limit(1);
  if (!r || !verifyPassword(password, r.passwordHash)) return { error: "Email o contraseña incorrectos." };
  await createSession("resident", r.id);
  redirect("/vecino/portal");
}

export async function logoutResident() {
  await destroySession();
  redirect("/vecino");
}
