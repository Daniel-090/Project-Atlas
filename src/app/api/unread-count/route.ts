import { NextResponse } from "next/server";
import { and, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { requireGestor } from "@/lib/session";

export async function GET() {
  const { company } = await requireGestor();
  const [{ value }] = await db
    .select({ value: count() })
    .from(messages)
    .where(and(eq(messages.companyId, company.id), eq(messages.isRead, false)));

  return NextResponse.json({ unread: value });
}
