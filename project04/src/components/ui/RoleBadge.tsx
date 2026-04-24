"use client";

import { useTranslations } from "next-intl";
import { Shield, User } from "lucide-react";
import type { UserRole } from "@/types";

interface RoleBadgeProps {
  role: UserRole;
}

const roleStyles: Record<UserRole, { icon: React.ElementType; className: string }> = {
  admin: {
    icon: Shield,
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  },
  user: {
    icon: User,
    className: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  },
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const t = useTranslations("users");

  const style = roleStyles[role] || roleStyles.user;
  const Icon = style.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${style.className}`}
    >
      <Icon className="w-3 h-3" />
      {t(role)}
    </span>
  );
}
