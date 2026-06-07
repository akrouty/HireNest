import { apiGet, apiPost, invalidateApiCache } from "@/services/api";

export type QcmQuestion = {
  id: number;
  question: string;
  question_text?: string;
  options: Record<string, string>;
  correct_option?: string;
  difficulty?: string;
  rationale?: string;
};

export type QcmSession = {
  id: number;
  session_id: string;
  job_title: string;
  status: string;
  questions: QcmQuestion[];
  answers?: { question_id: number; selected: string }[] | null;
  result?: QcmResult | null;
  score_percent?: number | null;
};

export type QcmResult = {
  session_id: string;
  score_percent: number;
  correct_count: number;
  total: number;
  per_question: { question_id: number; selected: string; correct: boolean; difficulty?: string }[];
  skill_map: Record<string, unknown>;
};

export function listQcmSessions() {
  return apiGet<QcmSession[]>("/qcm", { cacheTtlMs: 30_000 });
}

export function generateQcm(jobTitle?: string) {
  invalidateApiCache("/dashboard/me");
  return apiPost<QcmSession>("/qcm/generate", { job_title: jobTitle || undefined });
}

export function submitQcm(sessionId: string, answers: { question_id: number; selected: string }[]) {
  invalidateApiCache("/dashboard/me");
  return apiPost<QcmResult>(`/qcm/${sessionId}/submit`, { answers });
}
