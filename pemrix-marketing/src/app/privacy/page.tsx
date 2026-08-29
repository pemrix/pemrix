import type { Metadata } from "next";

import { LegalProse } from "@/components/legal/legal-prose";

import Privacy from "./privacy.mdx";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Relay collects, uses, and protects personal information.",
};

export default function PrivacyPage() {
  return (
    <LegalProse>
      <Privacy />
    </LegalProse>
  );
}
