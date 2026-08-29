"use client";

import { XIcon as X } from "@phosphor-icons/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Banner = ({ url = "https://cruip.com/relay/" }: { url?: string }) => {
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(true);
  const [isClient, setIsClient] = useState(false);

  const isBannerDisabled = searchParams.get("banner") === "false";

  // Check URL param and localStorage to see if banner should be hidden
  useEffect(() => {
    const syncFromStorage = () => {
      setIsClient(true);
      if (isBannerDisabled) {
        setIsVisible(false);
        localStorage.setItem("banner-dismissed", "true");
        return;
      }
      const bannerDismissed = localStorage.getItem("banner-dismissed");
      if (bannerDismissed === "true") {
        setIsVisible(false);
      }
    };
    syncFromStorage();
  }, [isBannerDisabled]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("banner-dismissed", "true");
  };

  // Don't render anything until client-side hydration is complete
  // Hide purchased-template promo banner for Qora rebrand.
  return null;

  /* Original banner kept below for reference.
  if (!isClient || !isVisible) {
    return null;
  }

  return (
    <div className="bg-primary relative">
      ...
    </div>
  );
  */
};

export default Banner;
