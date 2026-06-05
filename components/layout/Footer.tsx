import Link from "next/link";
import { Linkedin, Mail, Twitter } from "lucide-react";
import { Logo } from "@/components/layout/Logo";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Logo href="/" size="footer" />
            <p className="text-sm leading-6 text-slate-500">
              AI-powered recruitment and career matching for modern teams.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-slate-950">Platform</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              {[
                ["Dashboard", "/dashboard"],
                ["Resume Reviewer", "/resume"],
                ["Job Matcher", "/jobs"],
                ["AI Interview", "/interview"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="transition hover:text-sky-700">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-slate-950">Company</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              {["About Us", "Careers", "Privacy Policy", "Terms of Service"].map((label) => (
                <li key={label}>
                  <Link href="#" className="transition hover:text-sky-700">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-slate-950">Connect</h3>
            <div className="flex gap-3">
              {[Twitter, Linkedin, Mail].map((Icon, index) => (
                <Link
                  key={index}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-sky-700"
                >
                  <Icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-8 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} HireNest. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
