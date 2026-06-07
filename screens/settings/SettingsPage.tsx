"use client";

import { useEffect, useMemo, useState, type ElementType } from "react";
import { toast } from "sonner";
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import {
  createMyProfile,
  getMyProfile,
  updateMyProfile,
  type CandidateProfile,
  type CandidateProfileInput,
} from "@/services/profile.service";
import { ApiError } from "@/services/api";

type SecurityCardProps = {
  buttonLabel: string;
  description: string;
  disabled?: boolean;
  icon: ElementType;
  title: string;
  variant?: "default" | "outline";
};

type SettingsPreferences = {
  notifications: {
    career_insights: boolean;
    job_match_alerts: boolean;
    resume_tips: boolean;
  };
  privacy: {
    ai_data_sharing: boolean;
    profile_visibility: boolean;
  };
};

type NotificationKey = keyof SettingsPreferences["notifications"];
type PrivacyKey = keyof SettingsPreferences["privacy"];

const DEFAULT_PREFERENCES: SettingsPreferences = {
  notifications: {
    career_insights: true,
    job_match_alerts: true,
    resume_tips: true,
  },
  privacy: {
    ai_data_sharing: false,
    profile_visibility: true,
  },
};

const notificationItems: Array<{
  key: NotificationKey;
  title: string;
  description: string;
}> = [
  {
    key: "job_match_alerts",
    title: "Job Match Alerts",
    description: "Receive updates when new jobs match your profile and target role.",
  },
  {
    key: "resume_tips",
    title: "Resume Tips",
    description: "Get reminders and tips when your CV data looks incomplete.",
  },
  {
    key: "career_insights",
    title: "Career Insights",
    description: "Allow AI career insight refresh notices and model-driven recommendations.",
  },
];

const privacyItems: Array<{
  key: PrivacyKey;
  title: string;
  description: string;
}> = [
  {
    key: "profile_visibility",
    title: "Profile Visibility",
    description: "Allow matched recruiters and job workflows to use your candidate profile.",
  },
  {
    key: "ai_data_sharing",
    title: "AI Data Sharing",
    description: "Allow anonymized profile data to improve local AI recommendations.",
  },
];

const experienceLevels = [
  "entry",
  "junior",
  "mid",
  "senior",
  "lead",
] as const;

function clonePreferences(): SettingsPreferences {
  return {
    notifications: { ...DEFAULT_PREFERENCES.notifications },
    privacy: { ...DEFAULT_PREFERENCES.privacy },
  };
}

function readPreferences(value: string | null | undefined): SettingsPreferences {
  if (!value) return clonePreferences();

  try {
    const parsed = JSON.parse(value) as Partial<SettingsPreferences>;
    return {
      notifications: {
        ...DEFAULT_PREFERENCES.notifications,
        ...(parsed.notifications ?? {}),
      },
      privacy: {
        ...DEFAULT_PREFERENCES.privacy,
        ...(parsed.privacy ?? {}),
      },
    };
  } catch {
    return clonePreferences();
  }
}

function serializePreferences(preferences: SettingsPreferences) {
  return JSON.stringify(preferences);
}

function trimOrNull(value: string) {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function SecurityCard({
  buttonLabel,
  description,
  disabled = false,
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
        disabled={disabled}
      >
        {buttonLabel}
      </Button>
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { isOffline, blockIfOffline } = useOfflineStatus();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [location, setLocation] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [targetDomain, setTargetDomain] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [preferences, setPreferences] =
    useState<SettingsPreferences>(clonePreferences);
  const [saving, setSaving] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  useEffect(() => {
    setFullName(user?.fullName ?? "");
    setEmail(user?.email ?? "");
  }, [user?.email, user?.fullName]);

  useEffect(() => {
    let mounted = true;
    if (isOffline) return;

    async function loadProfile() {
      try {
        const data = await getMyProfile();
        if (!mounted) return;
        setProfile(data);
        setProfessionalTitle(data.professional_title ?? "");
        setSummary(data.summary ?? "");
        setLocation(data.location ?? "");
        setTargetRole(data.target_job_title ?? "");
        setTargetDomain(data.target_domain ?? "");
        setExperienceLevel(data.experience_level ?? "");
        setLinkedinUrl(data.linkedin_url ?? "");
        setGithubUrl(data.github_url ?? "");
        setPortfolioUrl(data.portfolio_url ?? "");
        setPreferences(readPreferences(data.preferences));
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          setPreferences(clonePreferences());
          return;
        }
        const message = err instanceof Error ? err.message : "Unable to load profile";
        toast.error("Profile failed to load", { description: message });
      }
    }

    void loadProfile();
    return () => {
      mounted = false;
    };
  }, [isOffline]);

  function buildProfilePayload(
    nextPreferences = preferences,
  ): CandidateProfileInput {
    return {
      professional_title: trimOrNull(professionalTitle),
      summary: trimOrNull(summary),
      target_domain: trimOrNull(targetDomain),
      target_job_title: trimOrNull(targetRole),
      location: trimOrNull(location),
      experience_level: trimOrNull(experienceLevel),
      preferences: serializePreferences(nextPreferences),
      linkedin_url: trimOrNull(linkedinUrl),
      github_url: trimOrNull(githubUrl),
      portfolio_url: trimOrNull(portfolioUrl),
    };
  }

  async function saveProfile() {
    if (blockIfOffline("Profile save")) return;
    if (!trimOrNull(professionalTitle) && !trimOrNull(targetRole)) {
      toast.error("Profile needs a role", {
        description: "Add a professional title or target role before saving.",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = buildProfilePayload();
      const saved = profile
        ? await updateMyProfile(payload)
        : await createMyProfile(payload);
      setProfile(saved);
      setPreferences(readPreferences(saved.preferences));
      toast.success("Profile saved");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Profile save failed";
      toast.error("Profile save failed", { description: message });
    } finally {
      setSaving(false);
    }
  }

  async function saveNotificationPreference(key: NotificationKey, checked: boolean) {
    const nextPreferences: SettingsPreferences = {
      ...preferences,
      notifications: {
        ...preferences.notifications,
        [key]: checked,
      },
    };
    await persistPreferences(nextPreferences);
  }

  async function savePrivacyPreference(key: PrivacyKey, checked: boolean) {
    const nextPreferences: SettingsPreferences = {
      ...preferences,
      privacy: {
        ...preferences.privacy,
        [key]: checked,
      },
    };
    await persistPreferences(nextPreferences);
  }

  async function persistPreferences(nextPreferences: SettingsPreferences) {
    if (blockIfOffline("Settings update")) return;
    const previous = preferences;
    setPreferences(nextPreferences);
    setSavingPreferences(true);

    try {
      const payload = buildProfilePayload(nextPreferences);
      const saved = profile
        ? await updateMyProfile({ preferences: payload.preferences })
        : await createMyProfile(payload);
      setProfile(saved);
      setPreferences(readPreferences(saved.preferences));
      toast.success("Settings updated");
    } catch (err) {
      setPreferences(previous);
      const message = err instanceof Error ? err.message : "Settings update failed";
      toast.error("Settings update failed", { description: message });
    } finally {
      setSavingPreferences(false);
    }
  }

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
                    {user?.initials ?? "HN"}
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
                      disabled
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Coming Soon
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
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled
                  />
                </div>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="professionalTitle">Professional Title</Label>
                  <Input
                    id="professionalTitle"
                    value={professionalTitle}
                    onChange={(event) => setProfessionalTitle(event.target.value)}
                    placeholder="Backend Developer"
                    disabled={isOffline}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experienceLevel">Experience Level</Label>
                  <Select
                    value={experienceLevel || undefined}
                    onValueChange={setExperienceLevel}
                    disabled={isOffline}
                  >
                    <SelectTrigger id="experienceLevel" className="w-full">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="Tunis, Tunisia"
                    disabled={isOffline}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetRole">Target Role</Label>
                  <Input
                    id="targetRole"
                    value={targetRole}
                    onChange={(event) => setTargetRole(event.target.value)}
                    placeholder="Senior Backend Developer"
                    disabled={isOffline}
                  />
                </div>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="targetDomain">Target Domain</Label>
                  <Input
                    id="targetDomain"
                    value={targetDomain}
                    onChange={(event) => setTargetDomain(event.target.value)}
                    placeholder="Cloud APIs, fintech, AI tools"
                    disabled={isOffline}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                  <Input
                    id="linkedinUrl"
                    value={linkedinUrl}
                    onChange={(event) => setLinkedinUrl(event.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    disabled={isOffline}
                  />
                </div>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="githubUrl">GitHub URL</Label>
                  <Input
                    id="githubUrl"
                    value={githubUrl}
                    onChange={(event) => setGithubUrl(event.target.value)}
                    placeholder="https://github.com/..."
                    disabled={isOffline}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                  <Input
                    id="portfolioUrl"
                    value={portfolioUrl}
                    onChange={(event) => setPortfolioUrl(event.target.value)}
                    placeholder="https://..."
                    disabled={isOffline}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="summary">Professional Summary</Label>
                <Textarea
                  id="summary"
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  placeholder="Short summary used by recommendations and career insights."
                  className="min-h-28 resize-y rounded-xl border-slate-300 bg-white"
                  disabled={isOffline}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  className="w-full sm:w-auto"
                  disabled={saving || isOffline}
                  onClick={() => void saveProfile()}
                >
                  {saving ? "Saving..." : "Save Changes"}
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
                {notificationItems.map((item) => (
                  <div key={item.key} className="flex items-center justify-between gap-5 py-5 first:pt-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-slate-950">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {item.description}
                      </p>
                    </div>
                    <Switch
                      checked={preferences.notifications[item.key]}
                      disabled={isOffline || savingPreferences}
                      onCheckedChange={(checked) =>
                        void saveNotificationPreference(item.key, checked)
                      }
                    />
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
                {privacyItems.map((item) => (
                  <div key={item.key} className="flex items-center justify-between gap-5 py-5 first:pt-0">
                    <div>
                      <p className="font-semibold text-slate-950">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {item.description}
                      </p>
                    </div>
                    <Switch
                      checked={preferences.privacy[item.key]}
                      disabled={isOffline || savingPreferences}
                      onCheckedChange={(checked) =>
                        void savePrivacyPreference(item.key, checked)
                      }
                    />
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
                description="Password change endpoint is not implemented yet."
                buttonLabel="Coming Soon"
                disabled
                variant="outline"
              />
              <SecurityCard
                icon={Shield}
                title="Two-Factor Authentication"
                description="Add an extra verification step before sensitive account actions."
                buttonLabel="Coming Soon"
                disabled
                variant="outline"
              />
              <SecurityCard
                icon={MonitorCheck}
                title="Login Sessions"
                description="Session history is planned for a future release."
                buttonLabel="Coming Soon"
                disabled
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
                  Account deactivation requires a backend endpoint to safely
                  revoke sessions and preserve audit integrity.
                </p>
              </div>
            </div>
            <Button variant="destructive" className="w-full sm:w-auto" disabled>
              <Trash2 className="mr-2 h-4 w-4" />
              Deactivation Coming Soon
            </Button>
          </CardContent>
        </Card>

        <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
          <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
            <span>Copyright {currentYear} HireNest.</span>
            <Badge variant="outline" className="border-slate-200 bg-white text-slate-500">
              AI Career Advisor
            </Badge>
          </div>
        </footer>
      </main>
    </DashboardLayout>
  );
}
