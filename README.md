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
| `/document-request` | Services; each certificate opens its request form in a modal (`?service=<id>`) |
| `/document-request/[serviceId]` | Old links; redirects to `?service=<id>` |
| `/my-requests` | Table on desktop, cards on mobile; `?status=` filter and `?ref=` details deep links |
| `/community-reports` | My Reports table / Community Map tabs (`?tab=mine\|map`) |
| `/community-reports/new` | Complaint or Report form with category, photo and map pin |
| `/appointments` | Book an Appointment form + upcoming / previous lists, reschedule, cancel |
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

## Design references

The UI follows the 17 screenshots in "UI/UX for Barangay Baesa" (Dashboard, Services, the four certificate
forms, My Requests, My Reports, Community Map, File a Complaint / Report, Book an Appointment, Announcements,
Notifications). Colours are sampled from them into the tokens in `src/app/globals.css`.

## Payments, camera and other simulated parts

- **Payments**: residents choose GCash, Maya, PayPal or face-to-face. Nothing is charged. Online choices are
  saved as "Awaiting online payment"; face-to-face as "Pay at barangay hall". The portal never marks a payment
  as paid. Real payments need a provider integration (e.g. a PH payment gateway) with server-side verification.
- **Identity verification**: the camera is only requested when the resident taps the capture area; there is
  always a preview, retake and an upload fallback. Photos and ID files are not stored (only their details).
- **Report photos** are downscaled and kept in browser storage for the demo.

## Things the barangay still needs to confirm (kept configurable)

| What | Where | Current state |
| --- | --- | --- |
| Document fees | `lib/config/services.ts` → `fee` | Sample amounts from the mockups (₱100 / ₱50 / ₱75), labelled as samples |
| First-Time Job Seeker fee | `services.ts` | Set to Free (RA 11261 waiver); the mockup showed ₱100 |
| Required documents | `services.ts` → `requiredDocuments` | Lists from the mockups; Burial/Donation left empty |
| Form options (purposes, durations, education levels) | `services.ts` | Purposes from the requirements; durations and education levels are reasonable defaults |
| Pickup instruction | `services.ts` → `DEFAULT_PICKUP_INSTRUCTION` | Text from the design mockup |
| Appointment services, 30-min slots, days, change window | `lib/config/appointments.ts` | Placeholder values, note on the page says so |
| Complaint / report categories and colours | `lib/config/reports.ts` | From the File a Complaint / Report mockups |
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
