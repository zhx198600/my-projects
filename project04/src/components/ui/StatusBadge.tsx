"use client";

import { useTranslations } from "next-intl";

interface StatusBadgeProps {
  status: string;
  type?: "order" | "logistics";
}

const orderStatusColors: Record<string, string> = {
  pending: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  shipped: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const logisticsStatusColors: Record<string, string> = {
  preparing: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  shipped: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  in_transit: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

export function StatusBadge({ status, type = "order" }: StatusBadgeProps) {
  const t = useTranslations(type === "order" ? "orders" : "logistics");

  const colors = type === "order" ? orderStatusColors : logisticsStatusColors;
  const colorClass = colors[status] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
    >
      {t(status)}
    </span>
  );
}
