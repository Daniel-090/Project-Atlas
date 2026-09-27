import Link from "next/link";
import { PublicShell } from "@/components/public-shell";

export const metadata = { title: "Términos y condiciones · Atlas" };

export default function TerminosPage() {
  return (
    <PublicShell eyebrow="Atlas" title="Términos y condiciones" wide>
      <div className="grid gap-6 text-sm leading-relaxed text-foreground">
        <p className="atlas-alert">
          Pendiente de revisión legal profesional. Este texto describe el funcionamiento real de Atlas a día de hoy;
          falta identificar al titular del servicio (ver <Link href="/legal" className="underline">información legal</Link>).
        </p>

        <section>
          <h2 className="atlas-title !text-lg">1. Objeto</h2>
          <p className="mt-2">
            Atlas es una aplicación web para que gestorías de fincas e inmobiliarias gestionen comunidades o
            inmuebles, contactos, incidencias/solicitudes y comunicaciones desde un solo lugar, y para que sus
            vecinos, propietarios o inquilinos reporten incidencias o solicitudes a través de un portal propio.
          </p>
        </section>

        <section>
          <h2 className="atlas-title !text-lg">2. Registro y cuentas</h2>
          <p className="mt-2">
            Existen dos tipos de cuenta: la de la empresa (administrador o agente) y la del vecino/propietario/
            inquilino, que se registra con un código facilitado por su empresa. Cada persona es responsable de la
            veracidad de los datos que aporta y de mantener su contraseña en secreto.
          </p>
        </section>

        <section>
          <h2 className="atlas-title !text-lg">3. Responsabilidades del usuario</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>No usar el servicio para fines ilícitos o que perjudiquen a terceros.</li>
            <li>No introducir contenido falso, injurioso o que vulnere derechos de terceros al crear incidencias, solicitudes o mensajes.</li>
            <li>La empresa es responsable de la exactitud de los datos de sus comunidades/inmuebles, contactos y proveedores que da de alta.</li>
          </ul>
        </section>

        <section>
          <h2 className="atlas-title !text-lg">4. Funcionamiento del servicio</h2>
          <p className="mt-2">
            Algunas funciones (clasificación automática con IA de incidencias/solicitudes y mensajes, avisos por
            email, y sincronización de correo o WhatsApp) dependen de proveedores externos y de que la empresa las
            configure. Atlas no garantiza disponibilidad continua ni ausencia total de errores, y puede interrumpir
            el servicio por mantenimiento.
          </p>
        </section>

        <section>
          <h2 className="atlas-title !text-lg">5. Propiedad intelectual</h2>
          <p className="mt-2">
            El software, diseño y marca de Atlas pertenecen a su titular. Los datos que cada empresa y sus vecinos,
            propietarios o inquilinos introducen siguen siendo suyos.
          </p>
        </section>

        <section>
          <h2 className="atlas-title !text-lg">6. Precio y pagos</h2>
          <p className="mt-2">
            TODO: en el código actual no existe todavía un sistema de cobro integrado. Esta sección debe completarse
            antes de empezar a cobrar por el servicio, con el precio, la forma de pago y la política de reembolsos
            correspondiente.
          </p>
        </section>

        <section>
          <h2 className="atlas-title !text-lg">7. Suspensión y cancelación</h2>
          <p className="mt-2">
            TODO: pendiente de definir el proceso exacto para que una empresa cierre su cuenta y para que Atlas pueda
            suspender una cuenta en caso de uso indebido.
          </p>
        </section>

        <section>
          <h2 className="atlas-title !text-lg">8. Modificaciones</h2>
          <p className="mt-2">
            Podemos actualizar estos términos cuando cambie el funcionamiento del servicio. Los cambios relevantes se
            indicarán en esta misma página.
          </p>
        </section>

        <section>
          <h2 className="atlas-title !text-lg">9. Legislación aplicable</h2>
          <p className="mt-2">Estos términos se rigen por la legislación española.</p>
        </section>

        <section>
          <h2 className="atlas-title !text-lg">10. Contacto</h2>
          <p className="mt-2">
            <a href="mailto:atlasproyectnextmillioner@gmail.com" className="underline">atlasproyectnextmillioner@gmail.com</a>.
            Ver <Link href="/legal" className="underline">información legal</Link> completa.
          </p>
        </section>
      </div>
    </PublicShell>
  );
}
