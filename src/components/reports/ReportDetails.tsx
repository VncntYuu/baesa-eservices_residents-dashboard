"use client";

import { ImageOff, MapPin } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { ReportStatusBadge } from "@/components/ui/StatusBadge";
import { categoryColor, categoryLabel } from "@/lib/config/reports";
import type { CommunityReport } from "@/lib/types";
import { formatCoords, formatDate, formatDateTime } from "@/lib/utils";

export function CategoryDot({ report, className }: { report: Pick<CommunityReport, "category" | "otherCategory">; className?: string }) {
  return (
    <span className={className}>
      <span className="mr-2 inline-block size-2 rounded-full align-middle" style={{ backgroundColor: categoryColor(report.category) }} aria-hidden />
      {categoryLabel(report.category, report.otherCategory)}
    </span>
  );
}

export function locationLine(r: CommunityReport) {
  return r.location.area ? `${r.location.label}, ${r.location.area}` : r.location.label;
}

/** Mobile row for My Reports (desktop uses the table). */
export function ReportCard({ report: r, onView }: { report: CommunityReport; onView: () => void }) {
  return (
    <button
      type="button"
      onClick={onView}
      className="block w-full rounded-2xl border border-line bg-white p-4 text-left transition-colors hover:border-brand-200 focus-visible:outline-2 focus-visible:outline-brand-500"
    >
      <span className="flex items-start justify-between gap-3">
        <span className="min-w-0">
          <span className="block font-semibold text-ink">{r.title}</span>
          <span className="block text-sm text-subtle">{r.referenceNo}</span>
        </span>
        <ReportStatusBadge status={r.status} className="shrink-0" />
      </span>
      <span className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
        <CategoryDot report={r} />
        <span className="inline-flex items-center gap-1">
          <MapPin className="size-3.5" aria-hidden />
          {locationLine(r)}
        </span>
        <span>{formatDate(r.submittedAt)}</span>
      </span>
    </button>
  );
}

export function ReportDetailsDialog({ report: r, onClose }: { report: CommunityReport | null; onClose: () => void }) {
  return (
    <Dialog open={!!r} onClose={onClose} title={r?.title ?? ""} description={r ? `${r.kind} · ${r.referenceNo}` : undefined} size="lg">
      {r && (
        <div className="space-y-5 text-sm">
          <div className="flex flex-wrap items-center gap-3">
            <ReportStatusBadge status={r.status} />
            <CategoryDot report={r} className="font-medium text-ink" />
            {!r.isMine && <span className="text-subtle">Filed by another resident. Personal details are hidden.</span>}
          </div>

          <div>
            <h3 className="font-bold text-brand-900">Description</h3>
            <p className="mt-1 whitespace-pre-line text-ink">{r.description}</p>
          </div>

          <div>
            <h3 className="mb-2 font-bold text-brand-900">Photo</h3>
            {r.photo?.dataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- photo stored in this browser for the demo
              <img src={r.photo.dataUrl} alt={`Photo attached to "${r.title}"`} className="max-h-72 w-auto max-w-full rounded-xl border border-line object-contain" />
            ) : r.photo ? (
              <p className="flex items-center gap-2 text-muted">
                <ImageOff className="size-4" aria-hidden />
                {r.photo.name} (image not kept: browser storage is full)
              </p>
            ) : (
              <p className="text-muted">No photo attached.</p>
            )}
          </div>

          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-page px-3 py-2">
              <dt className="text-xs font-semibold text-subtle">Location</dt>
              <dd className="font-medium text-ink">{locationLine(r)}</dd>
              <dd className="text-xs text-subtle">
                {formatCoords(r.location.lat, r.location.lng)}
                {r.isSample && " · demonstration position"}
              </dd>
            </div>
            <div className="rounded-lg bg-page px-3 py-2">
              <dt className="text-xs font-semibold text-subtle">Submitted</dt>
              <dd className="font-medium text-ink">{formatDateTime(r.submittedAt)}</dd>
            </div>
          </dl>

          <div>
            <h3 className="mb-2 font-bold text-brand-900">Status updates</h3>
            <ol className="space-y-3 border-l-2 border-line pl-4">
              {[...r.updates].reverse().map((u, i) => (
                <li key={i}>
                  <p className="text-ink">{u.note}</p>
                  <p className="text-xs text-subtle">{formatDateTime(u.date)}</p>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-subtle">Updates will come from barangay staff once the system is connected.</p>
          </div>
        </div>
      )}
    </Dialog>
  );
}
