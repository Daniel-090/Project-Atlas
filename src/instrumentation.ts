export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  const g = globalThis as typeof globalThis & { __atlasMailTimer?: NodeJS.Timeout };
  if (g.__atlasMailTimer) return;

  // Nunca debe tumbar el arranque del servicio: si algo falla, se avisa y ya.
  try {
    const { syncAllCompanies } = await import("@/lib/mail-sync");
    g.__atlasMailTimer = setInterval(() => {
      syncAllCompanies().catch((err) => console.error("[atlas][mail] fallo de sincronización:", err?.message));
    }, 300_000);
    g.__atlasMailTimer.unref?.();
  } catch (err) {
    console.error("[atlas][mail] no se pudo iniciar la sincronización de correo:", err);
  }
}
