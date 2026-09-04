import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { companies, messages } from "@/db/schema";
import { autoTags, detectCommunity } from "@/lib/mail-sync";

export const dynamic = "force-dynamic";

// POST /api/hooks/whatsapp?secret=<secreto por gestoría>
// Body: { from, name?, text, id? }
export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!secret) return Response.json({ ok: false, error: "missing secret" }, { status: 401 });
  const [company] = await db.select().from(companies).where(eq(companies.whatsappSecret, secret)).limit(1);
  if (!company) return Response.json({ ok: false, error: "invalid secret" }, { status: 401 });

  let payload: Record<string, unknown> = {};
  try {
    payload = (await req.json()) as Record<string, unknown>;
  } catch {
    const fd = await req.formData().catch(() => null);
    if (fd) fd.forEach((v, k) => (payload[k] = String(v)));
  }
  const from = String(payload.from ?? payload.phone ?? payload.From ?? "").trim();
  const name = String(payload.name ?? payload.profileName ?? "").trim();
  const text = String(payload.text ?? payload.body ?? payload.Body ?? payload.message ?? "").trim();
  const externalId = payload.id ? `wa-${String(payload.id)}` : null;
  if (!from || !text) return Response.json({ ok: false, error: "from and text are required" }, { status: 400 });

  const communityId = await detectCommunity(company.id, null, text);
  const subject = text.length > 80 ? `${text.slice(0, 77)}…` : text;
  const [row] = await db
    .insert(messages)
    .values({
      companyId: company.id,
      communityId,
      channel: "whatsapp",
      direction: "in",
      sender: name ? `${name} · ${from}` : from,
      subject,
      body: text,
      tags: autoTags(subject, text),
      externalId,
    })
    .onConflictDoNothing()
    .returning({ id: messages.id });
  return Response.json({ ok: true, id: row?.id ?? null, duplicated: !row });
}

export async function GET() {
  return Response.json({ ok: true, hint: "POST JSON { from, name, text, id } with ?secret=" });
}
