"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  Home,
  ChevronRight,
  User,
  LogOut,
  Globe,
  Menu,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/hooks/useLocale";
import { Link, usePathname, useRouter } from "@/lib/routing";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Header() {
  const t = useTranslations();
  const { user, logout } = useAuth();
  const { toggleLocale, isZh } = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split("/").filter(Boolean);
    const pathSegments = segments.slice(1);

    const breadcrumbs: BreadcrumbItem[] = [
      { label: t("breadcrumb.home"), href: "/orders" },
    ];

    if (pathSegments.length === 0 || pathSegments[0] === "orders") {
      breadcrumbs.push({ label: t("nav.orders") });

      if (pathSegments.length >= 2 && pathSegments[1] !== "") {
        breadcrumbs.push({ label: t("orders.detail") });
      }
    } else if (pathSegments[0] === "logistics") {
      breadcrumbs.push({ label: t("nav.logistics") });
    } else if (pathSegments[0] === "users") {
      breadcrumbs.push({ label: t("nav.users") });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const getRoleLabel = (role: string) => {
    return role === "admin" ? t("users.admin") : t("users.user");
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          <nav className="flex items-center gap-1 text-sm">
            {breadcrumbs.map((item, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 mx-1" />
                )}
                {item.href ? (
                  <Link
                    href={item.href}
                    className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {index === 0 && (
                      <Home className="w-4 h-4" />
                    )}
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    {item.label}
                  </span>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLocale}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 flex items-center gap-1"
          >
            <Globe className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">
              {isZh ? "中文" : "EN"}
            </span>
          </button>

          <ThemeToggle />

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="hidden sm:flex sm:flex-col sm:items-start">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.username}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {user && getRoleLabel(user.role)}
                </span>
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden transition-colors duration-200">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.username}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user && getRoleLabel(user.role)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    {t("common.logout")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
