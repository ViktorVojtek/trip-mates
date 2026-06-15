# Trip Mates — Remaining Work

_Last verified: 2026-06-15. Always check actual files before acting on this list — verify before you trust._

This list mirrors the approved completion plan. The autonomous night runner (`night-run.sh`) works through the unchecked checklist items below; items marked `BLOCKED:` are skipped.

---

## Status snapshot (verified 2026-06-15)

- **Backend API** — complete: auth / trips / messages / users controllers + routes, all mounted in `server/src/index.ts`. `budget` Decimal→Number via `serializeTrip`.
- **Frontend** — complete: 9 pages, 9 components, `AuthContext`, API service layer.
- **Database** — **set up, NOT blocked**: migration `server/prisma/migrations/20260608134149_initial_migration` applied, `server/.env` + `client/.env` present, Postgres up on :5432, Prisma client generated. (Re-run `npm run db:seed` if sample data is missing.)
- **Client tests** — 161 passing (23 files).
- **Server tests** — 74 passing (11 files).
- **TypeScript** — `tsc --noEmit` clean in both packages ✅ (test-file errors fixed 2026-06-15).

### Invariants (from CLAUDE.md — never break)
`postcss.config.js` not `.ts` · server imports use `.js` extension (NodeNext) · no `@hookform/resolvers` (use `client/src/utils/zodResolver.ts`) · always `Number(trip.budget)` before JSON.

---

## Remaining Tasks

### Phase 4 — Bug fixes (small, real correctness)

- [x] **4.1 Public trip listing** — remove the auth middleware from `GET /api/trips` and `GET /api/trips/:id` in `server/src/routes/trips.ts` so logged-out visitors can browse; keep `POST /`, `POST /:id/interest`, `GET /:id/interests` auth-gated. Update `server/src/routes/trips.test.ts` to assert both GETs are reachable without a token. (Fixes Landing showing "No trips posted yet" to visitors.)
- [x] **4.2 `createdById` filter** — in `tripController.getTrips`, read `req.query.createdById` and add `if (createdById) where['createdById'] = createdById as string;`. Then remove the client-side re-filter workaround in `client/src/pages/PublicProfile.tsx`. Add a controller test for the filter.
- [ ] **4.3 AvailabilityCalendar sync** — in `client/src/components/AvailabilityCalendar.tsx` add `useEffect(() => setSelected(new Set(value)), [value])` so it re-syncs when the parent `value` prop changes. Add a test for prop-change re-render.
- [ ] **4.4 Chat list staleness** — refetch conversations after sending a message in `client/src/pages/Chat.tsx`. Mark done-by-5a if Socket.IO lands first.

### Phase 5 — PRD non-goal features (full scope)

> Write and commit the code + tests regardless. Where live operation needs a secret, note it and mark only that live-verification step `BLOCKED:` — the code/tests are still expected. Add every new env var to `.env.example`.

- [ ] **5a Real-time chat (Socket.IO)** — supersedes 4.4.
  - Server: add `socket.io`; in `server/src/index.ts` wrap Express in `http.createServer` and attach `io`; authenticate the handshake with `jwt.verify` (reuse logic from `middleware/auth.ts`); join a per-user room. Emit `message:new` from `messageController.sendMessage`.
  - Client: add `socket.io-client`; a `useSocket` hook (reuse the JWT from `services/auth.ts`); in `Chat.tsx` subscribe to `message:new` to append messages and update the sidebar live.
  - Tests: server emits on send (mock `io`); client hook subscribe/cleanup.
- [ ] **5b Avatar file upload** — credential-free default: `multer` disk storage → `server/uploads/`, served statically; `POST /api/users/me/avatar` (auth) stores the path in `User.profilePicture` (string field — no schema change). Add a file input beside the URL field in `client/src/components/ProfileForm.tsx`; add `uploadAvatar` to `client/src/services/api.ts`. Tests: accepts an image, rejects non-images, updates the user. Cloud (Cloudinary/S3) variant is optional — needs keys.
- [ ] **5c Email notifications (code + mocked tests)** — `nodemailer` + new `server/src/utils/mailer.ts` reading `SMTP_*` env; trigger on `expressInterest` to notify the trip owner. Tests use a mock transport. Add `SMTP_*` to `.env.example`.
- [ ] `BLOCKED: needs SMTP_HOST/PORT/USER/PASS` — live email-send verification for 5c (code + mocked tests are still expected above).
- [ ] **5d Google login (code + mocked tests)** — `google-auth-library` on server: `POST /api/auth/google` verifies a Google ID token, upserts the user, returns the app JWT (reuse `authController` token logic). Client: `@react-oauth/google` button on `Login.tsx` / `Signup.tsx`. Tests mock the verifier. Add `GOOGLE_CLIENT_ID/SECRET` to `.env.example`.
- [ ] `BLOCKED: needs GOOGLE_CLIENT_ID/SECRET` — live Google sign-in verification for 5d (code + mocked tests are still expected above).

### Phase 6 — Final verification

- [ ] **6.1** `tsc --noEmit` clean in both packages; `npm test` green in both; `npm run build` succeeds in both.
- [ ] **6.2** End-to-end smoke (use the **run** skill): register/login, post a trip, view it logged-out on Landing (public listing), open another user's `PublicProfile`, send a chat message and confirm it appears in real time.
- [ ] **6.3** Reconcile this doc — check off completed items and note any that remain pending.

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
