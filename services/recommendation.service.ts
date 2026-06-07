import { apiGet } from "@/services/api";

export type CareerInsightsPriority = {
  rank?: number;
  skill?: string;
  priority_reason?: string;
  estimated_weeks?: number;
  learning_path?: {
    approach?: string;
    steps?: string[];
    recommended_resources?: { type?: string; title?: string; why?: string }[];
  };
  portfolio_project?: {
    title?: string;
    description?: string;
    tech_stack?: string[];
    features?: string[];
    cv_impact?: string;
  };
};

export type CareerInsightsReport = {
  available: boolean;
  status: "ok" | "missing_input" | string;
  missing_inputs: string[];
  module?: {
    name?: string;
    display_name?: string;
    runtime?: string;
    model_name?: string;
    ollama_base_url?: string;
    quota_model?: string;
    quota_note?: string;
    token_budgets?: Record<string, number>;
    endpoints?: { name?: string; method?: string; path?: string }[];
    input_counts?: Record<string, number>;
  };
  skill_gap: string[];
  learning_priority?: {
    headline?: string;
    cv_strength_tips?: string[];
    priorities?: CareerInsightsPriority[];
  } | null;
  personalized_digest?: {
    summary?: string;
    digest_items?: { summary?: string; title?: string; description?: string }[];
    profile_snapshot?: string;
    generated_for?: string;
    [key: string]: unknown;
  } | null;
  jobs?: unknown[];
  health?: unknown;
};

export function getAiCareerInsights() {
  return apiGet<CareerInsightsReport>("/insights/me/career-insights", {
    cacheTtlMs: 5_000,
  });
}
