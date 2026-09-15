import Link from "next/link";
import { AtlasMark, PublicThemeToggle } from "@/components/ui";

export default function HomePage() {
  return (
    <main className="atlas-hero-bg relative flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-3">
          <AtlasMark size={36} />
          <span className="text-sm font-semibold tracking-[0.3em] text-primary">ATLAS</span>
        </div>
        <PublicThemeToggle />
      </header>

      <section className="flex flex-1 items-center justify-center px-6 pb-16">
        <div className="atlas-card w-full max-w-md p-8 text-center sm:p-10" style={{ boxShadow: "var(--atlas-shadow)" }}>
          <p className="atlas-eyebrow">Administradores de fincas e inmobiliarias</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-primary sm:text-4xl">Atlas</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Comunidades o inmuebles, propietarios e inquilinos, solicitudes y comunicaciones de tu empresa en un solo lugar.
          </p>

          <div className="mt-8 grid gap-3">
            <Link href="/acceso" className="atlas-btn atlas-btn-primary w-full !py-3.5 text-base">
              Entrar como administrador
            </Link>
            <Link href="/vecino" className="atlas-btn atlas-btn-outline-primary w-full !py-3.5 text-base">
              Crear incidencia · Acceso vecino
            </Link>
          </div>

          <p className="mt-8 text-xs text-muted">
            ¿Nueva empresa?{" "}
            <Link href="/registro" className="font-semibold text-primary hover:underline">
              Crear cuenta
            </Link>
          </p>
        </div>
      </section>

      <footer className="px-6 pb-6 text-center text-[11px] tracking-wide text-muted">
        © {new Date().getFullYear()} Atlas · atlasapp.es
      </footer>
    </main>
  );
}
