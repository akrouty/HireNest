import { Logo } from "@/components/layout/Logo";

type AuthLayoutProps = {
  children: React.ReactNode;
  footer?: React.ReactNode;
  topRight?: React.ReactNode;
};

export function AuthLayout({ children, footer, topRight }: AuthLayoutProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-x-hidden bg-[#f8fafc] px-4 py-10 sm:px-6">
      {topRight ? (
        <div className="absolute right-5 top-5 text-sm sm:right-10">
          {topRight}
        </div>
      ) : null}

      <div className="w-full max-w-[420px]">
        <div className="mb-7 flex justify-center">
          <Logo href="/" size="auth" priority />
        </div>
        {children}
        {footer ? <div className="mt-8">{footer}</div> : null}
      </div>
    </main>
  );
}
