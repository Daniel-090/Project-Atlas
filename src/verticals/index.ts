import { FINCAS } from "./fincas";
import { INMOBILIARIAS } from "./inmobiliarias";
import { labelOf, type VerticalConfig, type VerticalKey } from "./types";

export * from "./types";
export { FINCAS } from "./fincas";
export { INMOBILIARIAS } from "./inmobiliarias";
export {
  LISTING_STATUSES,
  OPERATION_TYPES,
  PROPERTY_TYPES,
  formatPrice,
  listingStatusLabel,
  operationTypeLabel,
  propertyTypeLabel,
} from "./inmobiliarias";

/** Registro de verticales disponibles. Añadir una nueva = una línea aquí. */
export const VERTICALS: Record<VerticalKey, VerticalConfig> = {
  fincas: FINCAS,
  inmobiliarias: INMOBILIARIAS,
};

/** Esta edición de Atlas está dedicada exclusivamente a inmobiliarias. */
export const DEFAULT_VERTICAL: VerticalKey = "inmobiliarias";

export const VERTICAL_KEYS = Object.keys(VERTICALS) as VerticalKey[];

export function isVerticalKey(value: unknown): value is VerticalKey {
  return typeof value === "string" && value in VERTICALS;
}

/**
 * Devuelve la configuración de una vertical.
 * Nunca falla: si llega un valor desconocido (columna nula, dato antiguo…) se
 * devuelve la vertical por defecto. Así una vertical nueva o un dato raro no
 * puede romper el panel.
 */
export function getVertical(key: string | null | undefined): VerticalConfig {
  return isVerticalKey(key) ? VERTICALS[key] : VERTICALS[DEFAULT_VERTICAL];
}

/** Opciones para el selector de vertical del formulario de registro. */
export const VERTICAL_OPTIONS = VERTICAL_KEYS.map((key) => ({
  key,
  label: VERTICALS[key].name,
  pitch: VERTICALS[key].pitch,
  shortName: VERTICALS[key].shortName,
}));

/** Etiqueta legible de un rol de contacto dentro de la vertical indicada. */
export function contactRoleLabel(v: VerticalConfig, key: string | null | undefined): string {
  return labelOf(v.contactRoles, key);
}

/** Etiqueta legible de un tipo de solicitud dentro de la vertical indicada. */
export function requestKindLabel(v: VerticalConfig, key: string | null | undefined): string {
  return labelOf(v.requestKinds, key);
}
