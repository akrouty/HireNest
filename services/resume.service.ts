import { getAccessToken } from "@/lib/auth-store";
import { API_BASE, apiDelete, apiGet, apiPost, invalidateApiCache } from "@/services/api";

export type ResumeRecord = {
  id: number;
  user_id: number;
  original_filename: string;
  stored_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  parsing_status: string;
  created_at: string;
  updated_at: string | null;
};

export type ResumeText = {
  user_id: number;
  parsing_status: string;
  parsed_text: string | null;
};

export type ResumeParseResult = {
  ok: boolean;
  parsing_status: string;
  extracted_text_length: number;
};

export type ResumeAnalysis = {
  score: number;
  label: string;
  sections: {
    content: number;
    format: number;
    ats: number;
  };
};

export type ResumeEvaluation = {
  score: number;
  present_sections: string[];
  missing_sections: string[];
  checks: {
    key: string;
    label: string;
    passed: boolean;
    status: "passed" | "partial" | "missing" | string;
    points: number;
    max_points: number;
    detail: string;
    recommendation: string;
  }[];
  structure_status: "strong" | "partial" | "needs_work" | string;
  recommendation: string;
};

export async function uploadResume(file: File) {
  invalidateApiCache();
  const form = new FormData();
  form.append("file", file);
  return apiPost<ResumeRecord>("/resumes/upload", form);
}

export function getMyResume() {
  return apiGet<ResumeRecord>("/resumes/me", { cacheTtlMs: 45_000 });
}

export function parseMyResume() {
  invalidateApiCache();
  return apiPost<ResumeParseResult>("/resumes/parse/me");
}

export function getMyResumeText() {
  return apiGet<ResumeText>("/resumes/me/text");
}

export function deleteMyResume() {
  invalidateApiCache();
  return apiDelete<void>("/resumes/me");
}

export function getMyResumeEvaluation() {
  return apiGet<ResumeEvaluation>("/resumes/me/evaluation");
}

export function resumeFileUrl() {
  return `${API_BASE}/resumes/me/file`;
}

export async function getMyResumeFileBlob() {
  const token = getAccessToken();
  const response = await fetch(resumeFileUrl(), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(response.statusText || "Unable to load resume preview");
  }
  return response.blob();
}

export function toResumeAnalysis(
  resume: ResumeRecord,
  parsed?: ResumeParseResult,
): ResumeAnalysis {
  const parsedOk = parsed?.ok || resume.parsing_status === "parsed";
  return {
    score: parsedOk ? 85 : 55,
    label: parsedOk ? "Parsed" : "Uploaded",
    sections: {
      content: parsedOk ? 88 : 50,
      format: 82,
      ats: parsedOk ? 80 : 45,
    },
  };
}
