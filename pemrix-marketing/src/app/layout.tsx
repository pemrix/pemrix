import "./globals.css";

import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { SiteChrome } from "@/components/layout/site-chrome";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pemrix.com"),
  title: {
    default: "PEMRIX — The Open Network for Value",
    template: "%s | PEMRIX",
  },
  description:
    "PEMRIX is the open network for value: a fast, secure, and decentralized blockchain for payments, AI-native apps, and global commerce.",
  keywords: [
    "PEMRIX",
    "PRX",
    "blockchain",
    "cryptocurrency",
    "payments",
    "DeFi",
    "AI agents",
    "Web3",
    "validator",
    "wallet",
    "merchant",
    "exchange",
    "governance",
  ],
  authors: [{ name: "PEMRIX Labs", url: "https://pemrix.com" }],
  creator: "PEMRIX Labs",
  publisher: "PEMRIX Labs",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon/favicon.ico?v=1", sizes: "48x48" },
      { url: "/favicon/favicon.svg?v=1", type: "image/svg+xml" },
      { url: "/favicon/favicon-96x96.png?v=1", sizes: "96x96", type: "image/png" },
    ],
    apple: [{ url: "/favicon/apple-touch-icon.png?v=1", sizes: "180x180" }],
    shortcut: [{ url: "/favicon/favicon.ico?v=1" }],
  },
  openGraph: {
    title: "PEMRIX — The Open Network for Value",
    description:
      "PEMRIX is the open network for value: a fast, secure, and decentralized blockchain for payments, AI-native apps, and global commerce.",
    siteName: "PEMRIX",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PEMRIX — The Open Network for Value",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PEMRIX — The Open Network for Value",
    description:
      "PEMRIX is the open network for value: a fast, secure, and decentralized blockchain for payments, AI-native apps, and global commerce.",
    images: ["/images/og-image.jpg"],
    creator: "@pemrix",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning className={cn("font-sans", geistSans.variable, geistMono.variable)}>
      <body className={cn("relative flex min-h-screen flex-col antialiased [--header-height:calc(var(--spacing)*17)]")}>
        <RootProvider
          theme={{
            defaultTheme: "dark",
            enableSystem: false,
            disableTransitionOnChange: true,
          }}
          search={{
            options: {
              type: "static",
            },
          }}
        >
          <SiteChrome>{children}</SiteChrome>
        </RootProvider>
      </body>
    </html>
  );
}
