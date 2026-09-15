import type { VerticalConfig } from "./types";

/**
 * Vertical 1 — Atlas para administradores de fincas (comportamiento actual).
 * Esta configuración reproduce exactamente los textos y categorías que Atlas
 * tiene hoy, de modo que la vertical actual no cambia en absoluto.
 */
export const FINCAS: VerticalConfig = {
  key: "fincas",
  name: "Administradores de fincas",
  shortName: "Fincas",
  pitch: "Comunidades de propietarios: incidencias, vecinos, proveedores y comunicaciones.",

  company: { one: "Gestoría", many: "Gestorías", oneLower: "gestoría", manyLower: "gestorías" },

  entity: { one: "Comunidad", many: "Comunidades", oneLower: "comunidad", manyLower: "comunidades" },
  contact: { one: "Vecino", many: "Vecinos", oneLower: "vecino", manyLower: "vecinos" },
  request: { one: "Incidencia", many: "Incidencias", oneLower: "incidencia", manyLower: "incidencias" },
  provider: { one: "Proveedor", many: "Proveedores", oneLower: "proveedor", manyLower: "proveedores" },

  requestCta: "Registrar incidencia",
  portalName: "Portal del vecino",

  contactRoles: [],
  requestKinds: [],

  categories: [
    { key: "fontaneria", label: "Fontanería", words: ["agua", "fuga", "gotera", "humedad", "tubería", "tuberia", "bajante", "inundación", "inundacion", "grifo"] },
    { key: "electricidad", label: "Electricidad", words: ["luz", "bombilla", "eléctric", "electric", "enchufe", "cuadro", "apagón", "apagon", "fusible"] },
    { key: "ascensor", label: "Ascensor", words: ["ascensor", "elevador", "atrapad", "montacargas"] },
    { key: "limpieza", label: "Limpieza", words: ["limpieza", "sucio", "basura", "suciedad", "olor", "residuos"] },
    { key: "seguridad", label: "Seguridad", words: ["puerta", "cerradura", "portero", "robo", "okupa", "alarma", "cámara", "camara", "llave"] },
    { key: "convivencia", label: "Convivencia", words: ["ruido", "vecino", "molestia", "fiesta", "perro", "mascota"] },
    { key: "zonas_comunes", label: "Zonas comunes", words: ["piscina", "jardín", "jardin", "garaje", "portal", "escalera", "azotea", "terraza", "fachada", "tejado"] },
    { key: "administracion", label: "Administración", words: ["recibo", "cuota", "factura", "derrama", "junta", "acta", "pago", "presupuesto"] },
  ],
  highWords: ["urgente", "urgencia", "peligro", "inundación", "inundacion", "incendio", "fuego", "atrapad", "gas", "humo", "no funciona", "sin luz", "sin agua", "rotura", "reventad"],
  lowWords: ["sugerencia", "consulta", "pregunta", "cuando puedan", "sin prisa", "información", "informacion"],
  aiContext: "una gestoría de comunidades de vecinos",

  nav: [
    { href: "/app", label: "Resumen" },
    { href: "/app/incidencias", label: "Incidencias" },
    { href: "/app/comunidades", label: "Comunidades" },
    { href: "/app/residentes", label: "Vecinos" },
    { href: "/app/bandeja", label: "Bandeja" },
    { href: "/app/configuracion", label: "Configuración" },
  ],
  metrics: [
    { key: "requests", label: "Incidencias abiertas", href: "/app/incidencias" },
    { key: "entities", label: "Comunidades", href: "/app/comunidades" },
    { key: "contacts", label: "Vecinos registrados", href: "/app/residentes" },
    { key: "unread", label: "Mensajes sin leer", href: "/app/bandeja?filtro=noleidas" },
  ],

  features: {
    propertyAttributes: false,
    requestKinds: false,
    contactRoles: false,
    portfolio: false,
  },
};
