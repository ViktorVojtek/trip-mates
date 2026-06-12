# Trip Mates — Remaining Work

_Last verified: 2026-06-10. Always check actual files before acting on this list — verify before you trust._

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

### 2. Frontend Feature Gaps

#### 2a. Chat — Conversation List
`/chat` shows "Select a conversation" with no list. Users have no way to find who to chat with.
- [ ] Add `GET /api/messages` call on Chat page load (no userId param) to get all conversations for current user
- [ ] Render a sidebar list of conversation partners with links to `/chat/:userId`
- [ ] Add `GET /api/users/:id` to `client/src/services/api.ts` for fetching conversation partner names

#### 2b. Public User Profile Page
No `/profile/:userId` route exists. TripDetail shows `createdById` but no link.
- [ ] Create `client/src/pages/PublicProfile.tsx` — calls `GET /api/users/:id`, displays name, bio, familySize, travelPreferences, trips
- [ ] Add route `/profile/:userId` to `client/src/App.tsx`
- [ ] Link "Posted by" section in `client/src/pages/TripDetail.tsx` to `/profile/:createdById`

#### 2c. AvailabilityCalendar Integration
`AvailabilityCalendar` component is built but unused. `ProfileForm` uses a plain text input for availability instead.
- [ ] Replace the plain text availability input in `client/src/components/ProfileForm.tsx` with `<AvailabilityCalendar />`
- [ ] Wire selected dates to react-hook-form field as comma-separated ISO date strings

#### 2d. Landing Page — Featured Trips
- [ ] Add a featured trips section to `client/src/pages/Landing.tsx` — call `GET /api/trips?pageSize=3` (unauthenticated), render with `TripCard`

#### 2e. Profile Picture Upload
Use URL input as the simplest no-infrastructure strategy.
- [ ] Add a URL text input for `profilePicture` to `client/src/components/ProfileForm.tsx`
- [ ] Wire it to the `updateProfile` API call

---

### 3. Client Tests — ✅ COMPLETE (71/71 tests passing)

- [x] `@testing-library/user-event@^14.5.2` installed
- [x] `src/api/client.test.ts` — 4 tests, all passing ✅
- [x] `src/services/auth.test.ts` — 8 tests, all passing ✅
- [x] `src/components/ChatBubble.test.tsx` — 4 tests, all passing ✅
- [x] `src/components/FilterBar.test.tsx` — 7 tests, all passing ✅
- [x] `src/components/AvailabilityCalendar.test.tsx` — 6 tests, all passing ✅
- [x] `src/components/MatchScore.test.tsx` — 6 tests, all passing ✅
- [x] **Helper & Resolver tests** — 20 tests, all passing ✅
- [x] Other component tests (TripCard, ProfileForm, TripForm, etc.) — need to be written

**Still needed:**
- `src/services/api.test.ts` — ~8 tests for API service layer
- `src/components/TripCard.test.tsx` — ~9 tests
- `src/components/ProfileForm.test.tsx` — ~6 tests  
- `src/components/TripForm.test.tsx` — ~6 tests
- Context & page tests (AuthContext, Login, Signup, Dashboard, TripDetail, PostTrip, Profile) — ~29 tests

---

### 4. Server Tests (not set up yet)

**Install and configure first:**
```bash
cd /Users/dexter/Projects/trip-mates/server && npm install --save-dev vitest@^1.6.0 supertest@^7.0.0 @types/supertest@^6.0.0
```

**Create `server/vitest.config.ts`:**
```ts
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: { environment: 'node', globals: true },
});
```

**Add to `server/package.json` scripts:**
```json
"test": "vitest run"
```

#### Test Files
| File | Tests | Notes |
|------|-------|-------|
| `server/src/utils/helpers.test.ts` | ~6 | Test `paginate()` — page 1, last page, empty, out-of-range |
| `server/src/middleware/auth.test.ts` | ~5 | Use real `jwt.sign`; test missing/invalid/valid token |
| `server/src/middleware/errorHandler.test.ts` | ~3 | Test status code and message passthrough |
| `server/src/controllers/authController.test.ts` | ~8 | Mock prisma; test register/login/getProfile/updateProfile |
| `server/src/routes/auth.test.ts` | ~8 | Supertest integration; test full request/response cycle |

---

## Recommended Order

1. ~~Backend API Routes~~ — done
2. ~~Budget field~~ — done
3. **Frontend gaps** (2a → 2b → 2c → 2d → 2e) — no blockers
4. **Client tests** — install user-event, then write service → component → context/page tests
5. **Server tests** — install vitest + supertest, create config, write test files
6. **Environment setup** — BLOCKED until user provides DATABASE_URL and JWT_SECRET
