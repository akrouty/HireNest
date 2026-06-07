"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  ClipboardCheck,
  CircleHelp,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  Sparkles,
  Video,
} from "lucide-react";

import { Logo } from "@/components/layout/Logo";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Resume", href: "/resume", icon: FileText },
  { title: "Job Offers", href: "/jobs", icon: Briefcase },
  { title: "Recommendations", href: "/recommendations", icon: Sparkles },
  { title: "QCM Tests", href: "/qcm", icon: ClipboardCheck },
  { title: "AI Interview", href: "/interview", icon: Video },
  { title: "Settings", href: "/settings", icon: Settings },
];

type SidebarProps = {
  onNavigate?: () => void;
  variant?: "desktop" | "mobile";
};

export function Sidebar({ onNavigate, variant = "desktop" }: SidebarProps) {
  const [pathname, setPathname] = useState("");
  const { logout } = useAuth();

  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  async function onLogout() {
    onNavigate?.();
    await logout();
  }

  return (
    <aside
      className={cn(
        "h-full w-[260px] border-r border-slate-200 bg-white",
        variant === "desktop"
          ? "fixed left-0 top-0 z-40 hidden h-screen lg:block"
          : "h-full shadow-2xl",
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex flex-col items-center border-b border-slate-200 px-5 py-7 text-center">
          <Logo
            href="/dashboard"
            size="sidebar"
            priority
            onClick={onNavigate}
          />
          <p className="mt-2 text-sm font-semibold text-slate-500">
            AI Career Advisor
          </p>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.99]",
                  isActive
                    ? "bg-[#020817] text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-slate-200 p-4">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-950"
          >
            <CircleHelp className="h-5 w-5" />
            Help Center
          </button>
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition-colors duration-200 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-5 w-5" />
            Log Out
          </button>
        </div>
      </div>
    </aside>
  );
}
