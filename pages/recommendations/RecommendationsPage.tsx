import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Lightbulb,
  Target,
  TrendingUp,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const learningPlan = [
  {
    title: "System Design Mastery",
    description: "Bridge architecture gaps for senior software engineering roles.",
    status: "In progress",
    progress: 72,
  },
  {
    title: "Strategic Leadership",
    description: "Build stronger project ownership and mentoring signals.",
    status: "Not started",
    progress: 28,
  },
  {
    title: "Cloud Security Basics",
    description: "Improve AWS deployment readiness and compliance vocabulary.",
    status: "Completed",
    progress: 100,
  },
];

const gaps = [
  ["System Design", 85, "Gap: 15%"],
  ["Strategic Leadership", 60, "Gap: 40%"],
  ["Business Analytics", 90, "Gap: 10%"],
  ["User Research", 100, "Mastered"],
];

const alternativePaths = [
  ["Product Manager", "Pivot your design expertise into technical product ownership.", "92% Match"],
  ["Creative Technologist", "Combine visual skills with front-end prototyping.", "85% Match"],
  ["UX Researcher", "Leverage analytical strengths in specialized research.", "78% Match"],
];

function statusClass(status: string) {
  if (status === "Completed") return "bg-emerald-50 text-emerald-700 hover:bg-emerald-50";
  if (status === "In progress") return "bg-sky-50 text-sky-700 hover:bg-sky-50";
  return "bg-slate-100 text-slate-700 hover:bg-slate-100";
}

export default function RecommendationsPage() {
  return (
    <DashboardLayout>
      <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <section>
          <p className="text-sm font-semibold text-sky-700">Career Insights</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Recommendations
          </h1>
          <p className="mt-2 max-w-3xl text-base leading-7 text-slate-500">
            Track learning progress, skill gaps, suggested resources, and the
            next actions that improve your job-match quality.
          </p>
        </section>

        <section className="grid gap-4 lg:gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">Recommendation progress</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-950">
                    Profile Strength
                  </h2>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#0284c7] text-lg font-bold text-slate-950">
                  68%
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  ["Experience clarity", "Your timeline is well structured.", CheckCircle2, "bg-emerald-50 text-emerald-700"],
                  ["Skill gap priority", "Strategic leadership needs the most work.", Target, "bg-rose-50 text-rose-700"],
                  ["Learning opportunity", "System design will unlock senior matches.", Lightbulb, "bg-sky-50 text-sky-700"],
                ].map(([title, description, Icon, tone]) => (
                  <div key={title as string} className={`flex gap-3 rounded-2xl p-4 ${tone as string}`}>
                    <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                    <div>
                      <p className="font-semibold">{title as string}</p>
                      <p className="mt-1 text-sm leading-6">{description as string}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-slate-950">Trajectory vs. Goals</h2>
              <div className="mt-6 space-y-5">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Current role
                  </p>
                  <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-semibold text-slate-950">
                      Software Engineer
                    </p>
                    <Badge className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                      In position: 2y 4m
                    </Badge>
                  </div>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase text-emerald-700">
                        Your target
                      </p>
                      <p className="mt-1 font-semibold text-emerald-950">
                        Senior Software Engineer
                      </p>
                    </div>
                    <p className="font-semibold text-emerald-800">
                      Estimated: Q4 2026
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-emerald-800">
                    You are currently ahead of the standard promotion cycle.
                    Focus on system design and technical leadership next.
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
                Benchmark against your target role requirements.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {gaps.map(([skill, value, label]) => (
                <div key={skill as string}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-950">{skill as string}</span>
                    <span className={label === "Mastered" ? "font-semibold text-emerald-600" : "text-slate-500"}>
                      {label as string}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-blue-100">
                    <div
                      className="h-full rounded-full bg-[#020817]"
                      style={{ width: `${value as number}%` }}
                    />
                  </div>
                </div>
              ))}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-950">
                        Recommended Course
                      </h3>
                      <p className="mt-1 max-w-xl text-sm leading-6 text-slate-600">
                        Bridge the Strategic Leadership gap with "Executive
                        Design Leadership" on Coursera. HireNest users get 20% off.
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" className="text-sky-700">
                    View Course
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-950">Alternative Paths</CardTitle>
              <p className="text-sm text-slate-500">
                Based on your underlying skills and growth trajectory.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {alternativePaths.map(([title, description, match]) => (
                <div key={title} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-slate-950">{title}</h3>
                    <Badge className="rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                      {match}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {description}
                  </p>
                </div>
              ))}
              <Button variant="ghost" className="w-full justify-between text-sky-700">
                Explore all 12 potential paths
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-3 lg:gap-6">
          {learningPlan.map((item) => (
            <Card key={item.title} className="rounded-2xl border-slate-200 bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <BookOpen className="h-5 w-5 text-sky-700" />
                  <Badge className={`rounded-full ${statusClass(item.status)}`}>
                    {item.status}
                  </Badge>
                </div>
                <h3 className="mt-4 font-bold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {item.description}
                </p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#0284c7]"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="overflow-hidden rounded-2xl border-0 bg-[#020817] text-white shadow-sm">
          <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold">Ready for your next big leap?</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">
                We found 14 roles that match your skills and target trajectory.
                Start applying with your optimized profile today.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button className="rounded-xl bg-white text-slate-950 hover:bg-slate-100">
                View Matched Jobs
              </Button>
              <Button variant="outline" className="rounded-xl border-white/30 bg-transparent text-white hover:bg-white/10">
                Improve Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </DashboardLayout>
  );
}
