import Link from "next/link";
import { requireResident } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { ResidentIncidentForm } from "@/components/panel-forms";
import { getVertical } from "@/verticals";

export default async function NuevaIncidenciaPage() {
  const { community, company } = await requireResident();
  const v = getVertical(company.vertical);
  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-4">
        <Link href="/vecino/portal" className="atlas-btn-ghost text-xs font-semibold">
          ← Volver al portal
        </Link>
      </div>
      <PageHeader eyebrow={community.name} title={v.requestCta} subtitle={`Tu ${v.company.oneLower} la recibirá al instante y la clasificará automáticamente.`} />
      <div className="atlas-card atlas-card-pad">
        <ResidentIncidentForm vertical={v.key} />
      </div>
    </div>
  );
}
