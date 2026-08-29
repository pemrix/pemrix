import type { ReactNode } from "react";

type LegalProseProps = {
  children: ReactNode;
};

export function LegalProse({ children }: LegalProseProps) {
  return (
    <section className="section-padding container max-w-3xl">
      <article className="prose prose-neutral dark:prose-invert max-w-none">{children}</article>
    </section>
  );
}
