"use client";

import { CircleCheck, Info, X } from "lucide-react";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { cn, uid } from "@/lib/utils";

type ToastTone = "success" | "info";
interface ToastItem {
  id: string;
  message: string;
  tone: ToastTone;
}

const ToastContext = createContext<(message: string, tone?: ToastTone) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const show = useCallback(
    (message: string, tone: ToastTone = "success") => {
      const id = uid();
      setToasts((t) => [...t, { id, message, tone }]);
      window.setTimeout(() => dismiss(id), 4500);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-3 bottom-4 z-[60] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:items-end"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-line bg-white px-4 py-3 text-sm shadow-lg"
          >
            {t.tone === "success" ? (
              <CircleCheck className="mt-0.5 size-5 shrink-0 text-status-green" aria-hidden />
            ) : (
              <Info className="mt-0.5 size-5 shrink-0 text-status-blue" aria-hidden />
            )}
            <p className={cn("flex-1 text-ink")}>{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="rounded text-muted hover:text-ink"
              aria-label="Dismiss notification"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
