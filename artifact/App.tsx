/**
 * Route table for the single-file artifact build. Mirrors src/app's routes and
 * reuses the same page views, layout and shared store.
 */
import { Fragment, useEffect } from "react";
import { FileQuestion } from "lucide-react";
import { AppointmentsView } from "@/app/(resident)/appointments/AppointmentsView";
import { AnnouncementDetailView } from "@/app/(resident)/announcements/[id]/AnnouncementDetailView";
import { AnnouncementsView } from "@/app/(resident)/announcements/AnnouncementsView";
import { CommunityReportsView } from "@/app/(resident)/community-reports/CommunityReportsView";
import { NewReportView } from "@/app/(resident)/community-reports/new/NewReportView";
import { DashboardView } from "@/app/(resident)/dashboard/DashboardView";
import { RequestFormView } from "@/app/(resident)/document-request/[serviceId]/RequestFormView";
import DocumentRequestPage from "@/app/(resident)/document-request/page";
import { MyRequestsView } from "@/app/(resident)/my-requests/MyRequestsView";
import { NotificationsView } from "@/app/(resident)/notifications/NotificationsView";
import { LoginView } from "@/app/login/LoginView";
import { ResidentShell } from "@/components/layout/ResidentShell";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Card";
import { getService } from "@/lib/config/services";
import { navigate, useRoute } from "./shims/router";

const TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  "document-request": "Document Request",
  "my-requests": "My Requests",
  "community-reports": "Community Reports",
  appointments: "Appointments",
  announcements: "Announcements",
  notifications: "Notifications",
  login: "Sign in",
};

function NotFound() {
  return (
    <EmptyState
      icon={<FileQuestion className="size-6" />}
      title="Page not found"
      description="This page doesn't exist in the portal."
      action={<LinkButton href="/dashboard">Go to dashboard</LinkButton>}
    />
  );
}

function residentPage(pathname: string) {
  const [section, sub, ...extra] = pathname.split("/").filter(Boolean);
  if (extra.length) return <NotFound />;
  switch (section) {
    case "dashboard":
      return sub ? <NotFound /> : <DashboardView />;
    case "document-request":
      if (!sub) return <DocumentRequestPage />;
      return getService(sub) ? <RequestFormView serviceId={getService(sub)!.id} /> : <NotFound />;
    case "my-requests":
      return sub ? <NotFound /> : <MyRequestsView />;
    case "community-reports":
      if (!sub) return <CommunityReportsView />;
      return sub === "new" ? <NewReportView /> : <NotFound />;
    case "appointments":
      return sub ? <NotFound /> : <AppointmentsView />;
    case "announcements":
      return sub ? <AnnouncementDetailView id={sub} /> : <AnnouncementsView />;
    case "notifications":
      return sub ? <NotFound /> : <NotificationsView />;
    default:
      return <NotFound />;
  }
}

export function App() {
  const { pathname } = useRoute();

  useEffect(() => {
    if (pathname === "/") navigate("/dashboard", { replace: true });
    const section = pathname.split("/")[1] ?? "";
    document.title = TITLES[section] ? `${TITLES[section]} · Barangay Baesa E-Services` : "Barangay Baesa E-Services";
  }, [pathname]);

  if (pathname === "/login") return <LoginView />;
  return (
    <ResidentShell>
      {/* Keyed by path so each page starts fresh, like a route change in Next.js. */}
      <Fragment key={pathname}>{residentPage(pathname)}</Fragment>
    </ResidentShell>
  );
}
