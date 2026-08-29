"use client";

import { GoogleLogoIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";

export function GoogleSignInButton() {
  return (
    <Button
      variant="outline"
      className="border-input bg-background/30 text-foreground hover:bg-background/50 flex h-10 w-full items-center justify-center gap-3 text-base font-medium"
    >
      <GoogleLogoIcon className="size-4.5" weight="bold" />
      Continue with Google
    </Button>
  );
}
