import {
  ChatCircleIcon as ChatCircle,
  EnvelopeSimpleIcon as EnvelopeSimple,
  MapPinIcon as MapPin,
} from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";
import Link from "next/link";

import { ContactForm } from "@/components/sections/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Relay for sales, support, security reviews, and partnership inquiries.",
};

const CONTACT_CHANNELS = [
  {
    icon: EnvelopeSimple,
    label: "General inquiries",
    value: "hello@example.com",
    href: "mailto:hello@example.com",
  },
  {
    icon: ChatCircle,
    label: "Sales & enterprise",
    value: "sales@example.com",
    href: "mailto:sales@example.com",
  },
  {
    icon: MapPin,
    label: "Headquarters",
    value: "San Francisco, CA",
    href: "https://maps.google.com/?q=San+Francisco,+CA",
  },
];

export default function ContactPage() {
  return (
    <section className="section-padding container max-w-5xl">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div className="space-y-8">
          <div className="space-y-4">
            <span className="text-secondary text-sm font-medium">Contact</span>
            <h1 className="text-4xxl leading-tight font-medium tracking-tight md:text-5xl">Talk to the Relay team</h1>
            <p className="text-muted-foreground max-w-md text-lg leading-snug">
              Questions about pricing, self-hosted runners, or security reviews? Send us a message and we&apos;ll route
              it to the right person.
            </p>
          </div>

          <div className="space-y-4">
            {CONTACT_CHANNELS.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="border-border bg-card/40 flex items-start gap-4 rounded-2xl border p-5">
                <div className="bg-secondary/10 text-secondary flex size-10 shrink-0 items-center justify-center rounded-full">
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">{label}</p>
                  <Link
                    href={href}
                    className="hover:text-secondary mt-1 inline-block font-medium transition-colors"
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  >
                    {value}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <p className="text-muted-foreground text-sm leading-relaxed">
            Existing customers can also open a ticket from the Relay dashboard under{" "}
            <strong className="text-foreground">Help → Support</strong>. For security disclosures, email{" "}
            <Link href="mailto:security@example.com" className="text-secondary hover:underline">
              security@example.com
            </Link>
            .
          </p>
        </div>

        <ContactForm />
      </div>
    </section>
  );
}
