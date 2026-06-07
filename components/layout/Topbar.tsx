"use client";

import { AlertCircle, Bell, Briefcase, ChevronDown, FileText, Info, LogOut, Settings, User } from "lucide-react";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

type TopbarProps = {
  onOpenSidebar: () => void;
  notifications?: DashboardNotification[];
};

export type DashboardNotification = {
  id: string;
  title: string;
  description?: string;
  tone?: "error" | "warning" | "info";
};

export function Topbar({ onOpenSidebar, notifications = [] }: TopbarProps) {
  const { user, logout } = useAuth();
  const initials = user?.initials ?? "HN";
  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim() ||
    user?.fullName ||
    user?.username ||
    "HireNest";

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:h-[72px] sm:gap-4 sm:px-6 lg:px-8">
      <MobileSidebar onOpen={onOpenSidebar} />

      <div className="min-w-0 flex-1"></div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative" aria-label="Open notifications">
            <Bell className="h-5 w-5 text-slate-600" />
            {notifications.length ? (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            ) : null}
            <span className="sr-only">Notifications</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 rounded-xl border-slate-200 bg-white p-2 shadow-lg">
          <DropdownMenuLabel className="flex items-center justify-between px-2 py-2">
            <span>Notifications</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
              {notifications.length}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {notifications.length ? (
            <div className="max-h-80 space-y-1 overflow-y-auto py-1">
              {notifications.map((item) => {
                const tone = item.tone ?? "info";
                const Icon = tone === "info" ? Info : AlertCircle;
                const toneClass = tone === "error"
                  ? "bg-red-50 text-red-700"
                  : tone === "warning"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-sky-50 text-sky-700";
                return (
                  <div key={item.id} className="flex gap-3 rounded-xl px-2 py-2 text-sm hover:bg-slate-50">
                    <span className={"mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl " + toneClass}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold text-slate-950">{item.title}</span>
                      {item.description ? (
                        <span className="mt-0.5 block text-xs leading-5 text-slate-500">{item.description}</span>
                      ) : null}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="px-2 py-6 text-center text-sm text-slate-500">No interview alerts.</p>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="hidden h-8 w-px bg-slate-300 sm:block" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex max-w-[240px] items-center gap-2 rounded-2xl px-1 py-1 transition-all duration-200 hover:bg-slate-100 active:scale-[0.98]"
            aria-label="Open profile menu"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#020817] text-sm font-bold text-white">
              {initials}
            </span>
            <span className="hidden min-w-0 text-left sm:block">
              <span className="block truncate text-sm font-semibold text-slate-900">
                {displayName}
              </span>
              <span className="block truncate text-xs text-slate-500">
                {user?.role ?? "candidate"}
              </span>
            </span>
            <ChevronDown className="hidden h-4 w-4 text-slate-600 sm:block" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 rounded-xl border-slate-200 bg-white p-2 shadow-lg">
          <DropdownMenuLabel className="px-2 py-2">
            <span className="block truncate text-sm font-semibold text-slate-950">
              {displayName}
            </span>
            <span className="block truncate text-xs font-normal text-slate-500">
              {user?.email ?? user?.role ?? "candidate"}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => window.location.assign("/dashboard")}>
            <User className="h-4 w-4" />
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => window.location.assign("/resume")}>
            <FileText className="h-4 w-4" />
            Resume
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => window.location.assign("/jobs?saved=1")}>
            <Briefcase className="h-4 w-4" />
            Saved jobs
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => window.location.assign("/settings")}>
            <Settings className="h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={(event) => {
              event.preventDefault();
              void logout();
            }}
          >
            <LogOut className="h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
