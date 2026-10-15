"use client";

import { CreditCard, Globe, Info, Store, Wallet } from "lucide-react";
import { PaymentStatusBadge } from "@/components/ui/StatusBadge";
import { ONLINE_METHODS, paymentMethodLabel, type ServiceConfig } from "@/lib/config/services";
import { paymentFor } from "@/lib/store/portal-store";
import type { PaymentMethod } from "@/lib/types";
import { cn, formatPeso } from "@/lib/utils";

const METHOD_ICON = { gcash: Wallet, maya: CreditCard, paypal: Globe } as const;

/** True when this service needs the resident to choose a payment method. */
export function needsPaymentChoice(service: ServiceConfig): boolean {
  return service.takesPayment && (service.fee.amount ?? 0) > 0;
}

export function FeeSummary({ service }: { service: ServiceConfig }) {
  const { fee } = service;
  const hint =
    fee.amount === null
      ? fee.note
      : fee.amount === 0
        ? fee.note
        : "Choose online or face-to-face payment below.";

  return (
    <section aria-label="Fee summary" className="rounded-2xl bg-page p-5 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-bold text-brand-900">Fee summary</p>
          <p className="text-muted">{service.name}</p>
        </div>
        <p className="text-3xl font-extrabold text-brand-900 tabular-nums">{fee.label}</p>
      </div>

      {fee.amount !== null && fee.amount > 0 && (
        <dl className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">{service.name} fee</dt>
            <dd className="font-medium text-ink tabular-nums">{formatPeso(fee.amount)}</dd>
          </div>
          <div className="flex justify-between gap-4 font-semibold">
            <dt className="text-ink">Total due</dt>
            <dd className="text-ink tabular-nums">{formatPeso(fee.amount)}</dd>
          </div>
        </dl>
      )}

      {hint && (
        <p className="mt-3 flex items-start gap-2 text-sm text-muted">
          <Info className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden />
          {hint}
        </p>
      )}
      {fee.isSample && (
        <p className="mt-1 pl-6 text-xs text-subtle">Sample fee shown for this demo. The barangay will confirm the official amount.</p>
      )}
    </section>
  );
}

function Radio({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-6 shrink-0 place-items-center rounded-full border-2 bg-white",
        checked ? "border-brand-500" : "border-[#d3dbd6]",
      )}
    >
      {checked && <span className="size-3 rounded-full bg-brand-500" />}
    </span>
  );
}

export function PaymentOptions({
  service,
  value,
  onChange,
  error,
}: {
  service: ServiceConfig;
  value: PaymentMethod | null;
  onChange: (m: PaymentMethod) => void;
  error?: string;
}) {
  if (!needsPaymentChoice(service)) {
    return (
      <section aria-label="Payment" className="rounded-2xl border border-line p-5 sm:px-6">
        <p className="font-bold text-brand-900">Payment</p>
        <p className="mt-1 text-muted">
          {service.fee.amount === 0
            ? "No payment is needed for this request."
            : "No payment is collected online. The barangay will assess this request and contact you."}
        </p>
      </section>
    );
  }

  const isOnline = value === "gcash" || value === "maya" || value === "paypal";
  const preview = value ? paymentFor(service.id, value) : null;
  const amount = formatPeso(service.fee.amount ?? 0);

  return (
    <fieldset aria-describedby={error ? "payment-error" : undefined} className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <legend className="float-left text-xl font-bold text-brand-900">
          Payment options<span className="text-status-red"> *</span>
        </legend>
        <span className="text-sm text-muted">Choose how you want to pay</span>
      </div>

      <div className={cn("clear-both rounded-2xl border p-4 sm:p-5", error ? "border-status-red" : "border-line")}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-bold text-brand-900">Online payment</p>
            <p className="text-muted">Pay online.</p>
          </div>
          <Radio checked={isOnline} />
        </div>
        <div className="mt-4 space-y-3">
          {ONLINE_METHODS.map((m) => {
            const Icon = METHOD_ICON[m.id];
            return (
              <label
                key={m.id}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-brand-500",
                  value === m.id ? "border-brand-500 bg-brand-100" : "border-line bg-page hover:border-brand-200",
                )}
              >
                <input
                  type="radio"
                  name="payment-method"
                  value={m.id}
                  checked={value === m.id}
                  onChange={() => onChange(m.id)}
                  className="sr-only"
                />
                <span className="grid size-10 place-items-center rounded-lg border border-line bg-white text-brand-500">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="flex-1 font-semibold text-ink">{m.label}</span>
                <Radio checked={value === m.id} />
              </label>
            );
          })}
        </div>
      </div>

      <label
        className={cn(
          "flex cursor-pointer items-start justify-between gap-3 rounded-2xl border p-4 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-brand-500 sm:p-5",
          value === "face-to-face" ? "border-brand-500 bg-brand-100" : error ? "border-status-red" : "border-line",
        )}
      >
        <input
          type="radio"
          name="payment-method"
          value="face-to-face"
          checked={value === "face-to-face"}
          onChange={() => onChange("face-to-face")}
          className="sr-only"
        />
        <span className="flex items-start gap-3">
          <Store className="mt-0.5 size-5 text-brand-500" aria-hidden />
          <span>
            <span className="block font-bold text-brand-900">Face-to-face payment</span>
            <span className="block text-muted">Pay in person.</span>
          </span>
        </span>
        <Radio checked={value === "face-to-face"} />
      </label>

      {error && (
        <p id="payment-error" role="alert" className="text-sm font-medium text-status-red">
          {error}
        </p>
      )}

      {value && preview && (
        <div aria-live="polite" className="rounded-2xl border border-line bg-white p-4 text-sm sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-ink">{paymentMethodLabel(value)} selected</p>
            <span className="flex items-center gap-2 text-muted">
              Payment status after you submit: <PaymentStatusBadge status={preview.status} />
            </span>
          </div>
          <p className="mt-2 text-muted">
            {isOnline
              ? `Choosing ${paymentMethodLabel(value)} does not charge you now. Online payment isn't connected in this demo, so your request will be saved as "Awaiting online payment" and no money is collected. When the barangay connects ${paymentMethodLabel(value)}, you'll get payment instructions for ${amount}.`
              : `Pay ${amount} in person at the barangay hall when you claim your document. Bring your reference number.`}
          </p>
        </div>
      )}
    </fieldset>
  );
}
