"use client";

import { Bell, ChevronDown, Search } from "lucide-react";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

type TopbarProps = {
  onOpenSidebar: () => void;
};

export function Topbar({ onOpenSidebar }: TopbarProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:h-[72px] sm:gap-4 sm:px-6 lg:px-8">
      <MobileSidebar onOpen={onOpenSidebar} />

      <div className="min-w-0 flex-1">
        <div className="relative hidden max-w-xl sm:block">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          <Input
            placeholder="Search jobs, skills, reports..."
            className="h-11 border-slate-200 pl-12 text-sm"
          />
        </div>
      </div>

      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5 text-slate-600" />
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        <span className="sr-only">Notifications</span>
      </Button>
      <div className="hidden h-8 w-px bg-slate-300 sm:block" />
      <button
        type="button"
        className="flex items-center gap-2 rounded-2xl px-1 py-1 transition-all duration-200 hover:bg-slate-100 active:scale-[0.98]"
        aria-label="Open profile menu"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#020817] text-sm font-bold text-white">
          {user.initials}
        </span>
        <ChevronDown className="hidden h-4 w-4 text-slate-600 sm:block" />
      </button>
    </header>
  );
}
