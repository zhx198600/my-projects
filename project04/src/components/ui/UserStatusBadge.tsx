"use client";

import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";
import type { UserStatus } from "@/types";

interface UserStatusBadgeProps {
  status: UserStatus;
}

const statusStyles: Record<UserStatus, { icon: React.ElementType; className: string }> = {
  active: {
    icon: Check,
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  disabled: {
    icon: X,
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
};

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const t = useTranslations("users");

  const style = statusStyles[status] || statusStyles.disabled;
  const Icon = style.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${style.className}`}
    >
      <Icon className="w-3 h-3" />
      {t(status)}
    </span>
  );
}
