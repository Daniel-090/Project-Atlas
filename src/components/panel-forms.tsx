"use client";

import { useActionState } from "react";
import type { ActionState } from "@/app/actions/auth";
import { createCommunity, createIncidentAsGestor, createIncidentAsResident, logMessage, saveContacts, saveCustomization, saveImap } from "@/app/actions/panel";
import { CATEGORY_OPTIONS } from "@/lib/incident-ai";
import { Field, Notice, SubmitButton } from "@/components/ui";

type Option = { id: number; name: string };

export function CommunityForm() {
  const [state, action] = useActionState<ActionState, FormData>(createCommunity, undefined);
  return (
    <form action={action} className="grid gap-4" key={state === undefined ? "init" : JSON.stringify(state)}>
      <Field label="Nombre de la comunidad">
        <input name="name" required className="atlas-input" placeholder="C.P. Avenida del Mar 12" />
      </Field>
      <Field label="Dirección">
        <input name="address" className="atlas-input" placeholder="Av. del Mar 12, 29600 Marbella" />
      </Field>
      <Notice message={state?.error} />
      <SubmitButton pendingText="Creando…">Crear comunidad</SubmitButton>
    </form>
  );
}

export function IncidentForm({ communities }: { communities: Option[] }) {
  const [state, action] = useActionState<ActionState, FormData>(createIncidentAsGestor, undefined);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field label="Comunidad">
          <select name="communityId" required className="atlas-input" defaultValue="">
            <option value="" disabled>
              Selecciona una comunidad
            </option>
            {communities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Título">
          <input name="title" required className="atlas-input" placeholder="Fuga de agua en el garaje" />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Descripción" hint="La categoría y la prioridad se clasifican automáticamente si las dejas en automático.">
          <textarea name="description" rows={4} className="atlas-input" placeholder="Detalla qué ocurre, dónde y desde cuándo." />
        </Field>
      </div>
      <Field label="Categoría">
        <select name="category" className="atlas-input" defaultValue="">
          <option value="">Automática</option>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Prioridad">
        <select name="priority" className="atlas-input" defaultValue="">
          <option value="">Automática</option>
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
        </select>
      </Field>
      <Field label="Quién avisa">
        <input name="reporterName" className="atlas-input" placeholder="Nombre del vecino" />
      </Field>
      <Field label="Contacto">
        <input name="reporterContact" className="atlas-input" placeholder="Teléfono o email" />
      </Field>
      <div className="sm:col-span-2">
        <Notice message={state?.error} />
      </div>
      <div className="sm:col-span-2 flex justify-end">
        <SubmitButton pendingText="Registrando…">Registrar incidencia</SubmitButton>
      </div>
    </form>
  );
}

export function ResidentIncidentForm() {
  const [state, action] = useActionState<ActionState, FormData>(createIncidentAsResident, undefined);
  return (
    <form action={action} className="grid gap-4">
      <Field label="¿Qué ocurre?">
        <input name="title" required className="atlas-input" placeholder="Ej. La luz del portal no funciona" />
      </Field>
      <Field label="Cuéntanos más" hint="Dónde está, desde cuándo y si es urgente.">
        <textarea name="description" required rows={5} className="atlas-input" placeholder="Describe la incidencia con detalle." />
      </Field>
      <Notice message={state?.error} />
      <SubmitButton pendingText="Enviando…" className="atlas-btn atlas-btn-primary w-full !py-3">
        Enviar incidencia a mi gestoría
      </SubmitButton>
    </form>
  );
}

export function LogMessageForm({ communities }: { communities: Option[] }) {
  const [state, action] = useActionState<ActionState, FormData>(logMessage, undefined);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2" key={state && !state.error ? Date.now() : "form"}>
      <Field label="Canal">
        <select name="channel" className="atlas-input" defaultValue="llamada">
          <option value="llamada">Llamada</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="email">Email</option>
        </select>
      </Field>
      <Field label="Dirección">
        <select name="direction" className="atlas-input" defaultValue="in">
          <option value="in">Recibida</option>
          <option value="out">Enviada</option>
        </select>
      </Field>
      <Field label="Remitente / contacto">
        <input name="sender" required className="atlas-input" placeholder="María López · +34 600 000 000" />
      </Field>
      <Field label="Comunidad">
        <select name="communityId" className="atlas-input" defaultValue="">
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
          <input name="subject" required className="atlas-input" placeholder="Consulta sobre la derrama del ascensor" />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Resumen de la conversación">
          <textarea name="body" rows={3} className="atlas-input" placeholder="Notas de la conversación." />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" name="factura" className="h-4 w-4 accent-[var(--atlas-primary)]" /> Marcar como factura / documento para el vecino
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

export function CustomizationForm({ initial }: { initial: { companyName: string; primaryColor: string; secondaryColor: string; backgroundColor: string; theme: string; logoUrl: string } }) {
  const [state, action] = useActionState<ActionState, FormData>(saveCustomization, undefined);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field label="Nombre de la gestoría">
          <input name="companyName" defaultValue={initial.companyName} className="atlas-input" />
        </Field>
      </div>
      <ColorInput name="primaryColor" label="Color principal" defaultValue={initial.primaryColor} />
      <ColorInput name="secondaryColor" label="Color secundario" defaultValue={initial.secondaryColor} />
      <ColorInput name="backgroundColor" label="Fondo" defaultValue={initial.backgroundColor} />
      <Field label="Tema">
        <select name="theme" defaultValue={initial.theme} className="atlas-input">
          <option value="light">Claro</option>
          <option value="dark">Oscuro</option>
        </select>
      </Field>
      <div className="sm:col-span-2">
        <Field label="URL del logo" hint="Déjalo vacío para usar las iniciales.">
          <input name="logoUrl" defaultValue={initial.logoUrl} className="atlas-input" placeholder="https://…/logo.png" />
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
      <span className="flex items-center gap-2">
        <input type="color" name={name} defaultValue={defaultValue} className="h-10 w-12 cursor-pointer rounded-lg border border-border bg-transparent p-1" />
        <span className="atlas-code">{defaultValue}</span>
      </span>
    </label>
  );
}

export function ContactsForm({ initial }: { initial: { phone: string; whatsapp: string; emails: string } }) {
  const [state, action] = useActionState<ActionState, FormData>(saveContacts, undefined);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field label="Teléfono principal">
          <input name="phone" defaultValue={initial.phone} className="atlas-input" placeholder="+34 900 000 000" />
        </Field>
      </div>
      <Field label="WhatsApp (uno por línea)">
        <textarea name="whatsapp" defaultValue={initial.whatsapp} rows={4} className="atlas-input" />
      </Field>
      <Field label="Emails (uno por línea)">
        <textarea name="emails" defaultValue={initial.emails} rows={4} className="atlas-input" />
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

export function ImapForm({ initial }: { initial: { host: string; port: number; user: string; hasPassword: boolean; folder: string; lastSync: string | null; lastError: string | null } }) {
  const [state, action] = useActionState<ActionState, FormData>(saveImap, undefined);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <Field label="Servidor IMAP">
        <input name="imapHost" defaultValue={initial.host} className="atlas-input" placeholder="imap.gmail.com" />
      </Field>
      <Field label="Puerto">
        <input name="imapPort" type="number" defaultValue={initial.port} className="atlas-input" />
      </Field>
      <Field label="Usuario">
        <input name="imapUser" defaultValue={initial.user} className="atlas-input" placeholder="gestoria@gmail.com" />
      </Field>
      <Field label="Contraseña de aplicación" hint={initial.hasPassword ? "Ya hay una guardada. Déjala vacía para mantenerla." : "En Gmail: 16 letras, sin espacios."}>
        <input name="imapPassword" type="password" className="atlas-input" placeholder={initial.hasPassword ? "••••••••••••••••" : "xxxx xxxx xxxx xxxx"} />
      </Field>
      <Field label="Carpeta">
        <input name="imapFolder" defaultValue={initial.folder} className="atlas-input" />
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
