"use client";

import { Package, Truck, Users, Box } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/lib/routing";

interface MenuItem {
  href: string;
  icon: React.ElementType;
  labelKey: string;
}

const menuItems: MenuItem[] = [
  {
    href: "/orders",
    icon: Package,
    labelKey: "nav.orders",
  },
  {
    href: "/logistics",
    icon: Truck,
    labelKey: "nav.logistics",
  },
  {
    href: "/users",
    icon: Users,
    labelKey: "nav.users",
  },
];

export function Sidebar() {
  const t = useTranslations();
  const pathname = usePathname();

  const isActive = (href: string): boolean => {
    const segments = pathname.split("/").filter(Boolean);
    const locale = segments[0];
    const cleanPath = "/" + segments.slice(1).join("/");

    if (href === cleanPath) {
      return true;
    }

    return cleanPath.startsWith(href + "/");
  };

  return (
    <aside className="hidden lg:flex lg:flex-col lg:fixed lg:left-0 lg:top-0 lg:h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
          <Box className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            {t("login.title")}
          </h1>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                active
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Icon className="w-5 h-5" />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
