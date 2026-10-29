import PulseField from "@/components/brand/PulseField";
import RevealScanner from "@/components/brand/RevealScanner";
import AboutSection from "@/components/marketing/AboutSection";
import FaqAccordion from "@/components/marketing/FaqAccordion";
import FinalCtaSection from "@/components/marketing/FinalCtaSection";
import HeroSection from "@/components/marketing/HeroSection";
import HighlightsSection from "@/components/marketing/HighlightsSection";
import JourneySection from "@/components/marketing/JourneySection";
import PlansSection from "@/components/marketing/PlansSection";
import SiteFooter from "@/components/marketing/SiteFooter";
import SiteHeader from "@/components/marketing/SiteHeader";
import TestimonialsSection from "@/components/marketing/TestimonialsSection";
import ThemeProvider from "@/components/marketing/ThemeProvider";
import { getUserFromToken } from "./actions/user";

export default async function Home() {
  const user = await getUserFromToken();
  const isAuthenticated = Boolean(user);
  const dashboardHref =
    user?.role === "admin" ? "/admin/dashboard" : "/aluno/home";
  const primaryHref = isAuthenticated ? dashboardHref : "/register";

  return (
    <ThemeProvider>
      <main className="bg-surface min-h-dvh">
        <PulseField />
        <RevealScanner />
        <SiteHeader
          isAuthenticated={isAuthenticated}
          dashboardHref={dashboardHref}
        />

        <HeroSection
          isAuthenticated={isAuthenticated}
          primaryHref={primaryHref}
        />
        <HighlightsSection />
        <AboutSection />
        <JourneySection />
        <TestimonialsSection />
        <PlansSection primaryHref={primaryHref} />

        <section className="relative overflow-hidden">
          <div className="relative z-10 mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
            <h2 className="reveal text-ink text-2xl font-semibold tracking-[-0.01em] md:text-3xl">
              Perguntas frequentes
            </h2>
            <div className="mt-8">
              <FaqAccordion />
            </div>
          </div>
        </section>

        <FinalCtaSection
          isAuthenticated={isAuthenticated}
          primaryHref={primaryHref}
        />
        <SiteFooter />
      </main>
    </ThemeProvider>
  );
}
