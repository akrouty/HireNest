import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type StatCardProps = {
  detail: string;
  icon: LucideIcon;
  label: string;
  value: string;
};

export function StatCard({ detail, icon: Icon, label, value }: StatCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-semibold text-[#64748b]">
          {label}
        </CardTitle>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-[#0284c7]">
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-[#0f172a]">{value}</div>
        <p className="mt-1 text-sm text-[#64748b]">{detail}</p>
      </CardContent>
    </Card>
  );
}
