import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandMark({ className, inverted = true }: { className?: string; inverted?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Logo cropped from the design reference — replace /public/baesa-logo.png with the original seal file. */}
      <Image
        src="/baesa-logo.png"
        alt="Barangay Baesa seal"
        width={48}
        height={48}
        className="size-12 shrink-0 rounded-full bg-white object-cover ring-2 ring-white/70"
        priority
      />
      <div className="leading-tight">
        <p className={cn("text-lg font-bold", inverted ? "text-white" : "text-brand-900")}>Barangay Baesa</p>
        <p className={cn("text-sm", inverted ? "text-sidebar-text" : "text-muted")}>E-Services</p>
      </div>
    </div>
  );
}
