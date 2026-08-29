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
  metadataBase: new URL("https://quanvio.com"),
  title: {
    default: "Quanvio — Intelligence Layer for Work",
    template: "%s | Quanvio",
  },
  description:
    "Quanvio is building the intelligence layer for work. One platform, powerful products: Qora, Qprint, Quanpos, Qorvia, Pegus, and more.",
  keywords: ["Quanvio", "AI platform", "productivity", "Qora", "Qprint", "Quanpos", "Qorvia", "Pegus"],
  authors: [{ name: "Quanvio", url: "https://quanvio.com" }],
  creator: "Quanvio",
  publisher: "Quanvio",
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
    title: "Quanvio — Intelligence Layer for Work",
    description:
      "Quanvio is building the intelligence layer for work. One platform, powerful products: Qora, Qprint, Quanpos, Qorvia, Pegus, and more.",
    siteName: "Quanvio",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Quanvio — Intelligence Layer for Work",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quanvio — Intelligence Layer for Work",
    description:
      "Quanvio is building the intelligence layer for work. One platform, powerful products: Qora, Qprint, Quanpos, Qorvia, Pegus, and more.",
    images: ["/images/og-image.jpg"],
    creator: "@quanvio",
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
