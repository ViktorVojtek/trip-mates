# Trip Mates — Remaining Plan Items

_Generated 2026-06-03. Cross-references PLAN.md against actual project state._

---

## UI Plan — Incomplete Items

### Pages with Gaps

| Page | Gap |
|------|-----|
| Landing / Home | Featured trips section (trending/upcoming) not implemented |
| Profile Setup | Photo upload for profile picture not implemented; `AvailabilityCalendar` not wired in — availability is a plain text input |
| Trip Detail | Match compatibility score display not implemented; "Posted by" has no link to public profile |
| User Profile (public) | `/profile/:userId` route and `PublicProfile.tsx` page do not exist |

### Key Components — Not Integrated

- **AvailabilityCalendar** — component is built but not used anywhere in the app
- **MatchScore** — component exists but compatibility score is not computed or displayed end-to-end

---

## Tech Plan — Incomplete Items

### Backend API Routes (Critical Blocker)

The server only exposes `/api/auth`. Three endpoint groups are missing:

**Trips API** (`server/src/routes/trips.ts`, `server/src/controllers/tripController.ts`)
- `GET /api/trips` — list with filters and pagination
- `GET /api/trips/:id` — single trip detail
- `POST /api/trips` — create trip (auth required)
- `POST /api/trips/:id/interest` — express interest (auth required)
- `GET /api/trips/:id/interests` — list interested users (auth required)

**Messages API** (`server/src/routes/messages.ts`, `server/src/controllers/messageController.ts`)
- `GET /api/messages` — fetch messages by `?userId=` or `?tripId=` (auth required)
- `POST /api/messages` — send a message (auth required)

**Users API** (`server/src/routes/users.ts`, `server/src/controllers/userController.ts`)
- `GET /api/users/:id` — public user profile

### Environment & Database Setup

- `server/.env` not created (needs `DATABASE_URL` and `JWT_SECRET`)
- Prisma client not generated (`npm run db:generate` not run)
- Database tables not created (`npm run db:migrate` not run)
- `server/prisma/seed.ts` referenced in `package.json` but file does not exist

### Data / Type Gaps

- `budget` field: required in Prisma `Trip` model but missing from `TripFormData` (frontend), `TripInput` (server types), and `TripForm.tsx` — trip creation will fail with a DB constraint error

### Frontend Feature Gaps

- Chat page has no conversation list — users cannot discover who to chat with from the UI
- No `GET /api/conversations` endpoint or equivalent to populate the sidebar

---

## Tests — Incomplete (148 of ~156 planned tests missing)

### Client Tests (116 missing)

| Area | Files Missing |
|------|--------------|
| Services / API | `api.test.ts`, `auth.test.ts`, `client.test.ts` |
| Components | `TripCard`, `FilterBar`, `MatchScore`, `ChatBubble`, `AvailabilityCalendar`, `ProfileForm`, `TripForm` |
| Context & Pages | `AuthContext`, `Dashboard`, `Login`, `Signup`, `Profile`, `PostTrip`, `TripDetail` |

Missing test dependencies: `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`, `msw`

### Server Tests (32 missing)

`server/vitest.config.ts` does not exist. No test files written.

| File | Tests |
|------|-------|
| `utils/helpers.test.ts` | 6 |
| `middleware/auth.test.ts` | 5 |
| `middleware/errorHandler.test.ts` | 3 |
| `controllers/authController.test.ts` | 10 |
| `routes/auth.test.ts` | 8 |

Missing test dependencies: `vitest`, `supertest`, `@types/supertest`, `sinon`, `better-sqlite3`

---

## Recommended Order

1. Fix `budget` field gap (unblocks trip creation)
2. Build Trips API (core feature, unblocks most frontend)
3. Build Messages API (unblocks Chat page)
4. Build Users API (unblocks public profile)
5. Set up `server/.env`, run `db:generate` + `db:migrate`
6. Write `server/prisma/seed.ts`
7. Add Chat conversation list (frontend)
8. Add `/profile/:userId` route + `PublicProfile.tsx`
9. Integrate `AvailabilityCalendar` into `ProfileForm`
10. Add `budget` display to `TripCard` and `TripDetail`
11. Install client + server test dependencies
12. Write server tests (utils → middleware → controllers → routes)
13. Write client tests (services → components → context/pages)
14. Add profile picture upload
15. Add featured trips to Landing page
