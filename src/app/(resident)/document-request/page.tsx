import type { Metadata } from "next";
import { Info } from "lucide-react";
import { ServiceCard } from "@/components/requests/ServiceCard";
import { SectionTitle } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ASSISTANCE_SERVICES, CERTIFICATE_SERVICES } from "@/lib/config/services";

export const metadata: Metadata = { title: "Document Request" };
// Rendered inside the client-data resident shell — see (resident)/layout.tsx.
export const instant = false;

export default function DocumentRequestPage() {
  return (
    <>
      <PageHeader title="Services" description="Select a service to submit a request." />

      <div className="mb-8 flex gap-3 rounded-xl border-l-4 border-status-blue bg-status-blue-bg px-4 py-3 text-sm text-status-blue">
        <Info className="mt-0.5 size-5 shrink-0" aria-hidden />
        <p>
          Fees shown are from the portal design and are still awaiting confirmation from the barangay. Online payment is not
          available yet.
        </p>
      </div>

      <section aria-labelledby="cert-title" className="mb-10">
        <SectionTitle id="cert-title" className="mb-5">
          Certificates
        </SectionTitle>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {CERTIFICATE_SERVICES.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      </section>

      <section aria-labelledby="others-title">
        <SectionTitle id="others-title" className="mb-5">
          Others
        </SectionTitle>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {ASSISTANCE_SERVICES.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      </section>
    </>
  );
}
