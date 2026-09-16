# Desplegar Atlas en Netlify — guía completa y autocontenida

Esta guía tiene **todo** lo necesario. No depende de nada más.
Puedes seguirla tú o pegársela a cualquier asistente.

---

## 0. Qué necesitas

- Cuenta en **netlify.com** (gratis).
- El repositorio `Daniel-090/Project-Atlas` y la rama `inmobiliarias-netlify`.

---

## 1. Base de datos aislada de Netlify

Esta rama usa **Netlify Database**. Al primer despliegue Netlify aprovisiona un
PostgreSQL exclusivo para el sitio y aplica automáticamente las migraciones de
`netlify/database/migrations/`. No configures `DATABASE_URL`: hacerlo podría
sobrescribir el aislamiento y conectar, por error, a la base de Vercel.

---

## 2. Crear el sitio en Netlify (3 min)

1. Entra en **netlify.com** → **Add new site** → **Import an existing project**.
2. Elige **GitHub** y autoriza a Netlify si te lo pide.
3. Selecciona el repositorio **`Daniel-090/Project-Atlas`**.
4. Netlify detecta Next.js y rellena los campos. **Comprueba que estén así**:

| Campo | Valor |
|---|---|
| Branch to deploy | `inmobiliarias-netlify` |
| Build command | `npm run build` |
| Publish directory | `.next` |
| Base directory | *(vacío)* |

5. **Antes** de pulsar Deploy, abre **Add environment variables** y añade:

| Clave | Valor |
|---|---|
| `NODE_VERSION` | `22` |
| `GROQ_API_KEY` | tu clave de Groq (clasificación con IA) |
| `RESEND_API_KEY` | tu clave de Resend (opcional, puedes dejarlo vacío) |

> La base de datos es **nueva y exclusiva** para este sitio. No copies la
> `DATABASE_URL` de Vercel ni ejecutes estas migraciones en esa base.

6. Pulsa **Deploy site** y espera unos 3-5 minutos.

> El repositorio ya incluye `netlify.toml` con esa configuración, así que aunque
> Netlify no detecte bien algo, el archivo manda.

---

## 3. Crear las tablas

No hay ningún paso manual. Netlify crea las tablas automáticamente antes de
publicar el primer despliegue. Si una migración falla, el sitio no se publica y
la base de Vercel no se ve afectada.

---

## 4. Comprobar que funciona

1. Abre la URL que te da Netlify (algo como `https://atlas-xxxx.netlify.app`).
2. **Registro** → crea una empresa eligiendo **Inmobiliaria**.
   El panel debe decir *Solicitudes*, *Inmuebles* y *Contactos*.
3. Crea otra empresa de **Administradores de fincas** y comprueba que dice
   *Incidencias*, *Comunidades* y *Vecinos* (comportamiento de siempre).
4. Abre `https://TU-URL.netlify.app/api/health`

Debe responder:

```json
{ "ok": true, "db": { "configured": true, "connected": true } }
```

Si sale `"configured": false` → falta `DATABASE_URL` en Netlify.
Si sale `"connected": false` → la cadena de Neon está mal copiada o sin `?sslmode=require`.

---

## 5. Diferencias frente a Render (importante)

Netlify es **serverless**: no hay un servidor encendido permanentemente.

- ✅ Ventaja: **no se duerme** (a diferencia del plan gratuito de Render).
- ⚠️ Consecuencia: las tareas programadas no existen. La sincronización automática
  de correo IMAP cada 5 min **no funciona** en Netlify. Ahora mismo no importa,
  porque el correo está marcado como "Próximamente" en Configuración; cuando se
  active, se hará con el botón *Sincronizar ahora* o con una función programada.
- ⚠️ Límite de tiempo: cada petición tiene 10 s en el plan gratuito. Las
  clasificaciones con IA son rápidas; suficiente para uso normal.

---

## 6. Si algo falla

| Síntoma | Causa | Solución |
|---|---|---|
| `Application exited early` | no aplica en Netlify | — |
| Página en blanco / error 500 | `DATABASE_URL` mal puesta | revisa `/api/health` |
| `the server does not support SSL` | falta `sslmode=require` | añádelo al final de la URL |
| Build falla por Node | `NODE_VERSION` ausente | ponlo a `22` y vuelve a desplegar |
| `0 new functions to upload` | el plugin no se ejecutó | confirma que `netlify.toml` está en `main` |
| La app va lenta la primera vez | arranque en frío de Lambda | normal; se calienta solo |

Para ver los errores: Netlify → tu sitio → **Deploys** → el deploy → **Deploy log**,
y para errores en caliente: **Functions** → logs.

---

## 7. Volver atrás

Netlify guarda todos los deploys. Si uno nuevo rompe algo:
**Deploys** → elige uno anterior → **Publish deploy**.
