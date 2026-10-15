import { ArrowRight } from "lucide-react";
import type { ServiceConfig } from "@/lib/config/services";
import { ServiceIcon } from "./ServiceIcon";

/** Service tile from the Services reference: tinted icon, fee pill, title, description and a "Request →" link. */
export function ServiceCard({
  title,
  description,
  feeLabel,
  icon,
  onSelect,
}: {
  title: string;
  description: string;
  feeLabel: string;
  icon: ServiceConfig["icon"];
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Request ${title}, fee ${feeLabel}`}
      className="group flex flex-col rounded-2xl border border-line bg-white p-6 text-left transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 sm:p-7"
    >
      <span className="flex w-full items-start justify-between gap-3">
        <span className="grid size-[3.25rem] place-items-center rounded-xl bg-brand-100 text-brand-500">
          <ServiceIcon icon={icon} className="size-6" />
        </span>
        <span className="rounded-full bg-brand-100 px-3.5 py-1 text-sm font-semibold text-brand-600">{feeLabel}</span>
      </span>
      <span className="mt-6 text-lg font-bold text-ink sm:text-xl">{title}</span>
      <span className="mt-3 flex-1 text-base text-muted">{description}</span>
      <span className="mt-4 inline-flex items-center gap-2 text-base font-semibold text-brand-500">
        Request
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
      </span>
    </button>
  );
}
