"use client";

import { useActionState } from "react";
import { loginGestor, loginResident, registerGestor, registerResident, type ActionState } from "@/app/actions/auth";
import { Field, Notice, SubmitButton } from "@/components/ui";
import { INMOBILIARIAS, getVertical, isVerticalKey } from "@/verticals";

export function GestorLoginForm() {
  const [state, action] = useActionState<ActionState, FormData>(loginGestor, undefined);
  return (
    <form action={action} className="grid gap-4">
      <Field label="Email">
        <input name="email" type="email" required autoComplete="email" className="atlas-input" placeholder="tu@empresa.es" />
      </Field>
      <Field label="Contraseña">
        <input name="password" type="password" required autoComplete="current-password" className="atlas-input" placeholder="••••••••" />
      </Field>
      <Notice message={state?.error} />
      <SubmitButton pendingText="Entrando…" className="atlas-btn atlas-btn-primary w-full !py-3">
        Entrar al panel
      </SubmitButton>
    </form>
  );
}

export function GestorRegisterForm() {
  const [state, action] = useActionState<ActionState, FormData>(registerGestor, undefined);
  const vertical = INMOBILIARIAS.key;
  const v = getVertical(vertical);

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="vertical" value={vertical} />

      <Field label={`Nombre de tu ${v.company.oneLower}`}>
        <input name="company" required className="atlas-input" placeholder={vertical === "inmobiliarias" ? "Inmobiliaria Duero" : "Gestoría Alcántara"} />
      </Field>
      <Field label="Tu nombre">
        <input name="name" required className="atlas-input" placeholder="Daniel García" />
      </Field>
      <Field label="Email">
        <input name="email" type="email" required autoComplete="email" className="atlas-input" placeholder="tu@empresa.es" />
      </Field>
      <Field label="Teléfono">
        <input name="phone" type="tel" className="atlas-input" placeholder="+34 600 000 000" />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Contraseña" hint="Mínimo 6 caracteres.">
          <input name="password" type="password" required minLength={6} autoComplete="new-password" className="atlas-input" placeholder="••••••••" />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Notice message={state?.error} />
      </div>
      <div className="sm:col-span-2">
        <SubmitButton pendingText="Creando cuenta…" className="atlas-btn atlas-btn-primary w-full !py-3">
          Crear cuenta y configurar mi {v.company.oneLower}
        </SubmitButton>
      </div>
    </form>
  );
}

export function ResidentLoginForm({ companyNoun }: { companyNoun?: string }) {
  const [state, action] = useActionState<ActionState, FormData>(loginResident, undefined);
  return (
    <form action={action} className="grid gap-4">
      <Field label="Email">
        <input name="email" type="email" required className="atlas-input" placeholder="tu@correo.es" />
      </Field>
      <Field label="Contraseña">
        <input name="password" type="password" required className="atlas-input" placeholder="••••••••" />
      </Field>
      <Notice message={state?.error} />
      <SubmitButton pendingText="Entrando…" className="atlas-btn atlas-btn-primary w-full !py-3">
        Entrar al portal
      </SubmitButton>
    </form>
  );
}

export function ResidentRegisterForm({ code, vertical }: { code?: string; vertical?: string }) {
  const [state, action] = useActionState<ActionState, FormData>(registerResident, undefined);
  const v = getVertical(isVerticalKey(vertical) ? vertical : "inmobiliarias");
  const showRoles = v.features.contactRoles;

  return (
    <form action={action} className="grid gap-4">
      <Field label={`Código de tu ${v.entity.oneLower}`} hint="Te lo facilita tu empresa gestora. Formato RES-XXXXXXXX.">
        <input name="code" required defaultValue={code ?? ""} className="atlas-input font-mono uppercase" placeholder="RES-A1B2C3D4" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre">
          <input name="name" required className="atlas-input" placeholder="María López" />
        </Field>
        <Field label={showRoles ? "Vivienda / puerta" : "Piso / puerta"}>
          <input name="unit" className="atlas-input" placeholder="3º B" />
        </Field>
        {showRoles ? (
          <Field label="Soy">
            <select name="role" className="atlas-input" defaultValue="propietario">
              {v.contactRoles.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.label}
                </option>
              ))}
            </select>
          </Field>
        ) : null}
        <Field label="Email">
          <input name="email" type="email" required className="atlas-input" placeholder="tu@correo.es" />
        </Field>
        <Field label="Teléfono">
          <input name="phone" type="tel" className="atlas-input" placeholder="+34 600 000 000" />
        </Field>
      </div>
      <Field label="Contraseña">
        <input name="password" type="password" required minLength={6} className="atlas-input" placeholder="••••••••" />
      </Field>
      <Notice message={state?.error} />
      <SubmitButton pendingText="Registrando…" className="atlas-btn atlas-btn-primary w-full !py-3">
        {showRoles ? `Darme de alta en mi ${v.entity.oneLower}` : "Registrarme en mi comunidad"}
      </SubmitButton>
    </form>
  );
}
