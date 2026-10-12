import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SERVICES, getService } from "@/lib/config/services";
import { RequestFormView } from "./RequestFormView";

export const metadata: Metadata = { title: "Request a Service" };
// Rendered inside the client-data resident shell — see (resident)/layout.tsx.
export const instant = false;

export function generateStaticParams() {
  return SERVICES.map((s) => ({ serviceId: s.id }));
}

export default function ServiceRequestPage({ params }: PageProps<"/document-request/[serviceId]">) {
  // Params are awaited inside Suspense so Partial Prefetching can prerender a shell.
  return (
    <Suspense>
      <ServiceRequest params={params} />
    </Suspense>
  );
}

async function ServiceRequest({ params }: Pick<PageProps<"/document-request/[serviceId]">, "params">) {
  const { serviceId } = await params;
  const service = getService(serviceId);
  if (!service) notFound();
  return <RequestFormView serviceId={service.id} />;
}
