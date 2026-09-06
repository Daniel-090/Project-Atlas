import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { communities, providers } from "@/db/schema";
import { requireGestor } from "@/lib/session";
import { CATEGORY_OPTIONS, categoryLabel } from "@/lib/incident-ai";
import { createProvider, deleteProvider } from "@/app/actions/panel";
import { PageHeader } from "@/components/page-header";

export default async function ComunidadDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { company } = await requireGestor();
  const { id } = await params;
  const [community] = await db
    .select()
    .from(communities)
    .where(and(eq(communities.id, Number(id)), eq(communities.companyId, company.id)))
    .limit(1);
  if (!community) notFound();

  const list = await db
    .select()
    .from(providers)
    .where(and(eq(providers.communityId, community.id), eq(providers.companyId, company.id)))
    .orderBy(desc(providers.createdAt));

  return (
    <>
      <div className="mb-4">
        <Link href="/app/comunidades" className="atlas-btn-ghost text-xs font-semibold">
          ← Volver a comunidades
        </Link>
      </div>
      <PageHeader eyebrow="Comunidad" title={community.name} subtitle={community.address || "Sin dirección"} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-6">
        <section className="grid gap-4">
          <h2 className="text-sm font-semibold text-foreground">Proveedores</h2>
          {list.length === 0 ? (
            <div className="atlas-empty">Aún no hay proveedores para esta comunidad.</div>
          ) : (
            list.map((p) => (
              <article key={p.id} className="atlas-card atlas-card-pad flex min-w-0 flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="atlas-chip">{categoryLabel(p.category)}</span>
                    <h3 className="mt-2 text-base font-semibold text-foreground">{p.name}</h3>
                  </div>
                  <form action={deleteProvider}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="communityId" value={community.id} />
                    <button className="atlas-btn-ghost text-xs">Eliminar</button>
                  </form>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                  {p.phone ? <span>📞 {p.phone}</span> : null}
                  {p.email ? <span>✉️ {p.email}</span> : null}
                </div>
                {p.notes ? <p className="text-xs text-muted">{p.notes}</p> : null}
              </article>
            ))
          )}
        </section>

        <aside className="atlas-card atlas-card-pad h-fit xl:sticky xl:top-6">
          <p className="atlas-eyebrow">Nuevo proveedor</p>
          <h2 className="mt-1 mb-5 text-lg font-semibold text-foreground">Añadir</h2>
          <form action={createProvider} className="grid gap-4">
            <input type="hidden" name="communityId" value={community.id} />
            <label className="block">
              <span className="atlas-label">Categoría del problema</span>
              <select name="category" className="atlas-input" required>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="atlas-label">Nombre del proveedor</span>
              <input name="name" className="atlas-input" required placeholder="Ascensores Pérez" />
            </label>
            <label className="block">
              <span className="atlas-label">Teléfono</span>
              <input name="phone" className="atlas-input" placeholder="600 000 000" />
            </label>
            <label className="block">
              <span className="atlas-label">Email</span>
              <input name="email" type="email" className="atlas-input" placeholder="contacto@proveedor.com" />
            </label>
            <label className="block">
              <span className="atlas-label">Notas</span>
              <textarea name="notes" rows={3} className="atlas-input" placeholder="Horario, contrato, condiciones..." />
            </label>
            <button className="atlas-btn atlas-btn-primary">Añadir proveedor</button>
          </form>
        </aside>
      </div>
    </>
  );
}
