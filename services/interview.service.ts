import { API_BASE, apiGet, apiPost, invalidateApiCache } from "@/services/api";
import { getAccessToken } from "@/lib/auth-store";

export type InterviewSession = {
  id: number;
  session_id: string;
  job_title: string;
  status: string;
  language: string;
  voice_preset: string;
  voice_speed?: number;
  question_count: number;
  ws_url: string;
  result?: Record<string, unknown> | null;
  final_score?: number | null;
};

export type InterviewHealth = {
  available: boolean;
  base_url: string;
  detail?: unknown;
};

export type InterviewTranscriptItem = {
  speaker: "ai" | "candidate" | "system";
  text: string;
  turn_index?: number | null;
  timestamp_ms?: number | null;
  final?: boolean;
  event_type?: string | null;
};

export type InterviewTranscript = {
  session_id: string;
  items: InterviewTranscriptItem[];
};

export type InterviewVoice = {
  id: string;
  label: string;
  gender?: string;
  locale?: string;
  downloaded?: boolean;
};

export function getInterviewHealth() {
  return apiGet<InterviewHealth>("/interview/health", {
    auth: false,
    cacheTtlMs: 30_000,
  });
}

export function listInterviewSessions() {
  return apiGet<InterviewSession[]>("/interview");
}

export function getInterviewVoices() {
  return apiGet<{ default: string; voices: InterviewVoice[] }>("/interview/voices", {
    cacheTtlMs: 10 * 60_000,
  });
}

export function startInterview(payload: {
  job_title?: string;
  consent: boolean;
  voice_preset?: string;
  voice_speed?: number;
  language?: "en" | "fr";
  question_count?: number;
}) {
  invalidateApiCache("/dashboard/me");
  return apiPost<InterviewSession>("/interview/start", payload);
}

export function submitInterviewAnswer(
  sessionId: string,
  payload: { text: string; source?: string },
) {
  return apiPost<Record<string, unknown>>(`/interview/${sessionId}/answer`, {
    text: payload.text,
    source: payload.source ?? "browser",
  });
}

export function endInterview(
  sessionId: string,
  payload: { content_score?: number; expected_points?: string } = {},
) {
  invalidateApiCache("/dashboard/me");
  return apiPost<Record<string, unknown>>(
    `/interview/${sessionId}/end`,
    payload,
  );
}

export function forceEndActiveInterviews() {
  invalidateApiCache("/dashboard/me");
  return apiPost<{ ended_count: number; session_ids: string[] }>(
    "/interview/active/force-end",
  );
}

export function getInterviewTranscript(sessionId: string) {
  return apiGet<InterviewTranscript>(`/interview/${sessionId}/transcript`, {
    cacheTtlMs: 15_000,
  });
}

export function interviewWsUrl(sessionId: string) {
  const token = getAccessToken();
  const base = API_BASE.replace(
    /^http/,
    API_BASE.startsWith("https") ? "wss" : "ws",
  );
  const suffix = token ? `?token=${encodeURIComponent(token)}` : "";
  return `${base}/ws/interview/${sessionId}${suffix}`;
}
