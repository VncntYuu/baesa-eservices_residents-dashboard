/** Stand-in for `next/navigation` in the artifact build. */
import { useMemo } from "react";
import { navigate, useRoute } from "./router";

const router = {
  push: (href: string, opts?: { scroll?: boolean }) => navigate(href, { scroll: opts?.scroll }),
  replace: (href: string, opts?: { scroll?: boolean }) => navigate(href, { replace: true, scroll: opts?.scroll }),
  back: () => window.history.back(),
  forward: () => window.history.forward(),
  refresh: () => {},
  prefetch: () => {},
};

export function useRouter() {
  return router;
}

export function usePathname(): string {
  return useRoute().pathname;
}

export function useSearchParams(): URLSearchParams {
  const { search } = useRoute();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export function redirect(href: string): never {
  navigate(href, { replace: true });
  throw new Error("redirect");
}

export function notFound(): never {
  throw new Error("not found");
}
