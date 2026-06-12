# Trip Mates — Test Plan

## Overview

This plan outlines the testing strategy for the Trip Mates project, covering both the client (React + Vite + TypeScript) and server (Node.js + Express + TypeScript) codebases. The goal is to achieve **60–70% code coverage** across critical paths, prioritizing **business logic, utilities, and API contracts** over UI rendering.

---

## Tech Stack & Testing Tools

### Client (Frontend)
| Tool | Purpose |
|------|---------|
| **Vitest** | Fast unit & component testing framework |
| **@testing-library/react** (v16+) | Component rendering & interaction queries |
| **@testing-library/jest-dom** | Extended DOM assertion matchers |
| **msw** (Mock Service Worker) | API mocking at the network layer (or `vi.mock` for lighter approach) |
| **axios-mock-adapter** | Lightweight Axios interceptor mocking (alternative to MSW) |

### Server (Backend)
| Tool | Purpose |
|------|---------|
| **Vitest** | Same runner as client for consistency |
| **supertest** | HTTP integration testing for Express routes |
| **sinon** | Stub/spy on Prisma client, JWT, bcrypt |
| **@prisma/client** | Use in-memory SQLite for tests (or real DB fixture) |

---

## Project Structure (Test Files)

```
trip-mates/
├── client/
│   ├── vitest.config.ts           # Vitest + jsdom environment
│   ├── client.setup.ts            # Global test setup (jest-dom, etc.)
│   └── src/
│       ├── utils/
│       │   ├── helpers.test.ts    # Unit tests for formatDate, formatCurrency, etc.
│       │   └── zodResolver.test.ts # Unit tests for createZodResolver
│       ├── services/
│       │   ├── api.test.ts        # Tests for api.ts service layer
│       │   └── auth.test.ts       # Tests for auth service layer
│       ├── api/
│       │   └── client.test.ts     # Tests for axios interceptor (auth token, 401 handling)
│       ├── components/
│       │   ├── TripCard.test.tsx
│       │   ├── FilterBar.test.tsx
│       │   ├── MatchScore.test.tsx
│       │   ├── ChatBubble.test.tsx
│       │   ├── AvailabilityCalendar.test.tsx
│       │   ├── ProfileForm.test.tsx
│       │   └── TripForm.test.tsx
│       ├── context/
│       │   └── AuthContext.test.tsx
│       └── pages/
│           ├── Dashboard.test.tsx
│           ├── Login.test.tsx
│           ├── Signup.test.tsx
│           ├── Profile.test.tsx
│           ├── PostTrip.test.tsx
│           └── TripDetail.test.tsx
├── server/
│   ├── vitest.config.ts           # Vitest + node environment
│   ├── server.setup.ts            # Global test setup
│   └── src/
│       ├── utils/
│       │   └── helpers.test.ts    # Unit tests for paginate
│       ├── middleware/
│       │   ├── auth.test.ts       # Tests for JWT auth middleware
│       │   └── errorHandler.test.ts # Tests for error handler
│       ├── controllers/
│       │   └── authController.test.ts # Tests for register, login, getProfile, updateProfile
│       └── routes/
│           └── auth.test.ts       # Integration tests for auth routes with supertest
```

---

## Layer 1 — Client Utility Tests (Pure Functions, Highest ROI)

### `client/src/utils/helpers.test.ts`

| Test | What It Verifies |
|------|-----------------|
| `formatDate('2025-06-15')` | Returns `"June 15, 2025"` |
| `formatDate(new Date(2025, 0, 1))` | Returns `"January 1, 2025"` |
| `formatCurrency(1234.50)` | Returns `"$1,234.50"` |
| `formatCurrency(0, 'EUR')` | Returns `"€0.00"` |
| `calculateMatchScore('hiking,beaches', 'hiking,museums')` | Returns `33` (1 overlap / 3 union) |
| `calculateMatchScore('hiking', 'hiking')` | Returns `100` |
| `calculateMatchScore('hiking', 'beaches')` | Returns `0` |
| `calculateMatchScore(null, 'hiking')` | Returns `0` |
| `calculateMatchScore('travel', '')` | Returns `0` |
| `truncateText('hello world', 5)` | Returns `"hello..."` |
| `truncateText('hi', 5)` | Returns `"hi"` |
| `getInitials('John Doe')` | Returns `"JD"` |
| `getInitials('Marie Curie')` | Returns `"MC"` |
| `groupTypeLabel('family')` | Returns `"Families"` |
| `groupTypeLabel('invalid')` | Returns `"invalid"` |
| `groupTypeLabel('couples')` | Returns `"Couples"` |

**Estimated test count: ~15**

### `client/src/utils/zodResolver.test.ts`

| Test | What It Verifies |
|------|-----------------|
| Valid data passes through with `values` | Schema validation success path |
| Invalid data returns structured errors | Schema validation failure path |
| Multiple validation errors are collected | All error paths captured |
| Empty string required field produces error | Required field enforcement |

**Estimated test count: ~4**

---

## Layer 2 — Client Service Tests (API Layer)

### `client/src/services/api.test.ts`

| Test | What It Verifies |
|------|-----------------|
| `getTrips()` calls GET `/trips` with correct params | Query params serialization |
| `getTrips(filters)` with destination filter | Param passthrough |
| `getTripDetail('123')` calls GET `/trips/123` | Dynamic route construction |
| `postTrip(data)` calls POST `/trips` with body | Request body serialization |
| `expressInterest('123')` calls POST `/trips/123/interest` | Interest endpoint |
| `getMessages({ tripId: '123' })` includes query params | Message params passthrough |
| `sendMessage(data)` calls POST `/messages` with body | Send message endpoint |
| All methods return `response.data` | Axios response unwrapping |

**Estimated test count: ~8**

### `client/src/services/auth.test.ts`

| Test | What It Verifies |
|------|-----------------|
| `register()` calls POST `/auth/register` | Registration API call |
| `login()` calls POST `/auth/login` | Login API call |
| `getProfile()` calls GET `/auth/profile` | Profile fetch API call |
| `updateProfile(data)` calls PUT `/auth/profile` | Profile update API call |
| `setAuth()` stores token in localStorage | Token persistence |
| `clearAuth()` removes token from localStorage | Token removal |
| `getToken()` returns stored token | Token retrieval |
| `getToken()` returns `null` when not set | Empty state |

**Estimated test count: ~8**

### `client/src/api/client.test.ts`

| Test | What It Verifies |
|------|-----------------|
| Request interceptor attaches token to `Authorization` header | Auth token injection |
| Request interceptor omits header when no token | No-token scenario |
| Response interceptor on 401 clears localStorage and redirects | 401 handling |
| Response interceptor passes through non-401 errors | Error passthrough |

**Estimated test count: ~4**

---

## Layer 3 — Client Component Tests (React Components)

### `client/src/components/TripCard.test.tsx`

| Test | What It Verifies |
|------|-----------------|
| Renders trip title | Content rendering |
| Renders destination | Content rendering |
| Renders formatted dates | formatDate integration |
| Renders group type label | groupTypeLabel integration |
| Renders activity preference tags (if present) | Conditional rendering |
| Renders truncated description (if too long) | truncateText integration |
| Shows full duration in days | Duration calculation |
| Link navigates to `/trips/:id` | Router link behavior |
| Does not render activity tags if `activityPref` is null | Conditional rendering |

**Estimated test count: ~9**

### `client/src/components/FilterBar.test.tsx`

| Test | What It Verifies |
|------|-----------------|
| Renders destination input | Form elements |
| Renders group type select | Form elements |
| Renders start date input | Form elements |
| On destination input change, calls `onFilter` with destination | Debounced filter update |
| On group type change, calls `onFilter` with groupType | Filter propagation |
| After debounce timeout, `onFilter` receives updated filters | Debounce timing |
| Clear button appears when filters are set | Conditional UI |
| Clear button resets filters and calls `onFilter({})` | Reset behavior |
| Clear button does NOT appear when no filters | Conditional UI |

**Estimated test count: ~9**

### `client/src/components/MatchScore.test.tsx`

| Test | What It Verifies |
|------|-----------------|
| Returns `null` if `userPrefs` is null | Early return |
| Returns `null` if `tripPrefs` is null | Early return |
| Renders "Great match" (70%+) with green styling | High score rendering |
| Renders "Partial match" (40-69%) with yellow styling | Medium score rendering |
| Renders "Low match" (<40%) with red styling | Low score rendering |
| Progress bar width matches score percentage | Bar width calculation |
| Score percentage shown in label | Label content |

**Estimated test count: ~6**

### `client/src/components/ChatBubble.test.tsx`

| Test | What It Verifies |
|------|-----------------|
| Renders message content | Content rendering |
| Renders formatted time | Time formatting |
| Right-aligned (blue bg) when `isMine=true` | Styling by ownership |
| Left-aligned (gray bg) when `isMine=false` | Styling by ownership |

**Estimated test count: ~4**

### `client/src/components/AvailabilityCalendar.test.tsx`

| Test | What It Verifies |
|------|-----------------|
| Renders current month name | Month display |
| Renders day headers (Su–Sa) | Header row |
| Renders correct number of cells for the month | Calendar grid |
| Clicking a day toggles selection | Toggle behavior |
| Selected days have blue background | Visual feedback |
| Calls `onChange` with sorted date array on toggle | Callback behavior |
| Preserves pre-selected dates from `value` prop | Initial state |
| Prev/Next buttons change displayed month | Navigation |
| Disabled in readOnly mode (no toggle, cursor-default) | ReadOnly mode |
| Shows selected count when days selected | Info display |

**Estimated test count: ~10**

### `client/src/components/ProfileForm.test.tsx`

| Test | What It Verifies |
|------|-----------------|
| Pre-fills form with user data | Default values |
| Submitting valid data calls `updateProfile` | Form submission |
| Calls `onSave()` after successful update | Callback chain |
| Shows validation error for empty name | Required field |
| Shows validation error for familySize < 1 | Min validation |
| Shows validation error for familySize > 20 | Max validation |
| Disabled submit button during submission | Loading state |
| Optional fields (bio, childrenAges, etc.) accept empty | Optional fields |

**Estimated test count: ~8**

### `client/src/components/TripForm.test.tsx`

| Test | What It Verifies |
|------|-----------------|
| Renders all form fields | Complete form |
| Submitting valid data calls `onSubmit` | Form submission |
| Shows error for title < 3 chars | Title validation |
| Shows error for description < 20 chars | Description validation |
| Shows error if endDate < startDate | Cross-field validation |
| Does NOT show error if endDate === startDate | Edge case: same day |
| Pre-fills with `defaultValues` | Default values |
| Disabled submit during submission | Loading state |

**Estimated test count: ~8**

---

## Layer 4 — Client Context & Page Tests

### `client/src/context/AuthContext.test.tsx`

| Test | What It Verifies |
|------|-----------------|
| `AuthProvider` initializes loading state | Initial state |
| `login()` stores token and sets user | Login flow |
| `register()` stores token and sets user | Registration flow |
| `logout()` clears token and clears user | Logout flow |
| `useAuth()` throws when used outside provider | Error boundary |
| Auto-refreshes profile on mount with valid token | Initial auth recovery |
| Clears auth if profile fetch fails on mount | Invalid token recovery |

**Estimated test count: ~6**

### Page Tests (Dashboard, Login, Signup, Profile, PostTrip, TripDetail)

These test **rendering + user interactions** with mocked services.

| Page | Key Tests | Est. Count |
|------|-----------|------------|
| **Dashboard** | Renders loading/error/empty states; pagination buttons; FilterBar integration | 6 |
| **Login** | Renders email/password; shows errors; calls `useAuth().login` | 4 |
| **Signup** | Renders form; validates; calls `useAuth().register` | 5 |
| **Profile** | Renders user data; edit mode with ProfileForm | 4 |
| **PostTrip** | Renders TripForm; submits; navigates on success | 4 |
| **TripDetail** | Renders trip info; match score; interest button | 3 |

**Estimated total page tests: ~26**

---

## Layer 5 — Server Unit Tests (Pure Logic & Middleware)

### `server/src/utils/helpers.test.ts`

| Test | What It Verifies |
|------|-----------------|
| `paginate([], 1, 10)` returns empty results with `totalPages: 0` | Empty data |
| `paginate(items, 1, 10)` returns first 10 items | Page 1 |
| `paginate(items, 2, 10)` returns items 11–20 | Page 2 |
| `totalPages` is `ceil(totalItems / pageSize)` | Page count math |
| `hasNextPage` correct at boundaries | Pagination metadata |
| `hasPreviousPage` correct at boundaries | Pagination metadata |

**Estimated test count: ~6**

### `server/src/middleware/auth.test.ts`

| Test | What It Verifies |
|------|-----------------|
| Missing Authorization header → 401 | No header |
| No "Bearer" prefix → 401 | Malformed header |
| Invalid JWT → 401 | Bad token |
| Valid JWT → sets `req.userId`, calls `next()` | Valid token |
| Expired JWT → 401 | Token expiry |

**Estimated test count: ~5**

### `server/src/middleware/errorHandler.test.ts`

| Test | What It Verifies |
|------|-----------------|
| Returns error `message` with `status` | Standard error |
| Defaults to 500 if no status set | Default status |
| Does not leak stack traces (no `err.stack` in response) | Security |

**Estimated test count: ~3**

---

## Layer 6 — Server Integration Tests (Full Route Endpoints)

### `server/src/controllers/authController.test.ts`

| Test | What It Verifies |
|------|-----------------|
| `register`: creates user, returns 201 with user+token | Happy path |
| `register`: returns 400 if email already exists | Duplicate email |
| `register`: password is hashed with bcrypt | Password security |
| `login`: returns user+token with valid credentials | Happy path |
| `login`: returns 401 with invalid email | Unknown user |
| `login`: returns 401 with wrong password | Wrong password |
| `getProfile`: returns user data with auth header | Authenticated fetch |
| `getProfile`: returns 404 if user not found | Not found |
| `updateProfile`: updates and returns user data | Update success |
| `updateProfile`: only updates provided fields | Partial update |

**Estimated test count: ~10**

### `server/src/routes/auth.test.ts`

| Test | What It Verifies |
|------|-----------------|
| `POST /api/auth/register` with valid body → 201 | Registration route |
| `POST /api/auth/register` with duplicate email → 400 | Duplicate on route |
| `POST /api/auth/login` with valid creds → 200 | Login route |
| `POST /api/auth/login` with invalid creds → 401 | Login failure |
| `GET /api/auth/profile` with valid token → 200 | Authenticated profile |
| `GET /api/auth/profile` without token → 401 | Unauthenticated |
| `PUT /api/auth/profile` with token → 200 | Authenticated update |
| `PUT /api/auth/profile` without token → 401 | Unauthenticated update |

**Estimated test count: ~8**

---

## Estimated Totals

| Layer | File | Est. Tests |
|-------|------|------------|
| Client Utils | `helpers.test.ts` | 15 |
| Client Utils | `zodResolver.test.ts` | 4 |
| Client Services | `api.test.ts` | 8 |
| Client Services | `auth.test.ts` | 8 |
| Client API | `client.test.ts` | 4 |
| Client Components | 7 component tests | 53 |
| Client Context | `AuthContext.test.tsx` | 6 |
| Client Pages | 6 page tests | 26 |
| **Client Total** | | **124** |
| Server Utils | `helpers.test.ts` | 6 |
| Server Middleware | `auth.test.ts` | 5 |
| Server Middleware | `errorHandler.test.ts` | 3 |
| Server Controllers | `authController.test.ts` | 10 |
| Server Routes | `auth.test.ts` | 8 |
| **Server Total** | | **32** |
| **Grand Total** | | **~156 tests** |

---

## Priority Order (Implementation Sequence)

1. **Priority 1 — Client Utilities** (helpers, zodResolver) — pure functions, instant feedback, high coverage ROI
2. **Priority 2 — Server Utils & Middleware** (paginate, auth, errorHandler) — pure logic, no DB needed
3. **Priority 3 — Client Service Tests** (api, auth, client) — with `vi.mock` for axios
4. **Priority 4 — Server Controller Tests** (authController) — with mocked Prisma
5. **Priority 5 — Client Component Tests** (TripCard, MatchScore, ChatBubble → FilterBar → AvailabilityCalendar → ProfileForm → TripForm) — with mocked dependencies
6. **Priority 6 — Server Route Integration** (auth routes with supertest + real Prisma/SQLite)
7. **Priority 7 — Client Context & Pages** — with mocked AuthProvider and services

---

## Configuration Snippets

### `client/vitest.config.ts`
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
    },
  },
});
```

### `server/vitest.config.ts`
```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: './src/setupTests.ts',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts}'],
    },
  },
});
```

### Client `package.json` devDependencies addition
```json
{
  "devDependencies": {
    "vitest": "^1.6.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.4.0",
    "@testing-library/user-event": "^14.5.2",
    "jsdom": "^24.0.0",
    "msw": "^2.3.0"
  }
}
```

### Server `package.json` devDependencies addition
```json
{
  "devDependencies": {
    "vitest": "^1.6.0",
    "supertest": "^7.0.0",
    "sinon": "^18.0.0",
    "better-sqlite3": "^9.4.3"
  }
}
```

---

## Running Tests

```bash
# Install test dependencies
cd client && npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom msw
cd ../server && npm install --save-dev vitest supertest sinon better-sqlite3

# Run all tests
npm run test          # from project root (if monorepo)
# or:
cd client && npx vitest
cd server && npx vitest

# Run with coverage
cd client && npx vitest --coverage
cd server && npx vitest --coverage

# Run single test file
npx vitest src/utils/helpers.test.ts
npx vitest src/components/TripCard.test.tsx
```
