import type { Metadata } from "next";
import { NewReportView } from "./NewReportView";

export const metadata: Metadata = { title: "File a Report" };
// Rendered from browser-only demo data — see (resident)/layout.tsx.
export const instant = false;

export default function NewReportPage() {
  return <NewReportView />;
}
