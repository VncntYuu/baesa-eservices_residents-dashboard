"use client";

/**
 * In-memory drafts for the request form, so closing the modal (or switching
 * between Burial and Donation) doesn't throw away what the resident typed.
 * Files and photos stay in memory only and are cleared on reload by design.
 */
import type { VerificationPhoto } from "@/components/requests/IdentityVerification";
import type { ApplicantInfo, PaymentMethod, ResidentProfile, ServiceId } from "@/lib/types";

export interface RequestDraft {
  answers: Record<string, string>;
  validId: File | null;
  photo: VerificationPhoto | null;
  payment: PaymentMethod | null;
  confirmed: boolean;
}

export const EMPTY_APPLICANT: ApplicantInfo = {
  firstName: "",
  middleName: "",
  lastName: "",
  suffix: "",
  birthDate: "",
  mobile: "",
  address: "",
};

// Personal details are shared by every form; the rest is kept per service.
let applicantDraft: ApplicantInfo = EMPTY_APPLICANT;
const drafts = new Map<ServiceId, RequestDraft>();

export function emptyDraft(): RequestDraft {
  return { answers: {}, validId: null, photo: null, payment: null, confirmed: false };
}

export function loadDraft(serviceId: ServiceId): { applicant: ApplicantInfo; draft: RequestDraft } {
  return { applicant: applicantDraft, draft: drafts.get(serviceId) ?? emptyDraft() };
}

export function saveDraft(serviceId: ServiceId, applicant: ApplicantInfo, draft: RequestDraft) {
  applicantDraft = applicant;
  drafts.set(serviceId, draft);
}

export function clearDraft(serviceId: ServiceId) {
  drafts.delete(serviceId);
}

export function applicantFromProfile(p: ResidentProfile): ApplicantInfo {
  return {
    firstName: p.firstName,
    middleName: p.middleName ?? "",
    lastName: p.lastName,
    suffix: p.suffix ?? "",
    birthDate: p.birthDate,
    mobile: p.contactNumber,
    address: p.address,
  };
}
