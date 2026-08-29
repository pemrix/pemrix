"use client";
import { BrainIcon as Brain, GlobeIcon as Globe, HardDrivesIcon as Server, X } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { ProductSearchLauncher } from "@/components/docs/product-search-launcher";
import Logo from "@/components/layout/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

export const NAV_LINKS = [
  {
    label: "Features",
    href: "/feature",
    subitems: [
      {
        label: "AI Pipelines",
        href: "/feature",
        description: "Flaky-test detection and auto-retry for your pipelines",
        icon: Brain,
      },
      {
        label: "Runners",
        href: "/feature",
        description: "Cloud and self-hosted runners for Linux, macOS, Windows, and ARM",
        icon: Server,
      },
      {
        label: "Preview Environments",
        href: "/feature",
        description: "Spin up isolated preview deploys for every pull request",
        icon: Globe,
      },
    ],
  },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "/docs" },
  { label: "Changelog", href: "/changelog" },
  { label: "About", href: "/about" },
  { label: "Download", href: "/download" },
];

const ACTION_BUTTONS = [
  { label: "Sign in", href: "/signin", variant: "ghost" as const },
  { label: "Get started", href: "/signup", variant: "default" as const },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [portalMounted, setPortalMounted] = useState(false);
  const lastScrollY = useRef(0);
  const pathname = usePathname();

  useEffect(() => {
    setPortalMounted(true);
  }, []);
  const hideNavbar = ["/signin", "/signup", "/otp", "/docs"].some((route) => pathname.includes(route));

  useEffect(() => {
    if (isMenuOpen) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);

      // Don't hide while mobile menu is open.
      if (isMenuOpen) {
        setHidden(false);
        lastScrollY.current = y;
        return;
      }

      if (y < lastScrollY.current) {
        setHidden(false);
      } else if (y > 80 && y > lastScrollY.current) {
        setHidden(true);
      }
      lastScrollY.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMenuOpen]);

  if (hideNavbar) return null;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-transform duration-300 ease-out",
        hidden ? "-translate-y-full" : "translate-y-0",
        scrolled
          ? "border-b border-black/10 bg-background/80 shadow-sm backdrop-blur-xl dark:border-white/10"
          : "bg-transparent lg:border-b lg:border-black/10 dark:lg:border-white/10",
      )}
    >
      <div className="relative z-50 container flex h-[var(--header-height)] items-center justify-between gap-4">
        <Logo className="w-47" />

        <NavigationMenu viewport={false} className="hidden lg:block">
          <NavigationMenuList className="gap-4 xl:gap-8">
            {NAV_LINKS.map((item) => (
              <NavigationMenuItem key={item.label}>
                {item.subitems ? (
                  <>
                    <NavigationMenuTrigger
                      className={cn(
                        "cursor-pointer bg-transparent [&_svg]:ms-2 [&_svg]:size-4",
                        pathname.startsWith(item.href) && "bg-accent font-semibold",
                      )}
                    >
                      {item.label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="">
                      <ul className="grid w-[263px] gap-2">
                        {item.subitems.map((subitem) => (
                          <li key={subitem.label}>
                            <NavigationMenuLink href={subitem.href} className="flex-row items-start gap-3 p-3">
                              <subitem.icon className="text-foreground size-5.5 shrink-0" />
                              <div className="flex flex-col gap-1">
                                <div className="text-sm font-medium tracking-normal">{subitem.label}</div>
                                <div className="text-muted-foreground text-xs leading-snug">{subitem.description}</div>
                              </div>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <NavigationMenuLink
                    href={item.href}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "bg-transparent",
                      pathname === item.href && "bg-accent font-semibold",
                    )}
                  >
                    {item.label}
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="hidden w-47 items-center justify-end gap-3 lg:flex">
          <ProductSearchLauncher />
          <ThemeToggle />
          {ACTION_BUTTONS.map((button) => (
            <Button key={button.label} size="sm" variant={button.variant} asChild>
              <Link href={button.href}>{button.label}</Link>
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2 lg:hidden lg:gap-4">
          <ProductSearchLauncher />
          <ThemeToggle />
          <button
            className="text-muted-foreground hover:bg-accent/50 hover:text-foreground relative flex size-9 cursor-pointer rounded-sm border-0 transition-colors lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Open main menu"
            aria-expanded={isMenuOpen}
          >
            <span className="sr-only">Open main menu</span>
            <div className={cn("absolute top-1/2 left-1/2 block w-4 -translate-x-1/2 -translate-y-1/2")}>
              <span
                aria-hidden="true"
                className={cn(
                  "absolute block h-0.25 w-full rounded-full bg-current transition duration-500 ease-in-out",
                  isMenuOpen ? "rotate-45" : "-translate-y-1.5",
                )}
              ></span>
              <span
                aria-hidden="true"
                className={cn(
                  "absolute block h-0.25 w-full rounded-full bg-current transition duration-500 ease-in-out",
                  isMenuOpen ? "opacity-0" : "",
                )}
              ></span>
              <span
                aria-hidden="true"
                className={cn(
                  "absolute block h-0.25 w-full rounded-full bg-current transition duration-500 ease-in-out",
                  isMenuOpen ? "-rotate-45" : "translate-y-1.5",
                )}
              ></span>
            </div>
          </button>
        </div>

      </div>

      {/* Mobile Menu Navigation — portaled so sticky header transforms don't pull it. */}
      {portalMounted &&
        createPortal(
          <div
            className={cn(
              "bg-background/95 text-accent-foreground fixed inset-0 z-[60] flex flex-col justify-between tracking-normal backdrop-blur-md transition-all duration-500 ease-out lg:hidden",
              isMenuOpen ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-full opacity-0",
            )}
          >
            {/* Menu-own header so close button is always reachable even when the main navbar is hidden. */}
            <div className="absolute top-0 right-0 left-0 z-10 flex h-[var(--header-height)] items-center justify-between border-b px-4">
              <Logo className="w-32" />
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="text-muted-foreground hover:bg-accent/50 hover:text-foreground inline-flex size-9 items-center justify-center rounded-sm transition-colors"
                aria-label="Close menu"
              >
                <span className="sr-only">Close menu</span>
                <X className="size-5" />
              </button>
            </div>

            <div className="container flex-1 overflow-y-auto pt-[var(--header-height)]">
              {/* Plain nav (not Radix NavigationMenu) so touch taps aren't
                  intercepted, and every row is a full-width hit target. */}
              <nav className="w-full py-10">
                <ul className="flex w-full flex-col items-start gap-1">
                  {NAV_LINKS.map((item) => (
                    <li key={item.label} className="w-full">
                      {item.subitems ? (
                        <Accordion type="single" collapsible className="w-full rounded-lg border-0">
                          <AccordionItem value={item.label} className="border-0">
                            <AccordionTrigger className="hover:bg-accent/50 flex w-full cursor-pointer items-center justify-between rounded-lg p-3 text-base font-normal hover:no-underline">
                              {item.label}
                            </AccordionTrigger>
                            <AccordionContent className="pt-1 pb-0">
                              <div className="space-y-1">
                                {item.subitems.map((subitem) => (
                                  <Link
                                    key={subitem.label}
                                    href={subitem.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={cn(
                                      "text-muted-foreground hover:bg-accent/50 hover:text-foreground flex w-full flex-row items-center gap-2 rounded-lg p-3 font-medium transition-colors",
                                      pathname === subitem.href && "bg-accent text-foreground font-semibold",
                                    )}
                                  >
                                    <subitem.icon className="size-5.5" />
                                    <span>{subitem.label}</span>
                                  </Link>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className={cn(
                            "hover:bg-accent/50 hover:text-foreground block w-full rounded-lg p-3 text-base transition-colors",
                            pathname === item.href && "bg-accent font-semibold",
                          )}
                        >
                          {item.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            <div className="flex gap-4.5 border-t px-6 py-4">
              {ACTION_BUTTONS.map((button) => (
                <Button
                  key={button.label}
                  variant={button.variant}
                  asChild
                  className="h-12 flex-1 rounded-sm transition-all hover:scale-105"
                >
                  <Link href={button.href} onClick={() => setIsMenuOpen(false)}>
                    {button.label}
                  </Link>
                </Button>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </header>
  );
};

export default Navbar;
