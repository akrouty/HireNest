import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ActionCardProps = {
  cta: string;
  description: string;
  href: string;
  icon: LucideIcon;
  title: string;
};

export function ActionCard({
  cta,
  description,
  href,
  icon: Icon,
  title,
}: ActionCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0284c7] text-white">
          <Icon className="h-5 w-5" />
        </div>
        <CardTitle className="text-lg text-[#0f172a]">{title}</CardTitle>
        <CardDescription className="leading-6 text-[#64748b]">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto">
        <Button asChild className="w-full">
          <Link href={href}>
            {cta}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
