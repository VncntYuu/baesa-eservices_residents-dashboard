import {
  Bell,
  CalendarDays,
  CircleHelp,
  FileBadge,
  FileText,
  LayoutGrid,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Labels and icons follow the reference screenshots ("Announcement" with a bell, "Notifications" with a help circle). */
export const RESIDENT_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/document-request", label: "Document Request", icon: FileBadge },
  { href: "/my-requests", label: "My Request", icon: FileText },
  { href: "/community-reports", label: "Community Reports", icon: MessageSquare },
  { href: "/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/announcements", label: "Announcement", icon: Bell },
  { href: "/notifications", label: "Notifications", icon: CircleHelp },
];

export const LOGIN_PATH = "/login";
