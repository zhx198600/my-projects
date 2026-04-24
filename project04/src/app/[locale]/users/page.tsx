"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Search, Loader2, UserCheck, UserX, Users, RefreshCw } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { UserStatusBadge } from "@/components/ui/UserStatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { userApi } from "@/mock/api";
import { useToast } from "@/contexts/ToastContext";
import type { User, UserStatus } from "@/types";

export default function UsersPage() {
  const t = useTranslations("users");
  const tCommon = useTranslations("common");
  const { showToast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [targetAction, setTargetAction] = useState<"enable" | "disable" | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await userApi.getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      showToast(tCommon("error"), "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast, tCommon]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        searchQuery === "" ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [users, searchQuery]);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleActionClick = (user: User, action: "enable" | "disable") => {
    setTargetUser(user);
    setTargetAction(action);
    setShowConfirm(true);
  };

  const handleCloseConfirm = () => {
    setShowConfirm(false);
    setTargetUser(null);
    setTargetAction(null);
  };

  const handleConfirmAction = useCallback(async () => {
    if (!targetUser || !targetAction) return;

    const newStatus: UserStatus = targetAction === "enable" ? "active" : "disabled";

    setIsUpdating(true);
    try {
      const updatedUser = await userApi.updateUserStatus(targetUser.id, newStatus);
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      );
      showToast(tCommon("success"), "success");
    } catch (error) {
      console.error("Failed to update user status:", error);
      showToast(tCommon("error"), "error");
    } finally {
      setIsUpdating(false);
      handleCloseConfirm();
    }
  }, [targetUser, targetAction, showToast, tCommon]);

  const getConfirmMessage = () => {
    if (targetAction === "disable") {
      return t("confirmDisableUser");
    }
    if (targetAction === "enable") {
      return t("confirmEnableUser");
    }
    return "";
  };

  const getConfirmVariant = () => {
    return targetAction === "disable" ? "danger" : "primary";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("title")}
          </h1>
          <button
            onClick={fetchUsers}
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
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            icon={Users}
            title={tCommon("noData")}
            description={
              searchQuery
                ? tCommon("noMatchingData")
                : tCommon("noData")
            }
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 text-left">
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t("username")}
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t("role")}
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t("status")}
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t("lastLoginAt")}
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t("createdAt")}
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t("action")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <UserStatusBadge status={user.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(user.lastLoginAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.status === "active" ? (
                        <button
                          onClick={() => handleActionClick(user, "disable")}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <UserX className="w-4 h-4" />
                          {t("disable")}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActionClick(user, "enable")}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                        >
                          <UserCheck className="w-4 h-4" />
                          {t("enable")}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmAction}
        title={targetAction === "enable" ? t("enable") : t("disable")}
        message={getConfirmMessage()}
        confirmText={targetAction === "enable" ? t("enable") : t("disable")}
        cancelText={tCommon("cancel")}
        confirmVariant={getConfirmVariant()}
      />
    </DashboardLayout>
  );
}
