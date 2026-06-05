import Image from "next/image";
import { FileSearch, Gauge, Send } from "lucide-react";

const steps = [
  {
    icon: FileSearch,
    title: "Upload Profile/CV",
    description:
      "Our AI parsers extract deep data points, going beyond simple keywords to understand context and proficiency levels.",
  },
  {
    icon: Gauge,
    title: "AI Analyzes & Matches",
    description:
      "Sophisticated algorithms benchmark profiles against industry standards and specific organizational needs.",
  },
  {
    icon: Send,
    title: "Fast-Track to Interview",
    description:
      "Top candidates are automatically invited to AI-assisted video screenings, cutting time-to-hire.",
  },
];

function AnalysisFallbackIllustration() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl">
      <div className="rounded-3xl bg-slate-50 p-5">
        <div className="mb-5 flex items-center justify-between">
          <div className="h-3 w-36 rounded-full bg-slate-900" />
          <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
            4.2x
          </div>
        </div>
        <div className="space-y-4">
          {["Technical Fit", "Leadership Signal", "Interview Readiness"].map(
            (label, index) => (
              <div key={label} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-900">{label}</span>
                  <span className="text-slate-500">{88 + index * 3}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-sky-500"
                    style={{ width: `${88 + index * 3}%` }}
                  />
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

export function HowItWorks() {
  const hasHowItWorksAsset = true;

  return (
    <section id="how-it-works" className="overflow-hidden bg-slate-50 py-14 sm:py-20 md:py-24">
      <div className="container mx-auto grid items-center gap-10 px-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            How It Works
          </h2>
          <div className="mt-8 space-y-5">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <article key={step.title} className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">
                      Step {index + 1}
                    </div>
                    <h3 className="mt-1 text-lg font-bold text-slate-950">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {step.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -right-2 -top-4 z-10 rounded-2xl border border-emerald-100 bg-white px-3 py-2 shadow-xl sm:px-4 sm:py-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-600">
              Efficiency Gain
            </div>
            <div className="text-sm font-bold text-slate-950">4.2x Faster Hiring</div>
          </div>
          {hasHowItWorksAsset ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-2 shadow-xl sm:rounded-[2rem] sm:p-3">
              <div className="overflow-hidden rounded-2xl bg-slate-100 sm:rounded-[1.5rem]">
                <Image
                  src="/images/how-it-works-ai.png"
                  alt="AI resume analysis visual with candidate scoring and matching signals"
                  width={780}
                  height={620}
                  className="h-auto w-full object-cover"
                />
              </div>
            </div>
          ) : (
            <AnalysisFallbackIllustration />
          )}
        </div>
      </div>
    </section>
  );
}
