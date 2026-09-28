import { PublicShell } from "@/components/public-shell";

export const metadata = { title: "Información legal · Atlas" };

export default function LegalPage() {
  return (
    <PublicShell eyebrow="Atlas" title="Información legal" wide>
      <div className="grid gap-5 text-sm leading-relaxed text-foreground">
        

        <section>
          <h2 className="atlas-title !text-lg">Titular del servicio</h2>
          {/* Datos del titular (nombre, NIF, domicilio, teléfono) retirados de la web pública a petición del titular.
              Se facilitarán por email si alguien los solicita legítimamente. */}
          <p className="mt-3">
            Contacto: <a href="mailto:atlasproyectnextmillioner@gmail.com" className="underline">atlasproyectnextmillioner@gmail.com</a>
          </p>
        </section>

        <section>
          <h2 className="atlas-title !text-lg">Proveedores técnicos utilizados</h2>
          <p className="mt-2 text-muted">
            Esto sí puedo confirmarlo revisando el código: Atlas usa estos servicios para funcionar.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Alojamiento y despliegue: Vercel (este sitio, atlasapp.es) y Netlify (Atlas Inmobiliarias).</li>
            <li>Base de datos: PostgreSQL (proveedor a confirmar, p. ej. Neon/Supabase/Render).</li>
            <li>Clasificación automática de incidencias/solicitudes y mensajes: Groq y/o Google Gemini (opcional, solo si se configura una clave).</li>
            <li>Envío de avisos por email de incidencias urgentes: Resend (opcional, solo si se configura una clave).</li>
            <li>Sincronización del correo de la empresa: conexión IMAP al proveedor de correo que cada cuenta indique.</li>
          </ul>
        </section>
      </div>
    </PublicShell>
  );
}
