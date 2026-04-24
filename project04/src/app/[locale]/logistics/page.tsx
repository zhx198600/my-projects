"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Search, RefreshCw, Eye, Loader2, Package, MapPin, Calendar, Clock, Truck } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { logisticsApi } from "@/mock/api";
import type { Logistics } from "@/types";
import { Link } from "@/lib/routing";

export default function LogisticsPage() {
  const t = useTranslations("logistics");
  const tCommon = useTranslations("common");

  const [logistics, setLogistics] = useState<Logistics[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const pageSize = 10;

  const fetchLogistics = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await logisticsApi.getLogistics();
      setLogistics(data);
    } catch (error) {
      console.error("Failed to fetch logistics:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogistics();
  }, [fetchLogistics]);

  const filteredLogistics = useMemo(() => {
    return logistics.filter((item) => {
      return (
        searchQuery === "" ||
        item.trackingNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.orderNo.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [logistics, searchQuery]);

  const totalPages = Math.ceil(filteredLogistics.length / pageSize);
  const paginatedLogistics = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredLogistics.slice(startIndex, startIndex + pageSize);
  }, [filteredLogistics, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatShortDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("title")}
            </h1>
          </div>
          <button
            onClick={fetchLogistics}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
            {tCommon("search")}
          </button>
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {tCommon("search")}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-500" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              {tCommon("loading")}
            </span>
          </div>
        ) : filteredLogistics.length === 0 ? (
          <EmptyState
            icon={Truck}
            title={tCommon("noData")}
            description={
              searchQuery
                ? tCommon("noMatchingData")
                : tCommon("noData")
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700 text-left">
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t("trackingNo")}
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t("orderNo")}
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t("status")}
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t("currentLocation")}
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t("estimatedDelivery")}
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t("updatedAt")}
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t("action")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedLogistics.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {item.trackingNo}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Link
                          href={`/orders/${item.orderId}`}
                          className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
                        >
                          <Package className="w-3 h-3" />
                          {item.orderNo}
                        </Link>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <StatusBadge status={item.status} type="logistics" />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {item.currentLocation}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {formatShortDate(item.estimatedDelivery)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          {formatDate(item.updatedAt)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Link
                          href={`/logistics/${item.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          {t("detail")}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {tCommon("totalRecords", {
                  count: filteredLogistics.length,
                  page: currentPage,
                })}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
