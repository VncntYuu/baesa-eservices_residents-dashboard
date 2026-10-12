import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ServiceConfig } from "@/lib/config/services";
import { ServiceIcon } from "./ServiceIcon";

export function ServiceCard({ service }: { service: ServiceConfig }) {
  return (
    <Link
      href={`/document-request/${service.id}`}
      className="group flex flex-col rounded-2xl border border-line bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 sm:p-8"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-14 place-items-center rounded-xl bg-brand-100 text-brand-500">
          <ServiceIcon icon={service.icon} className="size-7" />
        </span>
        <span
          className="rounded-full bg-brand-100 px-3.5 py-1.5 text-sm font-semibold text-brand-600"
          title={service.feeConfirmed ? "Fee" : "Fee from design mockup — awaiting confirmation"}
        >
          {service.feeLabel}
          {!service.feeConfirmed && <span className="sr-only"> (fee to be confirmed)</span>}
        </span>
      </div>
      <h3 className="mt-5 text-lg font-bold text-ink sm:text-xl">{service.name}</h3>
      <p className="mt-2 flex-1 text-[15px] text-muted">{service.shortDescription}</p>
      <span className="mt-5 inline-flex items-center gap-2 font-semibold text-brand-500">
        Request
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
      </span>
    </Link>
  );
}
