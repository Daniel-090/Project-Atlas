import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

// ─── Gestorías ────────────────────────────────────────────────────────────────
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  code: varchar("code", { length: 20 }).notNull().unique(), // ATL-XXXXXXXX
  phone: varchar("phone", { length: 40 }),
  // Personalización (solo dentro del panel y del portal del vecino)
  primaryColor: varchar("primary_color", { length: 9 }).notNull().default("#c9a227"),
  secondaryColor: varchar("secondary_color", { length: 9 }).notNull().default("#1f2937"),
  backgroundColor: varchar("background_color", { length: 9 }).notNull().default("#f6f7f9"),
  theme: varchar("theme", { length: 10 }).notNull().default("light"), // light | dark
  logoUrl: text("logo_url"),
  // Contactos públicos de la gestoría
  whatsappJson: jsonb("whatsapp_json").$type<string[]>().notNull().default([]),
  emailsJson: jsonb("emails_json").$type<string[]>().notNull().default([]),
  // Correo IMAP
  imapHost: varchar("imap_host", { length: 160 }),
  imapPort: integer("imap_port").default(993),
  imapUser: varchar("imap_user", { length: 160 }),
  imapPassword: text("imap_password"),
  imapFolder: varchar("imap_folder", { length: 80 }).default("INBOX"),
  imapLastSync: timestamp("imap_last_sync", { withTimezone: true }),
  imapLastError: text("imap_last_error"),
  // WhatsApp hook
  whatsappSecret: varchar("whatsapp_secret", { length: 64 }).notNull(),
  onboardingDone: boolean("onboarding_done").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Usuarios (gestores) ──────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 160 }).notNull().unique(),
  phone: varchar("phone", { length: 40 }),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Sesiones persistentes (gestor + vecino) ──────────────────────────────────
export const sessions = pgTable("sessions", {
  token: varchar("token", { length: 96 }).primaryKey(),
  kind: varchar("kind", { length: 10 }).notNull(), // gestor | resident
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  residentId: integer("resident_id").references(() => residents.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

// ─── Comunidades ──────────────────────────────────────────────────────────────
export const communities = pgTable("communities", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 160 }).notNull(),
  address: varchar("address", { length: 240 }).notNull().default(""),
  accessCode: varchar("access_code", { length: 20 }).notNull().unique(), // RES-XXXXXXXX
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Vecinos ──────────────────────────────────────────────────────────────────
export const residents = pgTable("residents", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  communityId: integer("community_id")
    .notNull()
    .references(() => communities.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 160 }).notNull().unique(),
  phone: varchar("phone", { length: 40 }),
  unit: varchar("unit", { length: 40 }), // piso / puerta
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Incidencias ──────────────────────────────────────────────────────────────
export const incidents = pgTable("incidents", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  communityId: integer("community_id")
    .notNull()
    .references(() => communities.id, { onDelete: "cascade" }),
  residentId: integer("resident_id").references(() => residents.id, { onDelete: "set null" }),
  reference: varchar("reference", { length: 20 }).notNull(), // INC-000123
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull().default(""),
  category: varchar("category", { length: 40 }).notNull().default("general"),
  priority: varchar("priority", { length: 10 }).notNull().default("media"), // baja | media | alta
  status: varchar("status", { length: 12 }).notNull().default("abierta"), // abierta | en_curso | resuelta
  reporterName: varchar("reporter_name", { length: 120 }),
  reporterContact: varchar("reporter_contact", { length: 160 }),
  internalNote: text("internal_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Bandeja de comunicaciones ────────────────────────────────────────────────
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  communityId: integer("community_id").references(() => communities.id, { onDelete: "set null" }),
  channel: varchar("channel", { length: 12 }).notNull(), // email | whatsapp | llamada
  direction: varchar("direction", { length: 4 }).notNull().default("in"), // in | out
  sender: varchar("sender", { length: 200 }).notNull().default(""),
  subject: varchar("subject", { length: 240 }).notNull().default(""),
  body: text("body").notNull().default(""),
  tags: jsonb("tags").$type<string[]>().notNull().default([]), // factura | aviso | documento
  isRead: boolean("is_read").notNull().default(false),
  isRelevant: boolean("is_relevant"), // null = aún sin clasificar por IA
  classifiedAt: timestamp("classified_at", { withTimezone: true }),
  externalId: varchar("external_id", { length: 240 }).unique(), // Message-ID (dedupe)
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Company = typeof companies.$inferSelect;
export type User = typeof users.$inferSelect;
export type Community = typeof communities.$inferSelect;
export type Resident = typeof residents.$inferSelect;
export type Incident = typeof incidents.$inferSelect;
export type Message = typeof messages.$inferSelect;
