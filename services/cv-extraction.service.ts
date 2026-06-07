import { apiGet, apiPost, invalidateApiCache } from "@/services/api";

export type Skill = { id: number; name: string };
export type Experience = {
  id: number;
  job_title: string | null;
  company_name: string | null;
  start_date_text: string | null;
  end_date_text: string | null;
  description: string | null;
};
export type Education = {
  id: number;
  degree: string | null;
  institution: string | null;
  start_date_text: string | null;
  end_date_text: string | null;
  description: string | null;
};

export type CVExtraction = {
  user_id: number;
  skills: Skill[];
  experiences: Experience[];
  educations: Education[];
};

export function getMyCVExtraction() {
  return apiGet<CVExtraction>("/cv-extraction/me", { cacheTtlMs: 45_000 });
}

export function extractMyCV() {
  invalidateApiCache();
  return apiPost<CVExtraction>("/cv-extraction/me");
}

export function rebuildMyCVExtraction() {
  invalidateApiCache();
  return apiPost<CVExtraction>("/cv-extraction/me/rebuild");
}
