import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type StatCardProps = {
  detail: string;
  icon: LucideIcon;
  label: string;
  loading?: boolean;
  progress?: number | null;
  tone?: "default" | "good" | "warning" | "danger";
  value: string;
};

export function StatCard({
  detail,
  icon: Icon,
  label,
  loading = false,
  progress = null,
  tone = "default",
  value,
}: StatCardProps) {
  const iconTone = {
    default: "bg-sky-50 text-[#0284c7]",
    good: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    danger: "bg-red-50 text-red-700",
  }[tone];

  return (
    <Card className="h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-semibold text-[#64748b]">
          {label}
        </CardTitle>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconTone}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-9 w-24 rounded-xl" />
            <Skeleton className="h-4 w-full rounded-xl" />
            {progress !== null ? <Skeleton className="h-2 w-full rounded-full" /> : null}
          </div>
        ) : (
          <>
            <div className="text-3xl font-bold text-[#0f172a]">{value}</div>
            <p className="mt-1 text-sm leading-6 text-[#64748b]">{detail}</p>
            {progress !== null ? (
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#0284c7] transition-all duration-500"
                  style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                />
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
