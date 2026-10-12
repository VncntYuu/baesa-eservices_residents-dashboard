"use client";

/**
 * DEMO SESSION — not real authentication.
 *
 * There is no auth backend yet, so "signing in" only sets a flag in
 * localStorage. Replace `signIn` / `signOut` with the real auth provider
 * (e.g. NextAuth/Auth.js or the barangay's own API) and protect routes on the
 * server (proxy/middleware) when authentication is implemented.
 */

import { useSyncExternalStore } from "react";

const SESSION_KEY = "baesa-demo-session";
export type SessionState = "unknown" | "signed-in" | "signed-out";

const listeners = new Set<() => void>();

function read(): SessionState {
  try {
    return window.localStorage.getItem(SESSION_KEY) === "1" ? "signed-in" : "signed-out";
  } catch {
    return "signed-in"; // storage blocked: don't lock the demo
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => e.key === SESSION_KEY && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useDemoSession(): SessionState {
  return useSyncExternalStore(subscribe, read, () => "unknown");
}

export function signInDemo() {
  try {
    window.localStorage.setItem(SESSION_KEY, "1");
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function signOutDemo() {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}
