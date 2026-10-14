/**
 * Minimal in-page router for the single-file artifact build.
 *
 * The artifact viewer only passes a plain `#token` through to the page, so the
 * current path is mirrored into the hash as a dotted token
 * ("/community-reports/new" → "#community-reports.new"). Query strings stay in
 * memory only.
 */
import { useSyncExternalStore } from "react";

export interface Route {
  pathname: string;
  search: string;
}

const DEFAULT_PATH = "/dashboard";
const listeners = new Set<() => void>();

export function tokenFor(pathname: string): string {
  return pathname.replace(/^\/+/, "").replace(/\//g, ".") || "dashboard";
}

function pathFromToken(token: string): string {
  return "/" + token.replace(/\./g, "/");
}

function readHash(): string | null {
  try {
    const h = decodeURIComponent(window.location.hash.slice(1));
    return /^[A-Za-z0-9._~-]+$/.test(h) ? h : null;
  } catch {
    return null;
  }
}

let route: Route = (() => {
  const token = readHash();
  return { pathname: token ? pathFromToken(token) : DEFAULT_PATH, search: "" };
})();

function emit() {
  listeners.forEach((l) => l());
}

export function splitHref(href: string, base = route.pathname): Route {
  const u = new URL(href, "https://portal.local" + base);
  return { pathname: u.pathname.replace(/\/+$/, "") || "/", search: u.search };
}

export function navigate(href: string, opts: { replace?: boolean; scroll?: boolean } = {}) {
  route = splitHref(href);
  const hash = "#" + tokenFor(route.pathname);
  try {
    if (window.location.hash !== hash) {
      if (opts.replace) window.history.replaceState(null, "", hash);
      else window.location.hash = hash;
    }
  } catch {
    /* some sandboxes refuse history changes; routing still works in memory */
  }
  emit();
  if (opts.scroll !== false) window.scrollTo(0, 0);
}

if (typeof window !== "undefined") {
  window.addEventListener("hashchange", () => {
    const token = readHash();
    if (!token) return;
    const pathname = pathFromToken(token);
    if (pathname === route.pathname) return;
    route = { pathname, search: "" };
    emit();
  });
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useRoute(): Route {
  return useSyncExternalStore(subscribe, () => route);
}
