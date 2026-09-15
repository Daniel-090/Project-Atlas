# Desplegar Atlas en Render

Guía paso a paso. Hay dos caminos: **A) Blueprint** (automático, recomendado) o
**B) manual** desde el dashboard. El resultado es el mismo.

Antes de empezar necesitas tener el código con los cambios de la vertical de
inmobiliarias **subidos a GitHub en la rama `main`**.

---

## A) Blueprint (recomendado) — 5 minutos

1. Render Dashboard → **New** → **Blueprint**.
2. Conecta el repositorio `Daniel-090/Project-Atlas` si aún no lo has hecho.
3. Render detecta `render.yaml` y te muestra: servicio `atlas` + base `atlas-db`.
4. **Antes de aplicar**, añade los dos secretos que aparecen vacíos:
   - `GROQ_API_KEY` → tu clave de Groq (clasificación automática con IA).
   - `RESEND_API_KEY` → tu clave de Resend (avisos por email). Puedes dejarlo vacío.
5. **Apply**. Render crea la base, instala dependencias, compila y arranca.

Cuando termine, salta a [Después del despliegue](#4-después-del-despliegue).

---

## B) Manual — si prefieres controlar cada pantalla

### 1. Base de datos PostgreSQL
**New** → **PostgreSQL**:
- Name: `atlas-db` · Region: **Frankfurt** (Europa) · Postgres: **17** · Plan: Starter.
- Create database. Cuando esté "Available", copia la **Internal Database URL**.

### 2. Web Service
**New** → **Web Service** → conecta el repo:

| Campo | Valor |
|---|---|
| Runtime | **Node** |
| Region | **Frankfurt** |
| Branch | `main` |
| Build Command | `npm ci && npm run build` |
| Start Command | `npm run start -- -H 0.0.0.0 -p $PORT` |
| Health Check Path | `/api/health` |
| Plan | Starter |

Variables de entorno (Environment → Add Environment Variable):

| Clave | Valor |
|---|---|
| `DATABASE_URL` | la Internal Database URL de `atlas-db` |
| `NODE_VERSION` | `22` |
| `GROQ_API_KEY` | tu clave de Groq |
| `RESEND_API_KEY` | tu clave de Resend (opcional) |

### 3. Migración de la base de datos (una sola vez)
Hazlo **después** del primer despliegue, desde tu ordenador, con la
**External Database URL** de Render (achen `sslmode=require`):

```bash
psql "postgresql://...oregon-postgres.render.com/atlas_db?sslmode=require" \
  -f drizzle/0001_vertical_inmobiliarias.sql
```

Alternativa sin `psql`, usando la **Render Shell** del servicio (Dashboard → Shell):

```bash
psql "$DATABASE_URL" -f drizzle/0001_vertical_inmobiliarias.sql
```

> La migración es **aditiva e idempotente** (`ADD COLUMN IF NOT EXISTS`): no borra
> ni renombra nada, y puedes ejecutarla dos veces sin miedo. La versión de
> administradores de fincas sigue funcionando igual sin la migración aplicada.

---

## 4. Después del despliegue

1. Abre la URL de Render. Debe cargar la portada de Atlas.
2. Entra en **Registro** y crea una empresa eligiendo **Inmobiliaria**.
   Comprueba que el panel dice "Solicitudes", "Inmuebles" y "Contactos".
3. Crea una empresa de tipo **Administradores de fincas** y comprueba que dice
   "Incidencias", "Comunidades" y "Vecinos" (comportamiento de siempre).
4. Revisa **Logs** por si falta alguna variable de entorno.

**Comprobación rápida de salud:** `https://tu-app.onrender.com/api/health` → `{"ok":true}`

---

## 5. Notas y advertencias

- **Node 22.** Next.js 16 no funciona con Node 18. De ahí `NODE_VERSION=22` y
  `"engines": { "node": ">=20.9.0" }` en `package.json`.
- **SSL.** `src/db/index.ts` activa TLS automáticamente si la URL contiene
  `sslmode=require` o apunta a `*.render.com`. Bases locales sin SSL siguen igual.
- **Plan Starter y "spin down".** El servicio gratuito/Starter se duerme tras
  ~15 min sin tráfico y tarda ~30-50 s en despertar. Si quieres que esté siempre
  caliente, sube de plan o añade un ping periódico a `/api/health`.
- **Sincronización de correo.** `instrumentation.ts` lanza un hilo que sincroniza
  el IMAP de todas las empresas cada 5 minutos. Si escalas a varias instancias,
  se ejecutará en cada una; no pasa nada porque los mensajes se deduplican por
  `external_id` (columna única).
- **Vercel y Render a la vez.** Puedes tener ambos apuntando a la misma base sin
  problema: no hay estado en disco y las sesiones viven en Postgres.
- **Rollback.** Render guarda los despliegues anteriores: Deploy → el anterior →
  **Redeploy**. La migración es aditiva, así que el código antiguo sigue
  funcionando con la base migrada (las columnas nuevas tienen valor por defecto).

---

## 6. Resolución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| `DATABASE_URL is required` en el build | falta la variable | añádela antes de compilar |
| `self signed certificate` | conexión a Postgres sin TLS | usa la URL con `sslmode=require` |
| `the server does not support SSL` | se forzó SSL en una base local | quita `sslmode=require` de la URL |
| Página en blanco en `/app` | sesión/DB | mira los Logs: normalmente es `DATABASE_URL` mal puesta |
| Build muy lento o OOM | plan Starter | sube a un plan con más RAM para compilar |
