# Trip Mates — Project Context

## Stack

- **Server**: Node.js + Express + TypeScript + Prisma ORM (`/server`)
- **Client**: React 18 + Vite 5 + TypeScript + Tailwind CSS 3.4 (`/client`)
- **Forms**: react-hook-form v7 + Zod — custom resolver at `client/src/utils/zodResolver.ts` (no `@hookform/resolvers` package)
- **Auth**: JWT stored in localStorage; `AuthContext` via useReducer (`client/src/context/AuthContext.tsx`)
- **HTTP**: Axios with JWT + 401 interceptor (`client/src/api/client.ts`)
- **Tests**: Vitest + jsdom + @testing-library/react (client); Vitest (server, not yet installed)

## Critical invariants — never break these

- `postcss.config.js` not `.ts` — PostCSS does not support TypeScript config files
- Server imports use `.js` extension even for `.ts` source files (NodeNext module resolution requires this)
- No `@hookform/resolvers` package — always use `client/src/utils/zodResolver.ts`
- Prisma returns `Decimal` for the `budget` field — serialize with `Number(trip.budget)` before any JSON response

## Task tracking

- `REMAINING_WORK.md` is the task list — read it first to understand what to do next
- **Verify actual file state before trusting it** — it may be stale; files listed as missing may already exist
- Mark tasks `[x]` as you complete them and update the doc before moving to the next task
- Mark tasks `BLOCKED: <reason>` if they require user credentials or an external decision, then skip to next

## Key locations

| What | Where |
|------|-------|
| Task list | `REMAINING_WORK.md` |
| Server entry | `server/src/index.ts` |
| Prisma schema | `server/prisma/schema.prisma` |
| Client types | `client/src/types/index.ts` |
| Client services | `client/src/services/` |
| Client test config | `client/vitest.config.ts` |
| Client test setup | `client/src/setupTests.ts` |
