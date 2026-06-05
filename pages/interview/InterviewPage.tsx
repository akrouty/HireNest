import {
  BarChart3,
  CheckCircle2,
  Lightbulb,
  Mic,
  MoreHorizontal,
  Play,
  Sparkles,
  Video,
  VideoOff,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sessions = [
  ["Behavioral interview", "Role alignment and motivation", "Ready"],
  ["Technical deep dive", "System design and project decisions", "Recommended"],
  ["Communication drill", "Concise storytelling and clarity", "In progress"],
];

const scores = [
  ["Confidence", "86%", "bg-emerald-50 text-emerald-700"],
  ["Clarity", "94%", "bg-sky-50 text-sky-700"],
  ["Communication", "88%", "bg-blue-50 text-blue-700"],
];

export default function InterviewPage() {
  return (
    <DashboardLayout>
      <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <section className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              AI Video Interview
            </h1>
            <p className="mt-2 max-w-3xl text-base leading-7 text-slate-500">
              Practice structured interviews with AI feedback on confidence,
              clarity, pace, sentiment, and professional alignment.
            </p>
          </div>
          <Badge className="w-fit rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-red-700 hover:bg-red-50">
            Live practice ready
          </Badge>
        </section>

        <section className="grid gap-4 lg:gap-6 xl:grid-cols-[1fr_380px]">
          <div className="space-y-5">
            <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
              <CardContent className="p-0">
                <div className="relative min-h-[420px] overflow-hidden bg-[#020817]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(14,165,233,0.28),transparent_34%),linear-gradient(135deg,#07111f,#020817_65%)]" />
                  <div className="relative flex min-h-[420px] flex-col justify-between p-5 text-white sm:p-8">
                    <div className="max-w-xl rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                      <p className="text-xs font-bold uppercase text-sky-200">
                        Current question
                      </p>
                      <p className="mt-2 text-lg leading-8">
                        "Can you describe a time you had to pivot your technical
                        strategy based on user feedback?"
                      </p>
                    </div>

                    <div className="ml-auto w-full max-w-[240px] rounded-2xl border border-white/10 bg-white/10 p-4 text-center shadow-xl backdrop-blur">
                      <div className="flex h-36 items-center justify-center rounded-xl bg-slate-900">
                        <Sparkles className="h-12 w-12 text-sky-300" />
                      </div>
                      <p className="mt-2 text-xs font-semibold uppercase text-slate-300">
                        AI Interviewer
                      </p>
                    </div>

                    <div className="mx-auto rounded-2xl border border-white/10 bg-white/10 px-6 py-3 text-center backdrop-blur">
                      <span className="text-2xl font-bold">01:42</span>
                      <span className="mx-4 text-slate-500">|</span>
                      <span className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                        Remaining for response
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-slate-300 bg-white">
                <Mic className="h-5 w-5" />
                <span className="sr-only">Toggle microphone</span>
              </Button>
              <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-slate-300 bg-white">
                <VideoOff className="h-5 w-5" />
                <span className="sr-only">Toggle camera</span>
              </Button>
              <Button className="h-14 w-full rounded-2xl bg-[#020817] hover:bg-[#07111f] sm:w-auto sm:min-w-[220px]">
                Submit Response
              </Button>
              <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-slate-300 bg-white">
                <MoreHorizontal className="h-5 w-5" />
                <span className="sr-only">More interview tools</span>
              </Button>
            </div>

            <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-950">Practice Sessions</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3 lg:gap-6">
                {sessions.map(([title, description, status]) => (
                  <div key={title} className="rounded-2xl border border-slate-200 p-4">
                    <Video className="h-5 w-5 text-sky-700" />
                    <h3 className="mt-3 font-semibold text-slate-950">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
                    <Badge className="mt-4 rounded-full bg-sky-50 text-sky-700 hover:bg-sky-50">
                      {status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-5">
            <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sky-800">
                  <BarChart3 className="h-5 w-5" />
                  AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">
                      Sentiment Score
                    </span>
                    <Badge className="rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                      Positive
                    </Badge>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full w-[86%] rounded-full bg-emerald-500" />
                  </div>
                  <p className="mt-4 text-sm italic leading-6 text-slate-500">
                    "User indicates high levels of enthusiasm and professional
                    alignment."
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
                  {scores.map(([label, value, tone]) => (
                    <div key={label} className={`rounded-2xl border border-slate-200 p-4 text-center ${tone}`}>
                      <p className="text-xs font-semibold uppercase">{label}</p>
                      <p className="mt-2 text-2xl font-bold">{value}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="mb-3 text-sm font-semibold uppercase text-slate-500">
                    Facial expression analysis
                  </p>
                  {["Confident", "Engaged", "Calm"].map((signal) => (
                    <div key={signal} className="mb-2 flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-emerald-700">
                      <span>{signal}</span>
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  ))}
                </div>

                <div>
                  <p className="mb-3 text-sm font-semibold uppercase text-slate-500">
                    Detected key strengths
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["User-Centric", "Agile Methodology", "Leadership", "Design Systems"].map((skill) => (
                      <Badge key={skill} className="rounded-full bg-sky-100 text-sky-800 hover:bg-sky-100">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-0 bg-[#020817] text-white shadow-sm">
              <CardContent className="p-6">
                <Lightbulb className="h-6 w-6 text-sky-300" />
                <h2 className="mt-4 font-bold">AI Tip</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Maintain eye contact with the camera and answer with context,
                  action, and measurable result.
                </p>
                <Button className="mt-5 w-full rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7]">
                  <Play className="mr-2 h-4 w-4" />
                  Start AI Interview
                </Button>
              </CardContent>
            </Card>
          </aside>
        </section>
      </main>
    </DashboardLayout>
  );
}
