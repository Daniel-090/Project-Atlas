// Clasificación de incidencias/solicitudes (categoría + prioridad) a partir del texto.
// El clasificador es compartido por todas las verticales: las categorías, las
// palabras clave y el contexto del prompt los define cada vertical
// (src/verticals). Si no se indica vertical, se usa la de fincas, que es el
// comportamiento histórico de Atlas.

import Groq from "groq-sdk";
import { FINCAS, type CategoryDef, type VerticalConfig } from "@/verticals";

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export interface Classification {
  category: string;
  priority: "baja" | "media" | "alta";
}

// ─── Compatibilidad con el código anterior (vertical fincas) ──────────────────
export const CATEGORIES: CategoryDef[] = FINCAS.categories;

export function categoryOptions(v: VerticalConfig = FINCAS) {
  return [{ key: "general", label: "General" }, ...v.categories.map(({ key, label }) => ({ key, label }))];

}

export const CATEGORY_OPTIONS = categoryOptions(FINCAS);

function categoriesOf(v: VerticalConfig) {
  return [{ key: "general", label: "General", words: [] as string[] }, ...v.categories];
}

export function categoryLabel(key: string, v: VerticalConfig = FINCAS): string {
  return categoriesOf(v).find((c) => c.key === key)?.label ?? "General";
}

export const STATUS_LABEL: Record<string, string> = {
  abierta: "Abierta",
  en_curso: "En curso",
  resuelta: "Resuelta",
};

export const PRIORITY_LABEL: Record<string, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
};

/** Clasificación heurística (se usa como fallback cuando la IA no responde). */
export function classifyIncident(title: string, description: string, v: VerticalConfig = FINCAS): Classification {
  const text = `${title} ${description}`.toLowerCase();
  let category = "general";
  let best = 0;
  for (const c of v.categories) {
    const score = c.words.reduce((n, w) => (text.includes(w) ? n + 1 : n), 0);
    if (score > best) {
      best = score;
      category = c.key;
    }
  }
  let priority: Classification["priority"] = "media";
  if (v.highWords.some((w) => text.includes(w))) priority = "alta";
  else if (v.lowWords.some((w) => text.includes(w))) priority = "baja";
  return { category, priority };
}

// ─── Clasificación con IA (Groq) + doble verificación, con fallback a palabras clave ──
async function askLlm(prompt: string): Promise<string | null> {
  if (!groq) return null;
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
    });
    return (completion.choices[0]?.message?.content ?? "").trim();
  } catch (err) {
    console.error("Error llamando a Groq para clasificar incidencia", err);
    return null;
  }
}

export async function classifyIncidentAI(
  title: string,
  description: string,
  v: VerticalConfig = FINCAS
): Promise<Classification> {
  const fallback = classifyIncident(title, description, v);
  const categoryKeys = v.categories.map((c) => c.key).concat("general");

  const prompt1 = `Eres un clasificador de ${v.request.manyLower} para ${v.aiContext}.
Categorías válidas: ${categoryKeys.join(", ")}.
Prioridades válidas: baja, media, alta.

${v.request.one}:
Título: ${title}
Descripción: ${description}

Responde SOLO en este formato exacto, sin explicaciones: categoria|prioridad`;

  const first = await askLlm(prompt1);
  if (!first) return fallback;

  const [cat1, pri1] = first.split("|").map((s) => s.trim().toLowerCase());

  // Segunda pasada: verificación
  const prompt2 = `Revisa esta clasificación de ${v.aiContext} y corrígela si está mal.
Categorías válidas: ${categoryKeys.join(", ")}.
Prioridades válidas: baja, media, alta.

Título: ${title}
Descripción: ${description}
Clasificación propuesta: categoría=${cat1}, prioridad=${pri1}

Responde SOLO en este formato exacto, sin explicaciones: categoria|prioridad`;

  const second = await askLlm(prompt2);
  if (!second) {
    const category = categoryKeys.includes(cat1) ? cat1 : fallback.category;
    const priority = ["baja", "media", "alta"].includes(pri1) ? (pri1 as Classification["priority"]) : fallback.priority;
    return { category, priority };
  }

  const [cat2, pri2] = second.split("|").map((s) => s.trim().toLowerCase());
  const category = categoryKeys.includes(cat2) ? cat2 : categoryKeys.includes(cat1) ? cat1 : fallback.category;
  const priority = ["baja", "media", "alta"].includes(pri2)
    ? (pri2 as Classification["priority"])
    : ["baja", "media", "alta"].includes(pri1)
      ? (pri1 as Classification["priority"])
      : fallback.priority;

  return { category, priority };
}

// ─── Selección de proveedor con IA (compartida por ambas verticales) ───────────
export async function pickProviderAI(
  category: string,
  title: string,
  description: string,
  candidates: Array<{ id: number; name: string; notes: string | null }>,
  v: VerticalConfig = FINCAS
): Promise<number | null> {
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0].id;
  if (!groq) return null;

  const list = candidates.map((c) => `id=${c.id} · ${c.name}${c.notes ? ` (${c.notes})` : ""}`).join("\n");
  const prompt = `Eres un asistente de ${v.aiContext}. Elige el ${v.provider.oneLower} más adecuado para esta ${v.request.oneLower} de categoría "${category}".

${v.request.one}:
Título: ${title}
Descripción: ${description}

${v.provider.many} disponibles:
${list}

Responde SOLO con el id numérico del ${v.provider.oneLower} elegido, sin nada más.`;

  const text = await askLlm(prompt);
  if (!text) return null;
  const id = Number(text.replace(/\D/g, ""));
  return candidates.some((c) => c.id === id) ? id : null;
}
