import type { Metadata } from "next";
import { Suspense } from "react";
import { CommunityReportsView } from "./CommunityReportsView";

export const metadata: Metadata = { title: "Community Reports" };
// Rendered from browser-only demo data — see (resident)/layout.tsx.
export const instant = false;

export default function CommunityReportsPage() {
  return (
    <Suspense>
      <CommunityReportsView />
    </Suspense>
  );
}
