"use client";

import Image from "next/image";

import { Marquee, MarqueeContent, MarqueeItem } from "@/components/kibo-ui/marquee";

const logos = [
  { name: "Anthropic", src: "/images/partners/anthropic.svg" },
  { name: "Claude", src: "/images/partners/claude.svg" },
  { name: "Grok", src: "/images/partners/grok.svg" },
  { name: "Linear", src: "/images/partners/linear.svg" },
  { name: "Meta", src: "/images/partners/meta.svg" },
  { name: "PostHog", src: "/images/partners/posthog.svg" },
  { name: "Vercel", src: "/images/partners/vercel.svg" },
];

const logoClassName =
  "h-8 w-auto max-w-24 object-contain opacity-35 grayscale transition-opacity hover:opacity-60 dark:brightness-0 dark:invert dark:opacity-50 dark:grayscale-0 dark:hover:opacity-75";

export default function AboutLogos() {
  return (
    <section className="section-padding !pt-0">
      <div className="container text-center">
        <p className="text-muted-foreground tracking-normal">Trusted by engineering teams shipping at scale</p>
      </div>

      <Marquee className="mt-10 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] py-2">
        <MarqueeContent speed={35}>
          {logos.map((logo) => (
            <MarqueeItem key={logo.name} className="mx-8 md:mx-12">
              <Image src={logo.src} alt={`${logo.name} logo`} width={96} height={32} className={logoClassName} />
            </MarqueeItem>
          ))}
        </MarqueeContent>
      </Marquee>
    </section>
  );
}
