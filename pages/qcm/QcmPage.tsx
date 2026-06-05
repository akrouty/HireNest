import {
  BarChart3,
  CheckCircle2,
  Clock,
  ClipboardCheck,
  Flame,
  Trophy,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const tests = [
  {
    title: "React Fundamentals",
    questions: 24,
    duration: "35 min",
    difficulty: "Intermediate",
    readiness: 88,
    status: "Recommended",
  },
  {
    title: "TypeScript Reasoning",
    questions: 18,
    duration: "25 min",
    difficulty: "Advanced",
    readiness: 76,
    status: "In progress",
  },
  {
    title: "Cloud Architecture",
    questions: 30,
    duration: "45 min",
    difficulty: "Advanced",
    readiness: 64,
    status: "Not started",
  },
];

const results = [
  ["JavaScript Logic", "92%", "Completed yesterday"],
  ["REST API Design", "84%", "Completed 3 days ago"],
  ["Database Basics", "78%", "Completed last week"],
];

export default function QcmPage() {
  return (
    <DashboardLayout>
      <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-sky-700">Technical assessments</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              QCM Tests
            </h1>
            <p className="mt-2 max-w-3xl text-base leading-7 text-slate-500">
              Prepare for multiple-choice screenings generated from your target
              roles and current skill gaps.
            </p>
          </div>
          <Button className="w-full rounded-xl bg-[#020817] hover:bg-[#07111f] sm:w-auto">
            Start Recommended Test
          </Button>
        </section>

        <section className="grid gap-4 md:grid-cols-3 lg:gap-6">
          {[
            ["Readiness Score", "82%", "Strong preparation level", BarChart3],
            ["Questions Completed", "146", "Across 7 practice tests", ClipboardCheck],
            ["Current Streak", "5 days", "Keep momentum this week", Flame],
          ].map(([label, value, detail, Icon]) => (
            <Card key={label as string} className="rounded-2xl border-slate-200 bg-white shadow-sm">
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-sm text-slate-500">{label as string}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-950">
                    {value as string}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{detail as string}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 lg:gap-6 xl:grid-cols-3">
          {tests.map((test) => (
            <Card key={test.title} className="rounded-2xl border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                    <ClipboardCheck className="h-5 w-5" />
                  </div>
                  <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">
                    {test.status}
                  </Badge>
                </div>
                <CardTitle className="pt-2 text-slate-950">{test.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-lg font-bold text-slate-950">{test.questions}</p>
                    <p className="text-xs text-slate-500">Questions</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-lg font-bold text-slate-950">{test.duration}</p>
                    <p className="text-xs text-slate-500">Duration</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="truncate text-sm font-bold text-slate-950">
                      {test.difficulty}
                    </p>
                    <p className="text-xs text-slate-500">Difficulty</p>
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-500">Readiness</span>
                    <span className="font-semibold text-slate-950">{test.readiness}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#0284c7]"
                      style={{ width: `${test.readiness}%` }}
                    />
                  </div>
                </div>
                <Button className="w-full rounded-xl bg-[#020817] hover:bg-[#07111f]">
                  Start Test
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-950">Recent Results</CardTitle>
            <p className="text-sm text-slate-500">
              Latest assessment outcomes and preparation signals.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {results.map(([title, score, date]) => (
              <div key={title} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-950">{title}</p>
                    <p className="text-sm text-slate-500">{date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-lg font-bold text-slate-950">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  {score}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </DashboardLayout>
  );
}
