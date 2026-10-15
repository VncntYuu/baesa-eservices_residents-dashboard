"use client";

import { FileText, Upload } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { VALID_ID_RULES } from "@/lib/config/services";
import { cn } from "@/lib/utils";

export function validateIdFile(file: File): string | null {
  const ext = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
  if (!VALID_ID_RULES.extensions.includes(ext)) return "Please upload a JPG, PNG or PDF file.";
  if (file.size > VALID_ID_RULES.maxSizeMb * 1024 * 1024) return `The file must be ${VALID_ID_RULES.maxSizeMb} MB or smaller.`;
  return null;
}

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** "Upload Valid ID" control from the request form reference: input-styled picker, then a file row with replace/remove. */
export function ValidIdUpload({
  id,
  file,
  onChange,
  error,
  onError,
}: {
  id: string;
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  onError: (message: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrl = useMemo(() => (file && file.type.startsWith("image/") ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => void (previewUrl && URL.revokeObjectURL(previewUrl)), [previewUrl]);

  const pick = (f: File | undefined) => {
    if (!f) return;
    const problem = validateIdFile(f);
    if (problem) {
      onError(problem);
      return;
    }
    onChange(f);
  };

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
        Upload Valid ID<span className="text-status-red"> *</span>
        <span className="sr-only"> (required)</span>
      </label>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={VALID_ID_RULES.accept}
        className="sr-only"
        aria-invalid={!!error || undefined}
        aria-describedby={`${id}-help${error ? ` ${id}-error` : ""}`}
        onChange={(e) => {
          pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {file ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#dce4df] bg-white p-3">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- local preview of the chosen file
            <img src={previewUrl} alt="Preview of your uploaded ID" className="size-14 rounded-lg object-cover" />
          ) : (
            <span className="grid size-14 place-items-center rounded-lg bg-brand-100 text-brand-500">
              <FileText className="size-6" aria-hidden />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-ink">{file.name}</p>
            <p className="text-sm text-subtle">{formatSize(file.size)}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
              Replace
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onChange(null)} aria-label={`Remove ${file.name}`}>
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex h-12 w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 text-left text-[15px] text-[#a3b0aa] transition-colors hover:border-brand-400 focus-visible:outline-2 focus-visible:outline-brand-500",
            error ? "border-status-red" : "border-[#dce4df]",
          )}
        >
          Choose file to upload (Valid ID)
          <Upload className="size-5 text-muted" aria-hidden />
        </button>
      )}
      <p id={`${id}-help`} className="mt-1.5 text-xs text-muted">
        Accepted formats: JPG, PNG, PDF (Max size: {VALID_ID_RULES.maxSizeMb}MB)
      </p>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs font-medium text-status-red">
          {error}
        </p>
      )}
    </div>
  );
}
