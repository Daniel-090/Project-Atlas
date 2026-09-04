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
          <div className="p-5 sm:p-6">
            <div className="atlas-empty">Todavía no hay vecinos. Comparte el código RES- de cada comunidad para que se registren.</div>
          </div>
        ) : (
          <>
            <div className="divide-y divide-border sm:hidden">
              {list.map(({ r, communityName }) => (
                <article key={r.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-semibold text-foreground">{r.name}</h2>
                      <p className="mt-1 truncate text-xs text-muted">{communityName}</p>
                    </div>
                    <span className="atlas-chip shrink-0">{r.unit || "Sin piso"}</span>
                  </div>

                  <dl className="mt-4 grid gap-2 text-xs">
                    <div className="flex gap-2">
                      <dt className="w-20 shrink-0 text-muted">Email</dt>
                      <dd className="min-w-0 break-all text-foreground">{r.email}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-20 shrink-0 text-muted">Teléfono</dt>
                      <dd className="text-foreground">{r.phone || "—"}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-20 shrink-0 text-muted">Alta</dt>
                      <dd className="text-muted">{formatDate(r.createdAt)}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto sm:block">
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
          </>
        )}
      </section>
    </>
  );
}
