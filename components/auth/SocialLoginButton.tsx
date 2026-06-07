import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type SocialLoginButtonProps = {
  icon: LucideIcon;
  label: string;
  iconClassName?: string;
  disabled?: boolean;
  onClick?: () => void;
};

export function SocialLoginButton({
  icon: Icon,
  label,
  iconClassName,
  disabled = false,
  onClick,
}: SocialLoginButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className="h-10 w-full rounded-lg border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
      disabled={disabled}
      onClick={onClick}
    >
      <Icon className={`mr-2 h-4 w-4 text-slate-700 ${iconClassName ?? ""}`} />
      {label}
    </Button>
  );
}
