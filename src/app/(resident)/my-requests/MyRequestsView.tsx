"use client";

import { FileText } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useResidentData } from "@/components/layout/ResidentShell";
import { RequestCard } from "@/components/requests/RequestCard";
import { RequestDetailsDialog } from "@/components/requests/RequestDetailsDialog";
import { Button, LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Card";
import { FilterBar, Pagination, TablePanel, paginate } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { RequestStatusBadge } from "@/components/ui/StatusBadge";
import type { RequestStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type StatusFilter = "All" | RequestStatus;
const STATUSES: RequestStatus[] = ["Pending", "In Progress", "Completed", "Rejected"];

export function MyRequestsView() {
  const { requests } = useResidentData();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  // Status filter and the open request live in the URL so Dashboard cards and notifications can link here.
  const statusParam = params.get("status") as StatusFilter | null;
  const status: StatusFilter = statusParam && STATUSES.includes(statusParam as RequestStatus) ? statusParam : "All";
  const openRef = params.get("ref");

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...requests]
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
      .filter((r) => status === "All" || r.status === status)
      .filter(
        (r) =>
          !q ||
          r.referenceNo.toLowerCase().includes(q) ||
          r.serviceName.toLowerCase().includes(q) ||
          r.summary.toLowerCase().includes(q),
      );
  }, [requests, status, query]);

  const { pages, current, slice, start } = paginate(filtered, page);
  const selected = openRef ? (requests.find((r) => r.referenceNo === openRef) ?? null) : null;
  const view = (ref: string) => setParam("ref", ref);

  return (
    <>
      <PageHeader title="My Requests" description="Track the status of all your service requests." />

      <TablePanel>
        <FilterBar
          searchId="req-search"
          searchLabel="Search requests"
          searchPlaceholder="Search by request, reference number or purpose"
          query={query}
          onQuery={(q) => {
            setQuery(q);
            setPage(1);
          }}
          selects={[
            {
              id: "req-status",
              label: "Filter by status",
              value: status,
              onChange: (v) => {
                setParam("status", v === "All" ? null : v);
                setPage(1);
              },
              options: [{ value: "All", label: "All statuses" }, ...STATUSES.map((s) => ({ value: s, label: s }))],
            },
          ]}
        />

        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<FileText className="size-6" />}
              title={requests.length === 0 ? "No requests yet" : "No requests match your filters"}
              description={requests.length === 0 ? "Submit your first document request to see it here." : "Try a different status or search term."}
              action={requests.length === 0 ? <LinkButton href="/document-request">Request a document</LinkButton> : undefined}
            />
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block">
              <table className="w-full text-left">
                <caption className="sr-only">Your document requests</caption>
                <thead className="bg-table-head text-base text-muted">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-medium">Name / Kind of Request</th>
                    <th scope="col" className="px-4 py-4 font-medium">Date Submitted</th>
                    <th scope="col" className="px-4 py-4 font-medium">Document Fee</th>
                    <th scope="col" className="px-4 py-4 font-medium">Date Approved</th>
                    <th scope="col" className="px-4 py-4 font-medium">Status</th>
                    <th scope="col" className="px-6 py-4 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {slice.map((r) => (
                    <tr key={r.id} className="border-t border-line align-middle">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-ink">{r.serviceName}</p>
                        <p className="text-sm text-subtle">{r.referenceNo}</p>
                      </td>
                      <td className="px-4 py-4 text-ink">{formatDate(r.submittedAt)}</td>
                      <td className="px-4 py-4 text-ink">{r.fee.label}</td>
                      <td className="px-4 py-4 text-ink">{r.approvedAt ? formatDate(r.approvedAt) : <span aria-label="Not yet approved">—</span>}</td>
                      <td className="px-4 py-4">
                        <RequestStatusBadge status={r.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="soft" size="sm" onClick={() => view(r.referenceNo)} aria-label={`View details of ${r.serviceName} ${r.referenceNo}`}>
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Small screens: cards */}
            <div className="space-y-4 bg-page p-4 sm:p-6 lg:hidden">
              {slice.map((r) => (
                <RequestCard key={r.id} request={r} onView={() => view(r.referenceNo)} />
              ))}
            </div>

            <Pagination page={current} pages={pages} total={filtered.length} start={start} shown={slice.length} noun="requests" onPage={setPage} />
          </>
        )}
      </TablePanel>

      <RequestDetailsDialog request={selected} onClose={() => setParam("ref", null)} />
    </>
  );
}
