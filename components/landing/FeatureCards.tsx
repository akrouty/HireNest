import Link from "next/link";
import { ArrowRight, BarChart3, BrainCircuit, Video } from "lucide-react";

const features = [
  {
    icon: BrainCircuit,
    title: "AI Job Matcher",
    description:
      "Matches candidates to roles with precision based on skills, experience density, and career trajectory analysis.",
    link: "Learn more",
  },
  {
    icon: Video,
    title: "AI Video Interviews",
    description:
      "Evaluate candidates beyond the CV with real-time sentiment analysis, clarity scoring, and professional alignment metrics.",
    link: "Explore Insights",
  },
  {
    icon: BarChart3,
    title: "Career Insights",
    description:
      "Personalized data-driven trajectory analysis to help talent grow and employers identify future leadership potential.",
    link: "View reports",
  },
];

export function FeatureCards() {
  return (
    <section id="features" className="bg-white py-14 sm:py-20 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            Intelligence at Every Step
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Sophisticated tools designed for precision hiring and career growth.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl sm:p-7"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-950">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 lg:min-h-[104px]">
                  {feature.description}
                </p>
                <Link
                  href="#how-it-works"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-sky-700"
                >
                  {feature.link}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
