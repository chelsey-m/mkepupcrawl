import React, { useEffect } from 'react';
import { X, RotateCcw } from 'lucide-react';

interface ToastProps {
  message: string;
  action?: () => void;
  onDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, action, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg max-w-sm mx-auto z-50 animate-fadeIn">
      <p className="text-sm">{message}</p>
      {action && (
        <button
          onClick={action}
          className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Filters</span>
        </button>
      )}
      <button
        onClick={onDismiss}
        className="ml-2 text-gray-400 hover:text-gray-300 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast