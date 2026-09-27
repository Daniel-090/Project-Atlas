import Link from "next/link";
import { PublicShell } from "@/components/public-shell";

export const metadata = { title: "Política de privacidad · Atlas" };

export default function PrivacidadPage() {
  return (
    <PublicShell eyebrow="Atlas" title="Política de privacidad" wide>
      <div className="grid gap-6 text-sm leading-relaxed text-foreground">
        <p className="atlas-alert">
          <strong>Aviso:</strong> este texto describe qué datos recoge Atlas y con qué finalidad, contrastado contra
          el código de la aplicación. No sustituye una revisión legal profesional, y le faltan los datos del
          responsable del tratamiento — ver <Link href="/legal" className="underline">Información legal</Link>.
        </p>

        <section>
          <h2 className="atlas-title !text-lg">1. Responsable del tratamiento</h2>
          <p className="mt-2">
            TODO: pendiente de completar con el nombre legal, NIF/CIF y domicilio del titular de Atlas (ver página de{" "}
            <Link href="/legal" className="underline">información legal</Link>).
          </p>
        </section>

        <section>
          <h2 className="atlas-title !text-lg">2. Qué datos recogemos</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><strong>Administradores/agentes:</strong> nombre, email, teléfono (opcional) y contraseña (almacenada como hash, nunca en texto plano).</li>
            <li><strong>Empresa (gestoría o inmobiliaria):</strong> nombre, teléfono, canales de contacto públicos y, si se configuran, las credenciales del buzón de correo IMAP y del webhook de WhatsApp.</li>
            <li><strong>Vecinos/propietarios/inquilinos:</strong> nombre, email, teléfono (opcional), vivienda/puerta (opcional) y contraseña (hash).</li>
            <li><strong>Incidencias o solicitudes:</strong> título, descripción, categoría, prioridad, estado y, si se aportan, nombre y contacto de quien reporta.</li>
            <li><strong>Mensajes:</strong> correos y mensajes de WhatsApp sincronizados en la bandeja de la empresa.</li>
            <li><strong>Proveedores/contactos:</strong> nombre, categoría, teléfono y email, dados de alta por la empresa.</li>
            <li><strong>Sesión:</strong> una cookie técnica de sesión (ver <Link href="/cookies" className="underline">política de cookies</Link>).</li>
          </ul>
        </section>

        <section>
          <h2 className="atlas-title !text-lg">3. Con qué finalidad</h2>
          <p className="mt-2">
            Gestionar el acceso a la aplicación, permitir a cada empresa administrar sus comunidades o inmuebles,
            contactos e incidencias/solicitudes, y mostrar a cada vecino, propietario o inquilino solo la
            información de su propia comunidad o inmueble. Cuando la empresa lo configura, Atlas también clasifica
            automáticamente incidencias/solicitudes y mensajes entrantes, y envía avisos por email cuando entra una
            incidencia de prioridad alta.
          </p>
        </section>

        <section>
          <h2 className="atlas-title !text-lg">4. Base jurídica</h2>
          <p className="mt-2">
            Ejecución del contrato de prestación del servicio (art. 6.1.b RGPD) para los datos necesarios para
            registrarte y usar Atlas, e interés legítimo de la empresa para la gestión de incidencias/solicitudes y
            comunicaciones con sus vecinos, propietarios o inquilinos.
          </p>
        </section>

        <section>
          <h2 className="atlas-title !text-lg">5. Conservación</h2>
          <p className="mt-2">
            TODO: pendiente de definir un plazo de conservación y un proceso de borrado. Actualmente los datos se
            conservan mientras la cuenta esté activa; no existe todavía un borrado automático tras un periodo de
            inactividad.
          </p>
        </section>

        <section>
          <h2 className="atlas-title !text-lg">6. Destinatarios y proveedores</h2>
          <p className="mt-2">
            No vendemos ni cedemos tus datos a terceros con fines comerciales. Para poder prestar el servicio,
            algunos datos pasan por estos proveedores, cada uno actuando como encargado del tratamiento:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><strong>Vercel</strong> (Atlas) y <strong>Netlify</strong> (Atlas Inmobiliarias) — alojamiento y ejecución de la aplicación.</li>
            <li><strong>Base de datos PostgreSQL</strong> (proveedor a confirmar) — almacenamiento de todos los datos anteriores.</li>
            <li><strong>Groq</strong> y/o <strong>Google Gemini</strong> — solo si la empresa activa la clasificación automática, procesan el contenido de incidencias/solicitudes y mensajes para clasificarlos.</li>
            <li><strong>Resend</strong> — solo si la empresa lo activa, envía el email de aviso de incidencia urgente.</li>
            <li>El servidor de correo IMAP que cada empresa indique, para sincronizar su bandeja.</li>
          </ul>
          <p className="mt-2">
            TODO: confirmar la ubicación de los servidores de cada proveedor y si implica alguna transferencia
            internacional de datos fuera del Espacio Económico Europeo (Google Gemini, en particular, conviene
            revisarlo).
          </p>
        </section>

        <section>
          <h2 className="atlas-title !text-lg">7. Seguridad</h2>
          <p className="mt-2">
            Las contraseñas se almacenan siempre como hash (nunca en texto plano). La sesión se identifica con una
            cookie de solo servidor (httpOnly) y segura en producción. TODO: las credenciales del buzón IMAP de cada
            empresa se guardan en la base de datos; pendiente confirmar si están cifradas en reposo.
          </p>
        </section>

        <section>
          <h2 className="atlas-title !text-lg">8. Tus derechos</h2>
          <p className="mt-2">
            Puedes solicitar acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad de
            tus datos escribiendo a TODO: email de contacto (ver <Link href="/legal" className="underline">información legal</Link>).
            También tienes derecho a reclamar ante la Agencia Española de Protección de Datos (aepd.es).
          </p>
        </section>

        <section>
          <h2 className="atlas-title !text-lg">9. Cambios en esta política</h2>
          <p className="mt-2">
            Podemos actualizar esta política cuando cambie el funcionamiento del servicio. Los cambios relevantes se
            indicarán en esta misma página.
          </p>
        </section>
      </div>
    </PublicShell>
  );
}
