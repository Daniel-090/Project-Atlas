import Groq from "groq-sdk";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { eq } from "drizzle-orm";

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export async function classifyMessage(messageId: number, body: string, subject: string) {
  if (!groq) return;
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `Eres un filtro para una gestoría de comunidades de vecinos. Responde SOLO "true" o "false" (sin comillas ni nada más): ¿este mensaje trata sobre algo relacionado con la gestión de una comunidad de vecinos (incidencias, facturas, avisos, quejas, mantenimiento, juntas, pagos, etc.)?\n\nAsunto: ${subject}\nMensaje: ${body}`,
        },
      ],
    });
    const text = (completion.choices[0]?.message?.content ?? "").trim().toLowerCase();
    const isRelevant = text.includes("true");

    await db
      .update(messages)
      .set({ isRelevant, classifiedAt: new Date() })
      .where(eq(messages.id, messageId));
  } catch (err) {
    console.error("Error clasificando mensaje", messageId, err);
  }
}
