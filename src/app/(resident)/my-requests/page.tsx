import type { Metadata } from "next";
import { Suspense } from "react";
import { MyRequestsView } from "./MyRequestsView";

export const metadata: Metadata = { title: "My Requests" };
// Rendered from browser-only demo data — see (resident)/layout.tsx.
export const instant = false;

export default function MyRequestsPage() {
  return (
    <Suspense>
      <MyRequestsView />
    </Suspense>
  );
}
