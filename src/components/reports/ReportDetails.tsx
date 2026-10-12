"use client";

import { Camera, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { categoryColor } from "@/lib/config/reports";
import type { CommunityReport } from "@/lib/types";
import { formatCoords, formatDate, formatDateTime } from "@/lib/utils";

export function CategoryTag({ category }: { category: CommunityReport["category"] }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-ink">
      <span className="size-2.5 rounded-full" style={{ backgroundColor: categoryColor(category) }} aria-hidden />
      {category}
    </span>
  );
}

export function ReportCard({ report, onView }: { report: CommunityReport; onView: () => void }) {
  const r = report;
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryTag category={r.category} />
            <span className="text-xs font-semibold text-muted uppercase">{r.kind}</span>
          </div>
          <h3 className="mt-2 text-lg font-bold text-ink">{r.title}</h3>
          <p className="mt-0.5 text-sm text-muted">Reference #: {r.referenceNo}</p>
        </div>
        <StatusBadge status={r.status} className="w-fit" />
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-ink/80">{r.description}</p>
      <div className="mt-4 flex flex-col gap-3 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <span className="flex min-w-0 items-center gap-1.5">
          <MapPin className="size-4 shrink-0 text-brand-500" aria-hidden />
          <span className="truncate">{r.location.label}</span>
          <span className="shrink-0">· {formatDate(r.submittedAt)}</span>
        </span>
        <Button variant="soft" size="sm" onClick={onView} className="w-full sm:w-auto">
          View details
        </Button>
      </div>
    </Card>
  );
}

export function ReportDetailsDialog({ report, onClose }: { report: CommunityReport | null; onClose: () => void }) {
  return (
    <Dialog open={!!report} onClose={onClose} title={report?.title ?? ""} description={report ? `Reference #: ${report.referenceNo}` : undefined} size="lg">
      {report && (
        <div className="space-y-5 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={report.status} />
            <CategoryTag category={report.category} />
            <span className="text-muted">{report.kind}</span>
          </div>
          <div>
            <h3 className="font-bold text-brand-900">Description</h3>
            <p className="mt-1 whitespace-pre-line text-ink">{report.description}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-page px-3 py-2">
              <p className="text-xs font-semibold text-muted">Location</p>
              <p className="font-medium text-ink">{report.location.label}</p>
              <p className="text-xs text-muted">{formatCoords(report.location.lat, report.location.lng)}</p>
            </div>
            <div className="rounded-lg bg-page px-3 py-2">
              <p className="text-xs font-semibold text-muted">Submitted</p>
              <p className="font-medium text-ink">{formatDateTime(report.submittedAt)}</p>
            </div>
            {report.photoName && (
              <div className="rounded-lg bg-page px-3 py-2 sm:col-span-2">
                <p className="flex items-center gap-1 text-xs font-semibold text-muted">
                  <Camera className="size-3.5" aria-hidden /> Photo
                </p>
                <p className="font-medium break-all text-ink">{report.photoName}</p>
              </div>
            )}
          </div>
          <div>
            <h3 className="mb-2 font-bold text-brand-900">Updates</h3>
            {report.updates.length ? (
              <ol className="space-y-3 border-l-2 border-line pl-4">
                {[...report.updates].reverse().map((u, i) => (
                  <li key={i}>
                    <p className="text-ink">{u.note}</p>
                    <p className="text-xs text-muted">{formatDateTime(u.date)}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-muted">No updates yet.</p>
            )}
            <p className="mt-3 text-xs text-muted">Updates are simulated in this demo until the barangay backend is connected.</p>
          </div>
        </div>
      )}
    </Dialog>
  );
}
