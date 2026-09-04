import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { communities, residents } from "@/db/schema";
import { requireGestor } from "@/lib/session";
import { PageHeader, formatDate } from "@/components/page-header";

export default async function ResidentesPage() {
  const { company } = await requireGestor();
  const list = await db
    .select({ r: residents, communityName: communities.name })
    .from(residents)
    .innerJoin(communities, eq(residents.communityId, communities.id))
    .where(eq(residents.companyId, company.id))
    .orderBy(desc(residents.createdAt));

  return (
    <>
      <PageHeader eyebrow="Residentes" title="Vecinos registrados" subtitle="Vecinos que se han dado de alta con el código de su comunidad." />
      <section className="atlas-card overflow-hidden">
        {list.length === 0 ? (
          <div className="p-6">
            <div className="atlas-empty">Todavía no hay vecinos. Comparte el código RES- de cada comunidad para que se registren.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="atlas-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Comunidad</th>
                  <th>Piso</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Alta</th>
                </tr>
              </thead>
              <tbody>
                {list.map(({ r, communityName }) => (
                  <tr key={r.id}>
                    <td className="font-medium">{r.name}</td>
                    <td>{communityName}</td>
                    <td>{r.unit || "—"}</td>
                    <td className="text-muted">{r.email}</td>
                    <td className="text-muted">{r.phone || "—"}</td>
                    <td className="text-muted">{formatDate(r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
