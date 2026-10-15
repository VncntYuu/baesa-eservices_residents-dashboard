import { Info, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pill, REQUEST_TONE, RequestStatusBadge, toneClasses } from "@/components/ui/StatusBadge";
import type { DocumentRequest } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

/** Request card from the My Requests reference; used for small screens (desktop uses the table). */
export function RequestCard({ request: r, onView }: { request: DocumentRequest; onView: () => void }) {
  return (
    <Card className="p-5 sm:p-8">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-ink sm:text-xl">{r.serviceName}</h3>
            {r.validId && (
              <Pill tone="blue" className="gap-1">
                <Paperclip className="size-3.5" aria-hidden />
                Attached
              </Pill>
            )}
          </div>
          <p className="mt-1 text-sm break-all text-subtle">Reference #: {r.referenceNo}</p>
        </div>
        <RequestStatusBadge status={r.status} className="shrink-0" />
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 rounded-xl bg-page p-4 sm:grid-cols-4 sm:p-5">
        <div>
          <dt className="text-xs font-semibold tracking-wide text-subtle uppercase">Date submitted</dt>
          <dd className="mt-1 font-semibold text-ink">{formatDate(r.submittedAt)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold tracking-wide text-subtle uppercase">Document fee</dt>
          <dd className="mt-1 font-semibold text-ink">{r.fee.label}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold tracking-wide text-subtle uppercase">Date approved</dt>
          <dd className="mt-1 font-semibold text-ink">{r.approvedAt ? formatDate(r.approvedAt) : "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold tracking-wide text-subtle uppercase">Status</dt>
          <dd className={cn("mt-1 font-semibold", toneClasses[REQUEST_TONE[r.status]].text)}>{r.status}</dd>
        </div>
      </dl>

      {r.remarks && (
        <div className="mt-4 flex gap-3 rounded-xl border-l-4 border-status-blue bg-status-blue-bg px-4 py-3 text-sm text-status-blue">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>
            {r.status === "Rejected" ? "Remarks: " : "Instructions: "}
            {r.remarks}
          </p>
        </div>
      )}

      <Button variant="soft" className="mt-5 w-full sm:w-auto" onClick={onView} aria-label={`View details of ${r.serviceName} ${r.referenceNo}`}>
        View Details
      </Button>
    </Card>
  );
}
