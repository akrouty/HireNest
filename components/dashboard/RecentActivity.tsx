import type { LucideIcon } from "lucide-react";
import { Briefcase, FileText, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type RecentActivityItem = {
  description: string;
  icon?: LucideIcon;
  time: string;
  title: string;
};

const defaultIcons = [FileText, Briefcase, TrendingUp];

type RecentActivityProps = {
  items: RecentActivityItem[];
};

export function RecentActivity({ items }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[#0f172a]">Recent Activity</CardTitle>
        <CardDescription className="text-[#64748b]">
          Your latest actions and platform updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-slate-100">
          {items.map((item, index) => {
            const Icon = item.icon ?? defaultIcons[index % defaultIcons.length];

            return (
              <article
                key={item.title}
                className="flex flex-col gap-3 py-4 transition-colors duration-200 first:pt-0 last:pb-0 hover:bg-slate-50/60 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[#0284c7]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#0f172a]">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-[#64748b]">
                      {item.description}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 pl-[52px] text-xs font-medium text-[#64748b] sm:pl-0 sm:pt-1">
                  {item.time}
                </span>
              </article>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
