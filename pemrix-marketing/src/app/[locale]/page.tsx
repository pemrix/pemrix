import type { Metadata } from "next";

import AIAutomation from "@/components/sections/ai-automation";
import FeatureCards from "@/components/sections/feature-cards";
import Features from "@/components/sections/features";
import FeaturesTabsSection from "@/components/sections/features-tabs";
import Hero from "@/components/sections/hero";
import Testimonials from "@/components/sections/testimonials";

export const metadata: Metadata = {
  title: {
    absolute: "Quanvio — Intelligence Layer for Work",
  },
};

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <FeatureCards />
      <AIAutomation />
      <FeaturesTabsSection />
      <Testimonials />
    </>
  );
}
