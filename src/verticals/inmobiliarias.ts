import type { VerticalConfig } from "./types";

/**
 * Vertical 2 — Atlas para inmobiliarias.
 *
 * Reutiliza exactamente las mismas tablas, rutas y componentes que la vertical de
 * fincas. Lo que cambia de verdad (no solo palabras):
 *   - El "comunidad" pasa a ser un inmueble con ficha comercial (tipo, operación,
 *     precio, m², habitaciones, estado de cartera, llaves, agente responsable).
 *   - El "vecino" pasa a ser un contacto con rol: propietario, inquilino o interesado.
 *   - La "incidencia" pasa a ser una solicitud con tipo: incidencia, solicitud o aviso.
 *   - La IA clasifica con categorías del negocio inmobiliario (comercial, contratos,
 *     rentas, llaves, documentación, comunidad de propietarios…).
 */
export const INMOBILIARIAS: VerticalConfig = {
  key: "inmobiliarias",
  name: "Inmobiliarias",
  shortName: "Inmobiliarias",
  pitch: "Cartera de inmuebles: propietarios, inquilinos, solicitudes, visitas y contratos.",

  company: { one: "Inmobiliaria", many: "Inmobiliarias", oneLower: "inmobiliaria", manyLower: "inmobiliarias" },

  entity: { one: "Inmueble", many: "Inmuebles", oneLower: "inmueble", manyLower: "inmuebles" },
  contact: { one: "Contacto", many: "Propietarios e inquilinos", oneLower: "contacto", manyLower: "propietarios e inquilinos" },
  request: { one: "Solicitud", many: "Solicitudes", oneLower: "solicitud", manyLower: "solicitudes" },
  provider: { one: "Proveedor", many: "Proveedores", oneLower: "proveedor", manyLower: "proveedores" },

  requestCta: "Registrar solicitud",
  portalName: "Portal del propietario e inquilino",

  contactRoles: [
    { key: "propietario", label: "Propietario" },
    { key: "inquilino", label: "Inquilino" },
    { key: "interesado", label: "Interesado" },
  ],
  requestKinds: [
    { key: "incidencia", label: "Incidencia" },
    { key: "solicitud", label: "Solicitud" },
    { key: "aviso", label: "Aviso" },
  ],

  categories: [
    // Mantenimiento del inmueble (equivalente al negocio de fincas)
    { key: "fontaneria", label: "Fontanería", words: ["agua", "fuga", "gotera", "humedad", "tubería", "tuberia", "bajante", "inundación", "inundacion", "grifo", "caldera", "termo"] },
    { key: "electricidad", label: "Electricidad", words: ["luz", "bombilla", "eléctric", "electric", "enchufe", "cuadro", "apagón", "apagon", "fusible"] },
    { key: "ascensor", label: "Ascensor", words: ["ascensor", "elevador", "atrapad", "montacargas"] },
    { key: "climatizacion", label: "Climatización", words: ["aire", "calefacción", "calefaccion", "radiador", "frío", "frio", "calor", "bomba de calor", "termostato"] },
    { key: "limpieza", label: "Limpieza", words: ["limpieza", "sucio", "basura", "suciedad", "olor", "residuos", "desinfec"] },
    { key: "seguridad", label: "Seguridad y accesos", words: ["puerta", "cerradura", "portero", "robo", "okupa", "alarma", "cámara", "camara", "candado", "persiana"] },
    { key: "zonas_comunes", label: "Zonas comunes", words: ["piscina", "jardín", "jardin", "garaje", "portal", "escalera", "azotea", "terraza", "fachada", "tejado", "trastero"] },
    // Negocio inmobiliario
    { key: "comercial", label: "Comercial y visitas", words: ["visita", "enseñar", "ensenar", "interesado", "oferta", "precio", "tasación", "tasacion", "cartel", "anuncio", "portal inmobiliario", "idealista", "fotos", "vídeo", "video", "publicar"] },
    { key: "contratos", label: "Contratos", words: ["contrato", "arrendamiento", "renovación", "renovacion", "prórroga", "prorroga", "fianza", "inventario", "firmar", "rescisión", "rescicion", "aval", "fiador"] },
    { key: "rentas", label: "Rentas y pagos", words: ["renta", "alquiler", "recibo", "pago", "impago", "cuota", "devolución", "devolucion", "actualización", "actualizacion", "ipc", "depósito", "deposito"] },
    { key: "llaves", label: "Llaves y accesos", words: ["llave", "llaves", "copia", "código", "codigo", "acceso", "cerradura inteligente", "caja de seguridad", "recoger llaves", "entregar llaves"] },
    { key: "documentacion", label: "Documentación", words: ["documento", "certificado", "escritura", "nota simple", "catastro", "eficiencia energética", "cedula", "cédula", "habitabilidad", "dni", "factura", "recibo"] },
    { key: "comunidad", label: "Comunidad de propietarios", words: ["comunidad", "junta", "derrama", "presidente", "acta", "administrador de fincas", "vecinos"] },
  ],
  highWords: [
    "urgente", "urgencia", "peligro", "inundación", "inundacion", "incendio", "fuego", "gas", "humo", "atrapad",
    "sin luz", "sin agua", "sin calefacción", "sin calefaccion", "rotura", "reventad", "impago", "desahucio", "okupa", "vencimiento", "mañana", "hoy mismo",
  ],
  lowWords: ["sugerencia", "consulta", "pregunta", "cuando puedan", "sin prisa", "información", "informacion", "duda"],
  aiContext: "una inmobiliaria que gestiona una cartera de inmuebles en alquiler y venta",

  nav: [
    { href: "/app", label: "Resumen" },
    { href: "/app/incidencias", label: "Solicitudes" },
    { href: "/app/comunidades", label: "Inmuebles" },
    { href: "/app/residentes", label: "Contactos" },
    { href: "/app/bandeja", label: "Bandeja" },
    { href: "/app/configuracion", label: "Configuración" },
  ],
  metrics: [
    { key: "requests", label: "Solicitudes abiertas", href: "/app/incidencias" },
    { key: "entities", label: "Inmuebles en cartera", href: "/app/comunidades" },
    { key: "contacts", label: "Propietarios e inquilinos", href: "/app/residentes" },
    { key: "unread", label: "Mensajes sin leer", href: "/app/bandeja?filtro=noleidas" },
  ],

  features: {
    propertyAttributes: true,
    requestKinds: true,
    contactRoles: true,
    portfolio: true,
  },
};

/** Tipos de inmueble (ficha de cartera). */
export const PROPERTY_TYPES = [
  { key: "piso", label: "Piso" },
  { key: "casa", label: "Casa / chalet" },
  { key: "local", label: "Local comercial" },
  { key: "oficina", label: "Oficina" },
  { key: "garaje", label: "Garaje" },
  { key: "trastero", label: "Trastero" },
  { key: "edificio", label: "Edificio completo" },
  { key: "otro", label: "Otro" },
];

/** Operación asociada al inmueble. */
export const OPERATION_TYPES = [
  { key: "alquiler", label: "En alquiler" },
  { key: "venta", label: "En venta" },
  { key: "alquiler_venta", label: "Alquiler o venta" },
  { key: "gestion", label: "Solo gestión" },
];

/** Estado comercial del inmueble dentro de la cartera. */
export const LISTING_STATUSES = [
  { key: "disponible", label: "Disponible" },
  { key: "reservado", label: "Reservado" },
  { key: "alquilado", label: "Alquilado" },
  { key: "vendido", label: "Vendido" },
  { key: "no_disponible", label: "No disponible" },
];

export function propertyTypeLabel(key: string | null | undefined): string {
  return PROPERTY_TYPES.find((t) => t.key === key)?.label ?? "—";
}

export function operationTypeLabel(key: string | null | undefined): string {
  return OPERATION_TYPES.find((t) => t.key === key)?.label ?? "—";
}

export function listingStatusLabel(key: string | null | undefined): string {
  return LISTING_STATUSES.find((t) => t.key === key)?.label ?? "Disponible";
}

export function formatPrice(price: number | null | undefined): string | null {
  if (!price) return null;
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(price);
}
