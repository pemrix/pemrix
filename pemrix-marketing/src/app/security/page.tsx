import type { Metadata } from "next";

import { SecurityCompliance } from "@/components/sections/security-compliance";

export const metadata: Metadata = {
  title: "Security",
  description:
    "Learn how Relay protects customer data with encryption, access controls, and enterprise compliance certifications.",
};

export default function SecurityPage() {
  return <SecurityCompliance />;
}
