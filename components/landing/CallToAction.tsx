import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CallToAction() {
  return (
    <section className="bg-white px-4 py-20">
      <div className="container mx-auto rounded-[2rem] bg-[#020817] px-6 py-14 text-center text-white shadow-2xl md:px-12 md:py-20">
        <h2 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
          Ready to redefine your recruitment?
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300">
          Join over 500+ tech companies using HireNest to build elite teams
          with surgical precision.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="bg-[#0ea5e9] hover:bg-[#0284c7]">
            <Link href="/signup">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/25 bg-transparent text-white hover:bg-white/10"
          >
            <Link href="/login">Contact Sales</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
