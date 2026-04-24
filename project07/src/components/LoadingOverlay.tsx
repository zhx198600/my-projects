import { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import ProgressIndicator from './ProgressIndicator';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export default function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  const [shouldRender, setShouldRender] = useState(visible);
  const [isFadingIn, setIsFadingIn] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      const timer = setTimeout(() => setIsFadingIn(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsFadingIn(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm
        transition-opacity duration-300 ease-in-out
        ${isFadingIn ? 'opacity-100' : 'opacity-0'}`}
    >
      <div
        className={`flex flex-col items-center gap-6 p-8 bg-gray-900/95 rounded-2xl shadow-2xl backdrop-blur-md
          transition-all duration-300 ease-out
          ${isFadingIn ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}
      >
        <LoadingSpinner size="lg" />
        <ProgressIndicator />
        {message && (
          <p className="text-sm text-gray-400 mt-2 animate-pulse">{message}</p>
        )}
      </div>
    </div>
  );
}
