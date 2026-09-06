import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { eq } from "drizzle-orm";

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

export async function classifyMessage(messageId: number, body: string, subject: string) {
  if (!genAI) return;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const prompt = `Eres un filtro para una gestoría de comunidades de vecinos. Responde SOLO "true" o "false" (sin comillas ni nada más): ¿este mensaje trata sobre algo relacionado con la gestión de una comunidad de vecinos (incidencias, facturas, avisos, quejas, mantenimiento, juntas, pagos, etc.)?\n\nAsunto: ${subject}\nMensaje: ${body}`;
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().toLowerCase();
    const isRelevant = text.includes("true");

    await db
      .update(messages)
      .set({ isRelevant, classifiedAt: new Date() })
      .where(eq(messages.id, messageId));
  } catch (err) {
    console.error("Error clasificando mensaje", messageId, err);
  }
}
