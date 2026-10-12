import { ResidentShell } from "@/components/layout/ResidentShell";

/**
 * The resident area renders from browser-only demo data (localStorage) and a
 * demo session flag, so its pages can't be part of a server-prerendered static
 * shell yet. Opt this segment out of Cache Components' instant-navigation
 * validation; revisit once the data comes from a real backend.
 */
export const instant = false;

export default function ResidentLayout({ children }: LayoutProps<"/">) {
  return <ResidentShell>{children}</ResidentShell>;
}
