"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { LOGIN_PATH } from "@/lib/config/navigation";
import type { PortalData } from "@/lib/mock-data";
import { signOutDemo, useDemoSession } from "@/lib/store/demo-session";
import { resetDemoData, usePortalData } from "@/lib/store/portal-store";
import { cn } from "@/lib/utils";
import { ResidentHeader } from "./ResidentHeader";
import { ResidentSidebar } from "./ResidentSidebar";

const PortalDataContext = createContext<PortalData | null>(null);

/** Shared resident data for any page rendered inside the resident layout. */
export function useResidentData(): PortalData {
  const data = useContext(PortalDataContext);
  if (!data) throw new Error("useResidentData must be used inside <ResidentShell>");
  return data;
}

export function ResidentShell({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <ShellInner>{children}</ShellInner>
    </ToastProvider>
  );
}

function ShellInner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const session = useDemoSession();
  const data = usePortalData();
  const toast = useToast();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Demo route guard — real protection must happen on the server once auth exists.
  useEffect(() => {
    if (session === "signed-out") router.replace(LOGIN_PATH);
  }, [session, router]);

  useEffect(() => {
    if (!drawerOpen) return;
    closeBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  if (session !== "signed-in" || !data) {
    return (
      <div className="grid min-h-dvh place-items-center bg-page" aria-busy="true">
        <div className="flex flex-col items-center gap-3 text-muted">
          <span className="size-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" aria-hidden />
          <span className="text-sm">Loading your portal…</span>
        </div>
      </div>
    );
  }

  const unread = data.notifications.filter((n) => !n.read).length;
  const openLogout = () => {
    setDrawerOpen(false);
    setConfirmLogout(true);
  };

  return (
    <PortalDataContext.Provider value={data}>
      <a
        href="#main"
        onClick={(e) => {
          // Move focus without touching the URL hash (the portal's routing may use it).
          e.preventDefault();
          document.getElementById("main")?.focus();
        }}
        className="sr-only z-[70] rounded-lg bg-white px-4 py-2 font-semibold text-brand-700 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[17rem] lg:block xl:w-[18rem]">
        <ResidentSidebar onLogout={openLogout} unreadCount={unread} />
      </aside>

      {/* Mobile / tablet drawer */}
      <div
        className={cn("fixed inset-0 z-50 lg:hidden", drawerOpen ? "visible" : "invisible")}
        // Set via the DOM property so it behaves the same on every React version.
        ref={(el) => {
          if (el) el.inert = !drawerOpen;
        }}
        aria-hidden={!drawerOpen}
      >
        <div
          className={cn("absolute inset-0 bg-black/40 transition-opacity", drawerOpen ? "opacity-100" : "opacity-0")}
          onClick={() => setDrawerOpen(false)}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className={cn(
            "absolute inset-y-0 left-0 w-[min(18rem,85vw)] shadow-2xl transition-transform duration-200",
            drawerOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <button
            ref={closeBtnRef}
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close navigation menu"
            className="absolute top-4 right-3 z-10 grid size-9 place-items-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
          >
            <X className="size-5" aria-hidden />
          </button>
          <ResidentSidebar onNavigate={() => setDrawerOpen(false)} onLogout={openLogout} unreadCount={unread} />
        </div>
      </div>

      <div className="flex min-h-dvh flex-col lg:pl-[17rem] xl:pl-[18rem]">
        <ResidentHeader
          resident={data.resident}
          notifications={data.notifications}
          onOpenMenu={() => setDrawerOpen(true)}
          onResetDemo={() => setConfirmReset(true)}
        />
        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-12 lg:py-10">
          {children}
        </main>
      </div>

      <ConfirmDialog
        open={confirmLogout}
        title="Log out?"
        message={
          <>
            <p>You will be returned to the sign-in page.</p>
            <p className="mt-2 text-xs">
              Demo note: authentication is not connected yet, so this only ends the demonstration session in this browser.
            </p>
          </>
        }
        confirmLabel="Log out"
        tone="danger"
        onCancel={() => setConfirmLogout(false)}
        onConfirm={() => {
          setConfirmLogout(false);
          signOutDemo();
          router.replace(LOGIN_PATH);
        }}
      />

      <ConfirmDialog
        open={confirmReset}
        title="Reset demo data?"
        message="This restores the sample requests, reports, appointments and notifications stored in this browser."
        confirmLabel="Reset"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          setConfirmReset(false);
          resetDemoData();
          toast("Demo data has been reset.", "info");
        }}
      />
    </PortalDataContext.Provider>
  );
}
