# Barangay Baesa E-Services — Residents Portal (frontend)

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Lucide icons · Leaflet + OpenStreetMap.

> **Frontend demonstration.** There is no backend yet. Data lives in the browser
> (localStorage), sign-in is a demo flag, and every "submit" is simulated. The
> header shows a **Demo mode** badge and each simulated action says so.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000  → redirects to /dashboard → /login (demo)
npm run lint
npx tsc --noEmit
npm run build && npm start
```

Use **Reset demo data** in the profile menu (top right) to restore the sample data.

## Routes

| Route | Page |
| --- | --- |
| `/login` | Demo sign-in (no real authentication) |
| `/dashboard` | Welcome, request summary, quick access, recent announcements |
| `/document-request` | Service catalogue (certificates + assistance) |
| `/document-request/[serviceId]` | Request form → review → reference number |
| `/my-requests` | Request tracking; `?status=` filter and `?ref=` details deep links |
| `/community-reports` | My Reports / Community Map tabs (`?tab=mine\|map`) |
| `/community-reports/new` | Report form with map pin, search, photo, review |
| `/appointments` | Upcoming / previous, request, reschedule, cancel |
| `/announcements`, `/announcements/[id]` | List with filters, detail view |
| `/notifications` | Notification centre, read/unread, mark all as read |

## Structure

```
src/
  app/
    (resident)/            # shared resident layout (sidebar + header) and pages
    login/
  components/
    layout/                # ResidentShell, ResidentSidebar, ResidentHeader, NotificationBell
    ui/                    # Button, Card, PageHeader, StatusBadge, Dialog/ConfirmDialog, FormControls, Toast
    dashboard/             # RequestSummaryCard, QuickAccessCard
    announcements/         # AnnouncementCard
    notifications/         # NotificationItem
    requests/              # ServiceCard, RequestCard, RequestDetailsDialog
    reports/               # LocationPicker, ReportsMap (Leaflet, client-only)
    appointments/          # AppointmentCard, AppointmentFormDialog
  lib/
    types.ts               # shared domain types
    config/                # services, appointment rules, report categories/map, navigation
    mock-data.ts           # SAMPLE data (not official)
    store/portal-store.ts  # single shared store + actions (each marked with its future API call)
    store/demo-session.ts  # demo sign-in flag
    services/geocoding.ts  # Nominatim search / reverse lookup
```

## Things the barangay still needs to confirm (kept configurable)

| What | Where | Current state |
| --- | --- | --- |
| Document fees | `lib/config/services.ts` → `feeLabel`, `feeConfirmed` | Copied from the design mockups, shown as "to be confirmed" |
| Documentary requirements | `services.ts` → `requirements` | Empty; UI says requirements aren't configured yet |
| Processing time / rules | `services.ts` → `processingNote` | `null` |
| Pickup instruction | `services.ts` → `DEFAULT_PICKUP_INSTRUCTION` | Text from the design mockup |
| Appointment purposes, slots, days, change window | `lib/config/appointments.ts` | Placeholder values, banner on the page says so |
| Announcements | `lib/mock-data.ts` | Sample content |

## Map

Uses **OpenStreetMap tiles** and **Nominatim** geocoding — no API key, so nothing secret ships to the
browser. Both are free community services with usage policies (attribution, light use, ≤1 request/second).
The app only geocodes on explicit actions (search, pin drop) and caches lookups. For production traffic,
point `MAP_CONFIG` (`lib/config/reports.ts`) at a self-hosted or paid provider; if that provider needs a
key, call it through a Next.js route handler so the key stays on the server.

Pins can be placed by tapping the map, dragging, searching, or "Use my location" (browser geolocation).
Nearby reports (same category, 50 m, 24 h) are **only highlighted** — never merged automatically.

## Connecting a backend

1. Replace the bodies of the actions in `lib/store/portal-store.ts` with API calls (each has an `// API:` comment)
   and load the initial data from the server instead of `createSeedData()`.
2. Replace `demo-session.ts` with real authentication and protect the `(resident)` routes on the server.
3. Upload attachments/photos to storage (the demo keeps only file names).
4. Push real status updates and notifications (e.g. polling, SSE or WebSockets) — none are connected now.
5. Once pages read server data, remove `export const instant = false` from the resident pages
   (it opts browser-only pages out of Cache Components' instant-navigation validation).

## Assets

- `public/baesa-logo.png` was cropped from the design screenshot — replace it with the original seal file.
- Plus Jakarta Sans (SIL Open Font License) is self-hosted in `src/app/fonts/`.
