"use client";

import { Bell, CircleCheck, Clock, FileText, MessageSquare, RefreshCw } from "lucide-react";
import { AnnouncementCard } from "@/components/announcements/AnnouncementCard";
import { QuickAccessCard } from "@/components/dashboard/QuickAccessCard";
import { RequestSummaryCard } from "@/components/dashboard/RequestSummaryCard";
import { useResidentData } from "@/components/layout/ResidentShell";
import { SectionTitle } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import type { RequestStatus } from "@/lib/types";

export function DashboardView() {
  const { resident, requests, announcements } = useResidentData();

  // Counts come straight from the shared request data, so they change as soon as a request is added or updated.
  const count = (s: RequestStatus) => requests.filter((r) => r.status === s).length;
  const recent = [...announcements].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 3);

  return (
    <div className="space-y-10 sm:space-y-12">
      <PageHeader
        title={`Welcome, ${resident.firstName}!`}
        description="Track your requests, access barangay services, and stay updated with announcements."
        flush
      />

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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <QuickAccessCard label="Request a Document" href="/document-request" icon={FileText} />
          <QuickAccessCard label="Community Reports" href="/community-reports" icon={MessageSquare} />
          <QuickAccessCard label="Track Requests" href="/my-requests" icon={FileText} />
          <QuickAccessCard label="Announcements" href="/announcements" icon={Bell} />
        </div>
      </section>

      <section aria-labelledby="ann-title">
        <SectionTitle id="ann-title" className="mb-5">
          Recent Announcements
        </SectionTitle>
        <div className="space-y-5">
          {recent.map((a) => (
            <AnnouncementCard key={a.id} announcement={a} />
          ))}
        </div>
      </section>
    </div>
  );
}
