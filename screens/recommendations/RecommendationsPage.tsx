"use client";

import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Info,
  Lightbulb,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCareerData } from "@/hooks/useCareerData";
import { getAiCareerInsights, type CareerInsightsReport } from "@/services/recommendation.service";

function progressTone(value: number | null) {
  if (value == null) return "bg-slate-100 text-slate-700 hover:bg-slate-100";
  if (value >= 75) return "bg-emerald-50 text-emerald-700 hover:bg-emerald-50";
  if (value >= 50) return "bg-sky-50 text-sky-700 hover:bg-sky-50";
  return "bg-amber-50 text-amber-700 hover:bg-amber-50";
}

type DigestCarouselItem = {
  source: string;
  title: string;
  text: string;
  weeks?: number;
  rank?: number;
  steps?: string[];
};

function digestPreview(report: CareerInsightsReport | null) {
  const digest = report?.personalized_digest;
  if (!digest) return "";
  if (typeof digest.summary === "string" && digest.summary.trim()) return digest.summary.trim();
  if (typeof digest.profile_snapshot === "string" && digest.profile_snapshot.trim()) {
    return digest.profile_snapshot.trim();
  }
  const firstItem = digest.digest_items?.find((item) =>
    [item.summary, item.description, item.title].some((value) => value && value.trim()),
  );
  return (firstItem?.summary || firstItem?.description || firstItem?.title || "").trim();
}

function digestItems(report: CareerInsightsReport | null): DigestCarouselItem[] {
  const digest = report?.personalized_digest;
  const priorities = report?.learning_priority?.priorities ?? [];
  const digestCards = digest?.digest_items
    ?.map((item) => ({
      source: "Personalized digest",
      title: item.title || "",
      text: item.summary || item.description || "",
    }))
    .filter((item) => item.title || item.text) ?? [];

  const summary = digestPreview(report);
  const summaryCards =
    !digestCards.length && summary
      ? [{ source: "Personalized digest", title: "Personalized digest", text: summary }]
      : [];

  const priorityCards = priorities
    .map((priority, index) => ({
      source: "Learning priority",
      title: priority.skill || `Learning priority ${index + 1}`,
      text:
        priority.priority_reason ||
        priority.learning_path?.approach ||
        "High-impact learning recommendation from the Career Insights model.",
      weeks: priority.estimated_weeks,
      rank: priority.rank ?? index + 1,
      steps: priority.learning_path?.steps?.slice(0, 2) ?? [],
    }))
    .filter((item) => item.title || item.text);

  return [...digestCards, ...summaryCards, ...priorityCards];
}

export default function RecommendationsPage() {
  const [aiInsights, setAiInsights] = useState<CareerInsightsReport | null>(null);
  const [aiInsightsLoading, setAiInsightsLoading] = useState(true);
  const [aiInsightsError, setAiInsightsError] = useState("");
  const [activeDigestIndex, setActiveDigestIndex] = useState(0);
  const [digestDirection, setDigestDirection] = useState<"left" | "right">("left");
  const swipeStartXRef = useRef<number | null>(null);
  const {
    profile,
    loading,
    error,
    isOffline,
    detectedSkills,
    missingSkills,
    matchedSkills,
    bestMatches,
    hasProfile,
    hasResume,
    hasParsedResume,
    hasExtraction,
    hasMatches,
    hasOffers,
  } = useCareerData({ includeJobs: true, includeMatches: true });

  const profileStrength = Math.min(
    100,
    (hasProfile ? 20 : 0) +
      (hasResume ? 20 : 0) +
      (hasParsedResume ? 20 : 0) +
      (hasExtraction ? 20 : 0) +
      (hasMatches || hasOffers ? 20 : 0),
  );
  const topMissingSkills = missingSkills.slice(0, 6);
  const modelSkillGap = aiInsights?.skill_gap?.filter(Boolean).slice(0, 8) ?? [];
  const visibleSkillGap = modelSkillGap.length ? modelSkillGap : topMissingSkills;
  const learningPriorities = useMemo(
    () => aiInsights?.learning_priority?.priorities?.filter((item) => item.skill).slice(0, 3) ?? [],
    [aiInsights],
  );
  const digestText = digestPreview(aiInsights);
  const digestList = useMemo(() => digestItems(aiInsights), [aiInsights]);
  const moduleInfo = aiInsights?.module;
  const tokenBudgets = moduleInfo?.token_budgets ?? {};
  const inputCounts = moduleInfo?.input_counts ?? {};
  const targetRole =
    profile?.target_job_title || profile?.professional_title || "Target role not set";

  useEffect(() => {
    let cancelled = false;
    setAiInsightsLoading(true);
    setAiInsightsError("");
    getAiCareerInsights()
      .then((data) => {
        if (!cancelled) setAiInsights(data);
      })
      .catch((err) => {
        if (!cancelled) setAiInsightsError(err instanceof Error ? err.message : "AI career insights unavailable.");
      })
      .finally(() => {
        if (!cancelled) setAiInsightsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setActiveDigestIndex(0);
  }, [digestList.length]);

  const moveDigest = useCallback(
    (direction: "left" | "right") => {
      if (digestList.length <= 1) return;
      setDigestDirection(direction);
      setActiveDigestIndex((current) => {
        if (direction === "left") return (current + 1) % digestList.length;
        return (current - 1 + digestList.length) % digestList.length;
      });
    },
    [digestList.length],
  );

  useEffect(() => {
    if (digestList.length <= 1 || aiInsightsLoading) return;
    const timer = window.setInterval(() => {
      moveDigest("left");
    }, 5200);
    return () => window.clearInterval(timer);
  }, [aiInsightsLoading, digestList.length, moveDigest]);

  function handleDigestPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    swipeStartXRef.current = event.clientX;
  }

  function handleDigestPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const startX = swipeStartXRef.current;
    swipeStartXRef.current = null;
    if (startX == null) return;
    const distance = event.clientX - startX;
    if (Math.abs(distance) < 48) return;
    moveDigest(distance < 0 ? "left" : "right");
  }

  useEffect(() => {
    if (aiInsights?.status !== "refreshing") return;
    const timer = window.setTimeout(() => {
      getAiCareerInsights()
        .then(setAiInsights)
        .catch(() => undefined);
    }, 6500);
    return () => window.clearTimeout(timer);
  }, [aiInsights?.status]);

  return (
    <DashboardLayout>
      <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <section>
          <p className="text-sm font-semibold text-sky-700">Career Insights</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Recommendations
          </h1>
          <p className="mt-2 max-w-3xl text-base leading-7 text-slate-500">
            Recommendations are derived from your candidate profile, resume
            extraction, and matching results. Advanced AI career insights are
            shown only when the model is connected.
          </p>
        </section>

        {error ? (
          <Card className="rounded-2xl border-red-100 bg-red-50 text-red-700">
            <CardContent className="p-4 text-sm">{error}</CardContent>
          </Card>
        ) : null}

        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardContent className="space-y-5 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-950">AI Career Insights model</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {aiInsightsLoading
                      ? "Connecting to the career-insights module..."
                      : aiInsightsError
                        ? aiInsightsError
                        : aiInsights?.status === "missing_input"
                          ? `Waiting for: ${(aiInsights.missing_inputs || []).join(", ")}.`
                          : aiInsights?.status === "refreshing"
                            ? "Fast preview is shown while the local model refreshes the full insights."
                          : aiInsights?.status === "unavailable"
                            ? "Career Insights is temporarily unavailable. Other dashboard data remains usable."
                          : "Connected to skill-gap, learning-priority, and personalized-digest APIs."}
                  </p>
                </div>
              </div>
              <Badge
                className={
                  aiInsightsLoading
                    ? "rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100"
                    : aiInsights?.status === "ok"
                      ? "rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                      : "rounded-full bg-amber-50 text-amber-700 hover:bg-amber-50"
                }
              >
                {aiInsightsLoading ? "Loading" : aiInsights?.status === "ok" ? "Model live" : aiInsights?.status === "refreshing" ? "Refreshing" : aiInsights?.status === "unavailable" ? "Unavailable" : "Needs data"}
              </Badge>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              {[
                ["Model", moduleInfo?.model_name || "llama3.2:3b"],
                ["Runtime", moduleInfo?.runtime || "local-ollama"],
                ["Quota", moduleInfo?.quota_model === "local" ? "Local only" : moduleInfo?.quota_model || "Local"],
                ["Inputs", `${inputCounts.jobs ?? 0} jobs · ${inputCounts.cv_skills ?? 0} skills`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
                  <p className="mt-1 truncate text-sm font-bold text-slate-950">{value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-400">Model quota / token budgets</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    ["Skill Gap", tokenBudgets.skill_gap ?? 512],
                    ["Learning Priority", tokenBudgets.learning_priority ?? 2048],
                    ["Personalized Digest", tokenBudgets.personalized_digest ?? 512],
                  ].map(([label, value]) => (
                    <Badge key={label} className="rounded-full bg-white text-slate-700 hover:bg-white">
                      {label}: {value} tokens
                    </Badge>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  {moduleInfo?.quota_note || "No cloud quota or API key. Limited by local Ollama and configured token budgets."}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-400">Consumed Career Insights APIs</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(moduleInfo?.endpoints || [
                    { name: "Skill Gap", method: "POST", path: "/api/v1/skill-gap" },
                    { name: "Learning Priority", method: "POST", path: "/api/v1/learning-priority" },
                    { name: "Personalized Digest", method: "POST", path: "/api/v1/personalized-digest" },
                  ]).map((endpoint) => (
                    <Badge key={endpoint.path} className="rounded-full bg-white text-slate-700 hover:bg-white">
                      {endpoint.method} {endpoint.path}
                    </Badge>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  Ollama: {moduleInfo?.ollama_base_url || "http://127.0.0.1:11434"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-4 lg:gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">Profile readiness</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-950">
                    Profile Strength
                  </h2>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#0284c7] text-lg font-bold text-slate-950">
                  {loading ? "--" : `${profileStrength}%`}
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {loading ? (
                  <>
                    <Skeleton className="h-20 rounded-2xl" />
                    <Skeleton className="h-20 rounded-2xl" />
                    <Skeleton className="h-20 rounded-2xl" />
                  </>
                ) : (
                  [
                    {
                      title: hasProfile ? "Profile loaded" : "Create profile",
                      description: hasProfile
                        ? `Target: ${targetRole}`
                        : "Add target role and location in Settings.",
                      icon: hasProfile ? CheckCircle2 : Target,
                      tone: hasProfile
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700",
                    },
                    {
                      title: hasExtraction ? "CV extraction available" : "CV extraction pending",
                      description: hasExtraction
                        ? `${detectedSkills.length} skills detected from your CV.`
                        : "Upload, parse, and extract your CV to unlock skill-based advice.",
                      icon: hasExtraction ? CheckCircle2 : Lightbulb,
                      tone: hasExtraction
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-sky-50 text-sky-700",
                    },
                    {
                      title: hasMatches ? "Matching data ready" : "Matching not ready",
                      description: hasMatches
                        ? `${bestMatches.length} candidate-job matches found.`
                        : "Matches appear after profile, CV extraction, and offers are available.",
                      icon: hasMatches ? CheckCircle2 : Info,
                      tone: hasMatches
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-50 text-slate-700",
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className={`flex gap-3 rounded-2xl p-4 ${item.tone}`}>
                        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                        <div>
                          <p className="font-semibold">{item.title}</p>
                          <p className="mt-1 text-sm leading-6">{item.description}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-slate-950">Trajectory vs. Goals</h2>
              <div className="mt-6 space-y-5">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Current profile
                  </p>
                  <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-semibold text-slate-950">
                      {profile?.professional_title || "Professional title not set"}
                    </p>
                    <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">
                      {profile?.experience_level || "Experience level not set"}
                    </Badge>
                  </div>
                </div>
                <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
                  <p className="text-xs font-semibold uppercase text-sky-700">
                    Target
                  </p>
                  <p className="mt-1 font-semibold text-sky-950">
                    {targetRole}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-sky-800">
                    {hasMatches
                      ? "Best-match roles below are calculated from live matching."
                      : "Advanced trajectory estimates are coming soon. No promotion dates or fake forecasts are generated."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:gap-6 xl:grid-cols-[1fr_360px]">
          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-950">Skill Gap Analysis</CardTitle>
              <p className="text-sm text-slate-500">
                Based on the Career Insights skill-gap model when available.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {aiInsightsLoading ? (
                <>
                  <Skeleton className="h-12 rounded-2xl" />
                  <Skeleton className="h-12 rounded-2xl" />
                  <Skeleton className="h-12 rounded-2xl" />
                </>
              ) : visibleSkillGap.length ? (
                visibleSkillGap.map((skill) => {
                  const coverage = detectedSkills.includes(skill) ? 100 : 0;
                  return (
                    <div key={skill}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-950">{skill}</span>
                        <span className="text-slate-500">
                          {coverage ? "Detected" : "Gap from matched offers"}
                        </span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-blue-100">
                        <div
                          className="h-full rounded-full bg-[#020817]"
                          style={{ width: `${coverage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                  No skill gaps are available yet. Upload and analyze a
                  CV, then load matching results to populate this chart.
                </div>
              )}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-950">
                        Learning priority
                      </h3>
                      <p className="mt-1 max-w-xl text-sm leading-6 text-slate-600">
                        {learningPriorities[0]?.skill
                          ? `Start with ${learningPriorities[0].skill}: ${learningPriorities[0].priority_reason || "highest current priority from the learning model."}`
                          : visibleSkillGap[0]
                            ? `Start with ${visibleSkillGap[0]}, because it appears in your AI skill-gap output.`
                            : "Complete CV extraction and job offers to unlock the learning recommendation model."}
                      </p>
                    </div>
                  </div>
                  <Button asChild variant="ghost" className="text-sky-700">
                    <Link href="/jobs">View Jobs</Link>
                  </Button>
                </div>
              </div>

              {aiInsights?.learning_priority?.headline || learningPriorities.length ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase text-sky-700">
                      Learning priority model
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-slate-950">
                      {aiInsights?.learning_priority?.headline || "Recommended learning path"}
                    </h3>
                  </div>
                  <div className="grid gap-3 lg:grid-cols-3">
                    {learningPriorities.map((priority, index) => (
                      <div key={`${priority.skill}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="font-bold text-slate-950">{priority.skill}</h4>
                          <Badge className="rounded-full bg-sky-50 text-sky-700 hover:bg-sky-50">
                            {priority.estimated_weeks ? `${priority.estimated_weeks}w` : `#${priority.rank ?? index + 1}`}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {priority.priority_reason || "High-impact skill for the selected job market."}
                        </p>
                        {priority.learning_path?.steps?.length ? (
                          <ul className="mt-3 space-y-2 text-sm text-slate-600">
                            {priority.learning_path.steps.slice(0, 3).map((step) => (
                              <li key={step} className="flex gap-2">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                        {priority.portfolio_project?.title ? (
                          <div className="mt-3 rounded-xl bg-slate-50 p-3">
                            <p className="text-xs font-semibold uppercase text-slate-400">
                              Portfolio project
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-800">
                              {priority.portfolio_project.title}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-950">Best Matching Offers</CardTitle>
              <p className="text-sm text-slate-500">
                Live matches when available.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {bestMatches.length ? (
                bestMatches.slice(0, 4).map((match) => (
                  <div key={match.job_offer_id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-slate-950">{match.title}</h3>
                      <Badge className={`rounded-md ${progressTone(match.semantic_score)}`}>
                        {match.semantic_score == null
                          ? match.integration_status
                          : `${Math.round(match.semantic_score)}%`}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {match.company_name || "Unknown company"} ·{" "}
                      {match.location || "Location not specified"}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  No candidate-specific matches yet. Public job offers remain
                  available on the Job Offers page.
                </div>
              )}
              <Button asChild variant="ghost" className="w-full justify-between text-sky-700">
                <Link href="/jobs">
                  Open job matcher
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-3 lg:gap-6">
          {[
            {
              title: "Detected skills",
              description: detectedSkills.length
                ? detectedSkills.slice(0, 8).join(", ")
                : "No extracted skills yet.",
              status: hasExtraction ? "Live data" : "Pending",
            },
            {
              title: "Matched skills",
              description: matchedSkills.length
                ? matchedSkills.slice(0, 8).join(", ")
                : "No matched skills yet.",
              status: hasMatches ? "Live data" : "Pending",
            },
            {
              title: "Advanced AI insights",
              description: digestText
                ? digestText
                : aiInsightsLoading
                  ? "Career digest is being generated by the local model."
                  : "Complete CV extraction and job offers to unlock the personalized digest.",
              status: aiInsights?.personalized_digest ? "Model live" : aiInsightsLoading ? "Loading" : "Pending",
            },
          ].map((item) => (
            <Card key={item.title} className="rounded-2xl border-slate-200 bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <BookOpen className="h-5 w-5 text-sky-700" />
                  <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">
                    {item.status}
                  </Badge>
                </div>
                <h3 className="mt-4 font-bold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 lg:gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-slate-950">Personalized Digest</CardTitle>
                  <p className="mt-1 text-sm text-slate-500">
                    One focused recommendation at a time from personalized digest and learning-priority models.
                  </p>
                </div>
                {digestList.length > 1 ? (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-full border-slate-200 bg-white"
                      onClick={() => moveDigest("right")}
                      aria-label="Previous digest recommendation"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-full border-slate-200 bg-white"
                      onClick={() => moveDigest("left")}
                      aria-label="Next digest recommendation"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiInsightsLoading ? (
                <>
                  <Skeleton className="h-56 rounded-2xl" />
                </>
              ) : digestList.length ? (
                <>
                  {aiInsights?.personalized_digest?.generated_for ? (
                    <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
                      <p className="text-xs font-semibold uppercase text-sky-700">Generated for</p>
                      <p className="mt-1 font-semibold text-sky-950">
                        {aiInsights.personalized_digest.generated_for}
                      </p>
                    </div>
                  ) : null}
                  <div
                    className="relative overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-1 shadow-sm"
                    onPointerDown={handleDigestPointerDown}
                    onPointerUp={handleDigestPointerUp}
                    onPointerCancel={() => {
                      swipeStartXRef.current = null;
                    }}
                  >
                    <div
                      key={`${activeDigestIndex}-${digestList[activeDigestIndex]?.title}`}
                      className={`min-h-56 rounded-[1.35rem] bg-white/90 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur-sm animate-in fade-in duration-300 ${
                        digestDirection === "left"
                          ? "slide-in-from-right-6"
                          : "slide-in-from-left-6"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-600 text-sm font-bold text-white shadow-sm">
                            {activeDigestIndex + 1}
                          </span>
                          <div>
                            <Badge className="rounded-full bg-sky-50 text-sky-700 hover:bg-sky-50">
                              {digestList[activeDigestIndex]?.source || "Career Insights"}
                            </Badge>
                            <h3 className="mt-2 text-xl font-bold leading-7 text-slate-950">
                              {digestList[activeDigestIndex]?.title || "Career recommendation"}
                            </h3>
                          </div>
                        </div>
                        {digestList[activeDigestIndex]?.weeks ? (
                          <Badge className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                            {digestList[activeDigestIndex].weeks}w
                          </Badge>
                        ) : digestList[activeDigestIndex]?.rank ? (
                          <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">
                            Rank {digestList[activeDigestIndex].rank}
                          </Badge>
                        ) : null}
                      </div>

                      <p className="mt-5 text-base leading-8 text-slate-600">
                        {digestList[activeDigestIndex]?.text}
                      </p>

                      {digestList[activeDigestIndex]?.steps?.length ? (
                        <div className="mt-5 grid gap-2">
                          {digestList[activeDigestIndex].steps.map((step) => (
                            <div key={step} className="flex gap-2 rounded-2xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      <div className="mt-6 flex items-center justify-between gap-4">
                        <div className="flex gap-1.5">
                          {digestList.map((item, index) => (
                            <button
                              key={`${item.title}-${index}`}
                              type="button"
                              aria-label={`Show digest recommendation ${index + 1}`}
                              onClick={() => {
                                setDigestDirection(index > activeDigestIndex ? "left" : "right");
                                setActiveDigestIndex(index);
                              }}
                              className={`h-2 rounded-full transition-all duration-300 ${
                                index === activeDigestIndex
                                  ? "w-8 bg-sky-600"
                                  : "w-2 bg-slate-300 hover:bg-slate-400"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Swipe or auto-slide
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                  Personalized digest is not available yet. Complete CV extraction and keep Ollama running.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-950">CV Strength Tips</CardTitle>
              <p className="text-sm text-slate-500">
                Resume improvement advice from the learning-priority model.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {aiInsightsLoading ? (
                <>
                  <Skeleton className="h-12 rounded-2xl" />
                  <Skeleton className="h-12 rounded-2xl" />
                </>
              ) : aiInsights?.learning_priority?.cv_strength_tips?.length ? (
                aiInsights.learning_priority.cv_strength_tips.slice(0, 5).map((tip) => (
                  <div key={tip} className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{tip}</span>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                  No CV strength tips returned yet.
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        <Card className="overflow-hidden rounded-2xl border-0 bg-[#020817] text-white shadow-sm">
          <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold">Next recommended action</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">
                {isOffline
                  ? "Reconnect before running live matching actions."
                  : !hasProfile
                    ? "Create your profile so recommendations can use your target role."
                    : !hasExtraction
                      ? "Upload and extract your CV to unlock skill-based recommendations."
                      : "Review matched jobs and request AI scores for roles you care about."}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="rounded-xl bg-white text-slate-950 hover:bg-slate-100">
                <Link href={hasExtraction ? "/jobs" : "/resume"}>
                  {hasExtraction ? "View Matched Jobs" : "Improve Resume Data"}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </DashboardLayout>
  );
}
