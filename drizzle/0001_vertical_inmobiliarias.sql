-- Atlas · Verticales (fincas / inmobiliarias)
-- Migración 100% ADITIVA: no elimina ni renombra columnas ni tablas.
-- Es idempotente: se puede ejecutar más de una vez sin errores.

ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "property_type" varchar(20);--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "operation_type" varchar(20);--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "listing_status" varchar(20) DEFAULT 'disponible' NOT NULL;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "price_cents" integer;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "m2" integer;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "rooms" integer;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "baths" integer;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "key_code" varchar(40);--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "notes" text;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "agent_user_id" integer;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "vertical" varchar(20) DEFAULT 'fincas' NOT NULL;--> statement-breakpoint
ALTER TABLE "incidents" ADD COLUMN IF NOT EXISTS "kind" varchar(20) DEFAULT 'incidencia' NOT NULL;--> statement-breakpoint
ALTER TABLE "residents" ADD COLUMN IF NOT EXISTS "role" varchar(20) DEFAULT 'propietario' NOT NULL;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "communities" ADD CONSTRAINT "communities_agent_user_id_users_id_fk"
    FOREIGN KEY ("agent_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
