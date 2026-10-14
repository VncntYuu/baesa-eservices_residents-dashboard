import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function MapImageryNotice({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      role="note"
      className={cn(
        "pointer-events-none absolute z-[500] flex max-w-sm items-start gap-2 rounded-xl bg-white/95 px-3 py-2 text-xs text-ink shadow",
        className,
      )}
    >
      <ImageOff className="mt-0.5 size-4 shrink-0 text-status-amber" aria-hidden />
      <span>{children}</span>
    </div>
  );
}
