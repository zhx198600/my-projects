'use client';

import { X, Check, AlertTriangle, Info } from 'lucide-react';
import { useToast, type Toast } from '@/contexts/ToastContext';

interface ToastItemProps {
  toast: Toast;
}

const toastConfig = {
  success: {
    bgClass: 'bg-green-500',
    borderClass: 'border-green-600',
    Icon: Check,
  },
  error: {
    bgClass: 'bg-red-500',
    borderClass: 'border-red-600',
    Icon: X,
  },
  info: {
    bgClass: 'bg-blue-500',
    borderClass: 'border-blue-600',
    Icon: Info,
  },
};

function ToastItem({ toast }: ToastItemProps) {
  const { removeToast } = useToast();
  const config = toastConfig[toast.type];
  const Icon = config.Icon;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${config.bgClass} ${config.borderClass} text-white min-w-[280px] max-w-[380px] animate-pulse`}
      style={{
        animation: 'slideIn 0.3s ease-out, fadeOut 0.3s ease-in 2.7s',
      }}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
