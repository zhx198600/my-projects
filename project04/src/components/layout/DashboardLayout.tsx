"use client";

import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Loader2 } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isLoading } = useProtectedRoute();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <Sidebar />

      <div className="flex-1 flex flex-col lg:ml-64">
        <Header />

        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
