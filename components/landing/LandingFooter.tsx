import Link from "next/link";
import { Linkedin, Twitter } from "lucide-react";
import { Logo } from "@/components/layout/Logo";

const platformLinks = ["AI Matcher", "Video Interviews", "Assessments"];
const companyLinks = ["About Us", "Careers", "Contact Support"];
const bottomLinks = ["Privacy Policy", "Terms of Service", "Cookie Policy"];

export function LandingFooter() {
  return (
    <footer className="bg-[#020817] text-white">
      <div className="container mx-auto px-4 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_0.8fr]">
          <div>
            <Logo
              href="/"
              size="footer"
              className="rounded-xl bg-white shadow-sm"
            />
            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
              HireNest combines AI matching, resume intelligence, assessments,
              and interview automation for precision recruitment.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white">Platform</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              {platformLinks.map((link) => (
                <li key={link}>
                  <Link
                    href="#features"
                    className="transition hover:text-white"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white">Company</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              {companyLinks.map((link) => (
                <li key={link}>
                  <Link href="#" className="transition hover:text-white">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white">Social</h3>
            <div className="mt-4 flex gap-3">
              <Link
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <Linkedin className="h-4 w-4" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Twitter</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© 2026 HireNest. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            {bottomLinks.map((link) => (
              <Link key={link} href="#" className="transition hover:text-white">
                {link}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
