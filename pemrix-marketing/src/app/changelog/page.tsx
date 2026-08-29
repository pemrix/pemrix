import { BellIcon as Bell } from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";

import { ChangelogEntryItem } from "@/components/changelog/changelog-entry";
import { Button } from "@/components/ui/button";
import { LoadMoreList } from "@/components/ui/load-more-list";
import { getChangelogEntries } from "@/lib/changelog";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Every release, fix, and improvement shipped to Relay.",
};

export default async function ChangelogPage() {
  const changelogEntries = await getChangelogEntries();

  return (
    <section className="section-padding container max-w-5xl space-y-24">
      <div className="flex flex-wrap items-center justify-between gap-10">
        <div className="space-y-3">
          <span className="text-secondary text-sm font-medium">Product updates</span>
          <h1 className="text-4xxl leading-tight font-medium tracking-tight">Changelog</h1>
          <p className="text-muted-foreground text-lg leading-snug">
            Every release, fix, and improvement shipped to Relay.
          </p>
        </div>
        <Button variant="secondary" className="bg-muted/40 h-12 gap-2 rounded-full px-4 text-base font-normal">
          Subscribe for updates
          <Bell className="size-4 shrink-0" />
        </Button>
      </div>

      <div className="[--sidebar-width:150px]">
        <LoadMoreList initialCount={3} pageSize={3}>
          {changelogEntries.map((entry, index) => (
            <ChangelogEntryItem key={entry.id} entry={entry} showLatest={index === 0} />
          ))}
        </LoadMoreList>
      </div>
    </section>
  );
}
