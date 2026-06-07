"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar, type DashboardNotification } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";

type DashboardLayoutProps = {
  children: React.ReactNode;
  notifications?: DashboardNotification[];
};

export function DashboardLayout({ children, notifications }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  function closeSidebar() {
    setIsSidebarOpen(false);
  }

  return (
    <RequireAuth roles={["candidate"]}>
      <div className="min-h-screen overflow-x-hidden bg-[#f8fafc] text-slate-950">
        <Sidebar />
        <div className="min-w-0 lg:ml-[260px]">
          <Topbar onOpenSidebar={() => setIsSidebarOpen(true)} notifications={notifications} />
          <div className="dashboard-surface w-full min-w-0">{children}</div>
        </div>

        {isSidebarOpen ? (
          <div className="fixed inset-0 z-[80] lg:hidden" id="dashboard-mobile-sidebar">
            <button
              type="button"
              className="absolute inset-0 bg-slate-950/50"
              aria-label="Close dashboard navigation overlay"
              onClick={closeSidebar}
            />
            <div className="absolute left-0 top-0 h-full max-w-[86vw]">
              <Sidebar variant="mobile" onNavigate={closeSidebar} />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-3 top-3 rounded-xl bg-white/90"
                aria-label="Close dashboard navigation"
                onClick={closeSidebar}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </RequireAuth>
  );
}
