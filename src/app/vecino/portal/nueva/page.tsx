import Link from "next/link";
import { requireResident } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { ResidentIncidentForm } from "@/components/panel-forms";

export default async function NuevaIncidenciaPage() {
  const { community } = await requireResident();
  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-4">
        <Link href="/vecino/portal" className="atlas-btn-ghost text-xs font-semibold">
          ← Volver al portal
        </Link>
      </div>
      <PageHeader eyebrow={community.name} title="Crear incidencia" subtitle="Tu gestoría la recibirá al instante y la clasificará automáticamente." />
      <div className="atlas-card atlas-card-pad">
        <ResidentIncidentForm />
      </div>
    </div>
  );
}
