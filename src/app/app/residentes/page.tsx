import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { communities, residents } from "@/db/schema";
import { requireGestor } from "@/lib/session";
import { PageHeader, formatDate } from "@/components/page-header";
import { getVertical, contactRoleLabel } from "@/verticals";

export default async function ContactosPage({ searchParams }: { searchParams: Promise<{ rol?: string }> }) {
  const { company } = await requireGestor();
  const v = getVertical(company.vertical);
  const { rol = "todos" } = await searchParams;
  const useRoles = v.features.contactRoles;

  const rows = await db
    .select({ r: residents, communityName: communities.name })
    .from(residents)
    .innerJoin(communities, eq(residents.communityId, communities.id))
    .where(
      useRoles && rol !== "todos"
        ? and(eq(residents.companyId, company.id), eq(residents.role, rol))
        : eq(residents.companyId, company.id)
    )
    .orderBy(desc(residents.createdAt));

  const list = rows.filter((row) => !useRoles || rol === "todos" || row.r.role === rol);

  return (
    <>
      <PageHeader
        eyebrow={v.contact.many}
        title={useRoles ? v.contact.many : `${v.contact.many} registrados`}
        subtitle={
          useRoles
            ? `${v.contact.many} que se han dado de alta con el código de su ${v.entity.oneLower}.`
            : `${v.contact.many} que se han dado de alta con el código de su ${v.entity.oneLower}.`
        }
      />

      {useRoles ? (
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1 sm:mb-4 sm:flex-wrap sm:overflow-visible sm:pb-0">
          <Link href="/app/residentes" className={`atlas-chip shrink-0 !py-2 ${rol === "todos" ? "atlas-chip-primary" : ""}`}>
            Todos
          </Link>
          {v.contactRoles.map((r) => (
            <Link key={r.key} href={`/app/residentes?rol=${r.key}`} className={`atlas-chip shrink-0 !py-2 ${rol === r.key ? "atlas-chip-primary" : ""}`}>
              {r.label}
            </Link>
          ))}
        </div>
      ) : null}

      <section className="atlas-card overflow-hidden">
        {list.length === 0 ? (
          <div className="p-5 sm:p-6">
            <div className="atlas-empty">
              {rows.length === 0
                ? `Todavía no hay ${v.contact.manyLower}. Comparte el código RES- de cada ${v.entity.oneLower} para que se den de alta.`
                : `No hay ${v.contact.manyLower} en este filtro.`}
            </div>
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
                    {useRoles ? (
                      <div className="flex gap-2">
                        <dt className="w-20 shrink-0 text-muted">Rol</dt>
                        <dd className="text-foreground">{contactRoleLabel(v, r.role)}</dd>
                      </div>
                    ) : null}
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
                    {useRoles ? <th>Rol</th> : null}
                    <th>{v.entity.one}</th>
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
                      {useRoles ? <td>{contactRoleLabel(v, r.role)}</td> : null}
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
