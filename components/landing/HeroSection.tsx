import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  FileText,
  PlayCircle,
  Sparkles,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function HeroFallbackIllustration() {
  return (
    <div className="relative rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl">
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="h-3 w-24 rounded-full bg-slate-900" />
            <div className="mt-2 h-2 w-36 rounded-full bg-slate-200" />
          </div>
          <div className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
            96% Match
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { label: "Resume PDF", icon: FileText },
            { label: "AI Match", icon: Target },
            { label: "Analytics", icon: BarChart3 },
            { label: "Video Screen", icon: PlayCircle },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Icon className="h-4 w-4 text-sky-600" />
                  {item.label}
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-sky-500"
                    style={{ width: `${74 + index * 7}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  const hasHeroAsset = true;

  return (
    <section className="overflow-hidden bg-white">
      <div className="container mx-auto grid items-center gap-10 px-4 py-12 sm:py-16 lg:min-h-[680px] lg:grid-cols-[1fr_0.95fr] lg:py-20">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-2 text-xs font-medium text-sky-700 sm:px-4 sm:text-sm">
            <Sparkles className="h-4 w-4" />
            Next-Gen Recruitment Platform
          </div>
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Precision Recruitment, Powered by AI.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Find the perfect match faster with AI-driven insights, technical
            assessments, and automated video interviews. Built for the modern
            workforce.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row">
            <Button asChild size="lg" className="bg-[#0284c7] hover:bg-[#0369a1]">
              <Link href="/signup">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
            >
              <Link href="/login">Schedule a Demo</Link>
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-sky-100 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-44 w-44 rounded-full bg-blue-100 blur-3xl" />
          {hasHeroAsset ? (
            <div className="relative rounded-3xl border border-slate-200 bg-white p-2 shadow-2xl sm:rounded-[2rem] sm:p-3">
              <div className="overflow-hidden rounded-2xl bg-slate-50 sm:rounded-[1.5rem]">
                <Image
                  src="/images/landing-ai-hero.png"
                  alt="AI recruitment illustration showing resume analysis, matching, analytics, and video interview signals"
                  width={760}
                  height={620}
                  className="h-auto w-full object-cover"
                  priority
                />
              </div>
            </div>
          ) : (
            <HeroFallbackIllustration />
          )}
        </div>
      </div>
    </section>
  );
}
