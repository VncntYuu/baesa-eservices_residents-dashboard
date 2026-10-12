"use client";

import { Info, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/layout/BrandMark";
import { Button } from "@/components/ui/Button";
import { signInDemo } from "@/lib/store/demo-session";

export function LoginView() {
  const router = useRouter();

  return (
    <main className="grid min-h-dvh place-items-center bg-page px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center rounded-2xl bg-sidebar px-6 py-5">
          <BrandMark />
        </div>
        <div className="rounded-2xl border border-line bg-white p-6 shadow-card sm:p-8">
          <h1 className="text-2xl font-extrabold text-brand-900">Residents Portal</h1>
          <p className="mt-1 text-muted">Sign in to request documents, file reports and track your requests.</p>

          <div className="mt-6 flex gap-3 rounded-xl border-l-4 border-status-blue bg-status-blue-bg p-4 text-sm text-status-blue">
            <Info className="mt-0.5 size-5 shrink-0" aria-hidden />
            <p>
              <strong>Demonstration only.</strong> Resident authentication is not connected yet. Continuing opens the portal
              as a sample resident; nothing is sent to a server.
            </p>
          </div>

          <Button
            size="lg"
            className="mt-6 w-full"
            onClick={() => {
              signInDemo();
              router.push("/dashboard");
            }}
          >
            <LogIn className="size-5" aria-hidden />
            Continue as demo resident
          </Button>
        </div>
      </div>
    </main>
  );
}
