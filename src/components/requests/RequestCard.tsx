import { Info, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pill, StatusBadge, statusTone, toneClasses } from "@/components/ui/StatusBadge";
import type { DocumentRequest } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

export function RequestCard({ request, onView }: { request: DocumentRequest; onView: () => void }) {
  const r = request;
  const completedLabel = r.status === "Completed" ? "Date completed" : r.status === "Rejected" ? "Date closed" : "Date completed";
  const closedOn = r.completedAt ?? (r.status === "Rejected" ? r.history.at(-1)?.date : undefined);

  return (
    <Card className="p-5 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h3 className="text-lg font-bold text-ink sm:text-xl">{r.serviceName}</h3>
            {r.attachments.length > 0 && (
              <Pill tone="blue" className="gap-1">
                <Paperclip className="size-3.5" aria-hidden />
                Attached
              </Pill>
            )}
          </div>
          <p className="mt-1 text-sm break-all text-muted">Reference #: {r.referenceNo}</p>
        </div>
        <StatusBadge status={r.status} className="w-fit" />
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 rounded-xl bg-page p-4 sm:p-5 md:grid-cols-4">
        <div>
          <dt className="text-xs font-semibold tracking-wide text-muted uppercase">Date submitted</dt>
          <dd className="mt-1 font-semibold text-ink">{formatDate(r.submittedAt)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold tracking-wide text-muted uppercase">Document fee</dt>
          <dd className="mt-1 font-semibold text-ink">{r.feeLabel}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold tracking-wide text-muted uppercase">{completedLabel}</dt>
          <dd className="mt-1 font-semibold text-ink">{closedOn ? formatDate(closedOn) : "Pending"}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold tracking-wide text-muted uppercase">Status</dt>
          <dd className={cn("mt-1 font-semibold", toneClasses[statusTone(r.status)].text)}>{r.status}</dd>
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
