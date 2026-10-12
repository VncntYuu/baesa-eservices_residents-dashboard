import type { Metadata } from "next";
import { AnnouncementsView } from "./AnnouncementsView";

export const metadata: Metadata = { title: "Announcements" };
// Rendered from browser-only demo data — see (resident)/layout.tsx.
export const instant = false;

export default function AnnouncementsPage() {
  return <AnnouncementsView />;
}
