# Changelog

All notable changes to this project are documented here.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added
- Public trip discovery: `GET /api/trips` and `GET /api/trips/:id` no longer require auth, so visitors can browse before signing up.
- Real-time chat over Socket.IO (JWT handshake, per-user rooms, live `message:new` delivery) replacing the previous polling.
- Avatar file upload (`POST /api/users/me/avatar`, image-only via multer, served from `/uploads`) alongside the existing URL field.
- Email notifications to the trip owner when someone expresses interest (nodemailer; no-op without SMTP config).
- Google sign-in (`POST /api/auth/google` via google-auth-library; `@react-oauth/google` button, shown only when a client id is configured).

### Changed
- `getTrips` honors a `createdById` query filter; `PublicProfile` no longer re-filters client-side.
- `AvailabilityCalendar` re-syncs when its `value` prop changes (e.g. async profile load).

### Fixed
- Cleared all test-file TypeScript errors; `tsc --noEmit` is clean in both packages.

### Maintenance
- Removed live-smoke verification artifacts from the dev database (1 user `smoke_…@example.com`, 1 "Smoke Trip", 1 self-message) created during Phase 6 verification on 2026-06-15.
