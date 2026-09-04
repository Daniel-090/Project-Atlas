import { randomBytes } from "crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin 0/O/1/I para evitar confusiones

export function generateCode(prefix: "ATL" | "RES", length = 8): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return `${prefix}-${out}`;
}

export function generateSecret(): string {
  return randomBytes(24).toString("hex");
}

export function generateToken(): string {
  return randomBytes(24).toString("hex"); // 48 hex
}

export function incidentReference(id: number): string {
  return `INC-${String(id).padStart(6, "0")}`;
}
