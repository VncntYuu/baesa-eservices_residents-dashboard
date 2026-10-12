import type { Metadata } from "next";
import { DashboardView } from "./DashboardView";

export const metadata: Metadata = { title: "Dashboard" };
// Rendered from browser-only demo data — see (resident)/layout.tsx.
export const instant = false;

export default function DashboardPage() {
  return <DashboardView />;
}
