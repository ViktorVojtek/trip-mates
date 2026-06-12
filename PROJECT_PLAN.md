# TripMates — PROJECT_PLAN.md

## Overview
TripMates is a web application that helps friends plan trips together by centralizing itineraries, budgets, and shared tasks in one collaborative space.

## Problem Being Solved
When traveling with a group, coordination happens across multiple apps (WhatsApp, Google Docs, Excel sheets), leading to lost information, duplicated efforts, and decision fatigue.

## Target Users
- Groups of 2–8 friends planning a trip
- Family vacation organizers
- Travel enthusiasts who share itineraries

## Core Features
1. **Trip Creation** — Users can create a trip with dates, destination, and guest list
2. **Shared Itinerary** — A collaborative timeline view of daily plans
3. **Budget Tracker** — Split expenses and track per-person spending
4. **Task Assignment** — Assign chores (e.g., "book flights") to specific members
5. **Chat Thread** — In-app messaging tied to the trip
6. **Media Sharing** — Upload and share photos/links within the trip
7. **Guest Invitations** — Invite others via email with a join link

## Non-Goals
- Flight or hotel booking (integration only)
- Real-time GPS tracking
- Payment processing (expenses tracked only)

## Success Metrics
- 500 trips created in first 3 months
- Average 3+ guests per trip
- 80% of users return to an active trip within 7 days

## Recommended Execution Order

### Phase 1 — Foundation
1. **Scaffold project** — Initialize repo, set up build tooling, linting, and formatting
2. **Database schema** — Define models for `users`, `trips`, `trip_members`, `itinerary_items`, `expenses`, `tasks`, `messages`
3. **API skeleton** — Set up Express/FastAPI router structure with OpenAPI/Swagger docs

### Phase 2 — Core Backend
4. **Authentication** — Email/password + magic link auth, JWT sessions
5. **Trip CRUD API** — Endpoints for creating trips, listing user's trips, joining via invite link
6. **Itinerary API** — CRUD for itinerary items with drag-sort order
7. **Expense API** — Create, split, and settle expenses with per-person balances

### Phase 3 — Frontend
8. **UI Framework** — Set up React/Next.js with Tailwind CSS and a component library (e.g., shadcn/ui)
9. **Dashboard** — User's active and upcoming trips at a glance
10. **Trip Detail Page** — Itinerary view, expense summary, task list in tabs/panels
11. **Invite Flow** — Email invite UI + public join page with auth guard

### Phase 4 — Polish
12. **Real-time Chat** — WebSocket or Server-Sent Events for in-app messaging
13. **Media Upload** — Cloud storage integration (e.g., S3 or Cloudinary) for trip photos
14. **Notifications** — Email digest when tasks/expenses are updated
15. **Testing & CI** — Unit tests for API, E2E tests for critical flows, GitHub Actions pipeline
