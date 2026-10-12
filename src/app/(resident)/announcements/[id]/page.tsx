import type { Metadata } from "next";
import { Suspense } from "react";
import { AnnouncementDetailView } from "./AnnouncementDetailView";

export const metadata: Metadata = { title: "Announcement" };
// Rendered from browser-only demo data — see (resident)/layout.tsx.
export const instant = false;

export default function AnnouncementDetailPage({ params }: PageProps<"/announcements/[id]">) {
  return (
    <Suspense>
      <Detail params={params} />
    </Suspense>
  );
}

async function Detail({ params }: Pick<PageProps<"/announcements/[id]">, "params">) {
  const { id } = await params;
  return <AnnouncementDetailView id={id} />;
}
