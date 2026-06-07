"use client";

import { useEffect, useMemo, useState } from "react";

import { ApiError } from "@/services/api";
import {
  getMyCVExtraction,
  type CVExtraction,
} from "@/services/cv-extraction.service";
import { getJobOffers, type JobOffer } from "@/services/job-offers.service";
import {
  getCandidateJobMatches,
  type CandidateJobMatch,
} from "@/services/matching.service";
import { getMyProfile, type CandidateProfile } from "@/services/profile.service";
import { getMyResume, type ResumeRecord } from "@/services/resume.service";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";

type CareerData = {
  profile: CandidateProfile | null;
  resume: ResumeRecord | null;
  extraction: CVExtraction | null;
  matches: CandidateJobMatch[];
  offers: JobOffer[];
};

type UseCareerDataOptions = {
  includeJobs?: boolean;
  includeMatches?: boolean;
};

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

export function useCareerData(options: UseCareerDataOptions = {}) {
  const { includeJobs = false, includeMatches = false } = options;
  const { isOffline } = useOfflineStatus();
  const [data, setData] = useState<CareerData>({
    profile: null,
    resume: null,
    extraction: null,
    matches: [],
    offers: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (isOffline) {
        setLoading(false);
        setError("Live career data requires the backend connection.");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const [profile, resume, extraction] = await Promise.all([
          optional(getMyProfile()),
          optional(getMyResume()),
          optional(getMyCVExtraction()),
        ]);
        const hasParsedResume = resume?.parsing_status === "parsed";
        const hasExtraction = Boolean(extraction?.skills?.length);
        const careerReady = Boolean(resume && hasParsedResume && hasExtraction);
        const [matches, offers] = careerReady
          ? await Promise.all([
              includeMatches ? optional(getCandidateJobMatches()) : Promise.resolve(null),
              includeJobs ? getJobOffers({ limit: 50 }) : Promise.resolve([]),
            ])
          : [null, [] as JobOffer[]];

        if (!mounted) return;
        setData({
          profile,
          resume,
          extraction,
          matches: matches ?? [],
          offers,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to load career data";
        if (!mounted) return;
        setError(message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [includeJobs, includeMatches, isOffline]);

  return useMemo(() => {
    const detectedSkills = data.extraction?.skills.map((skill) => skill.name) ?? [];
    const missingSkills = Array.from(
      new Set(data.matches.flatMap((match) => match.missing_skills)),
    );
    const matchedSkills = Array.from(
      new Set(data.matches.flatMap((match) => match.matched_skills)),
    );
    const bestMatches = [...data.matches].sort(
      (a, b) => (b.semantic_score ?? -1) - (a.semantic_score ?? -1),
    );

    return {
      ...data,
      loading,
      error,
      isOffline,
      detectedSkills,
      missingSkills,
      matchedSkills,
      bestMatches,
      hasProfile: Boolean(data.profile),
      hasResume: Boolean(data.resume),
      hasParsedResume: data.resume?.parsing_status === "parsed",
      hasExtraction: Boolean(detectedSkills.length),
      careerReady: Boolean(
        data.resume &&
          data.resume.parsing_status === "parsed" &&
          detectedSkills.length,
      ),
      hasMatches: Boolean(data.matches.length),
      hasOffers: Boolean(data.offers.length),
    };
  }, [data, error, isOffline, loading]);
}
