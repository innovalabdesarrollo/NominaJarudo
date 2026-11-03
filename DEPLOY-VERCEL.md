# Publicar Nómina Jarudo en Vercel (monorepo → un solo proyecto)

Un dominio sirve **web (SvelteKit)** + **API (Express serverless)** en `/api/*`.

## 1. GitHub

Desde la raíz de este monorepo:

```bash
git init   # si aún no hay repo
git add .
git commit -m "Prepare deploy Vercel monorepo"
gh repo create Nomina-Jarudo --private --source=. --remote=origin --push
# o: git remote add origin git@github.com:TU_ORG/Nomina-Jarudo.git && git push -u origin main
```

## 2. Importar en Vercel

1. [vercel.com](https://vercel.com) → **Add New… → Project** → importa el repo de GitHub.
2. **Root Directory:** `apps/web`  
   (Framework: SvelteKit; `installCommand` en `apps/web/vercel.json` instala el monorepo desde la raíz.)
3. **Framework Preset:** SvelteKit.

## 3. Variables de entorno (Production + Preview)

| Variable | Valor |
| --- | --- |
| `MONGODB_URI` | URI Atlas con DB **`nomina_jarudo`** |
| `JWT_SECRET` | secreto fuerte (distinto al de desarrollo) |
| `PUBLIC_API_URL` | **dejar vacío** (mismo origen `/api`) |

No hace falta `PORT`, `HOST` ni `WEB_PORT` en Vercel.

## 4. Atlas Network Access

MongoDB Atlas → Network Access → permite `0.0.0.0/0` (o IPs de Vercel) para que las funciones serverless conecten.

## 5. Seed (una vez, desde local)

Con la misma `MONGODB_URI` en `.env` local:

```bash
pnpm seed
```

Usuarios demo: `jefe@jarudo.local` / `jefe123`, etc. (cámbialos en producción).

## 6. Local vs producción

| | Local | Vercel |
| --- | --- | --- |
| Web | `pnpm dev:web` → `:5288` | dominio `*.vercel.app` |
| API | `pnpm dev:api` → `:3088` | `/api/*` en el mismo dominio |
| `PUBLIC_API_URL` | `http://127.0.0.1:3088` | vacío |

## Notas

- Runtime serverless: `nodejs22.x` (configurado en `apps/web/svelte.config.js`).
- Uploads PDF en Vercel van a `/tmp` (efímeros entre invocaciones). Para producción dura: S3 u otro storage (fuera del MVP).
- Sin SMTP / Google (fuera de alcance).
- Tras el primer deploy: prueba `/api/health` y el login.
