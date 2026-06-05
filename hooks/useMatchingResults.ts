"use client";

import { useEffect, useMemo, useState } from "react";
import { getJobMatches, type JobMatch } from "@/services/matching.service";

export function useMatchingResults() {
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [region, setRegion] = useState("all");
  const [sector, setSector] = useState("all");

  useEffect(() => {
    void getJobMatches().then(setJobs);
  }, []);

  const filteredJobs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return jobs;

    return jobs.filter((job) =>
      [job.title, job.company, job.location, job.description, ...job.skills]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [jobs, searchQuery]);

  return {
    jobs: filteredJobs,
    searchQuery,
    setSearchQuery,
    region,
    setRegion,
    sector,
    setSector,
  };
}
