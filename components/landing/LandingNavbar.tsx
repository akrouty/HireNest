"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Employers", href: "#employers" },
  { label: "Candidates", href: "#candidates" },
];

export function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Logo href="/" size="nav" priority onClick={closeMenu} />

        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition hover:text-sky-700"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          <Link
            href="/signin"
            className="text-sm font-semibold text-slate-700 transition hover:text-sky-700"
          >
            Login
          </Link>
          <Button
            asChild
            className="rounded-xl bg-[#020817] hover:bg-[#07111f]"
          >
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-xl lg:hidden"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isOpen}
          aria-controls="landing-mobile-menu"
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </nav>

      {isOpen ? (
        <div
          id="landing-mobile-menu"
          className="border-t border-slate-200 bg-white px-4 py-4 shadow-lg lg:hidden"
        >
          <div className="container mx-auto space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="block rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-sky-700"
              >
                {link.label}
              </Link>
            ))}
            <div className="grid gap-3 border-t border-slate-100 pt-4">
              <Link
                href="/signin"
                onClick={closeMenu}
                className="rounded-xl px-3 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-sky-700"
              >
                Login
              </Link>
              <Button
                asChild
                className="rounded-xl bg-[#020817] hover:bg-[#07111f]"
              >
                <Link href="/signup" onClick={closeMenu}>
                  Get Started
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
