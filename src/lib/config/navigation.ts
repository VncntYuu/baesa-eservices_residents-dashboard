import {
  Bell,
  CalendarDays,
  FileBadge,
  FileText,
  LayoutGrid,
  Megaphone,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const RESIDENT_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/document-request", label: "Document Request", icon: FileBadge },
  { href: "/my-requests", label: "My Request", icon: FileText },
  { href: "/community-reports", label: "Community Reports", icon: MessageSquare },
  { href: "/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/announcements", label: "Announcements", icon: Megaphone },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

export const LOGIN_PATH = "/login";
