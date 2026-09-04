import { headers } from "next/headers";
import { requireGestor } from "@/lib/session";
import { PageHeader, formatDate } from "@/components/page-header";
import { ContactsForm, CustomizationForm, ImapForm } from "@/components/panel-forms";
import { ThemePreview } from "@/components/onboarding-wizard";

export default async function ConfiguracionPage() {
  const { company, user } = await requireGestor();
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "atlasapp.es";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  const webhookUrl = `${proto}://${host}/api/hooks/whatsapp?secret=${company.whatsappSecret}`;

  return (
    <>
      <PageHeader eyebrow="Configuración" title="Tu gestoría" subtitle="Identidad visual, contactos, correo y códigos. Todo se guarda en Atlas y se aplica a tu panel y al portal de tus vecinos." />

      <div className="grid gap-6">
        <Section id="identidad" eyebrow="Identidad" title="Personalización" description="Los colores se aplican solo dentro de tu panel y del portal de tus vecinos. La portada de Atlas mantiene su identidad propia.">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <CustomizationForm
              initial={{
                companyName: company.name,
                primaryColor: company.primaryColor,
                secondaryColor: company.secondaryColor,
                backgroundColor: company.backgroundColor,
                theme: company.theme,
                logoUrl: company.logoUrl ?? "",
              }}
            />
            <div>
              <span className="atlas-label">Así lo ven hoy tus usuarios</span>
              <ThemePreview primary={company.primaryColor} secondary={company.secondaryColor} background={company.backgroundColor} theme={company.theme} name={company.name} logoUrl={company.logoUrl ?? undefined} />
            </div>
          </div>
        </Section>

        <Section id="contactos" eyebrow="Contactos" title="Atención al vecino" description="Estos contactos aparecen en el portal del vecino como enlaces directos (WhatsApp y email).">
          <ContactsForm initial={{ phone: company.phone ?? "", whatsapp: company.whatsappJson.join("\n"), emails: company.emailsJson.join("\n") }} />
        </Section>

        <Section id="correo" eyebrow="Correo" title="Buzón IMAP" description="Conecta el buzón de la gestoría. Atlas importa los últimos mensajes, detecta la comunidad y etiqueta facturas automáticamente.">
          <ImapForm
            initial={{
              host: company.imapHost ?? "",
              port: company.imapPort ?? 993,
              user: company.imapUser ?? "",
              hasPassword: Boolean(company.imapPassword),
              folder: company.imapFolder ?? "INBOX",
              lastSync: company.imapLastSync ? formatDate(company.imapLastSync) : null,
              lastError: company.imapLastError,
            }}
          />
        </Section>

        <Section id="whatsapp" eyebrow="WhatsApp" title="Webhook de entrada" description="Conecta tu bridge (Make, Zapier o tu propio servicio) a esta URL. Cada POST crea un mensaje en la Bandeja.">
          <div className="grid gap-3 text-sm">
            <div>
              <span className="atlas-label">URL del webhook</span>
              <code className="atlas-code block overflow-x-auto whitespace-nowrap !px-3 !py-2">{webhookUrl}</code>
            </div>
            <p className="text-xs text-muted">
              Cuerpo JSON esperado: <code className="atlas-code">{`{ "from": "+34600000000", "name": "María", "text": "Hola, la luz del portal…", "id": "wamid…" }`}</code>
            </p>
          </div>
        </Section>

        <Section id="codigos" eyebrow="Códigos" title="Identificadores" description="El código de gestoría identifica tu cuenta. Los códigos RES- de cada comunidad están en Comunidades.">
          <dl className="grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="atlas-label">Código de gestoría</dt>
              <dd className="font-mono font-semibold text-primary">{company.code}</dd>
            </div>
            <div>
              <dt className="atlas-label">Administrador</dt>
              <dd className="text-foreground">{user.name}</dd>
            </div>
            <div>
              <dt className="atlas-label">Email de acceso</dt>
              <dd className="text-foreground">{user.email}</dd>
            </div>
          </dl>
        </Section>
      </div>
    </>
  );
}

function Section({ id, eyebrow, title, description, children }: { id: string; eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <section id={id} className="atlas-card atlas-card-pad scroll-mt-6">
      <div className="mb-6 border-b border-border pb-5">
        <p className="atlas-eyebrow">{eyebrow}</p>
        <h2 className="mt-1 text-lg font-semibold text-foreground">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>
      </div>
      {children}
    </section>
  );
}
