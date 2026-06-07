"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  Briefcase,
  Building2,
  Clock,
  ExternalLink,
  FileText,
  MapPin,
  RefreshCw,
  Search,
  Star,
} from "lucide-react";
import Link from "next/link";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMatchingResults } from "@/hooks/useMatchingResults";

function useAnimatedCount(value: number) {
  const [count, setCount] = useState(value);
  const previousValue = useRef(value);

  useEffect(() => {
    const start = previousValue.current;
    const diff = value - start;
    if (!diff) {
      setCount(value);
      return;
    }
    const startedAt = performance.now();
    const duration = 450;
    let frame = 0;

    function tick(now: number) {
      const progress = Math.min(1, (now - startedAt) / duration);
      setCount(Math.round(start + diff * progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    previousValue.current = value;
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return count;
}

function ScorePanel({ score }: { score: number }) {
  const animatedScore = useAnimatedCount(score);
  const clampedScore = Math.max(0, Math.min(100, animatedScore));
  const bars = [48, 64, 78, Math.max(22, clampedScore)];

  return (
    <div className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 lg:w-44">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Match score
          </p>
          <p className="mt-1 text-4xl font-black leading-none text-slate-950">
            {clampedScore}
            <span className="text-xl">%</span>
          </p>
        </div>
        <div
          className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(#0284c7 ${clampedScore * 3.6}deg, #dbeafe 0deg)`,
          }}
        >
          <div className="h-9 w-9 rounded-full bg-white" />
        </div>
      </div>
      <div className="mt-4 flex h-8 items-end gap-1.5">
        {bars.map((height, index) => (
          <span
            key={`${height}-${index}`}
            className="flex-1 rounded-t-md bg-sky-500/80 transition-all duration-500"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {score > 0 ? "Ranked by compatibility" : "Scoring automatically"}
      </p>
    </div>
  );
}

function JobCardSkeleton() {
  return (
    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardContent className="space-y-5 p-4 sm:p-6">
        <div className="flex gap-4">
          <Skeleton className="h-14 w-14 rounded-xl" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-2/5" />
            <Skeleton className="h-4 w-3/5" />
          </div>
        </div>
        <Skeleton className="h-16 w-full" />
        <div className="grid gap-3 sm:grid-cols-4">
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function JobsPage() {
  const {
    jobs,
    searchQuery,
    setSearchQuery,
    location,
    setLocation,
    locationOptions,
    sector,
    setSector,
    loading,
    error,
    isOffline,
    requiresCv,
    cvRequiredMessage,
    searchingJobs,
    recommendationLimit,
    canFindMore,
    searchJobs,
    findMoreJobs,
    toggleFavorite,
  } = useMatchingResults();
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [sortMode, setSortMode] = useState("score-desc");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const visibleJobs = useMemo(() => {
    const filtered = jobs.filter((job) => !showSavedOnly || job.isFavorite);
    return [...filtered].sort((left, right) => {
      if (sortMode === "score-asc") return left.matchScore - right.matchScore;
      if (sortMode === "newest") return right.id - left.id;
      return right.matchScore - left.matchScore || right.id - left.id;
    });
  }, [jobs, showSavedOnly, sortMode]);
  const totalPages = Math.max(1, Math.ceil(visibleJobs.length / pageSize));
  const paginatedJobs = visibleJobs.slice((page - 1) * pageSize, page * pageSize);
  const animatedTotal = useAnimatedCount(visibleJobs.length);
  const selectedJob = visibleJobs.find((job) => job.id === selectedJobId) ?? null;
  const busy = loading || searchingJobs;

  useEffect(() => {
    setShowSavedOnly(new URLSearchParams(window.location.search).get("saved") === "1");
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, location, sector, showSavedOnly, sortMode]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <DashboardLayout>
      <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <section>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Job Matcher
          </h1>
          <p className="mt-2 max-w-3xl text-base leading-7 text-slate-500">
            Discover high-potential job offers matched to your profile, skills,
            and career goals.
          </p>
        </section>

        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardContent className="space-y-5 p-4 sm:p-6">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_190px_170px_180px] lg:gap-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search jobs by title, company, or keywords..."
                  className="h-12 rounded-xl border-slate-200 bg-slate-50 pl-12"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  disabled={requiresCv}
                />
              </div>
              <Select value={location} onValueChange={setLocation} disabled={requiresCv}>
                <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50">
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  {locationOptions.map((option) => (
                    <SelectItem key={option.code} value={option.code}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sector} onValueChange={setSector} disabled={requiresCv}>
                <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50">
                  <SelectValue placeholder="All sectors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sectors</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="data">Data</SelectItem>
                </SelectContent>
              </Select>
              <Button
                className="h-12 rounded-xl bg-[#020817] hover:bg-slate-800"
                disabled={isOffline || searchingJobs || requiresCv}
                onClick={() => void searchJobs()}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${searchingJobs ? "animate-spin" : ""}`} />
                {searchingJobs ? "Searching" : "Search job"}
              </Button>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="font-semibold text-slate-600">
                {busy ? "Loading job offers..." : `Showing ${animatedTotal} matches`}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Select value={sortMode} onValueChange={setSortMode} disabled={requiresCv}>
                  <SelectTrigger className="h-10 w-[190px] rounded-xl border-slate-200 bg-white">
                    <BarChart3 className="mr-2 h-4 w-4 text-slate-500" />
                    <SelectValue placeholder="Sort jobs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="score-desc">Best match first</SelectItem>
                    <SelectItem value="score-asc">Lowest score first</SelectItem>
                    <SelectItem value="newest">Newest imported</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant={showSavedOnly ? "default" : "outline"}
                  className="rounded-xl"
                  disabled={requiresCv}
                  onClick={() => setShowSavedOnly((value) => !value)}
                >
                  <Star className={`mr-2 h-4 w-4 ${showSavedOnly ? "fill-current" : ""}`} />
                  Saved jobs
                </Button>
              </div>
              {isOffline ? (
                <p className="font-semibold text-amber-700">Offline mode</p>
              ) : null}
            </div>
            {error ? (
              <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                No jobs found
              </p>
            ) : null}
          </CardContent>
        </Card>

        <section className="space-y-5">
          {!busy && requiresCv ? (
            <Card className="rounded-2xl border-sky-100 bg-white shadow-sm">
              <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-950">Upload and extract your CV first</h2>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                      {cvRequiredMessage} Job search, matching, scoring, and saved-job actions stay locked until your CV is parsed and skills are extracted.
                    </p>
                  </div>
                </div>
                <Button asChild className="rounded-xl bg-[#020817] hover:bg-slate-800">
                  <Link href="/resume">Go to Resume</Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}
          {busy ? (
            <>
              <JobCardSkeleton />
              <JobCardSkeleton />
              <JobCardSkeleton />
            </>
          ) : null}
          {!busy && !requiresCv && !visibleJobs.length ? (
            <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
              <CardContent className="p-6 text-sm text-slate-600">
                {isOffline
                  ? "Job offers are unavailable offline. Reconnect to load live offers."
                  : showSavedOnly
                    ? "No saved jobs yet."
                    : "No job offers match your current filters."}
              </CardContent>
            </Card>
          ) : null}
          {!busy && paginatedJobs.map((job) => (
            <Card
              key={job.id}
              className="rounded-2xl border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-sky-200 hover:shadow-md"
            >
              <CardContent className="space-y-4 p-4 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-700 sm:h-14 sm:w-14">
                      <Briefcase className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-semibold text-slate-950">
                          {job.title}
                        </h2>
                        <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-slate-700">
                          {job.salary}
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {job.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {job.type}
                        </span>
                        <span>Posted {job.posted}</span>
                        {job.sourceName ? (
                          <Badge variant="outline" className="rounded-full border-slate-200 bg-white text-slate-600">
                            {job.sourceName}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <ScorePanel score={job.matchScore} />
                </div>

                <p className="line-clamp-2 max-w-4xl text-sm leading-6 text-slate-600">
                  {job.description}
                </p>

                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Missing skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {job.missingSkills.length ? job.missingSkills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="rounded-md border-amber-200 bg-amber-50 text-amber-700"
                      >
                        {skill}
                      </Badge>
                    )) : (
                      <p className="text-sm text-slate-500">
                        No missing skills detected yet.
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                  <Button
                    className="w-full rounded-xl bg-[#0284c7] hover:bg-[#0369a1]"
                    disabled={isOffline || !job.sourceUrl}
                    onClick={() => {
                      if (job.sourceUrl) window.open(job.sourceUrl, "_blank", "noopener,noreferrer");
                    }}
                  >
                    Apply Now
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-slate-300 bg-white"
                    onClick={() => setSelectedJobId(job.id)}
                  >
                    Details
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-slate-300 bg-white"
                    disabled={isOffline}
                    onClick={() => void toggleFavorite(job.id)}
                  >
                    <Star className={`mr-2 h-4 w-4 ${job.isFavorite ? "fill-amber-400 text-amber-500" : ""}`} />
                    {job.isFavorite ? "Saved" : "Save Job"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {!busy && visibleJobs.length > pageSize ? (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                disabled={page === 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <Button
                  key={pageNumber}
                  type="button"
                  variant={pageNumber === page ? "default" : "outline"}
                  className="h-10 w-10 rounded-xl p-0"
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              ))}
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                disabled={page === totalPages}
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              >
                Next
              </Button>
            </div>
          ) : null}
          {!busy && visibleJobs.length > 0 && canFindMore ? (
            <div className="flex justify-center pt-1">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-slate-300 bg-white px-6"
                disabled={isOffline || searchingJobs}
                onClick={() => void findMoreJobs()}
              >
                Find more
                <span className="ml-2 text-xs text-slate-500">
                  showing top {recommendationLimit}
                </span>
              </Button>
            </div>
          ) : null}
        </section>

        <Dialog open={Boolean(selectedJob)} onOpenChange={(open) => !open && setSelectedJobId(null)}>
          <DialogContent className="max-w-3xl">
            {selectedJob ? (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedJob.title}</DialogTitle>
                  <DialogDescription>
                    {selectedJob.company} - {selectedJob.location}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-5">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{selectedJob.type}</Badge>
                    {selectedJob.sourceName ? (
                      <Badge variant="outline">{selectedJob.sourceName}</Badge>
                    ) : null}
                    {selectedJob.matchScore > 0 ? (
                      <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                        {selectedJob.matchScore}% match
                      </Badge>
                    ) : null}
                    {selectedJob.isFavorite ? (
                      <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                        Saved
                      </Badge>
                    ) : null}
                  </div>
                  <p className="max-h-72 overflow-auto rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">
                    {selectedJob.rawDescription || selectedJob.description}
                  </p>
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Missing skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.missingSkills.length ? selectedJob.missingSkills.map((skill) => (
                        <Badge key={skill} variant="outline" className="rounded-md border-amber-200 bg-amber-50 text-amber-700">
                          {skill}
                        </Badge>
                      )) : (
                        <span className="text-sm text-slate-500">No missing skills detected yet.</span>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button
                      className="rounded-xl bg-[#0284c7] hover:bg-[#0369a1]"
                      disabled={!selectedJob.sourceUrl}
                      onClick={() => {
                        if (selectedJob.sourceUrl) window.open(selectedJob.sourceUrl, "_blank", "noopener,noreferrer");
                      }}
                    >
                      Open job link
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => void toggleFavorite(selectedJob.id)}
                    >
                      <Star className={`mr-2 h-4 w-4 ${selectedJob.isFavorite ? "fill-amber-400 text-amber-500" : ""}`} />
                      {selectedJob.isFavorite ? "Remove saved job" : "Save job"}
                    </Button>
                  </div>
                </div>
              </>
            ) : null}
          </DialogContent>
        </Dialog>
      </main>
    </DashboardLayout>
  );
}
