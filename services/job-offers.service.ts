import { apiDelete, apiGet, apiPost, invalidateApiCache } from "@/services/api";

export type JobOffer = {
  id: number;
  external_id: string | null;
  title: string;
  company_name: string | null;
  location: string | null;
  description: string | null;
  normalized_title: string | null;
  normalized_domain: string | null;
  experience_level: string | null;
  employment_type: string | null;
  source_name: string | null;
  source_url: string | null;
  is_active: boolean;
  collected_at: string | null;
  created_at: string;
  updated_at: string | null;
  skills: string[];
  is_favorite: boolean;
};

export type JobOfferSearchResult = {
  status: "ok";
  source: "jobSearch" | "job-search";
  query: string;
  location?: string;
  pages: number;
  results_wanted?: number;
  imported_count: number;
  updated_count: number;
  total_processed: number;
  results?: JobOffer[];
};

export type JobSearchOptions = {
  locations?: { code: string; name: string }[];
  countries: { code: string; name: string }[];
  recommended: string[];
  future_note: string;
};

export function getJobOffers(params: { skip?: number; limit?: number } = {}) {
  const search = new URLSearchParams();
  if (params.skip !== undefined) search.set("skip", String(params.skip));
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  const suffix = search.toString() ? `?${search}` : "";
  return apiGet<JobOffer[]>(`/job-offers${suffix}`, { cacheTtlMs: 60_000 });
}

export function getJobOffer(jobOfferId: number) {
  return apiGet<JobOffer>(`/job-offers/${jobOfferId}`, { auth: false });
}

export function searchJobOffers(query: string, country?: string, resultsWanted = 20) {
  const search = new URLSearchParams({ query });
  if (country && country !== "all") search.set("location", country);
  search.set("results_wanted", String(resultsWanted));
  invalidateApiCache("/job-offers");
  invalidateApiCache("/matching/me/jobs");
  return apiPost<JobOfferSearchResult>(`/job-search/search?${search}`);
}

export function getJobSearchOptions() {
  return apiGet<JobSearchOptions>("/job-search/options", {
    auth: false,
    cacheTtlMs: 10 * 60_000,
  });
}

export function getFavoriteJobOffers() {
  return apiGet<JobOffer[]>("/job-offers/favorites");
}

export function saveFavoriteJobOffer(jobOfferId: number) {
  invalidateApiCache("/job-offers");
  return apiPost<JobOffer>(`/job-offers/${jobOfferId}/favorite`);
}

export function removeFavoriteJobOffer(jobOfferId: number) {
  invalidateApiCache("/job-offers");
  return apiDelete<void>(`/job-offers/${jobOfferId}/favorite`);
}
