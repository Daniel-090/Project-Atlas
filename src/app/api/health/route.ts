import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * Endpoint de salud usado por Render como health check.
 * Devuelve información de diagnóstico sin exponer credenciales:
 *   { ok: true,  db: { configured: true,  connected: true } }
 *   { ok: false, db: { configured: false, connected: false, error: "…" } }
 */
export async function GET() {
  const configured = Boolean(process.env.DATABASE_URL);
  const info = {
    node: process.version,
    env: process.env.NODE_ENV ?? "desconocido",
  };

  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, db: { configured: true, connected: true }, ...info });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json(
      { ok: false, db: { configured, connected: false, error: message.slice(0, 300) }, ...info },
      { status: 500 }
    );
  }
}
