"use client";

import { Dialog } from "@/components/ui/Dialog";
import { StatusBadge, statusTone, toneClasses } from "@/components/ui/StatusBadge";
import { getService } from "@/lib/config/services";
import type { DocumentRequest } from "@/lib/types";
import { cn, formatDate, formatDateTime } from "@/lib/utils";

export function RequestDetailsDialog({ request, onClose }: { request: DocumentRequest | null; onClose: () => void }) {
  const service = request ? getService(request.serviceId) : undefined;

  return (
    <Dialog
      open={!!request}
      onClose={onClose}
      title={request?.serviceName ?? ""}
      description={request ? `Reference #: ${request.referenceNo}` : undefined}
      size="lg"
    >
      {request && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={request.status} />
            <span className="text-sm text-muted">Submitted {formatDateTime(request.submittedAt)}</span>
          </div>

          <section>
            <h3 className="mb-3 font-bold text-brand-900">Request details</h3>
            <dl className="grid gap-3 sm:grid-cols-2">
              {(service?.fields ?? []).map((f) => (
                <div key={f.id} className="rounded-lg bg-page px-3 py-2">
                  <dt className="text-xs font-semibold text-muted">{f.type === "checkbox" ? "Confirmation" : f.label}</dt>
                  <dd className="text-sm font-medium break-words text-ink">
                    {f.type === "date" && request.details[f.id]
                      ? formatDate(`${request.details[f.id]}T00:00:00+08:00`)
                      : request.details[f.id] || "—"}
                  </dd>
                </div>
              ))}
              <div className="rounded-lg bg-page px-3 py-2">
                <dt className="text-xs font-semibold text-muted">Fee</dt>
                <dd className="text-sm font-medium text-ink">{request.feeLabel}</dd>
              </div>
              <div className="rounded-lg bg-page px-3 py-2">
                <dt className="text-xs font-semibold text-muted">Attachments</dt>
                <dd className="text-sm font-medium break-words text-ink">
                  {request.attachments.length ? request.attachments.join(", ") : "None"}
                </dd>
              </div>
            </dl>
          </section>

          <section>
            <h3 className="mb-3 font-bold text-brand-900">Status history</h3>
            <ol className="relative space-y-5 border-l-2 border-line pl-6">
              {[...request.history].reverse().map((h, i) => (
                <li key={i} className="relative">
                  <span
                    className={cn(
                      "absolute top-1 -left-[31px] size-4 rounded-full ring-4 ring-white",
                      toneClasses[statusTone(h.status)].bar,
                    )}
                    aria-hidden
                  />
                  <p className="text-sm font-semibold text-ink">{h.status}</p>
                  <p className="text-sm text-muted">{h.note}</p>
                  <p className="mt-0.5 text-xs text-muted">{formatDateTime(h.date)}</p>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-xs text-muted">
              Status updates are simulated in this demo. Real-time updates will come from the barangay system once connected.
            </p>
          </section>
        </div>
      )}
    </Dialog>
  );
}
