"use client";

import { ArrowRight, CircleCheck, Copy, Info, LoaderCircle, UserRound, X } from "lucide-react";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useResidentData } from "@/components/layout/ResidentShell";
import { Button, LinkButton } from "@/components/ui/Button";
import { ModalShell } from "@/components/ui/Dialog";
import { Field, Select, TextArea, TextInput, describedBy } from "@/components/ui/FormControls";
import { PaymentStatusBadge } from "@/components/ui/StatusBadge";
import { ASSISTANCE_SERVICES, getService, paymentMethodLabel, type ServiceConfig, type ServiceField } from "@/lib/config/services";
import { submitDocumentRequest } from "@/lib/store/portal-store";
import { applicantFromProfile, clearDraft, loadDraft, saveDraft, type RequestDraft } from "@/lib/store/request-drafts";
import type { ApplicantInfo, DocumentRequest, ServiceId, SubmittedDetail } from "@/lib/types";
import { cn, formatPeso, isValidPhMobile, toYMD } from "@/lib/utils";
import { FeeSummary, PaymentOptions, needsPaymentChoice } from "./FeeAndPayment";
import { IdentityVerification } from "./IdentityVerification";
import { ValidIdUpload } from "./ValidIdUpload";

type Errors = Record<string, string>;

const fieldKey = (id: string) => `f-${id}`;
const otherKey = (id: string) => `f-${id}-other`;

function validate(service: ServiceConfig, a: ApplicantInfo, d: RequestDraft): Errors {
  const e: Errors = {};
  const today = toYMD(new Date());
  if (!a.firstName.trim()) e.firstName = "Enter your first name.";
  if (!a.lastName.trim()) e.lastName = "Enter your last name.";
  if (!a.birthDate) e.birthDate = "Enter your date of birth.";
  else if (a.birthDate > today) e.birthDate = "Date of birth can't be in the future.";
  else if (a.birthDate < "1900-01-01") e.birthDate = "Check the year of your date of birth.";
  if (!a.mobile.trim()) e.mobile = "Enter your mobile number.";
  else if (!isValidPhMobile(a.mobile)) e.mobile = "Use a Philippine mobile number, e.g. 0917 123 4567 or +63 917 123 4567.";
  if (a.address.trim().length < 5) e.address = "Enter your complete address.";

  for (const f of service.fields) {
    const v = (d.answers[f.id] ?? "").trim();
    if (f.required && !v) {
      e[fieldKey(f.id)] = f.type === "select" ? `Choose an option for "${f.label}".` : `Enter ${f.label.toLowerCase()}.`;
      continue;
    }
    if (v && f.type === "number") {
      const n = Number(v);
      if (!Number.isFinite(n)) e[fieldKey(f.id)] = "Enter a number.";
      else if (f.min !== undefined && n < f.min) e[fieldKey(f.id)] = `Enter ${f.min} or more.`;
      else if (f.max !== undefined && n > f.max) e[fieldKey(f.id)] = `Enter an amount up to ${formatPeso(f.max)}.`;
    }
    if (v && f.type === "date" && v > today) e[fieldKey(f.id)] = "The date can't be in the future.";
    if (f.otherOption && v === f.otherOption && !(d.answers[`${f.id}-other`] ?? "").trim())
      e[otherKey(f.id)] = "Please specify.";
  }

  if (!d.validId) e.validId = "Upload a photo or scan of a valid ID.";
  if (!d.photo) e.photo = "Take a live photo (or upload one) to verify your identity.";
  if (needsPaymentChoice(service) && !d.payment) e.payment = "Choose how you want to pay.";
  if (!d.confirmed) e.confirmed = "Please confirm that your information is accurate.";
  return e;
}

/** Turns the form answers into the labelled details saved with the request. */
function toDetails(service: ServiceConfig, d: RequestDraft): SubmittedDetail[] {
  return service.fields.map((f) => {
    let value = (d.answers[f.id] ?? "").trim();
    if (f.otherOption && value === f.otherOption) value = `${f.otherOption.replace(" (specify)", "")}: ${(d.answers[`${f.id}-other`] ?? "").trim()}`;
    if (f.prefix === "₱" && value) value = formatPeso(Number(value));
    return { label: f.label, value };
  });
}

/** Focus order for jumping to the first problem after a failed submit. */
const FOCUS_ORDER = ["firstName", "lastName", "birthDate", "mobile", "address"];

export function RequestFormModal({
  serviceId,
  onClose,
  onSwitchService,
}: {
  serviceId: ServiceId | null;
  onClose: () => void;
  onSwitchService: (id: ServiceId) => void;
}) {
  const titleId = useId();
  const service = getService(serviceId);
  return (
    <ModalShell
      open={!!service}
      onClose={onClose}
      labelledBy={titleId}
      closeOnBackdrop={false}
      className="max-h-[94dvh] max-w-[54rem] rounded-3xl sm:w-[calc(100%-3rem)]"
    >
      {service && (
        <RequestForm key={service.id} service={service} titleId={titleId} onClose={onClose} onSwitchService={onSwitchService} />
      )}
    </ModalShell>
  );
}

function RequestForm({
  service,
  titleId,
  onClose,
  onSwitchService,
}: {
  service: ServiceConfig;
  titleId: string;
  onClose: () => void;
  onSwitchService: (id: ServiceId) => void;
}) {
  const { resident } = useResidentData();
  // Restore any draft for this service (the component is keyed by service, so this runs once per form).
  const [applicant, setApplicant] = useState<ApplicantInfo>(() => loadDraft(service.id).applicant);
  const [draft, setDraft] = useState<RequestDraft>(() => loadDraft(service.id).draft);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<DocumentRequest | null>(null);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the draft in memory as the resident types, so closing the modal loses nothing.
  useEffect(() => {
    if (!result) saveDraft(service.id, applicant, draft);
  }, [service.id, applicant, draft, result]);

  const clear = (key: string) => errors[key] && setErrors((e) => ({ ...e, [key]: "" }));
  const setA = (k: keyof ApplicantInfo, v: string) => {
    setApplicant((a) => ({ ...a, [k]: v }));
    clear(k);
  };
  const setAnswer = (id: string, v: string, key = fieldKey(id)) => {
    setDraft((d) => ({ ...d, answers: { ...d.answers, [id]: v } }));
    clear(key);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return; // guards against double submission
    const errs = validate(service, applicant, draft);
    setErrors(errs);
    const keys = Object.keys(errs);
    if (keys.length) {
      const ordered = [
        ...FOCUS_ORDER,
        ...service.fields.flatMap((f) => [fieldKey(f.id), otherKey(f.id)]),
        "validId",
        "payment",
        "photo",
        "confirmed",
      ];
      const first = ordered.find((k) => errs[k]);
      const target =
        first === "payment"
          ? document.querySelector<HTMLInputElement>('input[name="payment-method"]')
          : first === "photo"
            ? document.querySelector<HTMLElement>("#rq-photo button")
            : document.getElementById(`rq-${first}`);
      target?.focus();
      target?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    // Simulated network delay so the loading state is visible; replace with the API call.
    await new Promise((r) => setTimeout(r, 700));
    const details = toDetails(service, draft);
    const req = submitDocumentRequest({
      serviceId: service.id,
      applicant: Object.fromEntries(Object.entries(applicant).map(([k, v]) => [k, v.trim()])) as unknown as ApplicantInfo,
      summary: details.map((d) => d.value).filter(Boolean).join(" · ").slice(0, 120),
      details,
      validId: { name: draft.validId!.name, type: draft.validId!.type, size: draft.validId!.size },
      identityCheck: { method: draft.photo!.method },
      paymentMethod: draft.payment ?? "none",
    });
    clearDraft(service.id);
    setSubmitting(false);
    setResult(req);
    scrollRef.current?.scrollTo({ top: 0 });
  };

  if (result) {
    return (
      <div className="overflow-y-auto px-6 py-10 text-center sm:px-12">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-status-green-bg text-status-green">
          <CircleCheck className="size-9" aria-hidden />
        </span>
        <h2 id={titleId} className="mt-5 text-2xl font-extrabold text-brand-900 sm:text-3xl">
          Request submitted
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-muted">
          Your {service.name} request is now <strong className="text-ink">Pending</strong> review. Use this reference number to
          track it.
        </p>
        <div className="mx-auto mt-6 flex max-w-md items-center justify-between gap-3 rounded-xl bg-page px-4 py-3 text-left">
          <div>
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">Reference number</p>
            <p className="font-mono text-lg font-bold text-ink" data-testid="reference-number">
              {result.referenceNo}
            </p>
          </div>
          <Button
            variant="soft"
            size="sm"
            onClick={() => {
              navigator.clipboard?.writeText(result.referenceNo).then(() => setCopied(true), () => {});
            }}
          >
            <Copy className="size-4" aria-hidden />
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <div className="mx-auto mt-4 max-w-md rounded-xl border border-line px-4 py-3 text-left text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-muted">
              Fee: <strong className="text-ink">{result.fee.label}</strong>
              {result.payment.method !== "none" && <> · {paymentMethodLabel(result.payment.method)}</>}
            </span>
            <PaymentStatusBadge status={result.payment.status} />
          </div>
          {result.payment.status === "Awaiting online payment" && (
            <p className="mt-2 text-muted">No payment has been taken. Online payment isn&apos;t connected in this demo.</p>
          )}
          {result.payment.status === "Pay at barangay hall" && (
            <p className="mt-2 text-muted">Pay at the barangay hall when you claim your document.</p>
          )}
        </div>
        <p className="mt-4 text-xs text-subtle">Demo: saved in this browser only. It was not sent to the barangay.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <LinkButton href={`/my-requests?ref=${result.referenceNo}`}>
            Track this request
          </LinkButton>
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    );
  }

  const assistanceChoice = service.group === "assistance";

  return (
    <form onSubmit={onSubmit} noValidate className="flex max-h-[94dvh] flex-col">
      {/*
        `relative` makes this scroll area the containing block for the visually hidden
        (position: absolute) inputs and labels inside the form. Without it they are
        positioned against the <dialog> itself, sit at their unscrolled depth and stretch
        the dialog, leaving a large blank area below the Submit button.
        `min-h-0` lets the area shrink inside the flex column so only it scrolls.
      */}
      <div ref={scrollRef} className="relative min-h-0 overflow-y-auto px-5 pt-7 pb-6 sm:px-10 sm:pt-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-2xl font-extrabold tracking-tight text-brand-900 sm:text-[2.125rem]">
              {service.formTitle}
            </h2>
            <p className="mt-1 text-muted sm:text-lg">Barangay Baesa E-Services · Complete your request below.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close form"
            className="-mr-2 grid size-10 shrink-0 place-items-center rounded-lg text-muted hover:bg-page hover:text-ink focus-visible:outline-2 focus-visible:outline-brand-500 sm:hidden"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        {assistanceChoice && (
          <div role="radiogroup" aria-label="Type of assistance" className="mt-5 grid grid-cols-2 gap-1 rounded-xl bg-page p-1">
            {ASSISTANCE_SERVICES.map((s) => (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={s.id === service.id}
                onClick={() => onSwitchService(s.id)}
                className={cn(
                  "h-11 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-brand-500 sm:text-base",
                  s.id === service.id ? "bg-brand-500 text-white" : "text-ink hover:bg-white",
                )}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}

        <div className="mt-6 rounded-2xl bg-info-bg px-5 py-4 text-status-blue sm:px-6">
          <p className="flex items-center gap-2 font-semibold">
            <Info className="size-5" aria-hidden />
            Required Documents
          </p>
          {service.requiredDocuments.length > 0 ? (
            <ul className="mt-2 list-disc space-y-1 pl-10 marker:text-status-blue">
              {service.requiredDocuments.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 pl-7 text-sm">
              The barangay hasn&apos;t listed required documents for this service yet. Staff will tell you if anything else is needed.
            </p>
          )}
        </div>

        {/* Resident Information */}
        <section aria-labelledby="rq-resident" className="mt-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 id="rq-resident" className="text-xl font-bold text-brand-900">
              Resident Information
            </h3>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  setApplicant(applicantFromProfile(resident));
                  setErrors({});
                }}
                className="inline-flex items-center gap-1.5 rounded text-sm font-semibold text-brand-500 hover:underline focus-visible:outline-2 focus-visible:outline-brand-500"
              >
                <UserRound className="size-4" aria-hidden />
                Fill in from my profile
              </button>
              <span className="text-sm text-[#c2410c]">Fields marked * are required</span>
            </div>
          </div>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field id="rq-firstName" label="First name" required error={errors.firstName}>
              <TextInput
                id="rq-firstName"
                autoComplete="given-name"
                placeholder="Juan"
                value={applicant.firstName}
                maxLength={60}
                onChange={(e) => setA("firstName", e.target.value)}
                invalid={!!errors.firstName}
                aria-describedby={describedBy("rq-firstName", errors.firstName)}
                aria-required
              />
            </Field>
            <Field id="rq-middleName" label="Middle name">
              <TextInput
                id="rq-middleName"
                autoComplete="additional-name"
                placeholder="Santos"
                value={applicant.middleName}
                maxLength={60}
                onChange={(e) => setA("middleName", e.target.value)}
              />
            </Field>
            <Field id="rq-lastName" label="Last name" required error={errors.lastName}>
              <TextInput
                id="rq-lastName"
                autoComplete="family-name"
                placeholder="Dela Cruz"
                value={applicant.lastName}
                maxLength={60}
                onChange={(e) => setA("lastName", e.target.value)}
                invalid={!!errors.lastName}
                aria-describedby={describedBy("rq-lastName", errors.lastName)}
                aria-required
              />
            </Field>
            <Field id="rq-suffix" label="Suffix">
              <TextInput
                id="rq-suffix"
                autoComplete="honorific-suffix"
                placeholder="e.g., Jr., Sr., III"
                value={applicant.suffix}
                maxLength={10}
                onChange={(e) => setA("suffix", e.target.value)}
              />
            </Field>
          </div>
        </section>

        {/* Resident Contact Information */}
        <section aria-labelledby="rq-contact" className="mt-7">
          <h3 id="rq-contact" className="text-xl font-bold text-brand-900">
            Resident Contact Information
          </h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field id="rq-birthDate" label="Date of birth" required error={errors.birthDate}>
              <TextInput
                id="rq-birthDate"
                type="date"
                autoComplete="bday"
                min="1900-01-01"
                max={toYMD(new Date())}
                value={applicant.birthDate}
                onChange={(e) => setA("birthDate", e.target.value)}
                invalid={!!errors.birthDate}
                aria-describedby={describedBy("rq-birthDate", errors.birthDate)}
                aria-required
              />
            </Field>
            <Field id="rq-mobile" label="Mobile number" required error={errors.mobile}>
              <TextInput
                id="rq-mobile"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+63 9XX XXX XXXX"
                value={applicant.mobile}
                maxLength={20}
                onChange={(e) => setA("mobile", e.target.value)}
                invalid={!!errors.mobile}
                aria-describedby={describedBy("rq-mobile", errors.mobile)}
                aria-required
              />
            </Field>
            <Field id="rq-address" label="Address" required error={errors.address} className="sm:col-span-2">
              <TextInput
                id="rq-address"
                autoComplete="street-address"
                placeholder="Ex: 24 Sampaguita Street, Barangay Baesa, Quezon City"
                value={applicant.address}
                maxLength={200}
                onChange={(e) => setA("address", e.target.value)}
                invalid={!!errors.address}
                aria-describedby={describedBy("rq-address", errors.address)}
                aria-required
              />
            </Field>
          </div>
        </section>

        {/* Service-specific details + valid ID */}
        <section aria-labelledby="rq-details" className="mt-7">
          <h3 id="rq-details" className="text-xl font-bold text-brand-900">
            {service.detailsTitle}
          </h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {service.fields.map((f) => (
              <DetailField
                key={f.id}
                field={f}
                value={draft.answers[f.id] ?? ""}
                otherValue={draft.answers[`${f.id}-other`] ?? ""}
                error={errors[fieldKey(f.id)]}
                otherError={errors[otherKey(f.id)]}
                onChange={(v) => setAnswer(f.id, v)}
                onOtherChange={(v) => setAnswer(`${f.id}-other`, v, otherKey(f.id))}
              />
            ))}
            <div className="sm:col-span-2">
              <ValidIdUpload
                id="rq-validId"
                file={draft.validId}
                onChange={(file) => {
                  setDraft((d) => ({ ...d, validId: file }));
                  clear("validId");
                }}
                error={errors.validId}
                onError={(m) => setErrors((e) => ({ ...e, validId: m }))}
              />
            </div>
          </div>
        </section>

        <div className="mt-7 space-y-6">
          <FeeSummary service={service} />
          <PaymentOptions
            service={service}
            value={draft.payment}
            onChange={(m) => {
              setDraft((d) => ({ ...d, payment: m }));
              clear("payment");
            }}
            error={errors.payment}
          />
          <div id="rq-photo">
            <IdentityVerification
              value={draft.photo}
              onChange={(photo) => {
                setDraft((d) => ({ ...d, photo }));
                clear("photo");
              }}
              error={errors.photo}
            />
          </div>

          <div>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                id="rq-confirmed"
                type="checkbox"
                checked={draft.confirmed}
                onChange={(e) => {
                  setDraft((d) => ({ ...d, confirmed: e.target.checked }));
                  clear("confirmed");
                }}
                aria-invalid={!!errors.confirmed || undefined}
                aria-describedby={errors.confirmed ? "rq-confirmed-error" : undefined}
                className="mt-0.5 size-5 shrink-0 accent-brand-500"
              />
              <span className="text-ink">
                I confirm that all information provided is accurate and complete. I understand that false information may result
                in the rejection of my request.
              </span>
            </label>
            {errors.confirmed && (
              <p id="rq-confirmed-error" role="alert" className="mt-1.5 pl-8 text-xs font-medium text-status-red">
                {errors.confirmed}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-10 sm:py-5">
        {Object.values(errors).some(Boolean) && (
          <p role="alert" className="text-sm font-medium text-status-red sm:mr-auto">
            Please fix the highlighted fields above.
          </p>
        )}
        <Button variant="outline" size="lg" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" size="lg" disabled={submitting} aria-busy={submitting}>
          {submitting ? (
            <>
              <LoaderCircle className="size-5 animate-spin" aria-hidden />
              Submitting…
            </>
          ) : (
            <>
              Submit request
              <ArrowRight className="size-5" aria-hidden />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function DetailField({
  field: f,
  value,
  otherValue,
  error,
  otherError,
  onChange,
  onOtherChange,
}: {
  field: ServiceField;
  value: string;
  otherValue: string;
  error?: string;
  otherError?: string;
  onChange: (v: string) => void;
  onOtherChange: (v: string) => void;
}) {
  const id = `rq-${fieldKey(f.id)}`;
  const otherId = `rq-${otherKey(f.id)}`;
  const wide = f.wide ? "sm:col-span-2" : "";
  const common = {
    id,
    invalid: !!error,
    "aria-describedby": describedBy(id, error, f.helpText),
    "aria-required": f.required || undefined,
  };

  return (
    <>
      <Field id={id} label={f.label} required={f.required} help={f.helpText} error={error} className={wide}>
        {f.type === "select" ? (
          <Select {...common} value={value} onChange={(e) => onChange(e.target.value)}>
            <option value="">{f.placeholder ?? "-- Select --"}</option>
            {f.options?.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </Select>
        ) : f.type === "textarea" ? (
          <TextArea {...common} value={value} maxLength={1000} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} />
        ) : f.prefix ? (
          <div className="relative">
            <span aria-hidden className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted">
              {f.prefix}
            </span>
            <TextInput
              {...common}
              type="number"
              inputMode="decimal"
              min={f.min}
              max={f.max}
              step="any"
              className="pl-9"
              value={value}
              placeholder={f.placeholder}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
        ) : (
          <TextInput
            {...common}
            type={f.type}
            min={f.min}
            max={f.type === "date" ? toYMD(new Date()) : f.max}
            value={value}
            maxLength={f.type === "text" ? 200 : undefined}
            placeholder={f.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      </Field>
      {f.otherOption && value === f.otherOption && (
        <Field id={otherId} label={f.otherLabel ?? "Please specify"} required error={otherError} className={wide}>
          <TextInput
            id={otherId}
            value={otherValue}
            maxLength={200}
            onChange={(e) => onOtherChange(e.target.value)}
            invalid={!!otherError}
            aria-describedby={describedBy(otherId, otherError)}
            aria-required
            autoFocus
          />
        </Field>
      )}
    </>
  );
}
