"use client";

import { Camera, CircleCheck, LoaderCircle, TriangleAlert, X } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { useResidentData } from "@/components/layout/ResidentShell";
import { LocationPicker } from "@/components/reports/maps";
import { Button, LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, TextArea, TextInput, describedBy } from "@/components/ui/FormControls";
import { PageHeader } from "@/components/ui/PageHeader";
import { COMPLAINT_CATEGORIES, MAP_CONFIG, PHOTO_RULES, REPORT_CATEGORIES, categoryLabel } from "@/lib/config/reports";
import { compressImage } from "@/lib/image";
import { submitCommunityReport } from "@/lib/store/portal-store";
import type { CommunityCategory, CommunityReport, GeoLocation, ReportKind } from "@/lib/types";
import { cn, distanceMeters, formatCoords } from "@/lib/utils";

type ErrorKey = "category" | "otherCategory" | "title" | "description" | "location" | "photo";
type Errors = Partial<Record<ErrorKey, string>>;

export function NewReportView() {
  const { reports } = useResidentData();
  const [kind, setKind] = useState<ReportKind>("Complaint");
  const [category, setCategory] = useState<CommunityCategory | null>(null);
  const [otherCategory, setOtherCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<{ name: string; dataUrl: string } | null>(null);
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<CommunityReport | null>(null);
  const [now] = useState(() => Date.now());

  const options = kind === "Complaint" ? COMPLAINT_CATEGORIES : REPORT_CATEGORIES;
  const isOther = options.find((o) => o.value === category)?.isOther ?? false;
  const activeReports = useMemo(() => reports.filter((r) => r.status !== "Resolved"), [reports]);

  const nearby = location
    ? activeReports.filter(
        (r) =>
          (!category || r.category === category) &&
          distanceMeters(r.location, location) <= MAP_CONFIG.nearbyRadiusMeters &&
          now - new Date(r.submittedAt).getTime() <= MAP_CONFIG.nearbyWindowHours * 3_600_000,
      )
    : [];

  const clearError = (k: ErrorKey) => errors[k] && setErrors((e) => ({ ...e, [k]: undefined }));

  const onPhoto = async (file: File | undefined) => {
    if (!file) return;
    if (!PHOTO_RULES.accept.split(",").includes(file.type)) {
      setErrors((e) => ({ ...e, photo: "Please choose a JPG or PNG image." }));
      return;
    }
    if (file.size > PHOTO_RULES.maxSizeMb * 1024 * 1024) {
      setErrors((e) => ({ ...e, photo: `Image must be ${PHOTO_RULES.maxSizeMb} MB or smaller.` }));
      return;
    }
    try {
      setPhoto({ name: file.name, dataUrl: await compressImage(file) });
      clearError("photo");
    } catch {
      setErrors((e) => ({ ...e, photo: "That image couldn't be read. Try another photo." }));
    }
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (!category) e.category = "Choose a category.";
    if (isOther && otherCategory.trim().length < 3) e.otherCategory = "Describe the category in a few words.";
    if (title.trim().length < 5) e.title = "Enter a short title (at least 5 characters).";
    if (description.trim().length < 10) e.description = "Describe the issue (at least 10 characters).";
    if (!location) e.location = "Pin the location on the map.";
    return e;
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (submitting) return;
    const e = validate();
    setErrors(e);
    const first = (["category", "otherCategory", "title", "description", "location"] as const).find((k) => e[k]);
    if (first) {
      const target = first === "category" ? "cat-0" : first === "location" ? "map-search" : `r-${first}`;
      document.getElementById(target)?.focus();
      return;
    }
    if (!category || !location) return;
    setSubmitting(true);
    // Simulated network delay so the loading state is visible; replace with the API call.
    await new Promise((r) => setTimeout(r, 700));
    const report = submitCommunityReport({
      kind,
      category,
      otherCategory: isOther ? otherCategory.trim() : undefined,
      title: title.trim(),
      description: description.trim(),
      photo: photo ?? undefined,
      location,
    });
    setSubmitting(false);
    setSubmitted(report);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="p-6 text-center sm:p-10">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-status-green-bg text-status-green">
            <CircleCheck className="size-9" aria-hidden />
          </span>
          <h1 className="mt-5 text-2xl font-extrabold text-brand-900 sm:text-3xl">{submitted.kind} submitted</h1>
          <p className="mt-2 text-muted">Thank you for helping keep Baesa safe and clean.</p>
          <div className="mx-auto mt-6 max-w-md rounded-xl bg-page px-4 py-3 text-left">
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">Reference number</p>
            <p className="font-mono text-lg font-bold text-ink" data-testid="reference-number">
              {submitted.referenceNo}
            </p>
            <p className="mt-1 text-sm text-muted">
              {categoryLabel(submitted.category, submitted.otherCategory)} · {submitted.location.label} ·{" "}
              {formatCoords(submitted.location.lat, submitted.location.lng)}
            </p>
          </div>
          <p className="mt-4 text-xs text-subtle">Demo: saved in this browser only. It was not sent to barangay staff.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <LinkButton href="/community-reports?tab=mine">View my reports</LinkButton>
            <LinkButton href="/community-reports?tab=map" variant="outline">
              See it on the community map
            </LinkButton>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="File a Complaint / Report"
        description="Describe the problem and pin its exact location so barangay staff can respond faster."
        back={{ href: "/community-reports", label: "Back to Complaints" }}
      />

      <form onSubmit={onSubmit} noValidate>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          <Card className="p-5 sm:p-9">
            <h2 className="text-2xl font-bold text-brand-900">Report details</h2>

            <div role="radiogroup" aria-label="Type" className="mt-5 grid grid-cols-2 gap-1 rounded-xl bg-page p-1.5">
              {(["Complaint", "Report"] as ReportKind[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={kind === k}
                  onClick={() => {
                    if (k === kind) return;
                    setKind(k);
                    setCategory(null);
                    setOtherCategory("");
                  }}
                  className={cn(
                    "h-12 rounded-lg text-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand-500",
                    kind === k ? "bg-brand-500 text-white shadow" : "text-ink hover:bg-white",
                  )}
                >
                  {k}
                </button>
              ))}
            </div>

            <fieldset className="mt-6" aria-describedby={errors.category ? "cat-error" : undefined}>
              <legend className="mb-2.5 text-base font-medium text-ink">
                Category<span className="text-status-red" aria-hidden> *</span>
                <span className="sr-only"> (required)</span>
              </legend>
              <div role="radiogroup" aria-label={`${kind} category`} className="flex flex-wrap gap-2.5">
                {options.map((c, i) => {
                  const active = category === c.value;
                  return (
                    <button
                      key={c.value}
                      id={`cat-${i}`}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => {
                        setCategory(c.value);
                        clearError("category");
                      }}
                      className={cn(
                        "inline-flex h-11 items-center gap-2 rounded-full border px-5 text-base transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
                        active ? "border-brand-500 bg-brand-500 font-medium text-white" : "border-line bg-white text-ink hover:bg-page",
                        errors.category && !active && "border-status-red/60",
                      )}
                    >
                      {!active && !c.isOther && <span className="size-2.5 rounded-full" style={{ backgroundColor: c.color }} aria-hidden />}
                      {c.label}
                    </button>
                  );
                })}
              </div>
              {errors.category && (
                <p id="cat-error" role="alert" className="mt-1.5 text-xs font-medium text-status-red">
                  {errors.category}
                </p>
              )}
            </fieldset>

            <div className="mt-6 space-y-5">
              {isOther && (
                <Field id="r-otherCategory" label="Specify the category" required error={errors.otherCategory}>
                  <TextInput
                    id="r-otherCategory"
                    value={otherCategory}
                    maxLength={60}
                    onChange={(e) => {
                      setOtherCategory(e.target.value);
                      clearError("otherCategory");
                    }}
                    placeholder={kind === "Complaint" ? "e.g. Stray animals" : "e.g. Fallen tree"}
                    invalid={!!errors.otherCategory}
                    aria-describedby={describedBy("r-otherCategory", errors.otherCategory)}
                    aria-required
                    autoFocus
                  />
                </Field>
              )}

              <Field
                id="r-title"
                label="Title"
                required
                error={errors.title}
                help="Example: Uncollected Garbage on Ramos Street"
              >
                <TextInput
                  id="r-title"
                  value={title}
                  maxLength={120}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    clearError("title");
                  }}
                  placeholder="Enter a short title for the issue."
                  invalid={!!errors.title}
                  aria-describedby={describedBy("r-title", errors.title, "help")}
                  aria-required
                />
              </Field>

              <Field
                id="r-description"
                label="Description"
                required
                error={errors.description}
                help="Example: Garbage bags have been left on the sidewalk for two days and are starting to smell."
              >
                <TextArea
                  id="r-description"
                  value={description}
                  maxLength={1500}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    clearError("description");
                  }}
                  placeholder="Describe the issue and its exact location..."
                  invalid={!!errors.description}
                  aria-describedby={describedBy("r-description", errors.description, "help")}
                  aria-required
                  rows={5}
                />
              </Field>

              <Field id="r-photo" label="Photo (optional)" error={errors.photo}>
                {photo ? (
                  <div className="flex items-center gap-3 rounded-xl border border-line p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element -- local preview */}
                    <img src={photo.dataUrl} alt="Selected photo preview" className="size-16 rounded-lg object-cover" />
                    <p className="min-w-0 flex-1 truncate text-sm font-medium">{photo.name}</p>
                    <label
                      htmlFor="r-photo"
                      className="cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold text-brand-500 hover:bg-page"
                    >
                      Replace
                    </label>
                    <button
                      type="button"
                      onClick={() => setPhoto(null)}
                      className="rounded-lg p-2 text-muted hover:bg-status-red-bg hover:text-status-red"
                      aria-label="Remove photo"
                    >
                      <X className="size-4" aria-hidden />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="r-photo"
                    className="flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed border-line bg-page/50 px-5 py-5 hover:border-brand-200 hover:bg-page"
                  >
                    <span className="grid size-12 place-items-center rounded-full bg-brand-100 text-brand-500">
                      <Camera className="size-5" aria-hidden />
                    </span>
                    <span>
                      <span className="block text-lg font-medium text-ink">Add a photo</span>
                      <span className="block text-sm text-subtle">JPG or PNG, up to {PHOTO_RULES.maxSizeMb} MB</span>
                    </span>
                  </label>
                )}
                <input
                  id="r-photo"
                  type="file"
                  accept={PHOTO_RULES.accept}
                  className="sr-only"
                  onChange={(e) => {
                    void onPhoto(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </Field>
            </div>
          </Card>

          <Card className="p-5 sm:p-9">
            <h2 className="text-2xl font-bold text-brand-900">
              Pin the location<span className="text-status-red" aria-hidden> *</span>
            </h2>
            <p className="mt-1 mb-5 text-muted">
              Drag the pin to the exact spot. This helps staff group duplicate reports and plan responses.
            </p>
            <LocationPicker
              value={location}
              onChange={(loc) => {
                setLocation(loc);
                clearError("location");
              }}
              otherReports={activeReports}
              invalid={!!errors.location}
            />
            {errors.location && (
              <p role="alert" className="mt-2 text-xs font-medium text-status-red">
                {errors.location}
              </p>
            )}

            {nearby.length > 0 && (
              <div className="mt-5 flex gap-3 rounded-2xl border border-warn-border bg-warn-bg px-5 py-4">
                <TriangleAlert className="mt-0.5 size-6 shrink-0 text-warn-ink" aria-hidden />
                <div>
                  <p className="font-bold text-warn-ink">
                    {nearby.length} similar report{nearby.length > 1 ? "s" : ""} nearby
                  </p>
                  <p className="text-warn-ink/90">
                    Filed within {MAP_CONFIG.nearbyRadiusMeters} m in the last {MAP_CONFIG.nearbyWindowHours} hours. You can still
                    submit; staff can group duplicates into one ticket.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <LinkButton href="/community-reports" variant="outline" size="lg">
            Cancel
          </LinkButton>
          <Button type="submit" size="lg" disabled={submitting} aria-busy={submitting}>
            {submitting ? (
              <>
                <LoaderCircle className="size-5 animate-spin" aria-hidden />
                Submitting…
              </>
            ) : (
              "Submit report"
            )}
          </Button>
        </div>
      </form>
    </>
  );
}
