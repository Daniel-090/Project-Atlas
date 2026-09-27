import { PublicShell } from "@/components/public-shell";

export const metadata = { title: "Información legal · Atlas" };

export default function LegalPage() {
  return (
    <PublicShell eyebrow="Atlas" title="Información legal" wide>
      <div className="grid gap-5 text-sm leading-relaxed text-foreground">
        <p className="atlas-alert">
          <strong>Pendiente de completar por el titular de Atlas.</strong> Los datos de esta página son obligatorios
          para cumplir con el deber de información del artículo 10 de la Ley 34/2002 (LSSI-CE), pero no pueden
          inventarse. Sustituye cada TODO por el dato real antes de publicar esta página o de empezar a cobrar por el
          servicio.
        </p>

        <section>
          <h2 className="atlas-title !text-lg">Titular del servicio</h2>
          <dl className="mt-3 grid gap-2 sm:grid-cols-[160px_1fr]">
            <dt className="text-muted">Nombre o razón social</dt>
            <dd>Daniel <span className="atlas-code">TODO: apellidos o razón social completa</span></dd>
            <dt className="text-muted">NIF / CIF</dt>
            <dd className="atlas-code">TODO: NIF o CIF</dd>
            <dt className="text-muted">Domicilio</dt>
            <dd>Avenida Zaragoza, 4 <span className="atlas-code">TODO: código postal y localidad</span></dd>
            <dt className="text-muted">Datos registrales</dt>
            <dd className="atlas-code">TODO: si aplica (p. ej. Registro Mercantil)</dd>
            <dt className="text-muted">Email de contacto</dt>
            <dd>atlasproyectnextmillioner@gmail.com</dd>
            <dt className="text-muted">Teléfono</dt>
            <dd className="atlas-code">TODO: teléfono (opcional pero recomendable)</dd>
          </dl>
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
