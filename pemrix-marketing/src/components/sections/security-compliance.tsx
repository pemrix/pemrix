import { ArrowRightIcon as ArrowRight } from "@phosphor-icons/react/ssr";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Data Protection",
    description:
      "Enterprise-grade encryption for all data, both in transit and at rest, using industry-standard AES-256 protocols.",
  },
  {
    title: "Access Management",
    description: "Granular role-based access controls (RBAC) and mandatory multi-factor authentication (MFA).",
  },
  {
    title: "Real-time Monitoring",
    description:
      "Continuous security monitoring and automated incident response workflows to mitigate threats instantly.",
  },
  {
    title: "Global Compliance",
    description:
      "Fully compliant with GDPR, CCPA, and HIPAA, ensuring your operations meet regional privacy standards.",
  },
];

const certifications = [
  {
    name: "ISO 27001",
    image: "/images/compliance/ISO-27001.svg",
    description: "Information Security",
  },
  {
    name: "SOC 2 Type II",
    image: "/images/compliance/AICPA-SOC.svg",
    description: "Security & Trust",
  },
  {
    name: "GDPR",
    image: "/images/compliance/GDPR.svg",
    description: "Data Privacy",
  },
  {
    name: "CCPA",
    image: "/images/compliance/CCPA.svg",
    description: "California Privacy",
  },
];

type SecurityComplianceProps = {
  className?: string;
};

export function SecurityCompliance({ className }: SecurityComplianceProps) {
  return (
    <section className={cn("section-padding", className)}>
      <div className="container">
        <div className="grid gap-16 lg:grid-cols-2">
          <div className="flex flex-col justify-center">
            <Badge variant="outline" className="mb-6 w-fit">
              Compliance Framework
            </Badge>
            <h2 className="mb-6 text-4xl font-semibold tracking-tight text-balance md:text-5xl">
              Secure by design, compliant by default.
            </h2>
            <p className="text-muted-foreground mb-10 text-pretty md:text-lg">
              We provide the tools and certifications you need to operate globally with confidence. Our platform is
              built to satisfy the most demanding security requirements of modern enterprises.
            </p>
            <div className="grid gap-8 sm:grid-cols-2">
              {features.map((feature) => (
                <div key={feature.title} className="flex flex-col gap-2">
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button className="h-12 rounded-full px-6" asChild>
                <Link href="/blog/soc-2-type-ii">View Trust Center</Link>
              </Button>
              <Button variant="ghost" className="h-12 rounded-full px-6" asChild>
                <Link href="/contact">
                  Download Report
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative grid grid-cols-2 gap-4 sm:gap-6">
            {certifications.map((cert) => (
              <div
                key={cert.name}
                className="border-border bg-card flex flex-col justify-between gap-4 rounded-2xl border p-6 sm:p-8"
              >
                {}
                <img src={cert.image} alt={cert.name} className="mx-auto max-h-40 object-contain dark:invert" />
                <div>
                  <h4 className="font-semibold">{cert.name}</h4>
                  <p className="text-muted-foreground text-xs">{cert.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
