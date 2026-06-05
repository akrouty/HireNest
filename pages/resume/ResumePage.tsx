"use client";

import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Info,
  RefreshCw,
  Sparkles,
  UploadCloud,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FileUpload } from "@/components/resume/FileUpload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useResumeUpload } from "@/hooks/useResumeUpload";

const detectedSkills = ["React", "Node.js", "TypeScript", "AWS", "Agile", "REST APIs"];
const missingSkills = ["Kubernetes", "System Design", "CI/CD", "Cloud Security"];

const improvementItems = [
  {
    title: "Experience clarity",
    description: "Your chronological history is well-structured and easy for ATS systems to parse.",
    icon: CheckCircle2,
    tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  {
    title: "Make your CV look more professional",
    description: "Your summary section is too generic. Replace it with measurable achievements.",
    icon: AlertCircle,
    tone: "border-rose-200 bg-rose-50 text-rose-700",
  },
  {
    title: "Keyword optimization",
    description: 'Add "Cloud Architecture" and "SDLC" to match top roles in your target market.',
    icon: Info,
    tone: "border-sky-200 bg-sky-50 text-sky-700",
  },
];

export default function ResumePage() {
  const {
    file,
    analysis,
    isAnalyzing,
    hasResults,
    selectFile,
    analyzeSelectedResume,
  } = useResumeUpload();

  const score = analysis?.score ?? 85;

  return (
    <DashboardLayout>
      <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <section>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Resume Review
          </h1>
          <p className="mt-2 max-w-3xl text-base leading-7 text-slate-500">
            Upload your CV and receive AI feedback on ATS fit, structure,
            detected skills, missing skills, and improvement priorities.
          </p>
        </section>

        <section className="grid gap-4 lg:gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-950">
                <UploadCloud className="h-5 w-5 text-sky-700" />
                CV Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <FileUpload onFileSelect={selectFile} />
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                {file ? (
                  <span>
                    Selected file:{" "}
                    <strong className="text-slate-950">{file.name}</strong>
                  </span>
                ) : (
                  "PDF or DOCX files up to 5MB are supported."
                )}
              </div>
              <Button
                onClick={analyzeSelectedResume}
                disabled={!file || isAnalyzing}
                className="w-full rounded-xl bg-[#020817] hover:bg-[#07111f]"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing CV...
                  </>
                ) : hasResults ? (
                  "Run New Analysis"
                ) : (
                  "Upload and Analyze"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardContent className="grid gap-6 p-6 md:grid-cols-[220px_1fr]">
              <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 p-6 text-center">
                <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-[10px] border-sky-100">
                  <div
                    className="absolute inset-[-10px] rounded-full border-[10px] border-[#0284c7]"
                    style={{
                      clipPath: `polygon(0 0, ${score}% 0, ${score}% 100%, 0 100%)`,
                    }}
                  />
                  <div className="relative text-4xl font-bold text-slate-950">
                    {score}
                  </div>
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-950">
                  Resume Score
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Strong candidate profile
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-sky-700" />
                  <h2 className="text-xl font-bold text-slate-950">
                    AI Analysis Summary
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Your CV is well structured and has strong technical signals.
                  The next improvement area is making achievements more
                  measurable and aligning keywords with target job offers.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    ["Content", analysis?.sections.content ?? 90],
                    ["Format", analysis?.sections.format ?? 82],
                    ["ATS Fit", analysis?.sections.ats ?? 83],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-slate-200 p-4">
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className="mt-1 text-2xl font-bold text-slate-950">
                        {value}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-2 lg:gap-6">
          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-950">Detected Skills</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {detectedSkills.map((skill) => (
                <Badge key={skill} className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                  {skill}
                </Badge>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-950">Missing Skills</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {missingSkills.map((skill) => (
                <Badge key={skill} variant="outline" className="rounded-full border-amber-200 bg-amber-50 text-amber-700">
                  {skill}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </section>

        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-950">
              <FileText className="h-5 w-5 text-sky-700" />
              Improvement Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-3">
            {improvementItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className={`rounded-2xl border p-4 ${item.tone}`}>
                  <Icon className="h-5 w-5" />
                  <h3 className="mt-3 font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6">{item.description}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </main>
    </DashboardLayout>
  );
}
