import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
};

export function AuthInput({
  id,
  label,
  leftElement,
  rightElement,
  className,
  ...props
}: AuthInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id} className="text-sm font-semibold text-slate-700">
          {label}
        </Label>
        {rightElement}
      </div>
      <div className="relative">
        {leftElement ? (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {leftElement}
          </div>
        ) : null}
        <Input
          id={id}
          className={`h-11 rounded-xl border-slate-200 bg-slate-100 text-slate-950 placeholder:text-slate-400 focus-visible:ring-sky-500 ${
            leftElement ? "pl-10" : ""
          } ${className ?? ""}`}
          {...props}
        />
      </div>
    </div>
  );
}
