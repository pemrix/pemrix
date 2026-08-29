import type { Metadata } from "next";

import BuiltForFuture from "@/components/sections/built-for-future";
import Ecosystem from "@/components/sections/ecosystem";
import FeatureGrid from "@/components/sections/feature-grid";
import Hero from "@/components/sections/hero";
import Principles from "@/components/sections/principles";
import Stats from "@/components/sections/stats";

export const metadata: Metadata = {
  title: {
    absolute: "PEMRIX — The Open Network for Value",
  },
};

export default function Home() {
  return (
    <>
      <Hero />
      <Principles />
      <FeatureGrid />
      <Ecosystem />
      <Stats />
      <BuiltForFuture />
    </>
  );
}
