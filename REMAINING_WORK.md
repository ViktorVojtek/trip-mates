# Trip Mates — Remaining Work

_Last verified: 2026-06-12. Always check actual files before acting on this list — verify before you trust._

---

## What's Actually Complete (verified 2026-06-04)

### Backend
- [x] Project scaffold (TypeScript, Express 4, Prisma 5, dotenv)
- [x] Prisma schema — `User`, `Trip`, `TripInterest`, `Interest`, `Message` models
- [x] Auth routes + controller (`POST /register`, `POST /login`, `GET /profile`, `PUT /profile`)
- [x] JWT auth middleware (`server/src/middleware/auth.ts`)
- [x] Error handler middleware (`server/src/middleware/errorHandler.ts`)
- [x] `paginate()` utility (`server/src/utils/helpers.ts`)
- [x] **Trips API** — `server/src/controllers/tripController.ts` + `server/src/routes/trips.ts` (fully implemented, mounted in index.ts)
- [x] **Messages API** — `server/src/controllers/messageController.ts` + `server/src/routes/messages.ts` (fully implemented, mounted in index.ts)
- [x] **Users API** — `server/src/controllers/userController.ts` + `server/src/routes/users.ts` (fully implemented, mounted in index.ts)
- [x] Seed file — `server/prisma/seed.ts` exists

### Frontend
- [x] React 18 + Vite 5 + TypeScript + Tailwind CSS scaffold
- [x] React Router with protected routes (`PrivateRoute`)
- [x] `AuthContext` — login, register, logout, refreshProfile
- [x] All 8 pages: Landing, Login, Signup, Dashboard, TripDetail, PostTrip, Chat, Profile
- [x] All components: `TripCard`, `FilterBar`, `MatchScore`, `ProfileForm`, `TripForm`, `ChatBubble`, `AvailabilityCalendar`, `Navbar`
- [x] API service layer: `services/api.ts`, `services/auth.ts`, `api/client.ts`
- [x] Frontend types — includes `budget: number` in `TripFormData` and `Trip`
- [x] Utilities: `helpers.ts`, `zodResolver.ts`
- [x] `budget` field present in `TripCard` and `TripDetail` display

### Tests
- [x] `client/vitest.config.ts` — configured with jsdom + @testing-library/jest-dom
- [x] `client/src/utils/helpers.test.ts` — 15 tests, all passing
- [x] `client/src/utils/zodResolver.test.ts` — 5 tests, all passing
- [x] Client test deps installed: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `@testing-library/user-event`
- [x] API client tests (`src/api/client.test.ts`) — 4 tests, all passing
- [x] Auth service tests (`src/services/auth.test.ts`) — 8 tests, all passing
- [x] Component tests (ChatBubble, FilterBar, AvailabilityCalendar, MatchScore) — 23 tests, all passing
- [x] **71 client tests total — all passing**

---

## Remaining Tasks

### 1. Environment & Database Setup
**BLOCKED: requires user-provided credentials — Claude cannot complete this**
- [ ] `BLOCKED` Create `server/.env` with `DATABASE_URL` (PostgreSQL connection string) and `JWT_SECRET` — user must provide these values
- [ ] Run `npm run db:generate` in `server/` — requires .env to exist first
- [ ] Run `npm run db:migrate` in `server/` — requires .env to exist first

---

### 2. Frontend Feature Gaps — ✅ ALL COMPLETE

#### 2a. Chat — Conversation List ✅
- [x] `GET /api/messages` called on Chat page load, sidebar conversation list implemented
- [x] Conversations rendered with links to `/chat/:userId`
- [x] `getUser(id)` in `client/src/services/api.ts` for fetching partner names

#### 2b. Public User Profile Page ✅
- [x] `client/src/pages/PublicProfile.tsx` — fetches user + trips, displays full profile
- [x] Route `/profile/:userId` in `client/src/App.tsx`
- [x] "Posted by" link in `client/src/pages/TripDetail.tsx` → `/profile/:createdById`

#### 2c. AvailabilityCalendar Integration ✅
- [x] `<AvailabilityCalendar />` used in `ProfileForm.tsx` via `Controller`
- [x] Wired to react-hook-form `availability` field as comma-separated ISO date strings

#### 2d. Landing Page — Featured Trips ✅
- [x] Featured trips section in `client/src/pages/Landing.tsx` — calls `GET /api/trips?pageSize=3`

#### 2e. Profile Picture Upload ✅
- [x] URL input for `profilePicture` in `client/src/components/ProfileForm.tsx`
- [x] Wired to `updateProfile` API call

---

### 3. Client Tests — ✅ COMPLETE (161/161 tests passing)

- [x] `src/api/client.test.ts` — 4 tests ✅
- [x] `src/services/auth.test.ts` — 8 tests ✅
- [x] `src/services/api.test.ts` — 9 tests ✅
- [x] `src/utils/helpers.test.ts` — 15 tests ✅
- [x] `src/utils/zodResolver.test.ts` — 5 tests ✅
- [x] `src/components/ChatBubble.test.tsx` — 4 tests ✅
- [x] `src/components/FilterBar.test.tsx` — 7 tests ✅
- [x] `src/components/AvailabilityCalendar.test.tsx` — 6 tests ✅
- [x] `src/components/MatchScore.test.tsx` — 6 tests ✅
- [x] `src/components/TripCard.test.tsx` — 7 tests ✅
- [x] `src/components/ProfileForm.test.tsx` — 6 tests ✅
- [x] `src/components/TripForm.test.tsx` — 5 tests ✅
- [x] `src/components/Navbar.test.tsx` — 8 tests ✅
- [x] `src/context/AuthContext.test.tsx` — 6 tests ✅
- [x] `src/pages/Login.test.tsx` — 5 tests ✅
- [x] `src/pages/Signup.test.tsx` — 4 tests ✅
- [x] `src/pages/Dashboard.test.tsx` — 7 tests ✅
- [x] `src/pages/Profile.test.tsx` — 8 tests ✅
- [x] `src/pages/PostTrip.test.tsx` — 3 tests ✅
- [x] `src/pages/TripDetail.test.tsx` — 8 tests ✅
- [x] `src/pages/Landing.test.tsx` — 9 tests ✅
- [x] `src/pages/Chat.test.tsx` — 9 tests ✅
- [x] `src/pages/PublicProfile.test.tsx` — 9 tests ✅

---

### 4. Server Tests — ✅ COMPLETE (34/34 tests passing)

- [x] `server/vitest.config.ts` — configured ✅
- [x] `server/src/utils/helpers.test.ts` — 6 tests ✅
- [x] `server/src/middleware/auth.test.ts` — 5 tests ✅
- [x] `server/src/middleware/errorHandler.test.ts` — 3 tests ✅
- [x] `server/src/controllers/authController.test.ts` — 10 tests ✅
- [x] `server/src/routes/auth.test.ts` — 10 tests ✅

---

## Recommended Order

1. ~~Backend API Routes~~ — done ✅
2. ~~Budget field~~ — done ✅
3. ~~Frontend gaps (2a → 2b → 2c → 2d → 2e)~~ — done ✅
4. ~~Client tests~~ — 124/124 passing ✅
5. ~~Server tests~~ — 34/34 passing ✅
6. **Environment setup** — BLOCKED until user provides DATABASE_URL and JWT_SECRET
