/**
 * Capa de verticales de Atlas.
 *
 * Una "vertical" es una especialización del mismo producto: mismas tablas, mismas
 * rutas, mismos componentes, pero con terminología, campos y categorías de IA
 * distintas. Añadir una vertical nueva = añadir un fichero de configuración aquí
 * y registrarlo en `src/verticals/index.ts`. No hace falta duplicar páginas ni
 * lógica de negocio.
 *
 * Esta capa es 100% datos (sin imports de servidor) para que pueda usarse tanto
 * en Server Components como en Client Components.
 */

export type VerticalKey = "fincas" | "inmobiliarias";

/** Categoría de clasificación automática de solicitudes/incidencias. */
export interface CategoryDef {
  key: string;
  label: string;
  /** Palabras clave usadas por el clasificador heurístico (fallback sin IA). */
  words: string[];
}

export interface NavItem {
  href: string;
  label: string;
}

/** Nombres de una entidad en singular/plural y en minúsculas (para frases). */
export interface NounSet {
  one: string;
  many: string;
  oneLower: string;
  manyLower: string;
}

export interface VerticalFeatures {
  /** Ficha del inmueble: tipo, operación, precio, m², habitaciones, estado comercial… */
  propertyAttributes: boolean;
  /** Las solicitudes se dividen en incidencia / solicitud / aviso. */
  requestKinds: boolean;
  /** Los contactos tienen rol: propietario / inquilino / interesado. */
  contactRoles: boolean;
  /** Se muestran métricas y campos de cartera (precio, estado comercial). */
  portfolio: boolean;
}

export interface VerticalConfig {
  key: VerticalKey;
  /** Nombre comercial de la vertical. */
  name: string;
  /** Nombre corto para chips y títulos. */
  shortName: string;
  /** Descripción que se muestra al elegir vertical en el registro. */
  pitch: string;

  /** Empresa cliente: gestoría, inmobiliaria… */
  company: NounSet;

  /** "Comunidad" / "Inmueble" (tabla `communities`). */
  entity: NounSet;
  /** "Vecino" / "Propietario o inquilino" (tabla `residents`). */
  contact: NounSet;
  /** "Incidencia" / "Solicitud" (tabla `incidents`). */
  request: NounSet;
  /** "Proveedor" (tabla `providers`). */
  provider: NounSet;

  /** CTA del botón "nuevo" de solicitudes. */
  requestCta: string;
  /** Texto del portal público del vecino/cliente. */
  portalName: string;

  /** Roles posibles de un contacto. Vacío = la vertical no usa roles. */
  contactRoles: Array<{ key: string; label: string }>;
  /** Tipos de solicitud. Vacío = la vertical no usa tipos. */
  requestKinds: Array<{ key: string; label: string }>;

  /** Categorías de clasificación automática (IA + heurística). */
  categories: CategoryDef[];
  /** Palabras que fuerzan prioridad alta. */
  highWords: string[];
  /** Palabras que bajan la prioridad. */
  lowWords: string[];
  /** Contexto que se inyecta en los prompts de IA. */
  aiContext: string;

  /** Elementos del menú lateral. Las rutas son las mismas en todas las verticales. */
  nav: NavItem[];
  /** Tarjetas de métricas del resumen. */
  metrics: Array<{ key: "requests" | "entities" | "contacts" | "unread"; label: string; href: string }>;

  features: VerticalFeatures;
}

/** Etiqueta legible de un rol/tipo desconocido. */
export function labelOf(list: Array<{ key: string; label: string }>, key: string | null | undefined): string {
  if (!key) return "";
  return list.find((o) => o.key === key)?.label ?? key;
}
