"use client";

import { Info } from "lucide-react";
import type { ReactNode } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { PaymentStatusBadge, REQUEST_TONE, RequestStatusBadge, toneClasses } from "@/components/ui/StatusBadge";
import { paymentMethodLabel } from "@/lib/config/services";
import type { DocumentRequest } from "@/lib/types";
import { cn, formatDate, formatDateTime, formatPeso } from "@/lib/utils";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-lg bg-page px-3 py-2">
      <dt className="text-xs font-semibold text-subtle">{label}</dt>
      <dd className="text-sm font-medium break-words text-ink">{children || "—"}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 font-bold text-brand-900">{title}</h3>
      {children}
    </section>
  );
}

export function RequestDetailsDialog({ request: r, onClose }: { request: DocumentRequest | null; onClose: () => void }) {
  return (
    <Dialog open={!!r} onClose={onClose} title={r?.serviceName ?? ""} description={r ? `Reference #: ${r.referenceNo}` : undefined} size="lg">
      {r && (
        <div className="space-y-6">
          <dl className="grid gap-3 sm:grid-cols-4">
            <Row label="Status">
              <RequestStatusBadge status={r.status} className="mt-1" />
            </Row>
            <Row label="Date submitted">{formatDateTime(r.submittedAt)}</Row>
            <Row label="Date approved">{r.approvedAt ? formatDate(r.approvedAt) : "—"}</Row>
            <Row label="Document type">{r.serviceName}</Row>
          </dl>

          {r.remarks && (
            <div className="flex gap-3 rounded-xl border-l-4 border-status-blue bg-status-blue-bg px-4 py-3 text-sm text-status-blue">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
              <p>
                {r.status === "Rejected" ? "Remarks: " : "Instructions: "}
                {r.remarks}
              </p>
            </div>
          )}

          <Section title="Resident details">
            <dl className="grid gap-3 sm:grid-cols-2">
              <Row label="Full name">
                {[r.applicant.firstName, r.applicant.middleName, r.applicant.lastName, r.applicant.suffix].filter(Boolean).join(" ")}
              </Row>
              <Row label="Date of birth">{r.applicant.birthDate ? formatDate(`${r.applicant.birthDate}T12:00:00+08:00`) : ""}</Row>
              <Row label="Mobile number">{r.applicant.mobile}</Row>
              <Row label="Address">{r.applicant.address}</Row>
            </dl>
          </Section>

          <Section title="Submitted information">
            <dl className="grid gap-3 sm:grid-cols-2">
              {r.details.map((d) => (
                <Row key={d.label} label={d.label}>
                  {d.value}
                </Row>
              ))}
              <Row label="Valid ID">{r.validId ? `${r.validId.name} (uploaded)` : "Not provided"}</Row>
              <Row label="Identity verification">
                {r.identityCheck ? (r.identityCheck.method === "camera" ? "Live photo taken" : "Photo uploaded") : "Not provided"}
              </Row>
            </dl>
            <p className="mt-2 text-xs text-subtle">The ID file and verification photo are not stored in this demo, only their details.</p>
          </Section>

          <Section title="Fee and payment">
            <div className="rounded-xl border border-line p-4">
              <dl className="space-y-1.5 text-sm">
                {r.fee.lines.map((l) => (
                  <div key={l.label} className="flex justify-between gap-4">
                    <dt className="text-muted">{l.label}</dt>
                    <dd className="tabular-nums">{formatPeso(l.amount)}</dd>
                  </div>
                ))}
                <div className="flex justify-between gap-4 border-t border-line pt-1.5 font-semibold">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{r.fee.total === null ? "Variable (assessed by the barangay)" : r.fee.label}</dd>
                </div>
              </dl>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-muted">
                  Payment method: <strong className="text-ink">{paymentMethodLabel(r.payment.method)}</strong>
                </span>
                <PaymentStatusBadge status={r.payment.status} />
              </div>
              {r.fee.isSample && <p className="mt-2 text-xs text-subtle">Sample fee. The barangay will confirm the official amount.</p>}
            </div>
          </Section>

          <Section title="Status history">
            <ol className="relative space-y-5 border-l-2 border-line pl-6">
              {[...r.history].reverse().map((h, i) => (
                <li key={i} className="relative">
                  <span
                    className={cn("absolute top-1 -left-[31px] size-4 rounded-full ring-4 ring-white", toneClasses[REQUEST_TONE[h.status]].bar)}
                    aria-hidden
                  />
                  <p className="text-sm font-semibold text-ink">{h.status}</p>
                  <p className="text-sm text-muted">{h.note}</p>
                  <p className="mt-0.5 text-xs text-subtle">{formatDateTime(h.date)}</p>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-xs text-subtle">Status updates will come from barangay staff once the system is connected.</p>
          </Section>
        </div>
      )}
    </Dialog>
  );
}
