import { Briefcase, FileText, Flower2, HandHeart, Heart, House } from "lucide-react";
import type { ServiceConfig } from "@/lib/config/services";

const ICONS = {
  file: FileText,
  heart: Heart,
  home: House,
  briefcase: Briefcase,
  flower: Flower2,
  "hand-heart": HandHeart,
} as const;

export function ServiceIcon({ icon, className }: { icon: ServiceConfig["icon"]; className?: string }) {
  const Icon = ICONS[icon];
  return <Icon className={className} aria-hidden />;
}
