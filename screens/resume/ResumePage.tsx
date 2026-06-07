"use client";

import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Image,
  Info,
  Link2,
  RefreshCw,
  Trash2,
  UploadCloud,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FileUpload } from "@/components/resume/FileUpload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useResumeUpload } from "@/hooks/useResumeUpload";

type ResumeCheck = {
  key: string;
  label: string;
  passed: boolean;
  status: string;
  points: number;
  max_points: number;
  detail: string;
  recommendation: string;
};

type ImprovementItem = {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
};

function statusTone(status: string) {
  switch (status) {
    case "present":
    case "ready":
    case "passed":
      return "border-emerald-200 bg-emerald-50";
    case "partial":
    case "warning":
      return "border-amber-200 bg-amber-50";
    case "missing":
    default:
      return "border-rose-200 bg-rose-50";
  }
}

function statusIcon(passed: boolean, status: string) {
  if (passed || status === "present" || status === "ready") {
    return CheckCircle2;
  }
  if (status === "partial" || status === "warning") {
    return Info;
  }
  return AlertCircle;
}

export default function ResumePage() {
  const {
    file,
    resume,
    extraction,
    evaluation,
    loading,
    isAnalyzing,
    hasResume,
    hasParsedResume,
    hasExtraction,
    isOffline,
    error,
    resumePreviewUrl,
    selectFile,
    analyzeSelectedResume,
    removeCurrentResume,
  } = useResumeUpload();

  const detectedSkills = extraction?.skills?.map((skill) => skill.name) ?? [];
  const experienceCount = extraction?.experiences?.length ?? 0;
  const educationCount = extraction?.educations?.length ?? 0;

  const readiness = Math.min(
    100,
    (hasResume ? 30 : 0) +
      (hasParsedResume ? 30 : 0) +
      (hasExtraction ? 25 : 0) +
      (experienceCount ? 10 : 0) +
      (educationCount ? 5 : 0),
  );

  const structureScore = evaluation?.score ?? readiness;

  const resumeChecks: ResumeCheck[] = evaluation?.checks ?? [
    {
      key: "text_extraction",
      label: "Text extraction",
      passed: hasParsedResume,
      status: hasParsedResume ? "present" : "missing",
      points: hasParsedResume ? 8 : 0,
      max_points: 8,
      detail: hasParsedResume
        ? "Readable resume text was extracted."
        : "Resume text has not been extracted yet.",
      recommendation: "Run analysis again if the PDF contains selectable text.",
    },
    {
      key: "profile_image",
      label: "Profile image",
      passed: false,
      status: "missing",
      points: 0,
      max_points: 4,
      detail: hasResume
        ? "No embedded portrait image was detected."
        : "Upload a resume to inspect embedded images.",
      recommendation:
        "A portrait is optional, but it may improve visual completeness in some resume styles.",
    },
    {
      key: "contact",
      label: "Contact details",
      passed: hasParsedResume,
      status: hasParsedResume ? "partial" : "missing",
      points: hasParsedResume ? 4 : 0,
      max_points: 12,
      detail: hasParsedResume
        ? "Contact data is partially available and can be refined after structured analysis."
        : "Parse your resume to inspect contact details.",
      recommendation:
        "Add email, phone, and relevant professional links near the top of your CV.",
    },
    {
      key: "professional_links",
      label: "Professional links",
      passed: false,
      status: "missing",
      points: 0,
      max_points: 6,
      detail: "LinkedIn, GitHub, or portfolio links improve candidate context.",
      recommendation: "Add public proof of work when relevant.",
    },
    {
      key: "skills_data",
      label: "Skills data",
      passed: detectedSkills.length > 0,
      status: detectedSkills.length > 0 ? "present" : "missing",
      points: detectedSkills.length > 0 ? 8 : 0,
      max_points: 8,
      detail:
        detectedSkills.length > 0
          ? `${detectedSkills.length} structured skills were detected.`
          : "No structured skills were extracted yet.",
      recommendation:
        "List your stack clearly using grouped technical skills to improve parsing quality.",
    },
    {
      key: "experience_data",
      label: "Experience data",
      passed: experienceCount > 0,
      status: experienceCount > 0 ? "present" : "missing",
      points: experienceCount > 0 ? 8 : 0,
      max_points: 8,
      detail:
        experienceCount > 0
          ? `${experienceCount} experience entries were extracted.`
          : "No experience entries were extracted yet.",
      recommendation:
        "Use a chronological experience section with company, role, dates, and bullet achievements.",
    },
    {
      key: "education_data",
      label: "Education data",
      passed: educationCount > 0,
      status: educationCount > 0 ? "present" : "missing",
      points: educationCount > 0 ? 6 : 0,
      max_points: 6,
      detail:
        educationCount > 0
          ? `${educationCount} education entries were extracted.`
          : "No education entries were extracted yet.",
      recommendation:
        "Keep education entries clearly formatted with degree, institution, and dates.",
    },
  ];

  const improvementItems: ImprovementItem[] = [
    {
      title: hasResume ? "CV uploaded" : "Upload required",
      description: hasResume
        ? `${resume?.original_filename ?? "Your CV"} is ready for analysis.`
        : "Upload a PDF resume to start parsing and structured analysis.",
      icon: hasResume ? CheckCircle2 : AlertCircle,
      tone: hasResume
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-amber-200 bg-amber-50 text-amber-700",
    },
    {
      title: hasParsedResume ? "Parsing complete" : "Parsing pending",
      description: hasParsedResume
        ? "Readable text has been extracted from your resume."
        : "Run analysis after upload to parse your resume text.",
      icon: hasParsedResume ? CheckCircle2 : Info,
      tone: hasParsedResume
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-sky-200 bg-sky-50 text-sky-700",
    },
    {
      title: hasExtraction
        ? "Structured extraction ready"
        : "Advanced recommendations coming soon",
      description: hasExtraction
        ? `${detectedSkills.length} skills, ${experienceCount} experiences, and ${educationCount} education entries detected.`
        : "Structured recommendations appear after resume analysis.",
      icon: hasExtraction ? CheckCircle2 : Info,
      tone: hasExtraction
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-slate-200 bg-slate-50 text-slate-700",
    },
  ];

  const summaryCards = [
    {
      label: "Upload",
      value: hasResume ? "Ready" : "Missing",
      helper: hasResume ? "Resume available" : "No resume yet",
    },
    {
      label: "Parsing",
      value: hasParsedResume ? "Ready" : "Pending",
      helper: hasParsedResume ? "Text extracted" : "Needs analysis",
    },
    {
      label: "Extraction",
      value: hasExtraction ? "Ready" : "Pending",
      helper: hasExtraction ? "Structured data ready" : "Not generated yet",
    },
    {
      label: "Structure Score",
      value: loading ? "--" : `${structureScore}%`,
      helper: "From structure and extracted content",
    },
  ];

  const presentSections: string[] = [
    hasParsedResume ? "Text extraction" : "",
    hasResume ? "Contact details" : "",
    detectedSkills.length > 0 ? "Skills data" : "",
    experienceCount > 0 ? "Experience data" : "",
    educationCount > 0 ? "Education data" : "",
  ].filter(Boolean);

  const improveSections: string[] = [
    !hasResume ? "Resume upload" : "",
    !hasParsedResume ? "Text extraction" : "",
    !hasExtraction ? "Structured extraction" : "",
    !experienceCount ? "Experience data" : "",
    !educationCount ? "Education data" : "",
    "Profile image",
  ].filter(Boolean);

  return (
    <DashboardLayout>
      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-4 sm:space-y-8 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <section>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Resume Review
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
            Upload your resume to enable automatic profile generation, receive
            AI feedback on ATS fit, detect skills, and prepare for matching with
            job offers.
          </p>
        </section>

        <section className="grid items-stretch gap-4 lg:grid-cols-[420px_minmax(0,1fr)] lg:gap-6">
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
                {isOffline ? (
                  "CV upload and analysis are unavailable offline."
                ) : file ? (
                  <span>
                    Selected file:{" "}
                    <strong className="text-slate-950">{file.name}</strong>
                  </span>
                ) : hasResume ? (
                  <span>
                    Stored resume:{" "}
                    <strong className="text-slate-950">
                      {resume?.original_filename ?? "Resume uploaded"}
                    </strong>
                  </span>
                ) : (
                  "Select a PDF file to begin resume analysis."
                )}
              </div>

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              <div className="space-y-3">
                <Button
                  type="button"
                  onClick={() => void analyzeSelectedResume()}
                  disabled={isAnalyzing || isOffline || (!file && !hasResume)}
                  className="w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing CV...
                    </>
                  ) : hasResume ? (
                    "Run New Analysis"
                  ) : (
                    "Upload and Analyze"
                  )}
                </Button>

                {hasResume ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void removeCurrentResume()}
                    disabled={isAnalyzing || isOffline}
                    className="w-full rounded-xl border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Resume
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-950">Resume Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {resumePreviewUrl ? (
                <iframe
                  title="Resume preview"
                  src={resumePreviewUrl}
                  className="h-[300px] w-full rounded-xl border border-slate-200 bg-slate-50 sm:h-[340px] lg:h-[380px]"
                />
              ) : (
                <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center text-sm text-slate-500 sm:h-[340px] lg:h-[380px]">
                  <div className="max-w-sm px-6">
                    <FileText className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                    <p className="font-medium text-slate-700">
                      No resume preview available yet
                    </p>
                    <p className="mt-2 leading-6">
                      Upload a resume to see the PDF preview here.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-5 p-5 sm:p-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">
                    Resume State Summary
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                    {loading
                      ? "Loading your resume state..."
                      : !hasResume
                        ? "No resume has been uploaded yet. Upload a PDF to enable parsing and analysis."
                        : !hasParsedResume
                          ? "Your resume is uploaded, but parsing is not complete yet."
                          : hasExtraction
                            ? "Your resume has been parsed and structured data is available."
                            : "Your resume is parsed. Run analysis to detect profile structure."}
                  </p>
                </div>

                <div className="shrink-0 rounded-2xl bg-slate-50 px-5 py-4 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Resume score
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">
                    {loading ? "--" : `${structureScore}%`}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Structure and extracted data
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {item.label}
                    </p>
                    <p className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">
                      {item.value}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {item.helper}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {resumeChecks.map((check) => {
                  const Icon =
                    check.key === "profile_image"
                      ? Image
                      : check.key === "professional_links"
                        ? Link2
                        : statusIcon(check.passed, check.status);

                  return (
                    <div
                      key={check.key}
                      className={`flex min-h-[180px] flex-col rounded-2xl border p-4 ${statusTone(check.status)}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                          <p className="font-semibold text-slate-950">
                            {check.label}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-white/70 px-2 py-1 text-xs font-bold text-slate-700">
                          {check.points}/{check.max_points}
                        </span>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-700">
                        {check.detail}
                      </p>

                      <p className="mt-auto pt-3 text-xs leading-5 text-slate-500">
                        {check.recommendation}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-2 lg:gap-6">
          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-950">Detected Skills</CardTitle>
            </CardHeader>
            <CardContent className="min-h-[180px]">
              {detectedSkills.length ? (
                <div className="flex flex-wrap gap-2">
                  {detectedSkills.map((skill) => (
                    <Badge
                      key={skill}
                      className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-6 text-slate-500">
                  No extracted skills yet. Parse and extract your CV to populate
                  this section.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-950">
                Resume Structure and Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Structure score
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">
                  {loading ? "--" : `${structureScore}%`}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  The resume is evaluated based on structure, extracted text,
                  and available data blocks.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Present sections
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {presentSections.length ? (
                      presentSections.map((section: string) => (
                        <Badge
                          key={section}
                          className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                        >
                          {section}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">
                        No section data yet.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Sections to improve
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {improveSections.length ? (
                      improveSections.map((section: string) => (
                        <Badge
                          key={section}
                          className="rounded-full border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50"
                        >
                          {section}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">
                        No improvement points detected.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Skills
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-950">
                    {detectedSkills.length}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Experience
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-950">
                    {experienceCount}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Education
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-950">
                    {educationCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-950">
                <Link2 className="h-5 w-5 text-sky-700" />
                Improvement Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 lg:grid-cols-3">
                {improvementItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className={`rounded-2xl border p-5 ${item.tone}`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <h3 className="text-lg font-semibold">{item.title}</h3>
                      </div>
                      <p className="mt-4 text-sm leading-7">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </DashboardLayout>
  );
}
