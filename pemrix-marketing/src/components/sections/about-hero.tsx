import Image from "next/image";

export default function AboutHero() {
  return (
    <section className="section-padding container">
      <div className="flex w-fit items-center rounded-full border p-1 text-xs">
        <span className="bg-muted rounded-full px-3 py-1">What’s New?</span>
        <span className="px-3">Self-hosted runners are GA</span>
      </div>

      <h1 className="my-5 text-5xl leading-none tracking-tight lg:text-7xl">
        We&apos;re the team building <span className="text-gradient">CI/CD that ships</span>
      </h1>

      <p className="text-muted-foreground max-w-3xl leading-snug md:text-lg lg:text-xl">
        Relay is a CI/CD platform built for teams who are tired of slow, flaky pipelines. Founded in 2023 in San
        Francisco by engineers who had spent too many afternoons waiting on builds, we set out to make shipping software
        feel instant — reliable runs, clear logs, and feedback that keeps pace with your team.
      </p>

      <Image
        src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80"
        alt="Engineer working at a desk with code on screen"
        width={1920}
        height={1280}
        priority
        className="mt-16 aspect-video rounded-xl object-cover object-top"
      />
    </section>
  );
}
