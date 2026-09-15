import { requireGestor } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { OnboardingWizard } from "@/components/onboarding-wizard";
import { getVertical } from "@/verticals";

export default async function BienvenidaPage() {
  const { company } = await requireGestor();
  const v = getVertical(company.vertical);
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Bienvenida"
        title={`Configura ${company.name}`}
        subtitle={`Tres pasos: los colores de tu marca, tu logo y los contactos que verán tus ${v.contact.manyLower}. Podrás cambiarlo todo después en Configuración.`}
      />
      <div className="atlas-card atlas-card-pad">
        <OnboardingWizard companyName={company.name} vertical={v.key} />
      </div>
    </div>
  );
}
