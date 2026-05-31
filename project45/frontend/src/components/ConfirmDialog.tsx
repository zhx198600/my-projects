import React, { useState, useCallback, createContext, useContext, type ReactNode } from 'react';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
}

interface ConfirmDialogContextType {
  showConfirm: (options: ConfirmOptions) => void;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined);

export const useConfirmDialog = () => {
  const context = useContext(ConfirmDialogContext);
  if (context === undefined) {
    throw new Error('useConfirmDialog must be used within a ConfirmDialogProvider');
  }
  return context;
};

interface ConfirmDialogProviderProps {
  children: ReactNode;
}

export const ConfirmDialogProvider: React.FC<ConfirmDialogProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const showConfirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setIsOpen(true);
  }, []);

  const handleConfirm = async () => {
    if (!options) return;
    try {
      setIsLoading(true);
      await options.onConfirm();
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setOptions(null);
  };

  return (
    <ConfirmDialogContext.Provider value={{ showConfirm }}>
      {children}
      {isOpen && options && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleCancel}></div>
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{options.title}</h3>
              <p className="text-gray-600">{options.message}</p>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-lg">
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
              >
                {options.cancelText || '取消'}
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isLoading ? '处理中...' : options.confirmText || '确认'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmDialogContext.Provider>
  );
};
