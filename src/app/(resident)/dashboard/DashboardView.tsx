"use client";

import { CircleCheck, Clock, FileText, Megaphone, MessageSquare, RefreshCw, FileSearch } from "lucide-react";
import { AnnouncementCard } from "@/components/announcements/AnnouncementCard";
import { QuickAccessCard } from "@/components/dashboard/QuickAccessCard";
import { RequestSummaryCard } from "@/components/dashboard/RequestSummaryCard";
import { useResidentData } from "@/components/layout/ResidentShell";
import { LinkButton } from "@/components/ui/Button";
import { SectionTitle } from "@/components/ui/Card";

export function DashboardView() {
  const { resident, requests, announcements } = useResidentData();

  const count = (s: string) => requests.filter((r) => r.status === s).length;
  const recent = [...announcements].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 3);

  return (
    <div className="space-y-10 sm:space-y-12">
      <section>
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl lg:text-5xl">
          Welcome, {resident.firstName}!
        </h1>
        <p className="mt-2 text-base text-muted sm:text-lg">
          Track your requests, access barangay services, and stay updated with announcements.
        </p>
      </section>

      <section aria-labelledby="summary-title">
        <SectionTitle id="summary-title" className="mb-5">
          Request Summary
        </SectionTitle>
        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          <RequestSummaryCard
            label="Pending"
            count={count("Pending")}
            caption="Awaiting processing"
            icon={Clock}
            tone="red"
            href="/my-requests?status=Pending"
          />
          <RequestSummaryCard
            label="In Progress"
            count={count("In Progress")}
            caption="Being reviewed"
            icon={RefreshCw}
            tone="amber"
            href="/my-requests?status=In%20Progress"
          />
          <RequestSummaryCard
            label="Completed"
            count={count("Completed")}
            caption="Ready for pickup"
            icon={CircleCheck}
            tone="green"
            href="/my-requests?status=Completed"
          />
        </div>
      </section>

      <section aria-labelledby="quick-title">
        <SectionTitle id="quick-title" className="mb-5">
          Quick Access
        </SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 2xl:grid-cols-4">
          <QuickAccessCard label="Request a Document" href="/document-request" icon={FileText} />
          <QuickAccessCard label="Community Reports" href="/community-reports" icon={MessageSquare} />
          <QuickAccessCard label="Track Requests" href="/my-requests" icon={FileSearch} />
          <QuickAccessCard label="Announcements" href="/announcements" icon={Megaphone} />
        </div>
      </section>

      <section aria-labelledby="ann-title">
        <div className="mb-5 flex items-center justify-between gap-4">
          <SectionTitle id="ann-title">Recent Announcements</SectionTitle>
          <LinkButton href="/announcements" variant="ghost" size="sm">
            View all
          </LinkButton>
        </div>
        <div className="space-y-4">
          {recent.map((a) => (
            <AnnouncementCard key={a.id} announcement={a} />
          ))}
        </div>
      </section>
    </div>
  );
}
