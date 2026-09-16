import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { getConnectionString } from "@netlify/database";
import { Pool } from "pg";

/**
 * Conexión perezosa a PostgreSQL.
 *
 * Importante: la conexión NO se crea al importar el módulo, sino la primera vez
 * que se usa. Si `DATABASE_URL` falta o está mal puesta, el error aparece solo
 * al consultar la base (mensaje claro en los logs) en lugar de tumbar el proceso
 * al arrancar. Esto evita el clásico "Application exited early" en Render.
 */

function requiresSsl(url: string): boolean {
  if (/sslmode=require|ssl=true/i.test(url)) return true;
  // Proveedores gestionados que exigen TLS (Render, Neon, Supabase, RDS…)
  return /\.render\.com|\.render\.internal|neon\.tech|supabase\.(co|com)|rds\.amazonaws\.com|\.ondigitalocean\.com|aivencloud\.com|elephantsql\.com/i.test(
    url
  );
}

const globalForDb = globalThis as typeof globalThis & {
  __atlasPool?: Pool;
  __atlasDb?: NodePgDatabase;
};

export function getPool(): Pool {
  if (globalForDb.__atlasPool) return globalForDb.__atlasPool;

  // En Netlify Database la URL se inyecta por sitio y por rama de despliegue.
  // La prioridad de DATABASE_URL mantiene compatibles los entornos existentes.
  const databaseUrl = process.env.DATABASE_URL ?? (process.env.NETLIFY === "true" ? getConnectionString() : undefined);
  if (!databaseUrl) {
    throw new Error(
      "Base de datos no configurada. Define DATABASE_URL o despliega en Netlify con Netlify Database activada."
    );
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ...(requiresSsl(databaseUrl) ? { ssl: { rejectUnauthorized: false } } : {}),
  });
  pool.on("error", (err) => console.error("[atlas][db] error de pool:", err.message));

  globalForDb.__atlasPool = pool;
  return pool;
}

function getDb(): NodePgDatabase {
  if (globalForDb.__atlasDb) return globalForDb.__atlasDb;
  globalForDb.__atlasDb = drizzle(getPool());
  return globalForDb.__atlasDb;
}

/** Proxy perezoso: mantiene la API `db.select()…` igual que antes. */
export const db = new Proxy({} as NodePgDatabase, {
  get(_target, prop) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === "function" ? value.bind(real) : value;
  },
});

/** Compatibilidad: `pool` se crea también bajo demanda. */
export const pool = new Proxy({} as Pool, {
  get(_target, prop) {
    const real = getPool() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === "function" ? value.bind(real) : value;
  },
});
