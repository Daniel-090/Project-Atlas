import { PublicShell } from "@/components/public-shell";

export const metadata = { title: "Política de cookies · Atlas" };

export default function CookiesPage() {
  return (
    <PublicShell eyebrow="Atlas" title="Política de cookies" wide>
      <div className="grid gap-6 text-sm leading-relaxed text-foreground">
        <p>
          Atlas usa el mínimo de cookies y almacenamiento local posible. No usamos analítica ni publicidad, y no hay
          ninguna cookie ni script de terceros con fines de seguimiento.
        </p>

        <section>
          <h2 className="atlas-title !text-lg">Cookie técnica de sesión</h2>
          <table className="atlas-table mt-3">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Finalidad</th>
                <th>Duración</th>
                <th>Tipo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono text-xs">atlas_session</td>
                <td>Mantener iniciada tu sesión como administrador/agente o como vecino/cliente.</td>
                <td>30 días o hasta cerrar sesión</td>
                <td>Técnica / necesaria</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-3 text-muted">
            Esta cookie es estrictamente necesaria para que la aplicación funcione, por lo que no requiere tu
            consentimiento previo según la normativa de cookies (ePrivacy / LSSI). No se usa con ningún otro fin.
          </p>
        </section>

        <section>
          <h2 className="atlas-title !text-lg">Almacenamiento local del navegador</h2>
          <p className="mt-2">
            En las páginas públicas guardamos tu preferencia de tema (claro u oscuro) en el almacenamiento local de
            tu navegador (<code className="atlas-code">localStorage</code>), no en una cookie. No se envía a ningún
            servidor y sirve solo para recordar tu elección visual.
          </p>
        </section>

        <section>
          <h2 className="atlas-title !text-lg">Qué no usamos</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Cookies de analítica (Google Analytics, Vercel Analytics, Netlify Analytics u otras).</li>
            <li>Cookies de publicidad o de redes sociales.</li>
            <li>Herramientas de seguimiento de terceros.</li>
          </ul>
          <p className="mt-2 text-muted">
            Si en el futuro se incorpora alguna herramienta de este tipo, esta página se actualizará y se añadirá un
            panel de consentimiento antes de activarla.
          </p>
        </section>
      </div>
    </PublicShell>
  );
}
