"use client";

import { Package } from "lucide-react";
import { useTranslations } from "next-intl";

interface EmptyStateProps {
  icon?: React.ElementType;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  const t = useTranslations("common");
  const IconComponent = Icon || Package;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <IconComponent className="w-8 h-8 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        {title || t("noData")}
      </h3>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
