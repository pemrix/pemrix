import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <section className="section-padding relative flex items-center justify-center">
      <div className="relative container flex max-w-4xl flex-col items-center text-center">
        {/* PEMRIX Logo */}
        <div
          role="img"
          aria-label="PEMRIX Logo"
          style={{
            maskImage: "url(/layout/logo.svg)",
            WebkitMaskImage: "url(/layout/logo.svg)",
            maskSize: "contain",
            WebkitMaskSize: "contain",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskPosition: "center",
            WebkitMaskPosition: "center",
          }}
          className="bg-primary h-[134px] w-[124px] md:h-[315px] md:w-[341px]"
        />
        <div className="mt-10 space-y-4 text-balance md:mt-20">
          <h1 className="md:text-6xxl text-5xl leading-none tracking-tight text-balance">Oops!</h1>

          <p className="text-muted-foreground leading-snug md:text-lg lg:text-xl">
            Looks like you&apos;ve ventured into uncharted territory. The page you&apos;re looking for doesn&apos;t
            exist, but don&apos;t worry – let&apos;s get you back on track.
          </p>
        </div>

        <Button asChild size="lg" className="mt-10 w-full max-w-sm gap-2">
          <Link href="/">
            Take me home
            <ArrowRightIcon className="size-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
