# Copilot / AI assistant instructions — Maggie

Purpose: short, actionable guidance so an AI coding assistant can be immediately productive in this codebase.

- Project type: Next.js 13+ (App Router) + TypeScript. UI uses MUI. Auth via Clerk. Data stored in MongoDB (mongoose). Cache via Redis (ioredis).

Big picture (why & how)

- Root app providers live in `src/app/layout.tsx` (ClerkProvider, AppRouterCacheProvider, MUI Theme). Prefer changes here for cross‑cutting UI/provider work.
- Auth & routing rules are enforced in `src/middleware.ts` using Clerk middleware. `/admin` routes are protected here.
- Server API routes use the App Router convention: each API folder contains a `route.ts` exporting HTTP handlers (export async function GET/POST...). Handlers use `NextRequest`, `NextResponse` and `next/headers` helpers.
- Database models and connection helpers live in `src/db/*.ts` (notably `src/db/schema.ts` and `src/db/product.ts`). They use mongoose and expect `process.env.MONGO_URI`.
- Redis client is in `src/cache/redis.ts` (ioredis). Environment variable: `REDIS_URL` (defaults to `redis://localhost:6379` in code).
- Client components (React) live under `src/components` and use `"use client"` when they call browser APIs or fetch; server components live under `src/app` pages unless explicitly marked client.

Key patterns and examples (copyable patterns you should follow)

- API route skeleton (follow existing files like `src/app/api/products/route.ts`):
  - export async function GET(req: NextRequest) { return NextResponse.json({ data }) }
  - Use `cookies()` from `next/headers` on the server to read cookies (see `src/app/api/cart/route.ts`).
- Cart flow (important concrete example):
  - Client: `src/components/productCard.tsx` fetches `/api/cart` POST to add items and `/api/cart/quantity` to read/update quantity.
  - Server: `src/app/api/cart/route.ts` and `src/app/api/cart/quantity/route.ts` read a `deviceId` cookie and persist cart JSON in Redis keyed by deviceId.
  - Device id is created client‑side (see `src/app/api/cart/utils.ts` and `src/cache/utils.ts` which reference localStorage / fingerprinting). On the server, code expects the cookie `deviceId` to exist.
- DB helpers: `src/db/product.ts` provides CRUD helpers (addProduct, getProducts, updateMultipleProducts). They use mongoose models defined in `src/db/schema.ts`. Use these helpers for DB logic to keep route handlers thin.

Conventions and gotchas (do not assume defaults)

- App Router + NextResponse: many handlers return `NextResponse.json(...)` — keep using NextResponse helpers rather than Express-style res.write.
- Server modules must not access browser-only APIs. If a file needs window/localStorage or FingerprintJS, it must be a client component or a helper used from client code (see `src/components/productCard.tsx` and `src/cache/utils.ts`).
- DeviceId/cookie gap: the cart API expects a cookie named `deviceId` (see `cookies().get('deviceId')`). Ensure the client sets this cookie (current client code uses localStorage/UUID — verify cookie syncing if you change the flow).
- Auth: `src/middleware.ts` enforces admin-only access for `/admin(.*)`. When adding admin pages, ensure middleware metadata checks align with Clerk session claims.
- Environment variables the code expects:
  - MONGO_URI — required by `src/db/schema.ts` (connect throws if missing)
  - REDIS_URL — used by `src/cache/redis.ts` (defaults to localhost if omitted)
  - Clerk env vars — required for Clerk to operate in dev/prod (check `.env.local` in your environment)

Developer workflows & commands

- Start dev server: `yarn run dev` (README uses standard Next scripts). Build: `yarn run build`. Start production: `yarn run start` or use Vercel.
- No test framework or CI config discovered — there are no tests in the repository. If adding tests, follow the TypeScript/MUI/Next patterns and keep server/client separation.
- Debugging tips:
  - Check server logs from `next dev` for middleware or API errors.
  - Confirm cookies with browser devtools; cart API depends on `deviceId` cookie.
  - Redis: the project uses an ioredis client at `src/cache/redis.ts` — run a local Redis for development or set REDIS_URL.

Files to inspect first (quick map)

- Root providers / layout: `src/app/layout.tsx`
- Middleware/auth: `src/middleware.ts`
- API examples: `src/app/api/products/route.ts`, `src/app/api/cart/route.ts`, `src/app/api/cart/quantity/route.ts`
- DB: `src/db/schema.ts`, `src/db/product.ts`
- Cache: `src/cache/redis.ts`, `src/cache/utils.ts`
- Important UI examples: `src/components/productCard.tsx`, `src/components/pageLayout.tsx`

If something is ambiguous or missing (e.g., how deviceId cookie is set in your environment, or specific Clerk environment variable names), ask me and I will point to the exact place to update or add code/tests. After you review this file, tell me which areas you'd like expanded (examples, CI, or local setup steps).
