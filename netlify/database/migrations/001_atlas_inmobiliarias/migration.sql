CREATE TABLE "communities" (
  "id" serial PRIMARY KEY NOT NULL,
  "company_id" integer NOT NULL,
  "name" varchar(160) NOT NULL,
  "address" varchar(240) DEFAULT '' NOT NULL,
  "access_code" varchar(20) NOT NULL,
  "property_type" varchar(20), "operation_type" varchar(20),
  "listing_status" varchar(20) DEFAULT 'disponible' NOT NULL,
  "price_cents" integer, "m2" integer, "rooms" integer, "baths" integer,
  "key_code" varchar(40), "notes" text, "agent_user_id" integer,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "communities_access_code_unique" UNIQUE("access_code")
);
CREATE TABLE "companies" (
  "id" serial PRIMARY KEY NOT NULL, "name" varchar(160) NOT NULL,
  "code" varchar(20) NOT NULL, "vertical" varchar(20) DEFAULT 'fincas' NOT NULL,
  "phone" varchar(40), "primary_color" varchar(9) DEFAULT '#c9a227' NOT NULL,
  "secondary_color" varchar(9) DEFAULT '#1f2937' NOT NULL,
  "background_color" varchar(9) DEFAULT '#f6f7f9' NOT NULL,
  "theme" varchar(10) DEFAULT 'light' NOT NULL, "logo_url" text,
  "whatsapp_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "emails_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "imap_host" varchar(160), "imap_port" integer DEFAULT 993,
  "imap_user" varchar(160), "imap_password" text, "imap_folder" varchar(80) DEFAULT 'INBOX',
  "imap_last_sync" timestamp with time zone, "imap_last_error" text,
  "whatsapp_secret" varchar(64) NOT NULL, "onboarding_done" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "companies_code_unique" UNIQUE("code")
);
CREATE TABLE "incidents" (
  "id" serial PRIMARY KEY NOT NULL, "company_id" integer NOT NULL, "community_id" integer NOT NULL,
  "resident_id" integer, "reference" varchar(20) NOT NULL, "title" varchar(200) NOT NULL,
  "description" text DEFAULT '' NOT NULL, "kind" varchar(20) DEFAULT 'incidencia' NOT NULL,
  "category" varchar(40) DEFAULT 'general' NOT NULL, "priority" varchar(10) DEFAULT 'media' NOT NULL,
  "status" varchar(12) DEFAULT 'abierta' NOT NULL, "reporter_name" varchar(120),
  "reporter_contact" varchar(160), "internal_note" text, "provider_id" integer,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE "messages" (
  "id" serial PRIMARY KEY NOT NULL, "company_id" integer NOT NULL, "community_id" integer,
  "channel" varchar(12) NOT NULL, "direction" varchar(4) DEFAULT 'in' NOT NULL,
  "sender" varchar(200) DEFAULT '' NOT NULL, "subject" varchar(240) DEFAULT '' NOT NULL,
  "body" text DEFAULT '' NOT NULL, "tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "is_read" boolean DEFAULT false NOT NULL, "is_relevant" boolean,
  "classified_at" timestamp with time zone, "external_id" varchar(240),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "messages_external_id_unique" UNIQUE("external_id")
);
CREATE TABLE "providers" (
  "id" serial PRIMARY KEY NOT NULL, "company_id" integer NOT NULL, "community_id" integer NOT NULL,
  "category" varchar(40) NOT NULL, "name" varchar(160) NOT NULL, "phone" varchar(40),
  "email" varchar(160), "notes" text, "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE "residents" (
  "id" serial PRIMARY KEY NOT NULL, "company_id" integer NOT NULL, "community_id" integer NOT NULL,
  "name" varchar(120) NOT NULL, "email" varchar(160) NOT NULL, "phone" varchar(40),
  "unit" varchar(40), "role" varchar(20) DEFAULT 'propietario' NOT NULL,
  "password_hash" text NOT NULL, "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "residents_email_unique" UNIQUE("email")
);
CREATE TABLE "sessions" (
  "token" varchar(96) PRIMARY KEY NOT NULL, "kind" varchar(10) NOT NULL,
  "user_id" integer, "resident_id" integer,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "expires_at" timestamp with time zone NOT NULL
);
CREATE TABLE "users" (
  "id" serial PRIMARY KEY NOT NULL, "company_id" integer NOT NULL, "name" varchar(120) NOT NULL,
  "email" varchar(160) NOT NULL, "phone" varchar(40), "password_hash" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "users_email_unique" UNIQUE("email")
);
ALTER TABLE "communities" ADD CONSTRAINT "communities_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade;
ALTER TABLE "communities" ADD CONSTRAINT "communities_agent_user_id_users_id_fk" FOREIGN KEY ("agent_user_id") REFERENCES "public"."users"("id") ON DELETE set null;
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade;
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE cascade;
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_resident_id_residents_id_fk" FOREIGN KEY ("resident_id") REFERENCES "public"."residents"("id") ON DELETE set null;
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE set null;
ALTER TABLE "messages" ADD CONSTRAINT "messages_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade;
ALTER TABLE "messages" ADD CONSTRAINT "messages_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE set null;
ALTER TABLE "providers" ADD CONSTRAINT "providers_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade;
ALTER TABLE "providers" ADD CONSTRAINT "providers_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE cascade;
ALTER TABLE "residents" ADD CONSTRAINT "residents_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade;
ALTER TABLE "residents" ADD CONSTRAINT "residents_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE cascade;
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade;
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_resident_id_residents_id_fk" FOREIGN KEY ("resident_id") REFERENCES "public"."residents"("id") ON DELETE cascade;
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade;
