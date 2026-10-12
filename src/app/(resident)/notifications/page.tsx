import type { Metadata } from "next";
import { NotificationsView } from "./NotificationsView";

export const metadata: Metadata = { title: "Notifications" };
// Rendered from browser-only demo data — see (resident)/layout.tsx.
export const instant = false;

export default function NotificationsPage() {
  return <NotificationsView />;
}
