"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

/**
 * Native <dialog> shell: focus trapping, Esc to close and an inert page behind
 * come for free. `Dialog` and the request form modal both build on it.
 */
export function ModalShell({
  open,
  onClose,
  labelledBy,
  className,
  children,
  closeOnBackdrop = true,
}: {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  className?: string;
  children: ReactNode;
  closeOnBackdrop?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  // Set while we close the dialog ourselves, so that close doesn't count as the resident dismissing it.
  const silentClose = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
    // Next.js keeps visited pages mounted but hidden (React <Activity>), which runs this cleanup.
    // A modal <dialog> left open would stay in the top layer and block the page now on screen,
    // so close it quietly; the effect reopens it if the page is shown again.
    return () => {
      if (el.open) {
        silentClose.current = true;
        el.close();
      }
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onClose={() => {
        if (silentClose.current) {
          silentClose.current = false;
          return;
        }
        onClose();
      }}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (closeOnBackdrop && e.target === ref.current) onClose();
      }}
      className={cn("m-auto w-[calc(100%-1.5rem)] rounded-2xl bg-white p-0 text-ink shadow-2xl", className)}
    >
      {open && children}
    </dialog>
  );
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const titleId = useId();

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      className={cn(size === "sm" && "max-w-md", size === "md" && "max-w-xl", size === "lg" && "max-w-3xl")}
    >
      {(
        <div className="flex max-h-[85dvh] flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
            <div className="min-w-0">
              <h2 id={titleId} className="text-lg font-bold text-brand-900">
                {title}
              </h2>
              {description && <div className="mt-0.5 text-sm text-muted">{description}</div>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="-mr-2 grid size-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-brand-50 hover:text-ink focus-visible:outline-2 focus-visible:outline-brand-500"
              aria-label="Close dialog"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>
          <div className="overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
          {footer && (
            <div className="flex flex-col-reverse gap-2 border-t border-line px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              {footer}
            </div>
          )}
        </div>
      )}
    </ModalShell>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "primary",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "primary" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} autoFocus>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="text-sm text-muted">{message}</div>
    </Dialog>
  );
}
