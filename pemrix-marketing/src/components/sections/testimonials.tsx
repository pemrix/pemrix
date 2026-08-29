"use client";

import { ArrowRightIcon as ArrowRight } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";

import { Marquee } from "@/components/magicui/marquee";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const REVIEWS = [
  {
    name: "Sarah Chen",
    username: "@sarah · Platform Engineer, Stackform",
    body: "Our main branch builds went from 18 minutes to under 6 with @relay caching. Queue time basically disappeared.",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces&q=80",
  },
  {
    name: "Marcus Okonkwo",
    username: "@marcus · DevOps Lead, Lattice Labs",
    body: "Flaky integration tests were killing us. @relay AI flagged the offenders and auto-retried the rest — we haven't babysat a red build in weeks.",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces&q=80",
  },
  {
    name: "James Whitfield",
    username: "@james · CTO, Northline Systems",
    body: 'Preview environments on every PR changed how we review. No more "works on my machine" before merge.',
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces&q=80",
  },
  {
    name: "Priya Nair",
    username: "@priya · Staff Engineer, Harborkit",
    body: "Moved our relay.yaml into the repo and pipeline changes finally go through code review. Deploy anxiety is basically gone.",
    img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces&q=80",
  },
  {
    name: "Daniel Reyes",
    username: "@daniel · Platform Engineer, Meridian Dev",
    body: "Matrix builds across Linux and macOS runners caught three OS-specific regressions last sprint. Worth it alone.",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces&q=80",
  },
  {
    name: "Elena Vasquez",
    username: "@elena · Engineering Manager, Cloudrift",
    body: "Deploy gates and one-click rollbacks mean on-call isn't a panic button anymore. @relay gave us a safety net we actually trust.",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces&q=80",
  },
];

const firstRow = REVIEWS.slice(0, REVIEWS.length / 2);
const secondRow = REVIEWS.slice(REVIEWS.length / 2);
const Testimonials = () => {
  return (
    <section className="container flex flex-col gap-y-10 overflow-x-hidden py-10 md:py-15 lg:flex-row">
      <div className="flex max-w-lg flex-col gap-15 text-balance">
        <h2 className="text-4xxl leading-tight tracking-tight md:text-5xl">Teams that stopped waiting on CI</h2>
        <div className="space-y-7.5">
          <p className="text-muted-foreground text-lg leading-snug">
            Slow builds, flaky tests, deploy anxiety — sound familiar? Here is what engineering teams say after
            switching to Relay.
          </p>

          <Button
            variant="ghost"
            asChild
            className="text-accent-foreground group gap-3 !px-0 hover:!bg-transparent hover:opacity-90"
          >
            <Link href="/signup">
              Start building free
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Marquee only animates/bleeds in the desktop side-by-side layout.
          On mobile it's stacked below the text, so the auto-scroll, left-edge
          fade and right bleed are disabled — cards sit static, faded on the
          right where they run off the container. */}
      <div className="relative flex flex-1 flex-col gap-[var(--testimonial-gap)] overflow-x-hidden mask-r-from-80% mask-r-to-100% px-1 py-px [--testimonial-gap:calc(var(--spacing)*4)] lg:-mr-[max(2rem,calc((100vw-80rem)/2+5rem))] lg:mask-r-from-100% lg:mask-r-to-100% lg:mask-l-from-50% lg:mask-l-to-100%">
        <Marquee pauseOnHover className="[--duration:20s] [--gap:var(--testimonial-gap)] max-lg:*:animate-none">
          {firstRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:20s] [--gap:var(--testimonial-gap)] max-lg:*:animate-none">
          {secondRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
      </div>
    </section>
  );
};

export default Testimonials;

const ReviewCard = ({ img, name, username, body }: { img: string; name: string; username: string; body: string }) => {
  return (
    <Card
      className={cn(
        "hover:bg-accent/60 max-w-xs cursor-pointer gap-4 bg-transparent p-6 md:max-w-sm md:p-8",
        "transition-colors duration-200",
      )}
    >
      <CardHeader className="flex items-center gap-4 p-0">
        <Image className="rounded-full" width={32} height={32} alt={`${name} avatar`} src={img} />
        <div className="flex flex-col">
          <CardTitle className="text-sm font-bold">{name}</CardTitle>
          <CardDescription className="text-muted-foreground text-xs">{username}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <blockquote className="text-sm leading-snug">
          {body.split(/(@relay)/g).map((part, index) =>
            part === "@relay" ? (
              <span key={index} className="text-chart-1">
                {part}
              </span>
            ) : (
              part
            ),
          )}
        </blockquote>
      </CardContent>
    </Card>
  );
};
