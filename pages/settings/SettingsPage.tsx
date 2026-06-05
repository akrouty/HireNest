"use client";

import type { ElementType } from "react";
import {
  Bell,
  Download,
  Info,
  KeyRound,
  MonitorCheck,
  Shield,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";

type SecurityCardProps = {
  buttonLabel: string;
  description: string;
  icon: ElementType;
  title: string;
  variant?: "default" | "outline";
};

const notificationItems = [
  ["Job Match Alerts", "Receive instant notifications for new recommended job matches.", true],
  ["Resume Tips", "Get weekly updates on hiring trends and resume screening.", true],
  ["Career Insights", "Monthly reports on your profile growth and analytics.", false],
];

const privacyItems = [
  ["Profile Visibility", "Allow matched recruiters to see your candidate profile.", true],
  ["AI Data Sharing", "Share anonymized data to improve AI matching accuracy.", true],
];

function SecurityCard({
  buttonLabel,
  description,
  icon: Icon,
  title,
  variant = "default",
}: SecurityCardProps) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:border-slate-300 hover:shadow-sm">
      <Icon className="h-5 w-5 text-sky-700" />
      <h3 className="mt-3 font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      <Button
        variant={variant === "outline" ? "outline" : "default"}
        className="mt-auto w-full"
      >
        {buttonLabel}
      </Button>
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <section>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Settings
          </h1>
          <p className="mt-2 max-w-3xl text-base leading-7 text-slate-500">
            Manage your profile, preferences, and account security.
          </p>
        </section>

        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardContent className="grid gap-8 p-5 sm:p-6 xl:grid-cols-[320px_1fr]">
            <div>
              <div className="flex items-center gap-2">
                <UserRound className="h-5 w-5 text-sky-700" />
                <h2 className="text-lg font-semibold text-slate-900">
                  Profile Information
                </h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Update your personal and professional identity details.
              </p>

              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-slate-950 shadow-sm ring-1 ring-slate-200">
                    {user.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      Avatar upload
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Upload a square PNG or JPG under 2MB.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-3 rounded-xl border-slate-300 bg-white"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Photo
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    defaultValue={user.fullName}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={user.email ?? "sana@hirenest.com"}
                  />
                </div>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    defaultValue="Tunisia, Ariana"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetRole">Target Role</Label>
                  <Input
                    id="targetRole"
                    defaultValue="Senior Software Engineer"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button className="w-full sm:w-auto">
                  Save Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-4 lg:gap-6 xl:grid-cols-2">
          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Notifications
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Configure how you receive updates and alerts.
                  </p>
                </div>
              </div>
              <div className="mt-6 divide-y divide-slate-200">
                {notificationItems.map(([title, description, checked]) => (
                  <div key={title as string} className="flex items-center justify-between gap-5 py-5 first:pt-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-slate-950">{title as string}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {description as string}
                      </p>
                    </div>
                    <Switch defaultChecked={Boolean(checked)} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Privacy
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Control your data visibility and AI sharing preferences.
                  </p>
                </div>
              </div>
              <div className="mt-6 divide-y divide-slate-200">
                {privacyItems.map(([title, description, checked]) => (
                  <div key={title as string} className="flex items-center justify-between gap-5 py-5 first:pt-0">
                    <div>
                      <p className="font-semibold text-slate-950">{title as string}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {description as string}
                      </p>
                    </div>
                    <Switch defaultChecked={Boolean(checked)} />
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <div className="flex gap-3">
                  <Download className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Data export
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Download your profile, resume analysis, and career
                      recommendation history anytime.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Security
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Protect your account and review access activity.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-6">
              <SecurityCard
                icon={KeyRound}
                title="Password"
                description="Update your password regularly to keep your account secure."
                buttonLabel="Change Password"
              />
              <SecurityCard
                icon={Shield}
                title="Two-Factor Authentication"
                description="Add an extra verification step before sensitive account actions."
                buttonLabel="Coming Soon"
                variant="outline"
              />
              <SecurityCard
                icon={MonitorCheck}
                title="Login Sessions"
                description="Review active devices and recent sign-in activity."
                buttonLabel="View Sessions"
                variant="outline"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-red-200 bg-white shadow-sm">
          <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Info className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-red-700">
                  Deactivate Account
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-red-600">
                  Permanently remove your account and associated career data.
                </p>
              </div>
            </div>
            <Button variant="destructive" className="w-full sm:w-auto">
              <Trash2 className="mr-2 h-4 w-4" />
              Deactivate
            </Button>
          </CardContent>
        </Card>
      </main>
    </DashboardLayout>
  );
}
