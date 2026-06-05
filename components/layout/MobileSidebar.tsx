"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

type MobileSidebarProps = {
  onOpen: () => void;
};

export function MobileSidebar({ onOpen }: MobileSidebarProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="shrink-0 rounded-xl lg:hidden"
      aria-label="Open dashboard navigation"
      aria-controls="dashboard-mobile-sidebar"
      onClick={onOpen}
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}
