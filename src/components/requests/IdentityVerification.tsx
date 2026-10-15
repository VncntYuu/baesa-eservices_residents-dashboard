"use client";

import { Camera, ImageUp, RotateCcw, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

export interface VerificationPhoto {
  method: "camera" | "upload";
  /** Kept in memory for the preview only; it is not saved with the request. */
  dataUrl: string;
}

type Phase = "idle" | "starting" | "live";

function cameraErrorMessage(err: unknown): string {
  const name = err instanceof DOMException ? err.name : "";
  if (name === "NotAllowedError" || name === "SecurityError")
    return "Camera access was blocked. Allow camera access in your browser settings, or upload a photo instead.";
  if (name === "NotFoundError" || name === "OverconstrainedError")
    return "No camera was found on this device. You can upload a photo instead.";
  if (name === "NotReadableError") return "The camera is being used by another app. Close it and try again, or upload a photo.";
  return "The camera couldn't be started. You can upload a photo instead.";
}

/**
 * Identity Verification block from the request form reference.
 * The camera is only requested after the resident taps the capture area, the live
 * preview is always visible, and nothing is captured until they press "Take photo".
 */
export function IdentityVerification({
  value,
  onChange,
  error,
}: {
  value: VerificationPhoto | null;
  onChange: (photo: VerificationPhoto | null) => void;
  error?: string;
}) {
  const id = useId();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState("");

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setPhase("idle");
  };

  // Always release the camera when this block goes away (modal closed, page changed).
  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), []);

  const startCamera = async () => {
    setMessage("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setMessage("This browser can't open the camera here. You can upload a photo instead.");
      return;
    }
    setPhase("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = stream;
      setPhase("live");
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play().catch(() => {});
        }
      });
    } catch (err) {
      setPhase("idle");
      setMessage(cameraErrorMessage(err));
    }
  };

  const takePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const scale = Math.min(1, 640 / video.videoWidth);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Mirror to match the selfie preview the resident saw.
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    onChange({ method: "camera", dataUrl: canvas.toDataURL("image/jpeg", 0.85) });
    stopCamera();
  };

  const onUpload = (file: File | undefined) => {
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setMessage("Please choose a JPG or PNG photo.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage("The photo must be 5 MB or smaller.");
      return;
    }
    setMessage("");
    const reader = new FileReader();
    reader.onload = () => onChange({ method: "upload", dataUrl: String(reader.result) });
    reader.readAsDataURL(file);
  };

  const status = value
    ? { label: value.method === "camera" ? "Photo taken" : "Photo uploaded", tone: "green" as const }
    : phase === "live"
      ? { label: "Camera on", tone: "blue" as const }
      : { label: "Not started", tone: "gray" as const };

  return (
    <section
      aria-labelledby={`${id}-title`}
      className={cn("rounded-2xl border p-5 sm:p-6", error ? "border-status-red" : "border-line")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 id={`${id}-title`} className="text-lg font-bold text-brand-900">
            Identity Verification<span className="text-status-red"> *</span>
          </h3>
          <p className="text-muted">Please take a live photo.</p>
        </div>
        <Pill tone={status.tone} className="border border-line">
          {status.label}
        </Pill>
      </div>

      <div className="mt-4 rounded-2xl bg-page p-4 sm:p-5">
        <div className="grid min-h-56 place-items-center overflow-hidden rounded-xl border border-line bg-white">
          {value ? (
            <div className="flex flex-col items-center gap-4 p-5">
              {/* eslint-disable-next-line @next/next/no-img-element -- local preview of the captured photo */}
              <img src={value.dataUrl} alt="Your verification photo" className="h-44 w-auto max-w-full rounded-xl object-cover" />
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onChange(null);
                    void startCamera();
                  }}
                >
                  <RotateCcw className="size-4" aria-hidden />
                  Retake
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
                  Remove
                </Button>
              </div>
            </div>
          ) : phase === "live" || phase === "starting" ? (
            <div className="flex w-full flex-col items-center gap-4 p-4">
              <div className="relative aspect-[4/3] w-full max-w-sm overflow-hidden rounded-xl bg-ink">
                <video ref={videoRef} playsInline muted className="size-full -scale-x-100 object-cover" aria-label="Live camera preview" />
                {phase === "starting" && (
                  <p className="absolute inset-0 grid place-items-center text-sm text-white">Waiting for camera permission…</p>
                )}
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <Button onClick={takePhoto} disabled={phase !== "live"}>
                  <Camera className="size-4" aria-hidden />
                  Take photo
                </Button>
                <Button variant="outline" onClick={stopCamera}>
                  <X className="size-4" aria-hidden />
                  Turn off camera
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => void startCamera()}
              aria-describedby={`${id}-hint`}
              className="flex size-full min-h-56 flex-col items-center justify-center gap-3 p-6 text-center focus-visible:outline-2 focus-visible:outline-brand-500"
            >
              <span className="grid size-16 place-items-center rounded-full border border-line text-brand-500">
                <Camera className="size-7" aria-hidden />
              </span>
              <span className="font-semibold text-brand-900">Tap to capture live photo</span>
              <span id={`${id}-hint`} className="text-sm text-muted">
                Hold your face centered and keep the lighting clear.
              </span>
            </button>
          )}
        </div>
        <p className="mt-4 text-sm text-subtle">This step helps confirm you are the account owner before your request is submitted.</p>
        {!value && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="mt-2 inline-flex items-center gap-1.5 rounded text-sm font-semibold text-brand-500 hover:underline focus-visible:outline-2 focus-visible:outline-brand-500"
          >
            <ImageUp className="size-4" aria-hidden />
            Can&apos;t use the camera? Upload a photo instead
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png"
          capture="user"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => {
            onUpload(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>

      {(message || error) && (
        <p role="alert" className="mt-3 text-sm font-medium text-status-red">
          {message || error}
        </p>
      )}
    </section>
  );
}
