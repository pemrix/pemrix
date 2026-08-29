'use client';

import { Children, useState, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type LoadMoreListProps = {
  children: ReactNode;
  initialCount?: number;
  pageSize?: number;
  buttonClassName?: string;
};

export function LoadMoreList({
  children,
  initialCount = 3,
  pageSize = 3,
  buttonClassName,
}: LoadMoreListProps) {
  const items = Children.toArray(children);
  const [visibleCount, setVisibleCount] = useState(
    Math.min(initialCount, items.length),
  );
  const hasMore = visibleCount < items.length;

  return (
    <>
      <div className="relative flex flex-col gap-16">{items.slice(0, visibleCount)}</div>

      {hasMore ? (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            className={cn(
              'mt-25 h-12 w-full rounded-full md:w-[calc(100%-var(--sidebar-width))]',
              buttonClassName,
            )}
            onClick={() =>
              setVisibleCount((count) => Math.min(count + pageSize, items.length))
            }
          >
            Load more
          </Button>
        </div>
      ) : null}
    </>
  );
}
