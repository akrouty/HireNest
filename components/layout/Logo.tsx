import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type LogoSize = "nav" | "sidebar" | "auth" | "footer";

type LogoProps = {
  className?: string;
  href?: string;
  onClick?: () => void;
  priority?: boolean;
  size?: LogoSize;
};

const frameSize: Record<LogoSize, string> = {
  nav: "h-10",
  sidebar: "h-12",
  auth: "h-16",
  footer: "h-12",
};

const markSize: Record<LogoSize, string> = {
  nav: "h-12 w-12",
  sidebar: "h-14 w-14",
  auth: "h-14 w-14",
  footer: "h-8 w-8",
};

const textSize: Record<LogoSize, string> = {
  nav: "text-xl",
  sidebar: "text-2xl",
  auth: "text-2xl",
  footer: "text-xl",
};

function LogoImage({
  className,
  priority,
  size = "nav",
}: Omit<LogoProps, "href" | "onClick">) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-2",
        frameSize[size],
        className,
      )}
    >
      <span
        className={cn(
          "relative inline-flex shrink-0 overflow-hidden",
          markSize[size],
        )}
      >
        <Image
          src="/images/hirenest-logo-cropped.png"
          alt=""
          width={667}
          height={697}
          className="h-full w-full object-contain"
          priority={priority}
        />
      </span>
      <span
        className={cn(
          "font-bold leading-none tracking-normal text-slate-950",
          textSize[size],
        )}
      >
        HireNest
      </span>
    </span>
  );
}

export function Logo({
  className,
  href,
  onClick,
  priority,
  size = "nav",
}: LogoProps) {
  if (!href) {
    return <LogoImage className={className} priority={priority} size={size} />;
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label="HireNest home"
      className="inline-flex items-center"
    >
      <LogoImage className={className} priority={priority} size={size} />
    </Link>
  );
}
