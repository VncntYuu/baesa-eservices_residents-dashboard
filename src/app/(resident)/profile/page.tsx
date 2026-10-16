import type { Metadata } from "next";
import { ProfileView } from "./ProfileView";

export const metadata: Metadata = { title: "My Profile" };
// Rendered from browser-only demo data — see (resident)/layout.tsx.
export const instant = false;

export default function ProfilePage() {
  return <ProfileView />;
}
