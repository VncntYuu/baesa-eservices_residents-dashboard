"use client";

import { FileText } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useResidentData } from "@/components/layout/ResidentShell";
import { RequestCard } from "@/components/requests/RequestCard";
import { RequestDetailsDialog } from "@/components/requests/RequestDetailsDialog";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Card";
import { FilterChips, SearchInput } from "@/components/ui/FormControls";
import { PageHeader } from "@/components/ui/PageHeader";
import type { RequestStatus } from "@/lib/types";

type StatusFilter = "All" | RequestStatus;
const STATUSES: StatusFilter[] = ["All", "Pending", "In Progress", "Completed", "Rejected"];

export function MyRequestsView() {
  const { requests } = useResidentData();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Status filter lives in the URL so Dashboard summary cards can deep-link to it.
  const statusParam = params.get("status") as StatusFilter | null;
  const status: StatusFilter = statusParam && STATUSES.includes(statusParam) ? statusParam : "All";
  const [query, setQuery] = useState("");
  const openRef = params.get("ref");

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const sorted = useMemo(() => [...requests].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)), [requests]);

  const filtered = sorted.filter((r) => {
    if (status !== "All" && r.status !== status) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return r.referenceNo.toLowerCase().includes(q) || r.serviceName.toLowerCase().includes(q) || r.purpose.toLowerCase().includes(q);
  });

  const selected = openRef ? (requests.find((r) => r.referenceNo === openRef) ?? null) : null;

  return (
    <>
      <PageHeader
        title="My Requests"
        description="Track the status of all your service requests."
        actions={<LinkButton href="/document-request">New request</LinkButton>}
      />

      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <FilterChips
          label="Filter by status"
          value={status}
          onChange={(v) => setParam("status", v === "All" ? null : v)}
          options={STATUSES.map((s) => ({
            value: s,
            label: s,
            count: s === "All" ? requests.length : requests.filter((r) => r.status === s).length,
          }))}
        />
        <SearchInput
          className="w-full xl:w-80"
          placeholder="Search reference, service or purpose"
          aria-label="Search requests"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <p className="sr-only" aria-live="polite">
        {filtered.length} request{filtered.length === 1 ? "" : "s"} shown
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FileText className="size-6" />}
          title={requests.length === 0 ? "No requests yet" : "No requests match your filters"}
          description={requests.length === 0 ? "Submit your first document request to see it here." : "Try a different status or search term."}
          action={requests.length === 0 ? <LinkButton href="/document-request">Request a document</LinkButton> : undefined}
        />
      ) : (
        <div className="space-y-5">
          {filtered.map((r) => (
            <RequestCard key={r.id} request={r} onView={() => setParam("ref", r.referenceNo)} />
          ))}
        </div>
      )}

      <RequestDetailsDialog request={selected} onClose={() => setParam("ref", null)} />
    </>
  );
}
