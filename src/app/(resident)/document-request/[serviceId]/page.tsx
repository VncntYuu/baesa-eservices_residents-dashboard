import { notFound, redirect } from "next/navigation";
import { SERVICES, getService } from "@/lib/config/services";

// Kept for old links: the request forms now open as a modal on the Services page.
export const instant = false;

export function generateStaticParams() {
  return SERVICES.map((s) => ({ serviceId: s.id }));
}

export default async function ServiceRequestRedirect({ params }: PageProps<"/document-request/[serviceId]">) {
  const { serviceId } = await params;
  if (!getService(serviceId)) notFound();
  redirect(`/document-request?service=${serviceId}`);
}
