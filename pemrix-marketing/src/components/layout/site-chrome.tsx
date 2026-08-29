"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, Suspense } from "react";

import Banner from "@/components/layout/banner";
import Footer from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";

function SiteChromeInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isDocs = pathname.startsWith("/docs");

  if (isDocs) {
    return children;
  }

  return (
    <>
      <div className="bg-background/10 absolute inset-0 z-[-2] backdrop-blur-[85px] will-change-transform md:backdrop-blur-[170px]" />
      <div
        className="absolute inset-0 z-[-1] size-full opacity-70 mix-blend-overlay dark:md:opacity-100"
        style={{
          background: "url(/images/noise.webp) lightgray 0% 0% / 83.69069695472717px 83.69069695472717px repeat",
        }}
      />
      <Suspense fallback={null}>
        <Banner url="https://cruip.com/relay/" />
      </Suspense>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={children}>
      <SiteChromeInner>{children}</SiteChromeInner>
    </Suspense>
  );
}
