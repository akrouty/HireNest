import { apiGet, apiPost, apiPut, invalidateApiCache } from "@/services/api";

export type CandidateProfile = {
  id: number;
  user_id: number;
  professional_title: string | null;
  summary: string | null;
  target_domain: string | null;
  target_job_title: string | null;
  location: string | null;
  experience_level: string | null;
  preferences: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  created_at: string;
  updated_at: string | null;
};

export type CandidateProfileInput = Partial<
  Pick<
    CandidateProfile,
    | "professional_title"
    | "summary"
    | "target_domain"
    | "target_job_title"
    | "location"
    | "experience_level"
    | "preferences"
    | "linkedin_url"
    | "github_url"
    | "portfolio_url"
  >
>;

export function getMyProfile() {
  return apiGet<CandidateProfile>("/profile/me", { cacheTtlMs: 60_000 });
}

export function createMyProfile(data: CandidateProfileInput) {
  invalidateApiCache();
  return apiPost<CandidateProfile>("/profile/me", data);
}

export function updateMyProfile(data: CandidateProfileInput) {
  invalidateApiCache();
  return apiPut<CandidateProfile>("/profile/me", data);
}
