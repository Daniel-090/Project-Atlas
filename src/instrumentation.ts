export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  const g = globalThis as typeof globalThis & { __atlasMailTimer?: NodeJS.Timeout };
  if (g.__atlasMailTimer) return;
  const { syncAllCompanies } = await import("@/lib/mail-sync");
  g.__atlasMailTimer = setInterval(() => {
    syncAllCompanies().catch(() => undefined);
  }, 300_000);
  g.__atlasMailTimer.unref?.();
}
