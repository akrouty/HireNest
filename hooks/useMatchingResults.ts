"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
  getAiScore,
  getJobMatches,
  type JobMatch,
} from "@/services/matching.service";
import { ApiError } from "@/services/api";
import { getMyCVExtraction } from "@/services/cv-extraction.service";
import {
  getJobSearchOptions,
  removeFavoriteJobOffer,
  saveFavoriteJobOffer,
  searchJobOffers,
  type JobSearchOptions,
} from "@/services/job-offers.service";
import { getMyResume } from "@/services/resume.service";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";

const TUNISIA_LOCATION_TERMS = [
  "tunisia",
  "tunisie",
  "tunis",
  "sousse",
  "sfax",
  "kairouan",
  "bizerte",
  "nabeul",
  "hammamet",
  "monastir",
  "mahdia",
  "gabes",
  "gafsa",
  "tozeur",
  "kebili",
  "medenine",
  "tataouine",
  "kasserine",
  "sidi bouzid",
  "siliana",
  "kef",
  "jendouba",
  "beja",
  "zaghouan",
  "ariana",
  "ben arous",
  "manouba",
  "\u062a\u0648\u0646\u0633",
];
const RECOMMENDED_BATCH_SIZE = 20;
const MAX_RECOMMENDED_JOBS = 60;
const MAX_AUTO_SCORE_JOBS = 4;
const AUTO_SCORE_BATCH_SIZE = 2;
const CV_REQUIRED_MESSAGE = "Upload and extract your CV before using job matching.";

function includesAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}

async function optional<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch (err) {
    if (err instanceof ApiError && [400, 401, 403, 404].includes(err.status)) {
      return null;
    }
    throw err;
  }
}

export function useMatchingResults() {
  const { isOffline, blockIfOffline } = useOfflineStatus();
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [location, setLocation] = useState("all");
  const [sector, setSector] = useState("all");
  const [searchOptions, setSearchOptions] = useState<JobSearchOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresCv, setRequiresCv] = useState(false);
  const [searchingJobs, setSearchingJobs] = useState(false);
  const [recommendationLimit, setRecommendationLimit] = useState(RECOMMENDED_BATCH_SIZE);
  const scoredJobIds = useRef<Set<number>>(new Set());

  const mergeAiScore = useCallback((job: JobMatch, result: Awaited<ReturnType<typeof getAiScore>>) => {
    return {
      ...job,
      matchScore:
        result.semantic_score == null
          ? job.matchScore
          : Math.round(result.semantic_score * 100),
      skills: result.matched_skills.length ? result.matched_skills : job.skills,
      missingSkills: result.missing_skills,
      description: result.notes.length ? result.notes.join(" ") : job.description,
    };
  }, []);

  const scoreJobsAutomatically = useCallback(
    async (inputJobs: JobMatch[]) => {
      if (isOffline) return;
      const targets = inputJobs
        .filter((job) => !scoredJobIds.current.has(job.id))
        .slice(0, MAX_AUTO_SCORE_JOBS);

      for (let index = 0; index < targets.length; index += AUTO_SCORE_BATCH_SIZE) {
        const batch = targets.slice(index, index + AUTO_SCORE_BATCH_SIZE);
        await Promise.all(
          batch.map(async (job) => {
            scoredJobIds.current.add(job.id);
            try {
              const result = await getAiScore(job.id);
              setJobs((current) =>
                current.map((item) =>
                  item.id === job.id ? mergeAiScore(item, result) : item,
                ),
              );
            } catch {
              scoredJobIds.current.delete(job.id);
            }
          }),
        );
      }
    },
    [isOffline, mergeAiScore],
  );

  const runJobSearch = useCallback(
    async (
      nextLocation = location,
      showToast = true,
      nextLimit = recommendationLimit,
    ) => {
      if (blockIfOffline("job search")) return null;
      if (requiresCv) {
        toast.error("CV required", { description: CV_REQUIRED_MESSAGE });
        return null;
      }
      const query = searchQuery.trim() || "Python developer";
      setSearchingJobs(true);
      setError(null);
      try {
        const result = await searchJobOffers(query, nextLocation, nextLimit);
        const data = await getJobMatches(nextLimit);
        scoredJobIds.current.clear();
        setJobs(data);
        void scoreJobsAutomatically(data);
        if (showToast) {
          toast.success("Job search completed", {
            description: `${result.imported_count} new, ${result.updated_count} updated.`,
          });
        }
        return result;
      } catch {
        setJobs([]);
        setError("No jobs found");
        if (showToast) toast.error("No jobs found");
        return null;
      } finally {
        setSearchingJobs(false);
      }
    },
    [blockIfOffline, location, recommendationLimit, requiresCv, scoreJobsAutomatically, searchQuery],
  );

  useEffect(() => {
    let mounted = true;

    async function load(showToast = true) {
      if (isOffline) {
        setLoading(false);
        setError("Job offers require a live backend connection.");
        return;
      }

      setLoading(true);
        setError(null);
        try {
        const [data, options] = await Promise.all([
          Promise.all([optional(getMyResume()), optional(getMyCVExtraction())]),
          getJobSearchOptions().catch(() => null),
        ]);
        const [resume, extraction] = data;
        const ready = Boolean(
          resume &&
            resume.parsing_status === "parsed" &&
            extraction?.skills?.length,
        );
        if (!mounted) return;
        setSearchOptions(options);
        setRequiresCv(!ready);
        if (!ready) {
          setJobs([]);
          setError(null);
          return;
        }
        const matches = await getJobMatches(RECOMMENDED_BATCH_SIZE);
        if (!mounted) return;
        setJobs(matches);
        void scoreJobsAutomatically(matches);
        if (showToast) {
          toast.success("Job offers loaded", {
            description: `${matches.length} offers available.`,
          });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to load jobs";
        if (!mounted) return;
        setError(message);
        toast.error("Job offers failed to load", { description: message });
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [isOffline, scoreJobsAutomatically]);

  const filteredJobs = useMemo(() => {
    const query = debouncedSearchQuery.trim().toLowerCase();
    const selectedLocationName =
      (searchOptions?.locations ?? searchOptions?.countries ?? [])
        .find((option) => option.code === location)
        ?.name.toLowerCase() ?? location;

    return jobs.filter((job) => {
      const haystack = [
        job.title,
        job.company,
        job.location,
        job.description,
        job.type,
        ...job.skills,
      ]
        .join(" ")
        .toLowerCase();
      const locationText = job.location.toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      const matchesLocation =
        location === "all" ||
        locationText.includes(location.replace("-", " ")) ||
        locationText.includes(selectedLocationName) ||
        (location === "tn" && includesAny(locationText, TUNISIA_LOCATION_TERMS)) ||
        (location === "fr" &&
          includesAny(locationText, [
            "france",
            "paris",
            "lyon",
            "marseille",
            "toulouse",
            "nantes",
            "lille",
          ])) ||
        (location === "gb" &&
          includesAny(locationText, [
            "united kingdom",
            "uk",
            "london",
            "manchester",
            "birmingham",
          ])) ||
        (location === "us" &&
          includesAny(locationText, [
            "united states",
            "usa",
            "us",
            "new york",
            "chicago",
            "dallas",
            "seattle",
          ]));
      const matchesSector = sector === "all" || haystack.includes(sector);
      return matchesQuery && matchesLocation && matchesSector;
    });
  }, [debouncedSearchQuery, jobs, location, searchOptions, sector]);

  const locationOptions = searchOptions?.locations ?? searchOptions?.countries ?? [
    { code: "all", name: "All locations" },
    { code: "tn", name: "Tunisia" },
    { code: "fr", name: "France" },
  ];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  return {
    jobs: filteredJobs,
    loading,
    error,
    isOffline,
    requiresCv,
    cvRequiredMessage: CV_REQUIRED_MESSAGE,
    searchingJobs,
    recommendationLimit,
    canFindMore: recommendationLimit < MAX_RECOMMENDED_JOBS,
    location,
    setLocation,
    locationOptions,
    searchOptions,
    searchQuery,
    setSearchQuery,
    sector,
    setSector,
    searchJobs: () => runJobSearch(location, true, recommendationLimit),
    async findMoreJobs() {
      if (blockIfOffline("more job recommendations")) return null;
      if (requiresCv) {
        toast.error("CV required", { description: CV_REQUIRED_MESSAGE });
        return null;
      }
      const nextLimit = Math.min(
        MAX_RECOMMENDED_JOBS,
        recommendationLimit + RECOMMENDED_BATCH_SIZE,
      );
      setRecommendationLimit(nextLimit);
      return runJobSearch(location, true, nextLimit);
    },
    async toggleFavorite(jobOfferId: number) {
      if (blockIfOffline("job favorites")) return null;
      if (requiresCv) {
        toast.error("CV required", { description: CV_REQUIRED_MESSAGE });
        return null;
      }
      const job = jobs.find((item) => item.id === jobOfferId);
      const nextFavorite = !job?.isFavorite;
      setJobs((current) =>
        current.map((item) =>
          item.id === jobOfferId ? { ...item, isFavorite: nextFavorite } : item,
        ),
      );
      try {
        if (nextFavorite) {
          await saveFavoriteJobOffer(jobOfferId);
          toast.success("Job saved");
        } else {
          await removeFavoriteJobOffer(jobOfferId);
          toast.success("Job removed from favorites");
        }
      } catch (err) {
        setJobs((current) =>
          current.map((item) =>
            item.id === jobOfferId ? { ...item, isFavorite: !nextFavorite } : item,
          ),
        );
        const message = err instanceof Error ? err.message : "Unable to update favorite";
        toast.error("Favorite update failed", { description: message });
      }
      return null;
    },
  };
}
