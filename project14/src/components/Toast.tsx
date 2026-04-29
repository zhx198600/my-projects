import React, { useEffect, useCallback } from 'react';

export const TOAST_TYPES = ['success', 'error'] as const;

export type ToastType = (typeof TOAST_TYPES)[number];

type ToastProps = {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
};

const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        handleClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, handleClose]);

  const baseStyles = "fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-lg shadow-lg transition-all duration-300 ease-in-out";
  
  const typeStyles = type === 'success'
    ? "bg-green-500 text-white"
    : "bg-red-500 text-white";

  const visibilityStyles = isVisible
    ? "translate-x-0 opacity-100"
    : "translate-x-full opacity-0";

  return (
    <div className={`${baseStyles} ${typeStyles} ${visibilityStyles}`}>
      {type === 'success' ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      <span className="font-medium">{message}</span>
      <button
        onClick={handleClose}
        className="ml-2 hover:opacity-70 transition-opacity"
        aria-label="关闭"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default Toast;
