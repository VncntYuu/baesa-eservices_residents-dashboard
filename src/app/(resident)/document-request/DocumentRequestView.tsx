"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RequestFormModal } from "@/components/requests/RequestFormModal";
import { ServiceCard } from "@/components/requests/ServiceCard";
import { SectionTitle } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { CERTIFICATE_SERVICES, getService } from "@/lib/config/services";
import type { ServiceId } from "@/lib/types";

export function DocumentRequestView() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  // The open form lives in the URL (?service=…) so it can be linked to and survives a reload.
  const open = getService(params.get("service"))?.id ?? null;
  const openService = (id: ServiceId | null) =>
    router.replace(id ? `${pathname}?service=${id}` : pathname, { scroll: false });

  return (
    <>
      <PageHeader
        title="Services"
        description="Select a service to submit a request. Payment options are shown before you submit."
      />

      <section aria-labelledby="cert-title" className="mb-10">
        <SectionTitle id="cert-title" className="mb-5">
          Certificates
        </SectionTitle>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {CERTIFICATE_SERVICES.map((s) => (
            <ServiceCard
              key={s.id}
              title={s.name}
              description={s.shortDescription}
              feeLabel={s.fee.label}
              icon={s.icon}
              onSelect={() => openService(s.id)}
            />
          ))}
        </div>
      </section>

      <section aria-labelledby="others-title">
        <SectionTitle id="others-title" className="mb-5">
          Others
        </SectionTitle>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <ServiceCard
            title="Burial / Donation"
            description="Choose burial service or donation assistance"
            feeLabel="Variable"
            icon="file"
            onSelect={() => openService("burial-assistance")}
          />
        </div>
      </section>

      <RequestFormModal serviceId={open} onClose={() => openService(null)} onSwitchService={(id) => openService(id)} />
    </>
  );
}
