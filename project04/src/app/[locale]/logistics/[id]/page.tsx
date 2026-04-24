"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  MapPin,
  Package,
  Truck,
  Calendar,
  Clock,
  Loader2,
  Inbox,
  ChevronRight,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { logisticsApi } from "@/mock/api";
import type { Logistics, LogisticsHistoryItem, LogisticsStatus } from "@/types";
import { Link } from "@/lib/routing";

export default function LogisticsDetailPage() {
  const params = useParams();
  const t = useTranslations("logistics");
  const tCommon = useTranslations("common");

  const [logistics, setLogistics] = useState<Logistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logisticsId = params.id as string;

  const fetchLogistics = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await logisticsApi.getLogisticsById(logisticsId);
      setLogistics(data);
    } catch (error) {
      console.error("Failed to fetch logistics:", error);
    } finally {
      setIsLoading(false);
    }
  }, [logisticsId]);

  useEffect(() => {
    fetchLogistics();
  }, [fetchLogistics]);

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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-500" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            {tCommon("loading")}
          </span>
        </div>
      </DashboardLayout>
    );
  }

  if (!logistics) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Link
            href="/logistics"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {tCommon("back")}
          </Link>
          <EmptyState
            icon={Truck}
            title={t("logisticsNotExist")}
            description={t("logisticsNotExistDesc")}
          />
        </div>
      </DashboardLayout>
    );
  }

  const historyItems = logistics.history || [];
  const sortedHistory = [...historyItems].sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/logistics"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {tCommon("back")}
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              {t("detail")}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {logistics.trackingNo}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t("logisticsInfo")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t("trackingNo")}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {logistics.trackingNo}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t("orderNo")}
                  </span>
                  <Link
                    href={`/orders/${logistics.orderId}`}
                    className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
                  >
                    <Package className="w-3 h-3" />
                    {logistics.orderNo}
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t("status")}
                  </span>
                  <StatusBadge status={logistics.status} type="logistics" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {t("currentLocation")}
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {logistics.currentLocation}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {t("estimatedDelivery")}
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {formatShortDate(logistics.estimatedDelivery)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {t("updatedAt")}
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {formatDate(logistics.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5" />
              {t("logisticsHistory")}
            </h2>
            {sortedHistory.length > 0 ? (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                <div className="space-y-6">
                  {sortedHistory.map((item, index) => (
                    <div key={index} className="relative flex gap-4 pl-8">
                      <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-4 border-blue-500 flex items-center justify-center z-10">
                        <ChevronRight className="w-3 h-3 text-blue-500" />
                      </div>
                      <div className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <StatusBadge
                            status={item.status}
                            type="logistics"
                          />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(item.time)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{item.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {tCommon("noData")}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
