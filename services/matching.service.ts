import { apiGet, apiPost } from "@/services/api";
import { getJobOffers, type JobOffer } from "@/services/job-offers.service";

export type MatchingPreview = {
  ready: boolean;
  missing: string[];
  preview: { mode: string; message: string } | null;
};

export type MatchingAiScore = {
  candidate_user_id: number;
  job_offer_id: number;
  ai_model: string;
  semantic_score: number | null;
  matched_skills: string[];
  missing_skills: string[];
  notes: string[];
  integration_status: string;
};

export type CandidateJobMatch = {
  job_offer_id: number;
  title: string;
  company_name: string | null;
  location: string | null;
  normalized_title: string | null;
  normalized_domain: string | null;
  semantic_score: number | null;
  matched_skills: string[];
  missing_skills: string[];
  compatibility_label: string;
  recommendation: string;
  source_url: string | null;
  integration_status: string;
  is_favorite: boolean;
};

export type JobMatch = {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  posted: string;
  matchScore: number;
  salary: string;
  description: string;
  skills: string[];
  missingSkills: string[];
  sourceUrl?: string | null;
  sourceName?: string | null;
  isFavorite: boolean;
  rawDescription?: string | null;
};

function dateLabel(value?: string | null) {
  if (!value) return "recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recently";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function offerToJobMatch(offer: JobOffer): JobMatch {
  return {
    id: offer.id,
    title: offer.title,
    company: offer.company_name ?? "Unknown company",
    location: offer.location ?? "Remote / flexible",
    type: offer.employment_type ?? offer.experience_level ?? "Not specified",
    posted: dateLabel(offer.collected_at ?? offer.created_at),
    matchScore: 0,
    salary: "Not disclosed",
    description: offer.description ?? "No description provided.",
    skills: offer.skills,
    missingSkills: [],
    sourceUrl: offer.source_url,
    sourceName: offer.source_name,
    isFavorite: offer.is_favorite,
    rawDescription: offer.description,
  };
}

function candidateMatchToJobMatch(match: CandidateJobMatch): JobMatch {
  const score = match.semantic_score;
  const percentScore = score == null ? 0 : Math.round(score * 100);
  return {
    id: match.job_offer_id,
    title: match.title,
    company: match.company_name ?? "Unknown company",
    location: match.location ?? "Remote / flexible",
    type: match.normalized_domain ?? match.normalized_title ?? "Matched role",
    posted: "matched",
    matchScore: percentScore,
    salary: "Not disclosed",
    description: match.recommendation,
    skills: match.matched_skills,
    missingSkills: match.missing_skills,
    sourceUrl: match.source_url,
    sourceName: null,
    isFavorite: match.is_favorite,
    rawDescription: match.recommendation,
  };
}

export function getMatchingPreview(jobOfferId: number) {
  return apiGet<MatchingPreview>(`/matching/preview/${jobOfferId}`);
}

export function getAiScore(jobOfferId: number) {
  return apiPost<MatchingAiScore>(`/matching/ai-score/${jobOfferId}`);
}

export function getCandidateJobMatches(limit = 20) {
  return apiGet<CandidateJobMatch[]>(`/matching/me/jobs?limit=${limit}`, {
    cacheTtlMs: 45_000,
  });
}

export async function getJobMatches(limit = 20): Promise<JobMatch[]> {
  const offers = await getJobOffers({ limit });
  try {
    const matches = await getCandidateJobMatches(limit);
    const matchesByOfferId = new Map(
      matches.map((match) => [match.job_offer_id, match]),
    );

    return offers.map((offer) => {
      const match = matchesByOfferId.get(offer.id);
      if (!match) return offerToJobMatch(offer);
      const scoredJob = candidateMatchToJobMatch(match);
      return {
        ...offerToJobMatch(offer),
        matchScore: scoredJob.matchScore,
        description: scoredJob.description,
        missingSkills: scoredJob.missingSkills,
        isFavorite: scoredJob.isFavorite,
      };
    });
  } catch {
    return offers.map(offerToJobMatch);
  }
}
