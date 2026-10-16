"use client";

import { Camera, IdCard, RotateCcw } from "lucide-react";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { ResidentAvatar } from "@/components/layout/ResidentAvatar";
import { useResidentData } from "@/components/layout/ResidentShell";
import { ValidIdUpload } from "@/components/requests/ValidIdUpload";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog, Dialog } from "@/components/ui/Dialog";
import { Field, Select, TextInput, describedBy } from "@/components/ui/FormControls";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pill } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import { compressImage } from "@/lib/image";
import { resetDemoData, setProfilePhoto, setProfileValidId, updateProfile, type ProfilePatch } from "@/lib/store/portal-store";
import type { ResidentProfile } from "@/lib/types";
import { cn, formatDate, isValidPhMobile, toYMD } from "@/lib/utils";

/* ------------------------------ Options ------------------------------ */

const SEX_OPTIONS = ["Female", "Male", "Prefer not to say"];
const CIVIL_STATUS_OPTIONS = ["Single", "Married", "Widowed", "Separated", "Annulled"];
const VOTER_OPTIONS = ["Yes", "No"];
export const ID_TYPES = [
  "Driver's License",
  "Passport",
  "PhilSys National ID",
  "UMID",
  "Postal ID",
  "Voter's ID",
  "PRC ID",
  "Senior Citizen ID",
  "Other government ID",
];

/* ------------------------------ Helpers ------------------------------ */

function longDate(ymdOrIso: string) {
  const d = ymdOrIso.length === 10 ? new Date(`${ymdOrIso}T12:00:00+08:00`) : new Date(ymdOrIso);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "Asia/Manila" });
}

function years(v: string) {
  if (!v) return "";
  const n = Number(v);
  return `${n} year${n === 1 ? "" : "s"}`;
}

/** Label / value pair in the profile cards. */
function Info({ label, value, className }: { label: string; value?: ReactNode; className?: string }) {
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-0.5 text-lg font-medium break-words text-ink">{value || "—"}</dd>
    </div>
  );
}

/** Profile section card with an Edit button that switches it to a form (Save / Cancel). */
function SectionCard({
  id,
  title,
  editing,
  onEdit,
  onCancel,
  onSave,
  children,
}: {
  id: string;
  title: string;
  editing?: boolean;
  onEdit?: () => void;
  onCancel?: () => void;
  onSave?: (e: FormEvent) => void;
  children: ReactNode;
}) {
  const head = (
    <div className="mb-6 flex items-center justify-between gap-3">
      <h2 id={`${id}-title`} className="text-xl font-semibold text-brand-900 sm:text-2xl">
        {title}
      </h2>
      {onEdit &&
        (editing ? (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save
            </Button>
          </div>
        ) : (
          <Button variant="soft" size="sm" onClick={onEdit} aria-label={`Edit ${title}`}>
            Edit
          </Button>
        ))}
    </div>
  );
  return (
    <Card id={id} aria-labelledby={`${id}-title`} role="region" className="scroll-mt-28 p-5 shadow-none sm:p-8">
      {editing ? (
        <form noValidate onSubmit={onSave}>
          {head}
          {children}
        </form>
      ) : (
        <>
          {head}
          {children}
        </>
      )}
    </Card>
  );
}

type Errors = Record<string, string>;

function useSectionForm<T extends Record<string, string>>(initial: () => T) {
  const [values, setValues] = useState<T>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const set = (k: keyof T & string, v: string) => {
    setValues((s) => ({ ...s, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  };
  return { values, setValues, errors, setErrors, set };
}

function focusFirst(prefix: string, order: string[], errs: Errors) {
  const first = order.find((k) => errs[k]);
  if (first) document.getElementById(`${prefix}-${first}`)?.focus();
  return Boolean(first);
}

/* ------------------------- Personal information ------------------------- */

function personalValues(r: ResidentProfile) {
  return {
    firstName: r.firstName,
    middleName: r.middleName ?? "",
    lastName: r.lastName,
    suffix: r.suffix ?? "",
    sex: r.sex,
    birthDate: r.birthDate,
    civilStatus: r.civilStatus,
    nationality: r.nationality,
  };
}

function PersonalSection({ resident, editing, setEditing }: { resident: ResidentProfile; editing: boolean; setEditing: (v: boolean) => void }) {
  const toast = useToast();
  const f = useSectionForm(() => personalValues(resident));
  const v = f.values;

  const save = (e: FormEvent) => {
    e.preventDefault();
    const errs: Errors = {};
    if (!v.firstName.trim()) errs.firstName = "Enter your first name.";
    if (!v.lastName.trim()) errs.lastName = "Enter your last name.";
    if (!v.sex) errs.sex = "Choose an option.";
    if (!v.birthDate) errs.birthDate = "Enter your date of birth.";
    else if (v.birthDate > toYMD(new Date())) errs.birthDate = "Date of birth can't be in the future.";
    else if (v.birthDate < "1900-01-01") errs.birthDate = "Check the year.";
    if (!v.civilStatus) errs.civilStatus = "Choose your civil status.";
    if (!v.nationality.trim()) errs.nationality = "Enter your nationality.";
    f.setErrors(errs);
    if (focusFirst("pf", ["firstName", "lastName", "sex", "birthDate", "civilStatus", "nationality"], errs)) return;
    const patch: ProfilePatch = Object.fromEntries(Object.entries(v).map(([k, val]) => [k, val.trim()]));
    updateProfile(patch, "Your personal information was updated.");
    setEditing(false);
    toast("Personal information saved.");
  };

  const input = (k: keyof typeof v, label: string, opts: { required?: boolean; placeholder?: string; type?: string; autoComplete?: string } = {}) => (
    <Field id={`pf-${k}`} label={label} required={opts.required} error={f.errors[k]}>
      <TextInput
        id={`pf-${k}`}
        type={opts.type}
        value={v[k]}
        placeholder={opts.placeholder}
        autoComplete={opts.autoComplete}
        maxLength={60}
        max={opts.type === "date" ? toYMD(new Date()) : undefined}
        onChange={(e) => f.set(k, e.target.value)}
        invalid={!!f.errors[k]}
        aria-describedby={describedBy(`pf-${k}`, f.errors[k])}
        aria-required={opts.required || undefined}
      />
    </Field>
  );
  const select = (k: keyof typeof v, label: string, options: string[]) => (
    <Field id={`pf-${k}`} label={label} required error={f.errors[k]}>
      <Select
        id={`pf-${k}`}
        value={v[k]}
        onChange={(e) => f.set(k, e.target.value)}
        invalid={!!f.errors[k]}
        aria-describedby={describedBy(`pf-${k}`, f.errors[k])}
        aria-required
      >
        <option value="">-- Select --</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </Select>
    </Field>
  );

  return (
    <SectionCard
      id="personal"
      title="Personal Information"
      editing={editing}
      onEdit={() => {
        f.setValues(personalValues(resident));
        f.setErrors({});
        setEditing(true);
      }}
      onCancel={() => setEditing(false)}
      onSave={save}
    >
      {editing ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {input("firstName", "First Name", { required: true, autoComplete: "given-name" })}
          {input("middleName", "Middle Name", { autoComplete: "additional-name" })}
          {input("lastName", "Last Name", { required: true, autoComplete: "family-name" })}
          {input("suffix", "Suffix", { placeholder: "e.g., Jr., Sr., III" })}
          {select("sex", "Sex", SEX_OPTIONS)}
          {input("birthDate", "Date of Birth", { required: true, type: "date", autoComplete: "bday" })}
          {select("civilStatus", "Civil Status", CIVIL_STATUS_OPTIONS)}
          {input("nationality", "Nationality", { required: true })}
        </div>
      ) : (
        <dl className="grid grid-cols-2 gap-x-6 gap-y-5 xl:grid-cols-4">
          <Info label="First Name" value={resident.firstName} />
          <Info label="Middle Name" value={resident.middleName} />
          <Info label="Last Name" value={resident.lastName} />
          <Info label="Suffix" value={resident.suffix} />
          <Info label="Sex" value={resident.sex} />
          <Info label="Date of Birth" value={resident.birthDate ? longDate(resident.birthDate) : ""} />
          <Info label="Civil Status" value={resident.civilStatus} />
          <Info label="Nationality" value={resident.nationality} />
        </dl>
      )}
    </SectionCard>
  );
}

/* --------------------------- Contact & address --------------------------- */

function contactValues(r: ResidentProfile) {
  return {
    contactNumber: r.contactNumber,
    email: r.email,
    address: r.address,
    yearsOfResidency: r.yearsOfResidency,
    purok: r.purok,
    registeredVoter: r.registeredVoter as string,
  };
}

function ContactSection({ resident, editing, setEditing }: { resident: ResidentProfile; editing: boolean; setEditing: (v: boolean) => void }) {
  const toast = useToast();
  const f = useSectionForm(() => contactValues(resident));
  const v = f.values;

  const save = (e: FormEvent) => {
    e.preventDefault();
    const errs: Errors = {};
    if (!isValidPhMobile(v.contactNumber)) errs.contactNumber = "Use a Philippine mobile number, e.g. 0917 123 4567 or +63 917 123 4567.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) errs.email = "Enter a valid email address.";
    if (v.address.trim().length < 5) errs.address = "Enter your complete address.";
    const yrs = Number(v.yearsOfResidency);
    if (v.yearsOfResidency === "" || !Number.isInteger(yrs) || yrs < 0 || yrs > 120) errs.yearsOfResidency = "Enter whole years, from 0 to 120.";
    if (!v.purok.trim()) errs.purok = "Enter your purok or zone.";
    f.setErrors(errs);
    if (focusFirst("pc", ["contactNumber", "email", "address", "yearsOfResidency", "purok"], errs)) return;
    updateProfile(
      {
        contactNumber: v.contactNumber.trim(),
        email: v.email.trim(),
        address: v.address.trim(),
        yearsOfResidency: String(yrs),
        purok: v.purok.trim(),
        registeredVoter: v.registeredVoter as ResidentProfile["registeredVoter"],
      },
      "Your contact details and address were updated.",
    );
    setEditing(false);
    toast("Contact & address saved.");
  };

  const err = (k: string) => f.errors[k];
  return (
    <SectionCard
      id="contact"
      title="Contact & Address"
      editing={editing}
      onEdit={() => {
        f.setValues(contactValues(resident));
        f.setErrors({});
        setEditing(true);
      }}
      onCancel={() => setEditing(false)}
      onSave={save}
    >
      {editing ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <Field id="pc-contactNumber" label="Mobile Number" required error={err("contactNumber")} className="lg:col-span-3">
            <TextInput
              id="pc-contactNumber"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+63 9XX XXX XXXX"
              maxLength={20}
              value={v.contactNumber}
              onChange={(e) => f.set("contactNumber", e.target.value)}
              invalid={!!err("contactNumber")}
              aria-describedby={describedBy("pc-contactNumber", err("contactNumber"))}
              aria-required
            />
          </Field>
          <Field id="pc-email" label="Email Address" required error={err("email")} className="lg:col-span-3">
            <TextInput
              id="pc-email"
              type="email"
              autoComplete="email"
              maxLength={120}
              value={v.email}
              onChange={(e) => f.set("email", e.target.value)}
              invalid={!!err("email")}
              aria-describedby={describedBy("pc-email", err("email"))}
              aria-required
            />
          </Field>
          <Field id="pc-address" label="Address" required error={err("address")} className="sm:col-span-2 lg:col-span-6">
            <TextInput
              id="pc-address"
              autoComplete="street-address"
              placeholder="Ex: 24 Sampaguita Street, Barangay Baesa, Quezon City"
              maxLength={200}
              value={v.address}
              onChange={(e) => f.set("address", e.target.value)}
              invalid={!!err("address")}
              aria-describedby={describedBy("pc-address", err("address"))}
              aria-required
            />
          </Field>
          <Field id="pc-yearsOfResidency" label="Years of Residency" required error={err("yearsOfResidency")} className="lg:col-span-2">
            <TextInput
              id="pc-yearsOfResidency"
              type="number"
              inputMode="numeric"
              min={0}
              max={120}
              step={1}
              value={v.yearsOfResidency}
              onChange={(e) => f.set("yearsOfResidency", e.target.value)}
              invalid={!!err("yearsOfResidency")}
              aria-describedby={describedBy("pc-yearsOfResidency", err("yearsOfResidency"))}
              aria-required
            />
          </Field>
          <Field id="pc-purok" label="Purok / Zone" required error={err("purok")} className="lg:col-span-2">
            <TextInput
              id="pc-purok"
              placeholder="e.g. Purok 2"
              maxLength={40}
              value={v.purok}
              onChange={(e) => f.set("purok", e.target.value)}
              invalid={!!err("purok")}
              aria-describedby={describedBy("pc-purok", err("purok"))}
              aria-required
            />
          </Field>
          <Field id="pc-registeredVoter" label="Registered Voter" className="sm:col-span-2 lg:col-span-2">
            <Select id="pc-registeredVoter" value={v.registeredVoter} onChange={(e) => f.set("registeredVoter", e.target.value)}>
              <option value="">-- Select --</option>
              {VOTER_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Select>
          </Field>
        </div>
      ) : (
        <dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-6">
          <Info label="Mobile Number" value={resident.contactNumber} className="sm:col-span-3" />
          <Info label="Email Address" value={resident.email} className="sm:col-span-3" />
          <Info label="Address" value={resident.address} className="sm:col-span-6" />
          <Info label="Years of Residency" value={years(resident.yearsOfResidency)} className="sm:col-span-2" />
          <Info label="Purok / Zone" value={resident.purok} className="sm:col-span-2" />
          <Info label="Registered Voter" value={resident.registeredVoter} className="sm:col-span-2" />
        </dl>
      )}
    </SectionCard>
  );
}

/* ------------------------- Identity & documents ------------------------- */

function IdDocumentSection({ resident }: { resident: ResidentProfile }) {
  const toast = useToast();
  const [viewing, setViewing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [idType, setIdType] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const doc = resident.validId;

  const openUpload = () => {
    setViewing(false);
    setIdType(doc?.idType ?? "");
    setFile(null);
    setErrors({});
    setUploading(true);
  };

  const saveUpload = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Errors = {};
    if (!idType) errs.idType = "Choose the type of ID.";
    if (!file) errs.file = "Choose the ID file to upload.";
    setErrors(errs);
    if (errs.idType) return document.getElementById("id-type")?.focus();
    if (!file) return document.getElementById("id-file")?.focus();
    let previewDataUrl: string | undefined;
    if (file.type.startsWith("image/")) {
      try {
        previewDataUrl = await compressImage(file, 900, 0.75);
      } catch {
        /* keep the details without a preview */
      }
    }
    setProfileValidId({ idType, fileName: file.name, mimeType: file.type, size: file.size, uploadedAt: new Date().toISOString(), previewDataUrl });
    setUploading(false);
    toast("Valid ID saved to your profile.");
  };

  return (
    <SectionCard id="documents" title="Identity & Documents">
      <div className="flex flex-col gap-4 rounded-2xl bg-page p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-white text-ink">
            <IdCard className="size-6" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-lg font-semibold text-ink">Valid Government ID</p>
            <p className="text-sm break-words text-muted">
              {doc ? `${doc.idType} · ${doc.fileName} · Uploaded ${formatDate(doc.uploadedAt)}` : "No ID uploaded yet. Add one to speed up your requests."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:shrink-0">
          <Pill tone={doc ? "green" : "gray"}>{doc ? "Uploaded" : "Not uploaded"}</Pill>
          {doc ? (
            <Button variant="outline" size="sm" className="border-transparent bg-white" onClick={() => setViewing(true)}>
              View
            </Button>
          ) : (
            <Button size="sm" onClick={openUpload}>
              Upload
            </Button>
          )}
        </div>
      </div>
      <p className="mt-3 text-xs text-subtle">
        Demo: the ID file stays in this browser. Barangay staff verification is not connected yet.
      </p>

      <Dialog
        open={viewing}
        onClose={() => setViewing(false)}
        title="Valid Government ID"
        description={doc ? `${doc.idType} · Uploaded ${formatDate(doc.uploadedAt)}` : undefined}
        footer={
          <>
            <Button variant="outline" onClick={() => setViewing(false)}>
              Close
            </Button>
            <Button onClick={openUpload}>Replace ID</Button>
          </>
        }
      >
        {doc && (
          <div className="space-y-4 text-sm">
            {doc.previewDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- preview stored in this browser
              <img src={doc.previewDataUrl} alt={`Uploaded ${doc.idType}`} className="max-h-80 w-auto max-w-full rounded-xl border border-line object-contain" />
            ) : (
              <p className="rounded-xl bg-page px-4 py-6 text-center text-muted">
                No preview available for this file{doc.mimeType === "application/pdf" ? " (PDF)" : " in the demo"}.
              </p>
            )}
            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-page px-3 py-2">
                <dt className="text-xs font-semibold text-subtle">File</dt>
                <dd className="font-medium break-all text-ink">{doc.fileName}</dd>
              </div>
              <div className="rounded-lg bg-page px-3 py-2">
                <dt className="text-xs font-semibold text-subtle">Size</dt>
                <dd className="font-medium text-ink">{Math.max(1, Math.round(doc.size / 1024))} KB</dd>
              </div>
            </dl>
          </div>
        )}
      </Dialog>

      <Dialog open={uploading} onClose={() => setUploading(false)} title={doc ? "Replace valid ID" : "Upload valid ID"}>
        <form noValidate onSubmit={saveUpload} className="space-y-5">
          <Field id="id-type" label="Type of ID" required error={errors.idType}>
            <Select
              id="id-type"
              value={idType}
              onChange={(e) => {
                setIdType(e.target.value);
                setErrors((x) => ({ ...x, idType: "" }));
              }}
              invalid={!!errors.idType}
              aria-describedby={describedBy("id-type", errors.idType)}
              aria-required
            >
              <option value="">-- Select ID type --</option>
              {ID_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          </Field>
          <ValidIdUpload
            id="id-file"
            file={file}
            onChange={(next) => {
              setFile(next);
              setErrors((x) => ({ ...x, file: "" }));
            }}
            error={errors.file}
            onError={(m) => setErrors((x) => ({ ...x, file: m }))}
          />
          <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setUploading(false)}>
              Cancel
            </Button>
            <Button type="submit">Save ID</Button>
          </div>
        </form>
      </Dialog>
    </SectionCard>
  );
}

/* ------------------------------- Summary ------------------------------- */

function SummaryCard({ resident }: { resident: ResidentProfile }) {
  const { requests } = useResidentData();
  const toast = useToast();
  const photoInput = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState("");
  const fullName = [resident.firstName, resident.middleName, resident.lastName, resident.suffix].filter(Boolean).join(" ");

  const onPhoto = async (file: File | undefined) => {
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) return setPhotoError("Choose a JPG or PNG photo.");
    if (file.size > 5 * 1024 * 1024) return setPhotoError("The photo must be 5 MB or smaller.");
    try {
      setProfilePhoto(await compressImage(file, 320, 0.82));
      setPhotoError("");
      toast("Profile photo updated.");
    } catch {
      setPhotoError("That photo couldn't be read. Try another one.");
    }
  };

  const stats = [
    { label: "Total", value: requests.length, className: "text-ink" },
    { label: "Pending", value: requests.filter((r) => r.status === "Pending").length, className: "text-status-red" },
    { label: "Approved", value: requests.filter((r) => r.status === "Completed").length, className: "text-status-green" },
  ];

  return (
    <Card className="p-6 shadow-none sm:p-8 lg:sticky lg:top-28">
      <div className="flex flex-col items-center text-center">
        <ResidentAvatar resident={resident} className="size-28 text-5xl" />
        <div className="mt-2 flex items-center gap-3 text-sm">
          <button
            type="button"
            onClick={() => photoInput.current?.click()}
            className="inline-flex items-center gap-1 rounded font-medium text-brand-500 hover:underline focus-visible:outline-2 focus-visible:outline-brand-500"
          >
            <Camera className="size-3.5" aria-hidden />
            Change photo
          </button>
          {resident.photoDataUrl && (
            <button
              type="button"
              onClick={() => setProfilePhoto(undefined)}
              className="rounded font-medium text-muted hover:underline focus-visible:outline-2 focus-visible:outline-brand-500"
            >
              Remove
            </button>
          )}
        </div>
        <input
          ref={photoInput}
          type="file"
          accept="image/jpeg,image/png"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => {
            void onPhoto(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        {photoError && (
          <p role="alert" className="mt-1 text-xs text-status-red">
            {photoError}
          </p>
        )}
        <p className="mt-2 text-2xl font-bold text-ink">{fullName}</p>
        <p className="mt-1 text-muted">Barangay Resident</p>
        <Pill tone="green" className="mt-2 text-sm">
          Active Account
        </Pill>
      </div>

      <dl className="mt-6 space-y-4 border-t border-line pt-6">
        <Info label="Resident ID" value={resident.residentId} />
        <Info label="Email Address" value={resident.email} />
        <Info label="Mobile Number" value={resident.contactNumber} />
        <Info label="Member Since" value={longDate(resident.memberSince)} />
      </dl>

      <div className="mt-6 border-t border-line pt-6">
        <h2 className="font-semibold text-brand-900 sm:text-lg">My Requests Summary</h2>
        <dl className="mt-4 grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse items-center rounded-xl bg-page px-2 py-4">
              <dt className="text-sm text-muted">{s.label}</dt>
              <dd className={cn("text-3xl font-bold tabular-nums", s.className)}>{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Card>
  );
}

/* --------------------------------- Page --------------------------------- */

export function ProfileView() {
  const { resident } = useResidentData();
  const toast = useToast();
  const [editPersonal, setEditPersonal] = useState(false);
  const [editContact, setEditContact] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <>
      <PageHeader
        title="My Profile"
        description="View and manage your personal information and verification status."
        back={{ href: "/dashboard", label: "Return to Dashboard" }}
        actions={
          <Button
            size="lg"
            onClick={() => {
              setEditPersonal(true);
              setEditContact(true);
              requestAnimationFrame(() => {
                document.getElementById("personal")?.scrollIntoView({ behavior: "smooth", block: "start" });
                document.getElementById("pf-firstName")?.focus({ preventScroll: true });
              });
            }}
          >
            Edit Profile
          </Button>
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <SummaryCard resident={resident} />
        <div className="min-w-0 space-y-6">
          {/* Keyed so each edit starts from the latest saved values. */}
          <PersonalSection key={`p-${editPersonal}`} resident={resident} editing={editPersonal} setEditing={setEditPersonal} />
          <ContactSection key={`c-${editContact}`} resident={resident} editing={editContact} setEditing={setEditContact} />
          <IdDocumentSection resident={resident} />

          <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-line px-5 py-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>Demo data: your profile, requests, reports and appointments are saved in this browser only.</p>
            <Button variant="ghost" size="sm" onClick={() => setConfirmReset(true)}>
              <RotateCcw className="size-4" aria-hidden />
              Reset demo data
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Reset demo data?"
        message="This restores the sample profile, requests, reports, appointments and notifications stored in this browser."
        confirmLabel="Reset"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          setConfirmReset(false);
          setEditPersonal(false);
          setEditContact(false);
          resetDemoData();
          toast("Demo data has been reset.", "info");
        }}
      />
    </>
  );
}
