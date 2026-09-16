import "server-only";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function notifyHighPriority(opts: {
  emails: string[];
  reference: string;
  title: string;
  communityName: string;
  incidentId: number;
}) {
  if (!resend) return;
  const to = Array.from(new Set(opts.emails.filter(Boolean)));
  if (to.length === 0) return;

  try {
    await resend.emails.send({
      from: "Atlas <onboarding@resend.dev>",
      to,
      subject: `⚠️ Incidencia urgente: ${opts.reference}`,
      html: `
        <p>Se ha registrado una incidencia de <strong>prioridad alta</strong>:</p>
        <p><strong>${opts.title}</strong><br/>Comunidad: ${opts.communityName}<br/>Referencia: ${opts.reference}</p>
        <p><a href="${process.env.ATLAS_APP_URL ?? "https://atlas-inmobiliarias.netlify.app"}/app/incidencias/${opts.incidentId}">Ver solicitud en Atlas</a></p>
      `,
    });
  } catch (err) {
    console.error("Error enviando aviso de incidencia urgente", err);
  }
}
