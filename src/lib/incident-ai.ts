// Clasificación heurística de incidencias (categoría + prioridad) a partir del texto.

const CATEGORIES: Array<{ key: string; label: string; words: string[] }> = [
  { key: "fontaneria", label: "Fontanería", words: ["agua", "fuga", "gotera", "humedad", "tubería", "tuberia", "bajante", "inundación", "inundacion", "grifo"] },
  { key: "electricidad", label: "Electricidad", words: ["luz", "bombilla", "eléctric", "electric", "enchufe", "cuadro", "apagón", "apagon", "fusible"] },
  { key: "ascensor", label: "Ascensor", words: ["ascensor", "elevador", "atrapad", "montacargas"] },
  { key: "limpieza", label: "Limpieza", words: ["limpieza", "sucio", "basura", "suciedad", "olor", "residuos"] },
  { key: "seguridad", label: "Seguridad", words: ["puerta", "cerradura", "portero", "robo", "okupa", "alarma", "cámara", "camara", "llave"] },
  { key: "convivencia", label: "Convivencia", words: ["ruido", "vecino", "molestia", "fiesta", "perro", "mascota"] },
  { key: "zonas_comunes", label: "Zonas comunes", words: ["piscina", "jardín", "jardin", "garaje", "portal", "escalera", "azotea", "terraza", "fachada", "tejado"] },
  { key: "administracion", label: "Administración", words: ["recibo", "cuota", "factura", "derrama", "junta", "acta", "pago", "presupuesto"] },
];

const HIGH = ["urgente", "urgencia", "peligro", "inundación", "inundacion", "incendio", "fuego", "atrapad", "gas", "humo", "no funciona", "sin luz", "sin agua", "rotura", "reventad"];
const LOW = ["sugerencia", "consulta", "pregunta", "cuando puedan", "sin prisa", "información", "informacion"];

export interface Classification {
  category: string;
  priority: "baja" | "media" | "alta";
}

export function classifyIncident(title: string, description: string): Classification {
  const text = `${title} ${description}`.toLowerCase();
  let category = "general";
  let best = 0;
  for (const c of CATEGORIES) {
    const score = c.words.reduce((n, w) => (text.includes(w) ? n + 1 : n), 0);
    if (score > best) {
      best = score;
      category = c.key;
    }
  }
  let priority: Classification["priority"] = "media";
  if (HIGH.some((w) => text.includes(w))) priority = "alta";
  else if (LOW.some((w) => text.includes(w))) priority = "baja";
  return { category, priority };
}

export function categoryLabel(key: string): string {
  return CATEGORIES.find((c) => c.key === key)?.label ?? "General";
}

export const CATEGORY_OPTIONS = [{ key: "general", label: "General" }, ...CATEGORIES.map(({ key, label }) => ({ key, label }))];

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


// ─── Clasificación con IA (Gemini) + doble verificación, con fallback a palabras clave ──────
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const CATEGORY_KEYS = CATEGORIES.map((c) => c.key).concat("general");

async function askGemini(prompt: string): Promise<string | null> {
  if (!genAI) return null;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error("Error llamando a Gemini para clasificar incidencia", err);
    return null;
  }
}

export async function classifyIncidentAI(title: string, description: string): Promise<Classification> {
  const fallback = classifyIncident(title, description);

  const prompt1 = `Eres un clasificador de incidencias para una gestoría de comunidades de vecinos.
Categorías válidas: ${CATEGORY_KEYS.join(", ")}.
Prioridades válidas: baja, media, alta.

Incidencia:
Título: ${title}
Descripción: ${description}

Responde SOLO en este formato exacto, sin explicaciones: categoria|prioridad`;

  const first = await askGemini(prompt1);
  if (!first) return fallback;

  const [cat1, pri1] = first.split("|").map((s) => s.trim().toLowerCase());

  // Segunda pasada: verificación
  const prompt2 = `Revisa esta clasificación de una incidencia de comunidad de vecinos y corrígela si está mal.
Categorías válidas: ${CATEGORY_KEYS.join(", ")}.
Prioridades válidas: baja, media, alta.

Título: ${title}
Descripción: ${description}
Clasificación propuesta: categoría=${cat1}, prioridad=${pri1}

Responde SOLO en este formato exacto, sin explicaciones: categoria|prioridad`;

  const second = await askGemini(prompt2);
  if (!second) {
    const category = CATEGORY_KEYS.includes(cat1) ? cat1 : fallback.category;
    const priority = ["baja", "media", "alta"].includes(pri1) ? (pri1 as Classification["priority"]) : fallback.priority;
    return { category, priority };
  }

  const [cat2, pri2] = second.split("|").map((s) => s.trim().toLowerCase());
  const category = CATEGORY_KEYS.includes(cat2) ? cat2 : (CATEGORY_KEYS.includes(cat1) ? cat1 : fallback.category);
  const priority = ["baja", "media", "alta"].includes(pri2)
    ? (pri2 as Classification["priority"])
    : (["baja", "media", "alta"].includes(pri1) ? (pri1 as Classification["priority"]) : fallback.priority);

  return { category, priority };
}
