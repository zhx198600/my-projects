'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Package,
  Loader2,
  Inbox,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { orderApi } from '@/mock/api';
import { useToast } from '@/contexts/ToastContext';
import type { Order, OrderStatus } from '@/types';
import { Link } from '@/lib/routing';

export default function OrderDetailPage() {
  const params = useParams();
  const t = useTranslations('orders');
  const tCommon = useTranslations('common');
  const { showToast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const orderId = params.id as string;

  const fetchOrder = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await orderApi.getOrderById(orderId);
      setOrder(data);
      if (data) {
        setNewStatus(data.status);
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
      showToast(tCommon('error'), 'error');
    } finally {
      setIsLoading(false);
    }
  }, [orderId, showToast, tCommon]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleUpdateStatus = () => {
    if (order && newStatus !== order.status) {
      setShowConfirm(true);
    }
  };

  const handleConfirmUpdate = async () => {
    if (!order) return;

    setIsUpdating(true);
    try {
      const updatedOrder = await orderApi.updateOrderStatus(
        order.id,
        newStatus
      );
      setOrder(updatedOrder);
      showToast(t('updateStatusSuccess'), 'success');
    } catch (error) {
      console.error('Failed to update order status:', error);
      showToast(t('updateStatusFailed'), 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number) => {
    return `¥${amount.toFixed(2)}`;
  };

  const statusOptions: { value: OrderStatus; label: string }[] = [
    { value: 'pending', label: t('pending') },
    { value: 'processing', label: t('processing') },
    { value: 'shipped', label: t('shipped') },
    { value: 'completed', label: t('completed') },
    { value: 'cancelled', label: t('cancelled') },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-500" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            {tCommon('loading')}
          </span>
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {tCommon('back')}
          </Link>
          <EmptyState
            icon={Inbox}
            title={t('orderNotExist')}
            description={t('orderNotExistDesc')}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {tCommon('back')}
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('detail')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {order.orderNo}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('orderInfo')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t('orderNo')}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {order.orderNo}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t('status')}
                  </span>
                  <StatusBadge status={order.status} type="order" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t('createdAt')}
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {formatDate(order.createdAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t('updatedAt')}
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {formatDate(order.updatedAt)}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t('customerName')}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {order.customerName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {t('customerPhone')}
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {order.customerPhone}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {t('customerAddress')}
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 text-right max-w-[200px]">
                    {order.customerAddress}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t('totalAmount')}
                  </span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {formatAmount(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              {t('items')}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('productName')}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('quantity')}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('unitPrice')}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('subtotal')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {order.items.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                        {item.name}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300 text-right">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300 text-right">
                        {formatAmount(item.price)}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white text-right">
                        {formatAmount(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <td
                      colSpan={3}
                      className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white"
                    >
                      {t('total')}
                    </td>
                    <td className="px-4 py-3 text-right text-lg font-bold text-blue-600 dark:text-blue-400">
                      {formatAmount(order.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('editStatus')}
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('currentStatus')}
                </label>
                <div className="py-2">
                  <StatusBadge status={order.status} type="order" />
                </div>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('newStatus')}
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleUpdateStatus}
                disabled={isUpdating || newStatus === order.status}
                className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {tCommon('updating')}
                  </>
                ) : (
                  t('editStatus')
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmUpdate}
        title={t('confirmUpdateStatus')}
        message={tCommon('confirmChangeStatusFromTo', {
          from: statusOptions.find((s) => s.value === order?.status)?.label,
          to: statusOptions.find((s) => s.value === newStatus)?.label,
        })}
        confirmText={t('confirmUpdate')}
        cancelText={tCommon('cancel')}
        confirmVariant={newStatus === 'cancelled' ? 'danger' : 'primary'}
      />
    </DashboardLayout>
  );
}
