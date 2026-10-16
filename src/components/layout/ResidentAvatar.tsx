/* eslint-disable @next/next/no-img-element -- profile photo is a local data URL in the demo */
import type { ResidentProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Round avatar: the resident's photo when set, otherwise their first initial on green. */
export function ResidentAvatar({ resident, className }: { resident: ResidentProfile; className?: string }) {
  return resident.photoDataUrl ? (
    <img src={resident.photoDataUrl} alt="" className={cn("shrink-0 rounded-full object-cover", className)} />
  ) : (
    <span aria-hidden className={cn("grid shrink-0 place-items-center rounded-full bg-brand-500 font-bold text-white", className)}>
      {resident.firstName.charAt(0).toUpperCase()}
    </span>
  );
}
