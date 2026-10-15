import type { Metadata } from "next";
import { Suspense } from "react";
import { DocumentRequestView } from "./DocumentRequestView";

export const metadata: Metadata = { title: "Document Request" };
// Rendered inside the client-data resident shell — see (resident)/layout.tsx.
export const instant = false;

export default function DocumentRequestPage() {
  return (
    <Suspense>
      <DocumentRequestView />
    </Suspense>
  );
}
