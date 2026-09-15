"use client";

import { useActionState } from "react";
import type { ActionState } from "@/app/actions/auth";
import {
  addTeamUser,
  createCommunity,
  createIncidentAsGestor,
  createIncidentAsResident,
  logMessage,
  saveContacts,
  saveCustomization,
  saveImap,
  updateProperty,
} from "@/app/actions/panel";
import { categoryOptions } from "@/lib/incident-ai";
import { Field, Notice, SubmitButton } from "@/components/ui";
import {
  FINCAS,
  LISTING_STATUSES,
  OPERATION_TYPES,
  PROPERTY_TYPES,
  getVertical,
  type VerticalKey,
} from "@/verticals";

type Option = { id: number; name: string };

export function CommunityForm({ vertical = "fincas", agents = [] }: { vertical?: VerticalKey; agents?: Option[] }) {
  const [state, action] = useActionState<ActionState, FormData>(createCommunity, undefined);
  const v = getVertical(vertical);
  const portfolio = v.features.propertyAttributes;

  return (
    <form action={action} className="grid gap-4" key={state === undefined ? "init" : JSON.stringify(state)}>
      <Field label={portfolio ? "Referencia o nombre del inmueble" : "Nombre de la comunidad"}>
        <input
          name="name"
          required
          className="atlas-input min-w-0 max-w-full"
          placeholder={portfolio ? "Piso · Calle Mayor 12, 3ºB" : "C.P. Avenida del Mar 12"}
        />
      </Field>
      <Field label="Dirección">
        <input name="address" className="atlas-input min-w-0 max-w-full" placeholder="Av. del Mar 12, 29600 Marbella" />
      </Field>

      {portfolio ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tipo de inmueble">
              <select name="propertyType" className="atlas-input min-w-0 max-w-full" defaultValue="">
                <option value="">Sin especificar</option>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Operación">
              <select name="operationType" className="atlas-input min-w-0 max-w-full" defaultValue="">
                <option value="">Sin especificar</option>
                {OPERATION_TYPES.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Estado en cartera">
              <select name="listingStatus" className="atlas-input min-w-0 max-w-full" defaultValue="disponible">
                {LISTING_STATUSES.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={v.key === "inmobiliarias" ? "Precio / renta (€)" : "Precio (€)"} hint="Solo números. En alquiler, indica la renta mensual.">
              <input name="price" type="number" min={0} className="atlas-input min-w-0 max-w-full" placeholder="850" />
            </Field>
            <Field label="Superficie (m²)">
              <input name="m2" type="number" min={0} className="atlas-input min-w-0 max-w-full" placeholder="85" />
            </Field>
            <Field label="Habitaciones">
              <input name="rooms" type="number" min={0} className="atlas-input min-w-0 max-w-full" placeholder="3" />
            </Field>
            <Field label="Baños">
              <input name="baths" type="number" min={0} className="atlas-input min-w-0 max-w-full" placeholder="2" />
            </Field>
            <Field label="Código de llaves">
              <input name="keyCode" className="atlas-input min-w-0 max-w-full" placeholder="L-2341" />
            </Field>
          </div>
          <Field label="Agente responsable">
            <select name="agentUserId" className="atlas-input min-w-0 max-w-full" defaultValue="">
              <option value="">Sin asignar</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Notas internas">
            <textarea name="notes" rows={3} className="atlas-input min-w-0 max-w-full" placeholder="Gastos de comunidad, estado del inmueble, acuerdos con el propietario…" />
          </Field>
        </>
      ) : null}

      <Notice message={state?.error} />
      <SubmitButton pendingText="Creando…">
        {portfolio ? "Añadir inmueble" : "Crear comunidad"}
      </SubmitButton>
    </form>
  );
}

export function PropertyForm({
  initial,
  agents = [],
}: {
  initial: {
    id: number;
    name: string;
    address: string;
    propertyType: string;
    operationType: string;
    listingStatus: string;
    price: number;
    m2: number;
    rooms: number;
    baths: number;
    keyCode: string;
    notes: string;
    agentUserId: number;
  };
  agents?: Option[];
}) {
  const [state, action] = useActionState<ActionState, FormData>(updateProperty, undefined);
  return (
    <form action={action} className="grid min-w-0 gap-4 sm:grid-cols-2" key={state?.error ?? "form"}>
      <input type="hidden" name="id" value={initial.id} />
      <div className="sm:col-span-2">
        <Field label="Nombre / referencia">
          <input name="name" defaultValue={initial.name} required className="atlas-input min-w-0 max-w-full" />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Dirección">
          <input name="address" defaultValue={initial.address} className="atlas-input min-w-0 max-w-full" />
        </Field>
      </div>
      <Field label="Tipo">
        <select name="propertyType" defaultValue={initial.propertyType} className="atlas-input min-w-0 max-w-full">
          <option value="">Sin especificar</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t.key} value={t.key}>
              {t.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Operación">
        <select name="operationType" defaultValue={initial.operationType} className="atlas-input min-w-0 max-w-full">
          <option value="">Sin especificar</option>
          {OPERATION_TYPES.map((t) => (
            <option key={t.key} value={t.key}>
              {t.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Estado en cartera">
        <select name="listingStatus" defaultValue={initial.listingStatus} className="atlas-input min-w-0 max-w-full">
          {LISTING_STATUSES.map((t) => (
            <option key={t.key} value={t.key}>
              {t.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Precio / renta (€)">
        <input name="price" type="number" min={0} defaultValue={initial.price || ""} className="atlas-input min-w-0 max-w-full" />
      </Field>
      <Field label="Superficie (m²)">
        <input name="m2" type="number" min={0} defaultValue={initial.m2 || ""} className="atlas-input min-w-0 max-w-full" />
      </Field>
      <Field label="Habitaciones">
        <input name="rooms" type="number" min={0} defaultValue={initial.rooms || ""} className="atlas-input min-w-0 max-w-full" />
      </Field>
      <Field label="Baños">
        <input name="baths" type="number" min={0} defaultValue={initial.baths || ""} className="atlas-input min-w-0 max-w-full" />
      </Field>
      <Field label="Código de llaves">
        <input name="keyCode" defaultValue={initial.keyCode} className="atlas-input min-w-0 max-w-full" />
      </Field>
      <Field label="Agente responsable">
        <select name="agentUserId" defaultValue={initial.agentUserId || ""} className="atlas-input min-w-0 max-w-full">
          <option value="">Sin asignar</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </Field>
      <div className="sm:col-span-2">
        <Field label="Notas internas">
          <textarea name="notes" rows={3} defaultValue={initial.notes} className="atlas-input min-w-0 max-w-full" />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Notice message={state?.error} />
      </div>
      <div className="sm:col-span-2 flex justify-end">
        <SubmitButton pendingText="Guardando…">Guardar ficha</SubmitButton>
      </div>
    </form>
  );
}

export function IncidentForm({ communities, vertical = "fincas" }: { communities: Option[]; vertical?: VerticalKey }) {
  const [state, action] = useActionState<ActionState, FormData>(createIncidentAsGestor, undefined);
  const v = getVertical(vertical);
  const categories = categoryOptions(v);

  return (
    <form action={action} className="grid min-w-0 gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field label={v.entity.one}>
          <select name="communityId" required className="atlas-input min-w-0 max-w-full" defaultValue="">
            <option value="" disabled>
              Selecciona {v.features.propertyAttributes ? "un inmueble" : "una comunidad"}
            </option>
            {communities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {v.features.requestKinds ? (
        <div className="sm:col-span-2">
          <Field label="Tipo">
            <select name="kind" className="atlas-input min-w-0 max-w-full" defaultValue="incidencia">
              {v.requestKinds.map((k) => (
                <option key={k.key} value={k.key}>
                  {k.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      ) : null}

      <div className="sm:col-span-2">
        <Field label="Título">
          <input
            name="title"
            required
            className="atlas-input min-w-0 max-w-full"
            placeholder={v.features.propertyAttributes ? "Fuga de agua en el baño" : "Fuga de agua en el garaje"}
          />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Descripción" hint="La categoría y la prioridad se clasifican automáticamente si las dejas en automático.">
          <textarea name="description" rows={4} className="atlas-input min-w-0 max-w-full" placeholder="Detalla qué ocurre, dónde y desde cuándo." />
        </Field>
      </div>
      <Field label="Categoría">
        <select name="category" className="atlas-input min-w-0 max-w-full" defaultValue="">
          <option value="">Automática</option>
          {categories.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Prioridad">
        <select name="priority" className="atlas-input min-w-0 max-w-full" defaultValue="">
          <option value="">Automática</option>
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
        </select>
      </Field>
      <Field label="Quién avisa">
        <input name="reporterName" className="atlas-input min-w-0 max-w-full" placeholder={v.features.contactRoles ? "Propietario, inquilino, interesado…" : "Nombre del vecino"} />
      </Field>
      <Field label="Contacto">
        <input name="reporterContact" className="atlas-input min-w-0 max-w-full" placeholder="Teléfono o email" />
      </Field>
      <div className="sm:col-span-2">
        <Notice message={state?.error} />
      </div>
      <div className="sm:col-span-2 flex justify-end">
        <SubmitButton pendingText="Registrando…">{v.requestCta}</SubmitButton>
      </div>
    </form>
  );
}

export function ResidentIncidentForm({ vertical = "fincas" }: { vertical?: VerticalKey }) {
  const [state, action] = useActionState<ActionState, FormData>(createIncidentAsResident, undefined);
  const v = getVertical(vertical);
  return (
    <form action={action} className="grid gap-4">
      <Field label="¿Qué ocurre?">
        <input name="title" required className="atlas-input min-w-0 max-w-full" placeholder={v.features.propertyAttributes ? "Ej. La caldera no enciende" : "Ej. La luz del portal no funciona"} />
      </Field>
      <Field label="Cuéntanos más" hint="Dónde está, desde cuándo y si es urgente.">
        <textarea name="description" required rows={5} className="atlas-input min-w-0 max-w-full" placeholder="Describe la incidencia con detalle." />
      </Field>
      <Notice message={state?.error} />
      <SubmitButton pendingText="Enviando…" className="atlas-btn atlas-btn-primary w-full !py-3">
        Enviar a mi {v.company.oneLower}
      </SubmitButton>
    </form>
  );
}

export function LogMessageForm({ communities, vertical = "fincas" }: { communities: Option[]; vertical?: VerticalKey }) {
  const [state, action] = useActionState<ActionState, FormData>(logMessage, undefined);
  const v = getVertical(vertical);
  return (
    <form action={action} className="grid min-w-0 gap-4 sm:grid-cols-2" key={state && !state.error ? Date.now() : "form"}>
      <Field label="Canal">
        <select name="channel" className="atlas-input min-w-0 max-w-full" defaultValue="llamada">
          <option value="llamada">Llamada</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="email">Email</option>
        </select>
      </Field>
      <Field label="Dirección">
        <select name="direction" className="atlas-input min-w-0 max-w-full" defaultValue="in">
          <option value="in">Recibida</option>
          <option value="out">Enviada</option>
        </select>
      </Field>
      <Field label="Remitente / contacto">
        <input name="sender" required className="atlas-input min-w-0 max-w-full" placeholder="María López · +34 600 000 000" />
      </Field>
      <Field label={v.entity.one}>
        <select name="communityId" className="atlas-input min-w-0 max-w-full" defaultValue="">
          <option value="">Detectar automáticamente</option>
          {communities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      <div className="sm:col-span-2">
        <Field label="Asunto">
          <input name="subject" required className="atlas-input min-w-0 max-w-full" placeholder={v.features.propertyAttributes ? "Consulta sobre la renovación del contrato" : "Consulta sobre la derrama del ascensor"} />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Resumen de la conversación">
          <textarea name="body" rows={3} className="atlas-input min-w-0 max-w-full" placeholder="Notas de la conversación." />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" name="factura" className="h-4 w-4 accent-[var(--atlas-primary)]" /> Marcar como factura / documento para el {v.contact.oneLower}
      </label>
      <div className="sm:col-span-2">
        <Notice message={state?.error} />
      </div>
      <div className="sm:col-span-2 flex justify-end">
        <SubmitButton pendingText="Registrando…">Registrar conversación</SubmitButton>
      </div>
    </form>
  );
}

export function CustomizationForm({
  initial,
  companyNoun = FINCAS.company.one,
}: {
  initial: { companyName: string; primaryColor: string; secondaryColor: string; backgroundColor: string; theme: string; logoUrl: string };
  companyNoun?: string;
}) {
  const [state, action] = useActionState<ActionState, FormData>(saveCustomization, undefined);
  return (
    <form action={action} className="grid min-w-0 gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field label={`Nombre de ${companyNoun === "Gestoría" ? "la gestoría" : "la empresa"}`}>
          <input name="companyName" defaultValue={initial.companyName} className="atlas-input min-w-0 max-w-full" />
        </Field>
      </div>
      <ColorInput name="primaryColor" label="Color principal" defaultValue={initial.primaryColor} />
      <ColorInput name="secondaryColor" label="Color secundario" defaultValue={initial.secondaryColor} />
      <ColorInput name="backgroundColor" label="Fondo" defaultValue={initial.backgroundColor} />
      <Field label="Tema">
        <select name="theme" defaultValue={initial.theme} className="atlas-input min-w-0 max-w-full">
          <option value="light">Claro</option>
          <option value="dark">Oscuro</option>
        </select>
      </Field>
      <div className="sm:col-span-2">
        <Field label="URL del logo" hint="Déjalo vacío para usar las iniciales.">
          <input name="logoUrl" defaultValue={initial.logoUrl} className="atlas-input min-w-0 max-w-full" placeholder="https://…/logo.png" />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Notice message={state?.error} />
      </div>
      <div className="sm:col-span-2 flex justify-end">
        <SubmitButton>Guardar personalización</SubmitButton>
      </div>
    </form>
  );
}

function ColorInput({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return (
    <label className="block">
      <span className="atlas-label">{label}</span>
      <span className="flex min-w-0 items-center gap-2">
        <input type="color" name={name} defaultValue={defaultValue} className="h-10 w-12 cursor-pointer rounded-lg border border-border bg-transparent p-1" />
        <span className="atlas-code min-w-0 max-w-full overflow-x-auto">{defaultValue}</span>
      </span>
    </label>
  );
}

export function ContactsForm({ initial, contactNoun = FINCAS.contact.many }: { initial: { phone: string; whatsapp: string; emails: string }; contactNoun?: string }) {
  const [state, action] = useActionState<ActionState, FormData>(saveContacts, undefined);
  return (
    <form action={action} className="grid min-w-0 gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field label="Teléfono principal">
          <input name="phone" defaultValue={initial.phone} className="atlas-input min-w-0 max-w-full" placeholder="+34 900 000 000" />
        </Field>
      </div>
      <Field label="WhatsApp (uno por línea)">
        <textarea name="whatsapp" defaultValue={initial.whatsapp} rows={4} className="atlas-input min-w-0 max-w-full" />
      </Field>
      <Field label="Emails (uno por línea)">
        <textarea name="emails" defaultValue={initial.emails} rows={4} className="atlas-input min-w-0 max-w-full" />
      </Field>
      <div className="sm:col-span-2">
        <Notice message={state?.error} />
      </div>
      <div className="sm:col-span-2 flex justify-end">
        <SubmitButton>Guardar contactos</SubmitButton>
      </div>
    </form>
  );
}

export function TeamForm({ companyNoun = FINCAS.company.oneLower }: { companyNoun?: string }) {
  const [state, action] = useActionState<ActionState, FormData>(addTeamUser, undefined);
  return (
    <form action={action} className="grid min-w-0 gap-4">
      <Field label="Nombre">
        <input name="name" className="atlas-input min-w-0 max-w-full" placeholder="María López" required />
      </Field>
      <Field label="Email de acceso">
        <input name="email" type="email" className="atlas-input min-w-0 max-w-full" placeholder="maria@gestoria.com" required />
      </Field>
      <Field label="Contraseña (mín. 6 caracteres)">
        <input name="password" type="password" className="atlas-input min-w-0 max-w-full" required minLength={6} />
      </Field>
      <Notice message={state?.error} />
      <div className="flex justify-end">
        <SubmitButton>Añadir compañero</SubmitButton>
      </div>
    </form>
  );
}

export function ImapForm({ initial }: { initial: { host: string; port: number; user: string; hasPassword: boolean; folder: string; lastSync: string | null; lastError: string | null } }) {
  const [state, action] = useActionState<ActionState, FormData>(saveImap, undefined);
  return (
    <form action={action} className="grid min-w-0 gap-4 sm:grid-cols-2">
      <Field label="Servidor IMAP">
        <input name="imapHost" defaultValue={initial.host} className="atlas-input min-w-0 max-w-full" placeholder="imap.gmail.com" />
      </Field>
      <Field label="Puerto">
        <input name="imapPort" type="number" defaultValue={initial.port} className="atlas-input min-w-0 max-w-full" />
      </Field>
      <Field label="Usuario">
        <input name="imapUser" defaultValue={initial.user} className="atlas-input min-w-0 max-w-full" placeholder="gestoria@gmail.com" />
      </Field>
      <Field label="Contraseña de aplicación" hint={initial.hasPassword ? "Ya hay una guardada. Déjala vacía para mantenerla." : "En Gmail: 16 letras, sin espacios."}>
        <input name="imapPassword" type="password" className="atlas-input min-w-0 max-w-full" placeholder={initial.hasPassword ? "••••••••••••••••" : "xxxx xxxx xxxx xxxx"} />
      </Field>
      <Field label="Carpeta">
        <input name="imapFolder" defaultValue={initial.folder} className="atlas-input min-w-0 max-w-full" />
      </Field>
      <div className="flex flex-col justify-end text-xs text-muted">
        <span>Última sincronización: {initial.lastSync ?? "nunca"}</span>
        {initial.lastError ? <span className="mt-1 text-foreground">Último error: {initial.lastError}</span> : null}
        <span className="mt-1">Se sincroniza automáticamente cada 5 minutos y al abrir la Bandeja.</span>
      </div>
      <div className="sm:col-span-2">
        <Notice message={state?.error} />
      </div>
      <div className="sm:col-span-2 flex flex-wrap justify-end gap-2">
        <SubmitButton name="intent" value="test" className="atlas-btn atlas-btn-secondary" pendingText="Probando…">
          Probar conexión
        </SubmitButton>
        <SubmitButton name="intent" value="sync" className="atlas-btn atlas-btn-secondary" pendingText="Sincronizando…">
          Sincronizar ahora
        </SubmitButton>
        <SubmitButton name="intent" value="save">Guardar</SubmitButton>
      </div>
    </form>
  );
}
