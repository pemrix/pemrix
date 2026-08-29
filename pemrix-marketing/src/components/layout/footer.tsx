"use client";

import { DiscordLogoIcon, DownloadIcon as Download, GithubLogoIcon, XLogoIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import Logo from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";

const FOOTER_LINKS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/feature" },
      { label: "Pricing", href: "/pricing" },
      { label: "Download", href: "/download" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs/getting-started" },
      { label: "API reference", href: "/docs/api-reference" },
      { label: "Status", href: "/status" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Security", href: "/security" },
    ],
  },
];

const SOCIAL_LINKS = [
  {
    name: "GitHub",
    href: "https://github.com/cruip",
    icon: <GithubLogoIcon className="size-4" />,
  },
  {
    name: "X",
    href: "https://x.com/Cruip_com",
    icon: <XLogoIcon className="size-4" />,
  },
  {
    name: "Discord",
    href: "#",
    icon: <DiscordLogoIcon className="size-4" />,
  },
];

const INSTALL_CMD = "curl -fsSL https://quanvio.com/install | sh";

const Footer = () => {
  const pathname = usePathname();
  const hideFooter = ["/signin", "/signup", "/otp", "/download", "/docs"].some((route) => pathname.includes(route));

  if (hideFooter) return null;

  return (
    <footer className="relative overflow-hidden">
      <div className="container py-16 lg:py-20">
        {/* Developer download CTA — install from the terminal */}
        <div className="bg-muted/50 border-border/70 dark:bg-card/45 dark:border-foreground/10 flex flex-col gap-8 rounded-2xl border p-8 shadow-[inset_0_1px_0_oklch(1_0_0/0.55)] lg:flex-row lg:items-center lg:justify-between lg:p-12 dark:shadow-[inset_0_1px_0_oklch(1_0_0/0.10)] dark:backdrop-blur-md">
          <div className="max-w-md space-y-3">
            <h2 className="text-2xl font-medium tracking-tight lg:text-3xl">Ship with Quanvio</h2>
            <p className="text-muted-foreground">
              The intelligence layer for work. One platform, powerful products for every team.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground h-14.5 gap-2.5 rounded-full px-6 text-base"
                asChild
              >
                <Link href="/download">
                  Get started
                  <Download className="size-4 shrink-0" />
                </Link>
              </Button>
              <Button
                variant="outline"
                className="border-secondary/30 hover:border-secondary/50 hover:bg-secondary/5 h-14.5 gap-2.5 rounded-full px-6 text-base"
                asChild
              >
                <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
                  Star on GitHub
                  <GithubLogoIcon className="size-4 shrink-0" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="w-full lg:max-w-sm">
            <div className="bg-background border-border dark:border-foreground/10 dark:bg-background/50 flex items-center gap-3 rounded-xl border px-4 py-3 font-mono text-sm">
              <span className="text-secondary select-none">$</span>
              <code className="text-foreground/90 flex-1 truncate">{INSTALL_CMD}</code>
              <CopyButton text={INSTALL_CMD} className="size-8 shrink-0" />
            </div>
            <p className="text-muted-foreground mt-2.5 text-xs">Native-fast AI editor & terminal agent</p>
          </div>
        </div>

        {/* Brand + link columns */}
        <div className="mt-16 grid gap-10 lg:grid-cols-[1.1fr_2fr] lg:gap-16">
          <div className="space-y-5">
            <Logo className="text-2xl" iconClassName="w-7" />
            <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
              Quanvio is building the intelligence layer for work. One platform, powerful products for every team.
            </p>
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="bg-muted/60 text-muted-foreground hover:border-secondary/40 hover:text-foreground border-border/70 dark:bg-card/40 dark:border-foreground/10 flex size-9 items-center justify-center rounded-full border transition-colors dark:shadow-[inset_0_1px_0_oklch(1_0_0/0.08)]"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.name}
                >
                  {link.icon}
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {FOOTER_LINKS.map((column) => (
              <div key={column.title} className="space-y-4 text-left">
                <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">{column.title}</p>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-foreground/80 hover:text-secondary text-base transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-border text-muted-foreground dark:border-foreground/10 mt-14 flex flex-col-reverse gap-3 border-t pt-6 text-sm shadow-[inset_0_1px_0_oklch(1_0_0/0.55)] sm:flex-row sm:items-center sm:justify-between dark:shadow-[inset_0_1px_0_oklch(1_0_0/0.08)]">
          <p>
            ©{" "}
            <a
              href="https://quanvio.com"
              target="_blank"
              rel="noopener"
              className="text-foreground/80 hover:text-secondary transition-colors"
            >
              Quanvio Lab
            </a>{" "}
            - All rights reserved.
          </p>
          <p className="text-muted-foreground font-mono text-xs">Built for builders · quanvio --version 0.1.0</p>
        </div>
      </div>

      <GradientSVG className="absolute inset-x-0 bottom-0 -z-10 h-[480px] w-full translate-y-[16%] md:h-[600px]" />
    </footer>
  );
};

export default Footer;

// Static mesh gradient — several offset, irregular blobs in the site's chart
// colors (lime / teal / green) overlapping to feel dynamic like the original
// Plasma mesh, but kept low-luminance so white footer links stay legible.
// Grain is faded in toward the bottom where the mesh sits.
const GradientSVG = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1440 700"
      fill="none"
      preserveAspectRatio="xMidYMax slice"
      {...props}
    >
      <defs>
        {/* Individual color blobs (color → transparent), kept dim. */}
        <radialGradient id="relay-mesh-lime" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.4} />
          <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="relay-mesh-teal" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.42} />
          <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="relay-mesh-green" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.4} />
          <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="relay-mesh-deep" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--emerald-700)" stopOpacity={0.4} />
          <stop offset="100%" stopColor="var(--emerald-700)" stopOpacity={0} />
        </radialGradient>

        {/* Vertical fade so grain concentrates toward the bottom mesh. */}
        <linearGradient id="relay-mesh-fade" x1="0" y1="0" x2="0" y2="700" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#000000" />
          <stop offset="55%" stopColor="#4d4d4d" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>

        <filter id="relay-mesh-soft">
          <feGaussianBlur stdDeviation={70} />
        </filter>

        <filter id="relay-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} stitchTiles="stitch" result="noise" />
          <feColorMatrix in="noise" type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope={0.55} intercept={0} />
          </feComponentTransfer>
        </filter>

        <mask id="relay-mesh-mask">
          <rect width={1440} height={700} fill="url(#relay-mesh-fade)" />
        </mask>
      </defs>

      {/* Overlapping, asymmetric blobs — irregular sizes and positions. */}
      <g filter="url(#relay-mesh-soft)">
        <ellipse cx={300} cy={470} rx={360} ry={300} fill="url(#relay-mesh-lime)" />
        <ellipse cx={720} cy={400} rx={480} ry={360} fill="url(#relay-mesh-teal)" />
        <ellipse cx={1140} cy={520} rx={400} ry={320} fill="url(#relay-mesh-green)" />
        <ellipse cx={560} cy={660} rx={620} ry={280} fill="url(#relay-mesh-deep)" />
        <ellipse cx={1020} cy={300} rx={300} ry={240} fill="url(#relay-mesh-lime)" />
      </g>

      {/* Film grain, faded in toward the bottom. */}
      <g mask="url(#relay-mesh-mask)" style={{ mixBlendMode: "soft-light" }}>
        <rect width={1440} height={700} fill="#ffffff" filter="url(#relay-grain)" opacity={0.5} />
      </g>
    </svg>
  );
};
