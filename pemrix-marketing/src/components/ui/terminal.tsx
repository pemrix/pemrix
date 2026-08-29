'use client';

import {
  CheckIcon as Check,
  DotsThreeVerticalIcon,
} from '@phosphor-icons/react';
import { motion, useInView } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

import { TypingAnimation } from '@/components/magicui/typing-animation';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// Default timing constants
const DEFAULT_TYPING_SPEED = 40; // milliseconds per character
const DEFAULT_LINE_PAUSE_DURATION = 0; // pause between lines
const DEFAULT_INITIAL_DELAY = 400; // delay before typing starts
const DEFAULT_CURSOR_BLINK_RATE = 500; // cursor blinking interval
const DEFAULT_TYPING_START_DELAY = 200; // delay before typing begins when in view

interface TerminalProps {
  className?: string;
  typingSpeed?: number;
  linePauseDuration?: number;
  initialDelay?: number;
  cursorBlinkRate?: number;
  typingStartDelay?: number;
}

export function Terminal({
  className,
  typingSpeed = DEFAULT_TYPING_SPEED,
  linePauseDuration = DEFAULT_LINE_PAUSE_DURATION,
  initialDelay = DEFAULT_INITIAL_DELAY,
  cursorBlinkRate = DEFAULT_CURSOR_BLINK_RATE,
  typingStartDelay = DEFAULT_TYPING_START_DELAY,
}: TerminalProps) {
  const terminalRef = useRef(null);
  const isInView = useInView(terminalRef, {
    once: true,
    margin: '0px 0px -100px 0px',
  });

  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [typingStarted, setTypingStarted] = useState(false);

  const logEntries: { time: string; message: string; ok?: boolean }[] = [
    {
      time: '14:29:50',
      message: 'Cloning github.com/relay/checkout-api (feat/preview-env)',
    },
    { time: '14:29:52', message: 'Checked out commit a1f9c3e' },
    {
      time: '14:29:56',
      message: 'Restored remote cache — hit (1.2 GB in 3.4s)',
      ok: true,
    },
    { time: '14:29:57', message: 'Installing dependencies with pnpm' },
    {
      time: '14:30:14',
      message: 'Dependencies installed — 1,284 packages (16.8s)',
      ok: true,
    },
    { time: '14:30:15', message: 'Running lint — eslint . --max-warnings 0' },
    {
      time: '14:30:23',
      message: 'Lint passed — 0 errors, 0 warnings (7.9s)',
      ok: true,
    },
    { time: '14:30:24', message: 'Running tests — vitest run' },
    {
      time: '14:31:02',
      message: 'Tests: 412 passed, 2 flaky retried by Relay AI (38.2s)',
      ok: true,
    },
    { time: '14:31:03', message: 'Building production bundle — next build' },
    {
      time: '14:31:48',
      message: 'Build complete — 2.1 MB gzipped (45.1s)',
      ok: true,
    },
    { time: '14:31:49', message: 'Deploying preview environment' },
    {
      time: '14:32:04',
      message: 'Preview live at https://pr-482.relay.app (15.0s)',
      ok: true,
    },
    { time: '14:32:08', message: 'Pipeline passed in 2m 14s', ok: true },
  ];

  // Start typing animation when in view
  useEffect(() => {
    if (isInView && !typingStarted) {
      const timer = setTimeout(() => {
        setTypingStarted(true);
      }, typingStartDelay);
      return () => clearTimeout(timer);
    }
  }, [isInView, typingStarted, typingStartDelay]);

  // Track typing progress and cursor position
  useEffect(() => {
    if (!typingStarted) return;

    const totalDelay =
      logEntries
        .slice(0, currentLineIndex)
        .reduce((acc, entry) => acc + entry.message.length * typingSpeed, 0) +
      currentLineIndex * linePauseDuration;

    const currentEntryDelay =
      logEntries[currentLineIndex]?.message.length * typingSpeed || 0;

    const timer = setTimeout(
      () => {
        if (currentLineIndex < logEntries.length - 1) {
          setCurrentLineIndex((prev) => prev + 1);
        }
      },
      totalDelay + currentEntryDelay + linePauseDuration,
    );

    return () => clearTimeout(timer);
  }, [typingStarted, currentLineIndex, typingSpeed, linePauseDuration]);

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, cursorBlinkRate);
    return () => clearInterval(cursorInterval);
  }, [cursorBlinkRate]);

  const containerVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <aside
      ref={terminalRef}
      className={cn(
        'bg-accent text-muted-foreground border-input/50 overflow-hidden rounded-md border',
        className,
      )}
    >
      {/* Header */}
      <motion.div
        className="border-input/30 grid grid-cols-[6rem_1fr_1rem] items-center gap-3 border-b px-4 py-1.5 text-xs"
        variants={headerVariants}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <motion.div variants={headerVariants}>
          <span>Date</span>
        </motion.div>
        <motion.div
          className="flex items-center gap-3"
          variants={headerVariants}
        >
          <span className="text-[0.625rem]">▶</span>
          <span>Message</span>
        </motion.div>
        <motion.div className="flex justify-end" variants={headerVariants}>
          <Popover>
            <PopoverTrigger asChild>
              <motion.button
                className="hover:bg-muted rounded p-1 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <DotsThreeVerticalIcon className="h-3 w-3" />
              </motion.button>
            </PopoverTrigger>
            <PopoverContent
              className="bg-popover/80 w-40 p-1 backdrop-blur-sm"
              align="end"
            >
              <div className="space-y-1">
                <button className="hover:bg-accent hover:text-accent-foreground w-full rounded px-3 py-1 text-left text-xs transition-colors">
                  Clear logs
                </button>
                <button className="hover:bg-accent hover:text-accent-foreground w-full rounded px-3 py-1 text-left text-xs transition-colors">
                  Export logs
                </button>
                <button className="hover:bg-accent hover:text-accent-foreground w-full rounded px-3 py-1 text-left text-xs transition-colors">
                  Settings
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </motion.div>
      </motion.div>

      {/* Log entries with fixed height */}
      <div className="bg-card h-80 overflow-hidden pt-2 text-xs">
        {logEntries.map((entry, index) => (
          <div
            key={index}
            className="grid min-h-[1.5rem] grid-cols-[6rem_1fr_1rem] items-start gap-3 px-4 py-1"
          >
            <div className="flex items-center whitespace-nowrap">
              <div className="bg-chart-1 me-0.5 h-2 w-0.25" />
              <span className="ms-1">Jul 07</span>
              <span>{entry.time}</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex-shrink-0 text-[0.625rem]">▶</span>
              <div className="flex min-h-[1.2rem] items-start leading-relaxed">
                {typingStarted && index <= currentLineIndex && (
                  <TypingAnimation
                    duration={typingSpeed}
                    delay={initialDelay + index * 500}
                    as="span"
                    className="text-xs leading-relaxed font-normal"
                  >
                    {entry.message}
                  </TypingAnimation>
                )}
                <span
                  className={`ml-1 w-2 ${
                    index === currentLineIndex && typingStarted && showCursor
                      ? 'animate-pulse'
                      : 'opacity-0'
                  }`}
                  style={{ color: 'var(--chart-1)' }}
                >
                  |
                </span>
              </div>
            </div>
            <div className="flex justify-end">
              {(() => {
                const isLast = index === logEntries.length - 1;
                const showCheck =
                  entry.ok &&
                  typingStarted &&
                  (index < currentLineIndex ||
                    (isLast && index === currentLineIndex));
                if (!showCheck) return null;
                return (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.25,
                      ease: 'easeOut',
                      delay: isLast ? 1.2 : 0,
                    }}
                    className="text-chart-1 mt-0.5"
                    aria-hidden
                  >
                    <Check className="size-3" />
                  </motion.span>
                );
              })()}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
