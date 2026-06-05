import { CallToAction } from "@/components/landing/CallToAction";
import { FeatureCards } from "@/components/landing/FeatureCards";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { TrustedCompanies } from "@/components/landing/TrustedCompanies";

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <LandingNavbar />
      <main>
        <HeroSection />
        <TrustedCompanies />
        <div id="employers">
          <FeatureCards />
        </div>
        <div id="candidates">
          <HowItWorks />
        </div>
        <CallToAction />
      </main>
      <LandingFooter />
    </div>
  );
}
