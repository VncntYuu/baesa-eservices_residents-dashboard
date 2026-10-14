"use client";

import { Camera, CircleCheck, TriangleAlert, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useResidentData } from "@/components/layout/ResidentShell";
import { LocationPicker } from "@/components/reports/maps";
import { CategoryTag } from "@/components/reports/ReportDetails";
import { Button, LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { Field, TextArea, TextInput, describedBy } from "@/components/ui/FormControls";
import { PageHeader } from "@/components/ui/PageHeader";
import { MAP_CONFIG, PHOTO_RULES, REPORT_CATEGORIES } from "@/lib/config/reports";
import { submitCommunityReport } from "@/lib/store/portal-store";
import type { CommunityReport, GeoLocation, ReportCategory, ReportKind } from "@/lib/types";
import { cn, distanceMeters, formatCoords } from "@/lib/utils";

type Errors = Partial<Record<"category" | "title" | "description" | "location" | "photo", string>>;

export function NewReportView() {
  const { reports } = useResidentData();
  const [kind, setKind] = useState<ReportKind>("Complaint");
  const [category, setCategory] = useState<ReportCategory | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [reviewOpen, setReviewOpen] = useState(false);
  const [submitted, setSubmitted] = useState<CommunityReport | null>(null);
  const [now] = useState(() => Date.now());
  const activeReports = useMemo(() => reports.filter((r) => r.status !== "Resolved"), [reports]);

  // Free the photo preview URL when it changes / on unmount.
  useEffect(() => () => void (photoUrl && URL.revokeObjectURL(photoUrl)), [photoUrl]);

  const nearby = location
    ? reports.filter(
        (r) =>
          r.status !== "Resolved" &&
          (!category || r.category === category) &&
          distanceMeters(r.location, location) <= MAP_CONFIG.nearbyRadiusMeters &&
          now - new Date(r.submittedAt).getTime() <= MAP_CONFIG.nearbyWindowHours * 3_600_000,
      )
    : [];

  const clearError = (k: keyof Errors) => errors[k] && setErrors((e) => ({ ...e, [k]: undefined }));

  const onPhoto = (file: File | undefined) => {
    if (!file) return;
    if (!PHOTO_RULES.accept.split(",").includes(file.type)) {
      setErrors((e) => ({ ...e, photo: "Please choose a JPG or PNG image." }));
      return;
    }
    if (file.size > PHOTO_RULES.maxSizeMb * 1024 * 1024) {
      setErrors((e) => ({ ...e, photo: `Image must be ${PHOTO_RULES.maxSizeMb} MB or smaller.` }));
      return;
    }
    clearError("photo");
    setPhoto(file);
    setPhotoUrl(URL.createObjectURL(file));
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (!category) e.category = "Please choose a category.";
    if (title.trim().length < 5) e.title = "Please enter a title (at least 5 characters).";
    if (description.trim().length < 10) e.description = "Please describe the issue (at least 10 characters).";
    if (!location) e.location = "Please pin the location on the map.";
    return e;
  };

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    const first = (["category", "title", "description", "location"] as const).find((k) => e[k]);
    if (first) {
      const target = first === "category" ? "cat-0" : first === "location" ? "map-search" : `r-${first}`;
      document.getElementById(target)?.focus();
      return;
    }
    setReviewOpen(true);
  };

  const confirm = () => {
    if (!category || !location) return;
    const report = submitCommunityReport({
      kind,
      category,
      title: title.trim(),
      description: description.trim(),
      photoName: photo?.name,
      location,
    });
    setReviewOpen(false);
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
          <h1 className="mt-5 text-2xl font-extrabold text-brand-900 sm:text-3xl">Report submitted</h1>
          <p className="mt-2 text-muted">Thank you for helping improve Barangay Baesa.</p>
          <div className="mx-auto mt-6 max-w-md rounded-xl bg-page px-4 py-3 text-left">
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">Report reference number</p>
            <p className="font-mono text-lg font-bold text-ink">{submitted.referenceNo}</p>
            <p className="mt-1 text-sm text-muted">
              {submitted.location.label} · {formatCoords(submitted.location.lat, submitted.location.lng)}
            </p>
          </div>
          <p className="mt-4 text-xs text-muted">Demo: the report is saved in this browser only and was not sent to barangay staff.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <LinkButton href="/community-reports?tab=mine">View my reports</LinkButton>
            <LinkButton href="/community-reports?tab=map" variant="outline">
              See community map
            </LinkButton>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="File a Report"
        description="Describe the problem and pin its exact location so barangay staff can respond faster."
        back={{ href: "/community-reports", label: "Back to Complaints" }}
      />

      <form onSubmit={onSubmit} noValidate>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <Card className="p-5 sm:p-8">
            <h2 className="text-xl font-bold text-brand-900">Report details</h2>

            <div role="radiogroup" aria-label="Type" className="mt-5 grid grid-cols-2 gap-1 rounded-xl bg-page p-1">
              {(["Complaint", "Report"] as ReportKind[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={kind === k}
                  onClick={() => setKind(k)}
                  className={cn(
                    "h-11 rounded-lg text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-brand-500",
                    kind === k ? "bg-brand-500 text-white shadow" : "text-ink hover:bg-white",
                  )}
                >
                  {k}
                </button>
              ))}
            </div>

            <fieldset className="mt-6" aria-describedby={errors.category ? "cat-error" : undefined}>
              <legend className="mb-2 text-sm font-semibold text-ink">
                Category<span className="text-status-red" aria-hidden> *</span>
                <span className="sr-only"> (required)</span>
              </legend>
              <div role="radiogroup" aria-label="Category" className="flex flex-wrap gap-2">
                {REPORT_CATEGORIES.map((c, i) => {
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
                        "inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
                        active ? "border-brand-500 bg-brand-500 text-white" : "border-line bg-white text-ink hover:bg-brand-50",
                        errors.category && !active && "border-status-red/60",
                      )}
                    >
                      {!active && <span className="size-2.5 rounded-full" style={{ backgroundColor: c.color }} aria-hidden />}
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
              <Field id="r-title" label="Title" required error={errors.title}>
                <TextInput
                  id="r-title"
                  value={title}
                  maxLength={120}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    clearError("title");
                  }}
                  placeholder="e.g. Garbage piled up near the corner of Ramos St."
                  invalid={!!errors.title}
                  aria-describedby={describedBy("r-title", errors.title)}
                  aria-required
                />
              </Field>

              <Field id="r-description" label="Description" required error={errors.description}>
                <TextArea
                  id="r-description"
                  value={description}
                  maxLength={1500}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    clearError("description");
                  }}
                  placeholder="What is the problem, since when, and who is affected?"
                  invalid={!!errors.description}
                  aria-describedby={describedBy("r-description", errors.description)}
                  aria-required
                  rows={5}
                />
              </Field>

              <Field id="r-photo" label="Photo (optional)" error={errors.photo}>
                {photo && photoUrl ? (
                  <div className="flex items-center gap-3 rounded-xl border border-line p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
                    <img src={photoUrl} alt="Selected photo preview" className="size-16 rounded-lg object-cover" />
                    <p className="min-w-0 flex-1 truncate text-sm font-medium">{photo.name}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setPhoto(null);
                        setPhotoUrl(null);
                      }}
                      className="rounded-lg p-2 text-muted hover:bg-status-red-bg hover:text-status-red"
                      aria-label="Remove photo"
                    >
                      <X className="size-4" aria-hidden />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="r-photo"
                    className="flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed border-line bg-page/60 px-4 py-4 hover:border-brand-200 hover:bg-brand-50"
                  >
                    <span className="grid size-11 place-items-center rounded-full bg-brand-100 text-brand-500">
                      <Camera className="size-5" aria-hidden />
                    </span>
                    <span>
                      <span className="block font-semibold text-ink">Add a photo</span>
                      <span className="block text-sm text-muted">JPG or PNG, up to {PHOTO_RULES.maxSizeMb} MB</span>
                    </span>
                  </label>
                )}
                <input
                  id="r-photo"
                  type="file"
                  accept={PHOTO_RULES.accept}
                  className="sr-only"
                  onChange={(e) => {
                    onPhoto(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </Field>
            </div>
          </Card>

          <Card className="p-5 sm:p-8">
            <h2 className="text-xl font-bold text-brand-900">
              Pin the location<span className="text-status-red" aria-hidden> *</span>
            </h2>
            <p className="mt-1 mb-5 text-sm text-muted">
              Search, tap the map, or drag the pin to the exact spot. This helps staff find related reports and plan responses.
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
              <div className="mt-5 flex gap-3 rounded-xl border border-[#e8cf86] bg-status-amber-bg px-4 py-3 text-sm">
                <TriangleAlert className="mt-0.5 size-5 shrink-0 text-status-amber" aria-hidden />
                <div>
                  <p className="font-bold text-status-amber">
                    {nearby.length} similar report{nearby.length > 1 ? "s" : ""} nearby
                  </p>
                  <p className="text-ink/80">
                    Filed within {MAP_CONFIG.nearbyRadiusMeters} m in the last {MAP_CONFIG.nearbyWindowHours} hours. You can still
                    submit — staff can review nearby reports together.
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
          <Button type="submit" size="lg">
            Review report
          </Button>
        </div>
      </form>

      <Dialog
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        title="Review your report"
        description="Check the details before submitting."
        footer={
          <>
            <Button variant="outline" onClick={() => setReviewOpen(false)}>
              Edit report
            </Button>
            <Button onClick={confirm}>Submit report</Button>
          </>
        }
      >
        <dl className="space-y-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <dt className="sr-only">Type and category</dt>
            <dd className="font-semibold">{kind}</dd>
            {category && (
              <dd>
                <CategoryTag category={category} />
              </dd>
            )}
          </div>
          <div>
            <dt className="text-xs font-semibold text-muted uppercase">Title</dt>
            <dd className="font-medium">{title}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-muted uppercase">Description</dt>
            <dd className="font-medium whitespace-pre-line">{description}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-muted uppercase">Location</dt>
            <dd className="font-medium">
              {location?.label}
              {location && <span className="block text-xs text-muted">{formatCoords(location.lat, location.lng)}</span>}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-muted uppercase">Photo</dt>
            <dd className="font-medium">{photo?.name ?? "None"}</dd>
          </div>
        </dl>
      </Dialog>
    </>
  );
}
