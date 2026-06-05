"use client";

import {
  BarChart3,
  Briefcase,
  ClipboardCheck,
  FileText,
  Video,
} from "lucide-react";

import { ActionCard } from "@/components/dashboard/ActionCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { StatCard } from "@/components/dashboard/StatCard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";

const stats = [
  {
    label: "Resume Score",
    value: "85/100",
    detail: "+12 points since last review",
    icon: FileText,
  },
  {
    label: "Recommended Jobs",
    value: "24",
    detail: "8 new matches this week",
    icon: Briefcase,
  },
  {
    label: "Recommendation Progress",
    value: "68%",
    detail: "3 active growth actions",
    icon: BarChart3,
  },
];

const actions = [
  {
    title: "Review Resume",
    description: "Upload a CV and receive AI feedback on structure, ATS fit, and skills.",
    href: "/resume",
    icon: FileText,
    cta: "Start Review",
  },
  {
    title: "Explore Job Offers",
    description: "Browse recommended offers ranked by skill fit and career trajectory.",
    href: "/jobs",
    icon: Briefcase,
    cta: "Browse Jobs",
  },
  {
    title: "Prepare QCM",
    description: "Track technical assessments and recommended preparation topics.",
    href: "/qcm",
    icon: ClipboardCheck,
    cta: "Open Tests",
  },
  {
    title: "AI Interview",
    description: "Practice structured interviews with clarity and confidence signals.",
    href: "/interview",
    icon: Video,
    cta: "Start Practice",
  },
];

const activity = [
  {
    title: "Resume updated",
    description: "Your resume score improved to 85/100 following AI suggestions.",
    time: "2 hours ago",
    icon: FileText,
  },
  {
    title: "New job matches",
    description: "8 new opportunities perfectly match your target profile.",
    time: "1 day ago",
    icon: Briefcase,
  },
  {
    title: "Career insights generated",
    description: "Your personalized career progress report is ready for review.",
    time: "3 days ago",
    icon: BarChart3,
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const displayName = user.fullName || user.username || "candidate";

  return (
    <DashboardLayout>
      <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <section className="rounded-3xl bg-[#020817] p-8 text-white shadow-sm md:p-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-sky-300">HireNest AI Workspace</p>
            <h1 className="mt-3 text-2xl font-bold sm:text-4xl">
              Welcome back, {displayName}.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Track your resume quality, recommended job offers, QCM readiness,
              and AI interview preparation from one clean dashboard.
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3 lg:gap-6">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-2 lg:gap-6 xl:grid-cols-4">
          {actions.map((action) => (
            <ActionCard key={action.title} {...action} />
          ))}
        </section>

        <RecentActivity items={activity} />
      </main>
    </DashboardLayout>
  );
}
