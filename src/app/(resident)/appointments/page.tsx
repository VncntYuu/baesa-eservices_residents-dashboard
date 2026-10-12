import type { Metadata } from "next";
import { AppointmentsView } from "./AppointmentsView";

export const metadata: Metadata = { title: "Appointments" };
// Rendered from browser-only demo data — see (resident)/layout.tsx.
export const instant = false;

export default function AppointmentsPage() {
  return <AppointmentsView />;
}
