"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, ClipboardCheck, FileText, Loader2, RefreshCw, Send, Target } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCareerData } from "@/hooks/useCareerData";
import { generateQcm, listQcmSessions, submitQcm, type QcmSession } from "@/services/qcm.service";

export default function QcmPage() {
  const { profile, detectedSkills, missingSkills, loading: careerLoading, careerReady } = useCareerData();
  const [sessions, setSessions] = useState<QcmSession[]>([]);
  const [activeSession, setActiveSession] = useState<QcmSession | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const suggestedRole = profile?.target_job_title || profile?.professional_title || "";
  const topics = useMemo(
    () => (missingSkills.length ? missingSkills : detectedSkills).slice(0, 6),
    [detectedSkills, missingSkills],
  );
  const focusSkills = useMemo(
    () => (missingSkills.length ? missingSkills : detectedSkills).slice(0, 8),
    [detectedSkills, missingSkills],
  );
  const resumeSkills = useMemo(
    () => detectedSkills.filter((skill) => !focusSkills.includes(skill)).slice(0, 10),
    [detectedSkills, focusSkills],
  );
  const contextRole = jobTitle || suggestedRole || activeSession?.job_title || "Target role";

  useEffect(() => {
    async function load() {
      if (careerLoading) return;
      if (!careerReady) {
        setSessions([]);
        setActiveSession(null);
        setLoading(false);
        return;
      }
      try {
        const data = await listQcmSessions();
        setSessions(data);
        setActiveSession(data[0] ?? null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to load QCM sessions";
        toast.error("QCM unavailable", { description: message });
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [careerLoading, careerReady]);

  async function handleGenerate() {
    if (!careerReady) {
      toast.error("CV required", {
        description: "Upload, parse, and extract your CV before generating a QCM test.",
      });
      return;
    }
    setGenerating(true);
    setAnswers({});
    try {
      const session = await generateQcm(jobTitle || suggestedRole);
      setActiveSession(session);
      setSessions((current) => [session, ...current]);
      toast.success("QCM generated", { description: `${session.questions.length} questions ready.` });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to generate QCM";
      toast.error("Generation failed", { description: message });
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmit() {
    if (!activeSession) return;
    const payload = activeSession.questions.map((question) => ({
      question_id: question.id,
      selected: answers[question.id] || "",
    })).filter((answer) => answer.selected);
    if (payload.length !== activeSession.questions.length) {
      toast.error("Complete all answers first");
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitQcm(activeSession.session_id, payload);
      const nextSession = {
        ...activeSession,
        status: "completed",
        answers: payload,
        result,
        score_percent: result.score_percent,
      };
      setActiveSession(nextSession);
      setSessions((current) =>
        current.map((session) =>
          session.session_id === nextSession.session_id ? nextSession : session,
        ),
      );
      toast.success("QCM submitted", { description: `${result.score_percent}% score.` });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to submit answers";
      toast.error("Submission failed", { description: message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout>
      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-sky-700">Skills-based assessment</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">QCM Tests</h1>
            <p className="mt-2 max-w-3xl text-base leading-7 text-slate-500">
              Generate role-specific MCQs from your profile, resume skills, and current target role.
            </p>
          </div>
          <div className="flex w-full gap-3 sm:w-auto">
            <Input
              className="h-11 rounded-xl bg-white sm:w-72"
              placeholder={suggestedRole || "Target role"}
              value={jobTitle}
              onChange={(event) => setJobTitle(event.target.value)}
              disabled={!careerReady}
            />
            <Button className="h-11 rounded-xl bg-[#020817]" disabled={generating || !careerReady} onClick={() => void handleGenerate()}>
              {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Generate
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            ["Sessions", String(sessions.length), "Stored in your workspace", ClipboardCheck],
            ["Current Score", activeSession?.score_percent == null ? "--" : `${Math.round(activeSession.score_percent)}%`, "Latest attempt", BarChart3],
            ["Skill Context", String(topics.length), "Used to guide generation", ClipboardCheck],
          ].map(([label, value, detail, Icon]) => (
            <Card key={String(label)} className="rounded-2xl border-slate-200 bg-white shadow-sm">
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-sm text-slate-500">{String(label)}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-950">{String(value)}</p>
                  <p className="mt-1 text-xs text-slate-500">{String(detail)}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardContent className="grid gap-5 p-5 lg:grid-cols-[1fr_2fr] lg:items-start">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">Assessment role</p>
                  <p className="mt-1 text-lg font-bold text-slate-950">{contextRole}</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                The generator uses this role plus the resume skills below to produce targeted technical questions.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
                <p className="text-sm font-semibold text-slate-950">Priority skill context</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  These topics guide the question difficulty and coverage.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {focusSkills.length ? focusSkills.map((skill) => (
                    <Badge key={skill} variant="outline" className="rounded-full border-sky-200 bg-white text-sky-800">
                      {skill}
                    </Badge>
                  )) : (
                    <span className="text-sm text-slate-500">Upload or parse a resume to enrich the context.</span>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                <p className="text-sm font-semibold text-slate-950">Resume skill base</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Additional detected skills help avoid generic template questions.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(resumeSkills.length ? resumeSkills : detectedSkills.slice(0, 10)).map((skill) => (
                    <Badge key={skill} variant="outline" className="rounded-full border-emerald-200 bg-white text-emerald-800">
                      {skill}
                    </Badge>
                  ))}
                  {!detectedSkills.length ? (
                    <span className="text-sm text-slate-500">No structured resume skills available yet.</span>
                  ) : null}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {!careerLoading && !careerReady ? (
          <Card className="rounded-2xl border-sky-100 bg-white shadow-sm">
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-950">Upload and extract your CV first</h2>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                    QCM generation needs real resume skills and an extracted candidate profile. Upload your CV, parse it, then run extraction before starting a test.
                  </p>
                </div>
              </div>
              <Button asChild className="rounded-xl bg-[#020817] hover:bg-slate-800">
                <Link href="/resume">Go to Resume</Link>
              </Button>
            </CardContent>
          </Card>
        ) : loading || careerLoading ? (
          <Skeleton className="h-96 rounded-2xl" />
        ) : activeSession ? (
          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="text-slate-950">{activeSession.job_title}</CardTitle>
                <p className="mt-1 text-sm text-slate-500">
                  {activeSession.questions.length} questions · {activeSession.status}
                </p>
              </div>
              {activeSession.score_percent != null ? (
                <Badge className="rounded-xl bg-emerald-50 px-3 py-1.5 text-emerald-700 hover:bg-emerald-50">
                  {Math.round(activeSession.score_percent)}% score
                </Badge>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-5">
              {activeSession.questions.map((question, index) => (
                <div key={question.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-slate-950">
                      {index + 1}. {question.question || question.question_text}
                    </p>
                    {question.difficulty ? (
                      <Badge variant="outline" className="rounded-full">{question.difficulty}</Badge>
                    ) : null}
                  </div>
                  <div className="mt-4 grid gap-2 md:grid-cols-2">
                    {Object.entries(question.options || {}).map(([key, value]) => {
                      const selected = answers[question.id] === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          disabled={activeSession.status === "completed"}
                          onClick={() => setAnswers((current) => ({ ...current, [question.id]: key }))}
                          className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                            selected
                              ? "border-sky-500 bg-sky-50 text-sky-900"
                              : "border-slate-200 bg-white text-slate-600 hover:border-sky-200"
                          }`}
                        >
                          <span className="mr-2 font-bold">{key}.</span>
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <Button
                className="w-full rounded-xl bg-[#0284c7] hover:bg-[#0369a1]"
                disabled={submitting || activeSession.status === "completed"}
                onClick={() => void handleSubmit()}
              >
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Submit Answers
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6 text-sm text-slate-600">
              No QCM session yet. Generate a test from your target role to begin.
            </CardContent>
          </Card>
        )}
      </main>
    </DashboardLayout>
  );
}
