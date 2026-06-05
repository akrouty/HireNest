import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  className?: string;
};

export function SectionHeader({
  title,
  subtitle,
  eyebrow,
  className,
}: SectionHeaderProps) {
  return (
    <section className={cn("mb-6", className)}>
      {eyebrow ? (
        <p className="text-sm font-semibold text-sky-700">{eyebrow}</p>
      ) : null}
      <h1 className="text-3xl font-bold text-slate-950">{title}</h1>
      {subtitle ? (
        <p className="mt-2 max-w-3xl text-base leading-7 text-slate-500">
          {subtitle}
        </p>
      ) : null}
    </section>
  );
}
