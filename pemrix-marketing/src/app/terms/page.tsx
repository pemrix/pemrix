import type { Metadata } from "next";

import { LegalProse } from "@/components/legal/legal-prose";

import Terms from "./terms.mdx";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using Relay Cloud and related services.",
};

export default function TermsPage() {
  return (
    <LegalProse>
      <Terms />
    </LegalProse>
  );
}
