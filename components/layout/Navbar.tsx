import Link from "next/link";
import { Menu } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Logo href="/" size="nav" priority />

        <nav className="hidden items-center gap-7 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-slate-500 hover:text-sky-700"
          >
            Home
          </Link>
          <Link
            href="#features"
            className="text-sm font-medium text-slate-500 hover:text-sky-700"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm font-medium text-slate-500 hover:text-sky-700"
          >
            How It Works
          </Link>
          <Link
            href="/signin"
            className="text-sm font-medium text-slate-500 hover:text-sky-700"
          >
            Sign In
          </Link>
        </nav>

        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </div>
    </header>
  );
}
