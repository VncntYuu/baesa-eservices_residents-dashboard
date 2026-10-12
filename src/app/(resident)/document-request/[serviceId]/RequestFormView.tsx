"use client";

import Link from "next/link";
import { CircleCheck, ClipboardList, Copy, Info, Paperclip, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useResidentData } from "@/components/layout/ResidentShell";
import { ServiceIcon } from "@/components/requests/ServiceIcon";
import { Button, LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { Field, TextArea, TextInput, describedBy } from "@/components/ui/FormControls";
import { PageHeader } from "@/components/ui/PageHeader";
import { ATTACHMENT_RULES, getService, type ServiceField } from "@/lib/config/services";
import { submitDocumentRequest } from "@/lib/store/portal-store";
import type { DocumentRequest, ServiceId } from "@/lib/types";
import { formatDate, toYMD } from "@/lib/utils";

type Errors = Record<string, string>;

function validate(fields: ServiceField[], values: Record<string, string>, certified: boolean): Errors {
  const errors: Errors = {};
  for (const f of fields) {
    const v = (values[f.id] ?? "").trim();
    if (f.required && (!v || (f.type === "checkbox" && v !== "Yes"))) {
      errors[f.id] = f.type === "checkbox" ? "Please confirm to continue." : `${f.label} is required.`;
      continue;
    }
    if (v && f.type === "number" && (Number.isNaN(Number(v)) || Number(v) < (f.min ?? -Infinity))) {
      errors[f.id] = "Please enter a valid number.";
    }
    if (v && f.type === "date" && v > toYMD(new Date())) {
      errors[f.id] = "Date cannot be in the future.";
    }
    if (v && f.type !== "checkbox" && v.length > 1000) errors[f.id] = "Please keep this under 1000 characters.";
  }
  if (!certified) errors.certify = "Please confirm that the information is correct.";
  return errors;
}

export function RequestFormView({ serviceId }: { serviceId: ServiceId }) {
  const service = getService(serviceId)!;
  const { resident } = useResidentData();
  const [values, setValues] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const [certified, setCertified] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [reviewOpen, setReviewOpen] = useState(false);
  const [submitted, setSubmitted] = useState<DocumentRequest | null>(null);
  const [copied, setCopied] = useState(false);

  const setValue = (id: string, v: string) => {
    setValues((s) => ({ ...s, [id]: v }));
    if (errors[id]) setErrors((e) => ({ ...e, [id]: "" }));
  };

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const incoming = Array.from(list);
    const allowed = ATTACHMENT_RULES.accept.split(",");
    for (const f of incoming) {
      const ext = `.${f.name.split(".").pop()?.toLowerCase()}`;
      if (!allowed.includes(ext)) return setFileError(`${f.name}: only JPG, PNG or PDF files are allowed.`);
      if (f.size > ATTACHMENT_RULES.maxSizeMb * 1024 * 1024)
        return setFileError(`${f.name} is larger than ${ATTACHMENT_RULES.maxSizeMb} MB.`);
    }
    const next = [...files, ...incoming];
    if (next.length > ATTACHMENT_RULES.maxFiles) return setFileError(`You can attach up to ${ATTACHMENT_RULES.maxFiles} files.`);
    setFileError("");
    setFiles(next);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(service.fields, values, certified);
    setErrors(errs);
    const firstError = Object.keys(errs).find((k) => errs[k]);
    if (firstError) {
      document.getElementById(firstError === "certify" ? "certify" : `f-${firstError}`)?.focus();
      return;
    }
    setReviewOpen(true);
  };

  const confirmSubmit = () => {
    const details: Record<string, string> = {};
    for (const f of service.fields) details[f.id] = (values[f.id] ?? "").trim();
    const req = submitDocumentRequest({ serviceId: service.id, details, attachments: files.map((f) => f.name) });
    setReviewOpen(false);
    setSubmitted(req);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="p-6 text-center sm:p-10">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-status-green-bg text-status-green">
            <CircleCheck className="size-9" aria-hidden />
          </span>
          <h1 className="mt-5 text-2xl font-extrabold text-brand-900 sm:text-3xl" tabIndex={-1}>
            Request submitted
          </h1>
          <p className="mt-2 text-muted">
            Your {service.name} request has been recorded. Use this reference number to track it.
          </p>
          <div className="mx-auto mt-6 flex max-w-md items-center justify-between gap-3 rounded-xl bg-page px-4 py-3">
            <div className="text-left">
              <p className="text-xs font-semibold tracking-wide text-muted uppercase">Reference number</p>
              <p className="font-mono text-lg font-bold text-ink">{submitted.referenceNo}</p>
            </div>
            <Button
              variant="soft"
              size="sm"
              onClick={() => {
                navigator.clipboard?.writeText(submitted.referenceNo).then(() => setCopied(true)).catch(() => {});
              }}
            >
              <Copy className="size-4" aria-hidden />
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted">
            Demo: this request is stored in your browser only and was not sent to the barangay.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <LinkButton href={`/my-requests?ref=${submitted.referenceNo}`}>Track this request</LinkButton>
            <LinkButton href="/document-request" variant="outline">
              Request another document
            </LinkButton>
          </div>
        </Card>
      </div>
    );
  }

  const residentRows: [string, string][] = [
    ["Full name", [resident.firstName, resident.middleName, resident.lastName].filter(Boolean).join(" ")],
    ["Address", `${resident.address}, ${resident.purok}`],
    ["Contact number", resident.contactNumber],
    ["Email", resident.email],
    ["Birth date", formatDate(`${resident.birthDate}T00:00:00+08:00`)],
    ["Civil status", resident.civilStatus],
  ];

  return (
    <>
      <PageHeader title={service.name} description={service.shortDescription} back={{ href: "/document-request", label: "Back to Services" }} />

      <form onSubmit={onSubmit} noValidate className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <Card className="p-5 sm:p-8">
            <h2 className="text-lg font-bold text-brand-900">Resident information</h2>
            <p className="mt-1 text-sm text-muted">Taken from your resident profile.</p>
            <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {residentRows.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs font-semibold tracking-wide text-muted uppercase">{k}</dt>
                  <dd className="mt-0.5 font-medium text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="p-5 sm:p-8">
            <h2 className="text-lg font-bold text-brand-900">Request details</h2>
            <p className="mt-1 text-sm text-muted">
              Fields marked <span className="text-status-red">*</span> are required.
            </p>
            <div className="mt-5 space-y-5">
              {service.fields.map((f) => {
                const id = `f-${f.id}`;
                const err = errors[f.id];
                if (f.type === "checkbox") {
                  return (
                    <div key={f.id}>
                      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-4 hover:bg-brand-50">
                        <input
                          id={id}
                          type="checkbox"
                          checked={values[f.id] === "Yes"}
                          onChange={(e) => setValue(f.id, e.target.checked ? "Yes" : "")}
                          aria-invalid={!!err || undefined}
                          aria-describedby={err ? `${id}-error` : undefined}
                          className="mt-0.5 size-5 accent-brand-500"
                        />
                        <span className="text-sm font-medium text-ink">
                          {f.label}
                          {f.required && <span className="text-status-red"> *</span>}
                        </span>
                      </label>
                      {err && (
                        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-status-red">
                          {err}
                        </p>
                      )}
                    </div>
                  );
                }
                return (
                  <Field key={f.id} id={id} label={f.label} required={f.required} help={f.helpText} error={err}>
                    {f.type === "textarea" ? (
                      <TextArea
                        id={id}
                        value={values[f.id] ?? ""}
                        onChange={(e) => setValue(f.id, e.target.value)}
                        placeholder={f.placeholder}
                        invalid={!!err}
                        aria-describedby={describedBy(id, err, f.helpText)}
                        aria-required={f.required}
                        maxLength={1000}
                      />
                    ) : (
                      <TextInput
                        id={id}
                        type={f.type}
                        inputMode={f.type === "number" ? "numeric" : undefined}
                        min={f.min}
                        max={f.type === "date" ? toYMD(new Date()) : undefined}
                        value={values[f.id] ?? ""}
                        onChange={(e) => setValue(f.id, e.target.value)}
                        placeholder={f.placeholder}
                        invalid={!!err}
                        aria-describedby={describedBy(id, err, f.helpText)}
                        aria-required={f.required}
                      />
                    )}
                  </Field>
                );
              })}

              <Field
                id="attachments"
                label="Supporting documents (optional)"
                help={`JPG, PNG or PDF, up to ${ATTACHMENT_RULES.maxSizeMb} MB each, max ${ATTACHMENT_RULES.maxFiles} files.`}
                error={fileError}
              >
                <label
                  htmlFor="attachments"
                  className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-line bg-page/60 px-4 py-4 text-sm hover:border-brand-200 hover:bg-brand-50"
                >
                  <Paperclip className="size-5 text-brand-500" aria-hidden />
                  <span className="font-semibold text-ink">Choose files</span>
                </label>
                <input
                  id="attachments"
                  type="file"
                  multiple
                  accept={ATTACHMENT_RULES.accept}
                  className="sr-only"
                  aria-describedby={describedBy("attachments", fileError, "help")}
                  onChange={(e) => {
                    addFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
                {files.length > 0 && (
                  <ul className="mt-2 space-y-2">
                    {files.map((f, i) => (
                      <li key={`${f.name}-${i}`} className="flex items-center gap-3 rounded-lg bg-page px-3 py-2 text-sm">
                        <Paperclip className="size-4 text-muted" aria-hidden />
                        <span className="min-w-0 flex-1 truncate">{f.name}</span>
                        <button
                          type="button"
                          onClick={() => setFiles((fs) => fs.filter((_, j) => j !== i))}
                          className="rounded p-1 text-muted hover:text-status-red"
                          aria-label={`Remove ${f.name}`}
                        >
                          <X className="size-4" aria-hidden />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Field>

              <div>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    id="certify"
                    type="checkbox"
                    checked={certified}
                    onChange={(e) => {
                      setCertified(e.target.checked);
                      setErrors((er) => ({ ...er, certify: "" }));
                    }}
                    aria-invalid={!!errors.certify || undefined}
                    aria-describedby={errors.certify ? "certify-error" : undefined}
                    className="mt-0.5 size-5 accent-brand-500"
                  />
                  <span className="text-sm text-ink">
                    I certify that the information I provided is true and correct.
                    <span className="text-status-red"> *</span>
                  </span>
                </label>
                {errors.certify && (
                  <p id="certify-error" role="alert" className="mt-1.5 text-xs font-medium text-status-red">
                    {errors.certify}
                  </p>
                )}
              </div>
            </div>
          </Card>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <LinkButton href="/document-request" variant="outline" size="lg">
              Cancel
            </LinkButton>
            <Button type="submit" size="lg">
              Review request
            </Button>
          </div>
        </div>

        <aside className="order-first space-y-6 lg:sticky lg:top-28 lg:order-none lg:self-start">
          <Card className="p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-xl bg-brand-100 text-brand-500">
                <ServiceIcon icon={service.icon} className="size-6" />
              </span>
              <div>
                <p className="font-bold text-ink">{service.name}</p>
                <p className="text-sm text-muted">
                  Fee: <span className="font-semibold text-ink">{service.feeLabel}</span>
                  {!service.feeConfirmed && " (to be confirmed)"}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-5 sm:p-6">
            <h2 className="flex items-center gap-2 font-bold text-brand-900">
              <ClipboardList className="size-5" aria-hidden />
              Requirements
            </h2>
            {service.requirements.length > 0 ? (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink">
                {service.requirements.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted">
                Official requirements for this service have not been configured yet. Barangay staff will advise you if
                additional documents are needed.
              </p>
            )}
            <div className="mt-4 flex gap-2 rounded-lg bg-status-blue-bg p-3 text-xs text-status-blue">
              <Info className="size-4 shrink-0" aria-hidden />
              {service.processingNote ?? "Processing time will be confirmed by the barangay."}
            </div>
          </Card>
        </aside>
      </form>

      <Dialog
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        title="Review your request"
        description="Please check the details before submitting."
        footer={
          <>
            <Button variant="outline" onClick={() => setReviewOpen(false)}>
              Edit details
            </Button>
            <Button onClick={confirmSubmit}>Submit request</Button>
          </>
        }
      >
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-xs font-semibold text-muted uppercase">Service</dt>
            <dd className="font-medium">
              {service.name} · {service.feeLabel}
              {!service.feeConfirmed && " (fee to be confirmed)"}
            </dd>
          </div>
          {service.fields.map((f) => (
            <div key={f.id}>
              <dt className="text-xs font-semibold text-muted uppercase">{f.type === "checkbox" ? "Confirmation" : f.label}</dt>
              <dd className="font-medium break-words whitespace-pre-line">{values[f.id]?.trim() || "—"}</dd>
            </div>
          ))}
          <div>
            <dt className="text-xs font-semibold text-muted uppercase">Attachments</dt>
            <dd className="font-medium">{files.length ? files.map((f) => f.name).join(", ") : "None"}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-muted">
          Demo: submitting saves the request in this browser only.{" "}
          <Link href="/my-requests" className="underline">
            My Requests
          </Link>{" "}
          will show it right away.
        </p>
      </Dialog>
    </>
  );
}
