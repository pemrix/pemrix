import type { Metadata } from "next";

import AboutHero from "@/components/sections/about-hero";
import AboutLogos from "@/components/sections/about-logos";
import AboutNews from "@/components/sections/about-news";
import AboutTeam from "@/components/sections/about-team";
import Features from "@/components/sections/features";

export const metadata: Metadata = {
  title: "About",
  description:
    "Relay was founded in 2023 to make CI/CD feel instant. Meet the remote-first team processing 12M+ builds every month.",
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <AboutLogos />
      <AboutTeam />
      <AboutNews />
      <Features className="section-padding" />
    </>
  );
}
