import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

/**
 * Render (y la mayoría de Postgres gestionados) exige TLS. Se activa solo cuando
 * hace falta, para no romper bases locales ni proveedores que ya funcionan sin SSL.
 */
function requiresSsl(url: string): boolean {
  if (/sslmode=require|ssl=true/i.test(url)) return true;
  return /\.render\.com|\.render\.internal|rds\.amazonaws\.com|\.ondigitalocean\.com/i.test(url);
}

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
    ...(requiresSsl(databaseUrl) ? { ssl: { rejectUnauthorized: false } } : {}),
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
