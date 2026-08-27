# Deploying LaunchProof

## Why GitHub Pages won't work

GitHub Pages is a static file host — it serves HTML, CSS, and JS, and runs no server-side code. LaunchProof needs a server for every one of these:

| Feature | Why it needs a server |
|---|---|
| 19 dynamic routes | Every page renders per-user data at request time |
| 9 modules of server actions | Saving jobs, analyzing, editing applications |
| `middleware.ts` | Route protection runs before each request |
| Auth.js | OAuth callbacks and session cookies |
| PostgreSQL via Prisma | Database connections can't be made from a browser |
| OpenAI / GitHub API keys | Secrets must stay server-side |
| Résumé uploads | Files are written to disk |

Next.js does have a static export mode (`output: 'export'`), but it disables server actions, API routes, middleware, and dynamic rendering — which is essentially the entire application. Exporting LaunchProof would leave the marketing page and nothing else.

**Use a host that runs Node.** The rest of this document covers that.

---

## Recommended: Vercel + a hosted Postgres

Vercel is built by the Next.js team and needs no configuration for this app.

### 1. Create a database

Any hosted Postgres works — [Neon](https://neon.tech), [Supabase](https://supabase.com), and Vercel Postgres all have free tiers. Copy the connection string.

> Neon and Supabase require `?sslmode=require` on the connection string.

### 2. Import the repository

At [vercel.com/new](https://vercel.com/new), import `Zura16/LaunchProof`. Vercel detects Next.js automatically — leave the build settings alone.

### 3. Set environment variables

In **Settings → Environment Variables**:

```
DATABASE_URL       postgresql://...        (from step 1)
NEXTAUTH_URL       https://<your-app>.vercel.app
NEXTAUTH_SECRET    <openssl rand -base64 32>
```

Optional, to enable the AI and GitHub features:

```
OPENAI_API_KEY         sk-...
GITHUB_CLIENT_ID       ...
GITHUB_CLIENT_SECRET   ...
```

`NEXTAUTH_URL` must match the deployed origin exactly, or OAuth callbacks will fail.

### 4. Push the schema

From your machine, pointed at the production database:

```bash
DATABASE_URL="<production-url>" npx prisma db push
DATABASE_URL="<production-url>" npm run db:seed   # optional: demo account
```

### 5. Deploy

Vercel builds on push. `npm run build` already runs `prisma generate`, so the client is generated correctly during the build.

### 6. Update OAuth callback URLs

If using GitHub or Google sign-in, set the callback URLs on those apps to your deployed origin:

- GitHub → `https://<your-app>.vercel.app/api/auth/callback/github`
- Google → `https://<your-app>.vercel.app/api/auth/callback/google`

---

## Other hosts

| Host | Notes |
|---|---|
| **Railway / Render** | Run `npm run build` then `npm start`. Both can provision Postgres alongside the app. |
| **Fly.io** | Needs a Dockerfile; use the Next.js `standalone` output. |
| **Any VPS** | `npm ci && npm run build && npm start` behind nginx. Set `NEXTAUTH_URL` to the public origin. |

---

## Uploads in production

Résumés are written to `uploads/` on local disk. That works on a VPS with a persistent volume, but **not on Vercel or other serverless platforms**, where the filesystem is ephemeral and per-invocation — an uploaded file will not survive.

For serverless hosting, move `lib/services/resume-storage.service.ts` to object storage (S3, Vercel Blob, Supabase Storage). It's deliberately the only module that touches the filesystem, so this is a contained change: `saveResumeFile` and `deleteResumeFile` are the two functions to swap.

Everything else in the app is serverless-safe.

---

## Pre-deploy checklist

```bash
npm run verify        # 57 offline checks
npx tsc --noEmit
npm run lint
npm run build
```

- [ ] `NEXTAUTH_SECRET` is a fresh random value, not the development one
- [ ] `NEXTAUTH_URL` matches the deployed origin exactly
- [ ] `.env` is not committed (it is gitignored)
- [ ] OAuth callback URLs updated for the new origin
- [ ] Schema pushed to the production database
- [ ] Résumé storage moved to object storage, if deploying serverless
