"use client";

import { AppleLogoIcon, CpuIcon as Cpu, LinuxLogoIcon, TerminalIcon, WindowsLogoIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { ShaderBackground } from "@/components/ui/shader-background";
import { Terminal } from "@/components/ui/terminal";

const INSTALL_COMMANDS = [
  { label: "Homebrew", cmd: "brew install relay-ci" },
  { label: "npm", cmd: "npm i -g @relay/cli" },
];

const PLATFORMS = [
  { label: "macOS", icon: AppleLogoIcon, meta: "Universal · .dmg" },
  { label: "Windows", icon: WindowsLogoIcon, meta: "x64 · .msi" },
  { label: "Linux", icon: LinuxLogoIcon, meta: ".deb / .rpm" },
];

export default function DownloadPage() {
  return (
    <section className="section-padding relative overflow-x-clip">
      <div className="pointer-events-none absolute top-1/2 left-1/2 z-0 aspect-square w-[min(130vw,920px)] -translate-x-1/2 -translate-y-1/2 scale-110 overflow-visible mask-[radial-gradient(ellipse_at_center,black_42%,transparent_76%)] md:w-[1120px] lg:w-[1280px]">
        <ShaderBackground className="h-full w-full overflow-visible" />
      </div>

      <div className="relative z-10 container flex flex-col items-center gap-12 text-center lg:gap-16">
        <div className="flex max-w-2xl flex-col items-center gap-6">
          <span className="border-secondary/30 bg-secondary/5 text-secondary inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium">
            <TerminalIcon className="size-3.5" />
            Relay CLI · v2.4.1
          </span>

          <h1 className="text-5xl leading-none tracking-tight text-balance md:text-6xl">Install Relay</h1>

          <p className="text-muted-foreground max-w-xl leading-snug md:text-lg">
            Trigger pipelines from your terminal, or run the desktop agent to watch builds in real time. Works with any
            repo — define pipelines in{" "}
            <code className="text-foreground bg-muted rounded px-1.5 py-0.5 font-mono text-sm">relay.yaml</code> and
            ship.
          </p>

          <div className="w-full space-y-2 text-left">
            {INSTALL_COMMANDS.map(({ label, cmd }) => (
              <div
                key={label}
                className="border-border bg-card/80 flex items-center gap-3 rounded-xl border px-4 py-2.5 font-mono text-sm backdrop-blur-sm"
              >
                <span className="text-secondary select-none">$</span>
                <code className="text-foreground/90 flex-1 truncate">{cmd}</code>
                <span className="text-muted-foreground/60 hidden text-xs sm:inline">{label}</span>
                <CopyButton text={cmd} className="size-8 shrink-0" />
              </div>
            ))}
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row">
            {PLATFORMS.map(({ label, icon: Icon, meta }) => (
              <Button
                key={label}
                variant="outline"
                className="border-border bg-card/80 hover:border-secondary/50 hover:bg-secondary/5 h-auto flex-1 flex-col items-center gap-1 rounded-xl py-3 backdrop-blur-sm"
              >
                <span className="flex items-center gap-2 text-base font-medium">
                  <Icon className="size-4.5" />
                  {label}
                </span>
                <span className="text-muted-foreground text-xs font-normal">{meta}</span>
              </Button>
            ))}
          </div>

          <div className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
            <Cpu className="size-4" />
            Desktop agent v1.8.0 · 18k weekly installs
          </div>
        </div>

        <div className="ring-foreground/5 relative w-full max-w-2xl rounded-xl shadow-2xl ring-1 lg:ring-8">
          <Terminal className="w-full" />
        </div>
      </div>
    </section>
  );
}
