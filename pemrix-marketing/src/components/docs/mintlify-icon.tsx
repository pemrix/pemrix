"use client";

import {
  BookOpen,
  CheckCircle,
  Code,
  DotsThreeVertical,
  Flag,
  Gear,
  Info,
  Lightning,
  MagnifyingGlass,
  Question,
  Rocket,
  Shield,
  Star,
  User,
  Users,
  Warning,
} from "@phosphor-icons/react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  flag: Flag,
  "ellipsis-vertical": DotsThreeVertical,
  warning: Warning,
  "check-circle": CheckCircle,
  info: Info,
  lightning: Lightning,
  search: MagnifyingGlass,
  question: Question,
  rocket: Rocket,
  book: BookOpen,
  code: Code,
  gear: Gear,
  shield: Shield,
  star: Star,
  user: User,
  users: Users,
};

export function MintlifyIcon({ icon }: { icon?: string }) {
  const PhosphorIcon = icon ? iconMap[icon] : null;
  if (PhosphorIcon) {
    return <PhosphorIcon className="inline h-4 w-4 align-text-bottom" />;
  }
  return <span className="inline-block h-4 w-4 rounded-full bg-current opacity-50" />;
}
