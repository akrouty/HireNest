import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AuthCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <Card className="rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
      <CardHeader className="space-y-2 px-6 pt-8 text-center sm:px-8">
        <CardTitle className="text-2xl font-bold tracking-tight text-slate-950">
          {title}
        </CardTitle>
        <CardDescription className="text-sm text-slate-500">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-8 pt-4 sm:px-8">{children}</CardContent>
    </Card>
  );
}
