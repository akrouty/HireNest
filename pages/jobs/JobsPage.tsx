"use client";

import {
  Briefcase,
  Building2,
  Clock,
  ExternalLink,
  MapPin,
  Search,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMatchingResults } from "@/hooks/useMatchingResults";

function matchTone(score: number) {
  if (score >= 90) return "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50";
  if (score >= 84) return "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50";
  return "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-50";
}

export default function JobsPage() {
  const {
    jobs,
    searchQuery,
    setSearchQuery,
    region,
    setRegion,
    sector,
    setSector,
  } = useMatchingResults();

  return (
    <DashboardLayout>
      <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <section>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Job Matcher
          </h1>
          <p className="mt-2 max-w-3xl text-base leading-7 text-slate-500">
            Discover high-potential job offers matched to your profile, skills,
            and career goals.
          </p>
        </section>

        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardContent className="space-y-5 p-4 sm:p-6">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px_180px_180px] lg:gap-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search jobs by title, company, or keywords..."
                  className="h-12 rounded-xl border-slate-200 bg-slate-50 pl-12"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50">
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="africa">Africa</SelectItem>
                  <SelectItem value="mena">MENA</SelectItem>
                  <SelectItem value="north-africa">North Africa</SelectItem>
                  <SelectItem value="west-africa">West Africa</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sector} onValueChange={setSector}>
                <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50">
                  <SelectValue placeholder="All Sectors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="data">Data</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="match">
                <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50">
                  <SelectValue placeholder="Best Match" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="match">Best Match</SelectItem>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="salary">Highest Salary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
              <p className="font-semibold text-slate-600">
                Showing {jobs.length} matches
              </p>
            </div>
          </CardContent>
        </Card>

        <section className="space-y-5">
          {jobs.map((job) => (
            <Card
              key={job.id}
              className="rounded-2xl border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-sky-200 hover:shadow-md"
            >
              <CardContent className="space-y-5 p-4 sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-700 sm:h-14 sm:w-14">
                      <Briefcase className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-semibold text-slate-950">
                          {job.title}
                        </h2>
                        <Badge variant="outline" className={`rounded-full ${matchTone(job.matchScore)}`}>
                          {job.matchScore}% Match
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {job.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {job.type}
                        </span>
                        <span>Posted {job.posted}</span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 lg:text-right">
                    <p className="text-lg font-bold text-slate-950 sm:text-xl">
                      {job.salary}
                    </p>
                    <p className="text-sm text-slate-500">Per year</p>
                  </div>
                </div>

                <p className="max-w-4xl text-sm leading-7 text-slate-600">
                  {job.description}
                </p>

                <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Required skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="rounded-md bg-sky-50 text-sky-800 hover:bg-sky-50"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Missing skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {job.missingSkills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="rounded-md border-amber-200 bg-amber-50 text-amber-700"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                  <Button className="w-full rounded-xl bg-[#0284c7] hover:bg-[#0369a1]">
                    Apply Now
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full rounded-xl border-slate-300 bg-white">
                    View Details
                  </Button>
                  <Button variant="outline" className="w-full rounded-xl border-slate-300 bg-white">
                    Save Job
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </DashboardLayout>
  );
}
