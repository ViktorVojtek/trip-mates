# Trip Mates — Remaining Work

_Last verified: 2026-06-16. Always check actual files before acting on this list — verify before you trust._

This list mirrors the approved completion plan. The autonomous night runner (`night-run.sh`) works through the unchecked checklist items below; items marked `BLOCKED:` are skipped.

---

## Status snapshot (verified 2026-06-15)

- **Backend API** — complete: auth / trips / messages / users controllers + routes, all mounted in `server/src/index.ts`. `budget` Decimal→Number via `serializeTrip`.
- **Frontend** — complete: 9 pages, 9 components, `AuthContext`, API service layer.
- **Database** — **set up, NOT blocked**: migration `server/prisma/migrations/20260608134149_initial_migration` applied, `server/.env` + `client/.env` present, Postgres up on :5432, Prisma client generated. (Re-run `npm run db:seed` if sample data is missing.)
- **Client tests** — 167 passing (24 files).
- **Server tests** — 92 passing (12 files).
- **TypeScript** — `tsc --noEmit` clean in both packages ✅. `npm run build` succeeds in both.
- **Live smoke (2026-06-15)** — verified against real DB: public trip listing without auth, public trip detail, budget serialized as number, avatar upload + non-image rejection, Socket.IO auth handshake + real-time `message:new` delivery.
- **v1 (Phases 4–6)** complete. **Phase 7 (production readiness)** newly drafted below and pending — hardening for real deployment, not new features.

### Invariants (from CLAUDE.md — never break)
`postcss.config.js` not `.ts` · server imports use `.js` extension (NodeNext) · no `@hookform/resolvers` (use `client/src/utils/zodResolver.ts`) · always `Number(trip.budget)` before JSON.

---

## Remaining Tasks

### Phase 4 — Bug fixes (small, real correctness)

- [x] **4.1 Public trip listing** — remove the auth middleware from `GET /api/trips` and `GET /api/trips/:id` in `server/src/routes/trips.ts` so logged-out visitors can browse; keep `POST /`, `POST /:id/interest`, `GET /:id/interests` auth-gated. Update `server/src/routes/trips.test.ts` to assert both GETs are reachable without a token. (Fixes Landing showing "No trips posted yet" to visitors.)
- [x] **4.2 `createdById` filter** — in `tripController.getTrips`, read `req.query.createdById` and add `if (createdById) where['createdById'] = createdById as string;`. Then remove the client-side re-filter workaround in `client/src/pages/PublicProfile.tsx`. Add a controller test for the filter.
- [x] **4.3 AvailabilityCalendar sync** — in `client/src/components/AvailabilityCalendar.tsx` add `useEffect(() => setSelected(new Set(value)), [value])` so it re-syncs when the parent `value` prop changes. Add a test for prop-change re-render.
- [x] **4.4 Chat list staleness** (done-by-5a: Socket.IO replaces polling) — refetch conversations after sending a message in `client/src/pages/Chat.tsx`. Mark done-by-5a if Socket.IO lands first.

### Phase 5 — PRD non-goal features (full scope)

> Write and commit the code + tests regardless. Where live operation needs a secret, note it and mark only that live-verification step `BLOCKED:` — the code/tests are still expected. Add every new env var to `.env.example`.

- [x] **5a Real-time chat (Socket.IO)** — supersedes 4.4.
  - Server: add `socket.io`; in `server/src/index.ts` wrap Express in `http.createServer` and attach `io`; authenticate the handshake with `jwt.verify` (reuse logic from `middleware/auth.ts`); join a per-user room. Emit `message:new` from `messageController.sendMessage`.
  - Client: add `socket.io-client`; a `useSocket` hook (reuse the JWT from `services/auth.ts`); in `Chat.tsx` subscribe to `message:new` to append messages and update the sidebar live.
  - Tests: server emits on send (mock `io`); client hook subscribe/cleanup.
- [x] **5b Avatar file upload** — credential-free default: `multer` disk storage → `server/uploads/`, served statically; `POST /api/users/me/avatar` (auth) stores the path in `User.profilePicture` (string field — no schema change). Add a file input beside the URL field in `client/src/components/ProfileForm.tsx`; add `uploadAvatar` to `client/src/services/api.ts`. Tests: accepts an image, rejects non-images, updates the user. Cloud (Cloudinary/S3) variant is optional — needs keys.
- [x] **5c Email notifications (code + mocked tests)** — `nodemailer` + new `server/src/utils/mailer.ts` reading `SMTP_*` env; trigger on `expressInterest` to notify the trip owner. Tests use a mock transport. Add `SMTP_*` to `.env.example`.
- [ ] `BLOCKED: needs SMTP_HOST/PORT/USER/PASS` — live email-send verification for 5c (code + mocked tests are still expected above).
- [x] **5d Google login (code + mocked tests)** — `google-auth-library` on server: `POST /api/auth/google` verifies a Google ID token, upserts the user, returns the app JWT (reuse `authController` token logic). Client: `@react-oauth/google` button on `Login.tsx` / `Signup.tsx`. Tests mock the verifier. Add `GOOGLE_CLIENT_ID/SECRET` to `.env.example`.
- [ ] `BLOCKED: needs GOOGLE_CLIENT_ID/SECRET` — live Google sign-in verification for 5d (code + mocked tests are still expected above).

### Phase 6 — Final verification

- [x] **6.1** `tsc --noEmit` clean in both packages; `npm test` green in both (server 92, client 167); `npm run build` succeeds in both.
- [x] **6.2** Live smoke against the real DB: register/create-trip, public trip listing + detail without auth, avatar upload (+ non-image 400), Socket.IO auth + real-time `message:new`. (Live email/Google not exercised — credential-gated.)
- [x] **6.3** Reconciled this doc — Phases 4–6 complete; only the two credential-gated live-verification items remain (SMTP, Google).

### Phase 7 — Production readiness (new scope, beyond v1)

> Newly scoped after v1 features completed (2026-06-16). These harden the app for real deployment rather than adding features. Live/deploy steps that need credentials or a hosting decision are marked `BLOCKED:` — the code + tests are still expected. Default to a single sensible choice where a decision is open (noted inline) so the runner is not blocked; the user can override.

- [x] **7.1 Server-side request validation** — add a `validate(schema)` middleware (`server/src/middleware/validate.ts`) backed by Zod and apply it to `POST /auth/register`, `/auth/login`, `/auth/google`, `POST /trips`, `POST /messages`, and `PUT /auth/profile`. Return 400 with field errors on invalid bodies (server currently trusts request bodies; Zod is client-only today). Tests: one accept + one reject per route.
- [x] **7.2 Security headers + CORS lockdown** — add `helmet`; restrict Express `cors()` and the Socket.IO `cors.origin` to `CLIENT_ORIGIN` (in `server/src/index.ts`), refusing `*` when `NODE_ENV === 'production'`. Test that a disallowed origin is rejected.
- [x] **7.3 Auth rate limiting** — add `express-rate-limit` to the auth router for `login`/`register`/`google` (e.g. 10 req/min/IP). Test that exceeding the limit returns 429.
- [x] **7.4 Production-safe error handling** — update `server/src/middleware/errorHandler.ts` to log the full error server-side but return a generic message (no stack/internal details) when `NODE_ENV === 'production'`, keeping detailed output in dev. Extend `errorHandler.test.ts`.
- [x] **7.5 Request logging + graceful shutdown** — add HTTP request logging (`morgan`, skipped under test) and close the HTTP server, Socket.IO, and Prisma on `SIGTERM`/`SIGINT` in `server/src/index.ts`.
- [x] **7.6 Cloud avatar storage (code + mocked tests)** — add a storage adapter so avatars upload to **Cloudinary** (default; S3 as alternative) when its keys are set, falling back to the existing local-disk multer path otherwise. `User.profilePicture` stores the returned URL. Add the keys to `.env.example`. Mock the SDK in tests. (Local disk does not survive ephemeral hosting — this is required for real deploys.)
- [ ] `BLOCKED: needs Cloudinary (or S3) credentials` — live upload-to-bucket verification for 7.6 (code + mocked tests still expected above).
- [x] **7.7 Containerization** — multi-stage `server/Dockerfile` (build → migrate + `node dist/index.js`), `client/Dockerfile` (vite build → nginx static serve with SPA fallback), `.dockerignore` files, `client/nginx.conf`, and a root `docker-compose.yml` wiring server + client + Postgres (healthcheck-gated). `docker compose config` validates. NOTE: live image build not run here — the Docker daemon/colima won't start in this environment; run `docker compose build` where Docker is available to verify.
- [ ] **7.8 CI workflow** — add `.github/workflows/ci.yml` running install + `tsc --noEmit` + tests + build for both packages on push/PR. Note: this only runs once the repo has a GitHub remote (currently none; pushing is prevented by the `pre-push` hook).

---

## Credentials needed for LIVE non-goal features (code ships regardless)

- **Google:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- **Email:** `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- **Cloud avatars (optional):** Cloudinary or S3 keys

## Execution rules (autonomous runner)

- Verify actual file state before trusting this list. Complete each task fully with real code (no stubs); run/extend tests until green; commit locally per task.
- Never `git push`, never add a remote, never use `--no-verify` (a `pre-push` hook enforces this).
- Mark each item `[x]` when done or `BLOCKED: <reason>` when truly blocked, then continue to the next. Stop only when all items are done or blocked.

---

## Completed (history)

- Backend API (auth/trips/messages/users) + middleware + Prisma schema — done.
- All frontend pages/components incl. Chat conversation list, `PublicProfile` (`/profile/:userId`), Landing featured trips, AvailabilityCalendar in ProfileForm, profile-picture URL field — done.
- Client tests 161/161 (commit `0bc4af8` added Navbar/Landing/Chat/PublicProfile).
- Server tests 74/74 (commit `cc0fc97` added trip/message/user controller + route tests).
- TypeScript test-file errors fixed in both packages (2026-06-15).
