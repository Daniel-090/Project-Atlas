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
