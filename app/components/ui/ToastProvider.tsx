'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Toast, ToastProps } from './Toast';

interface ToastContextType {
  showToast: (toast: Omit<ToastProps, 'id' | 'isVisible' | 'onClose'>) => void;
  showSuccess: (title: string, description?: string) => void;
  showError: (title: string, description?: string) => void;
  showWarning: (title: string, description?: string) => void;
  showInfo: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

interface ActiveToast extends ToastProps {
  id: string;
  isVisible: boolean;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ActiveToast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastProps, 'id' | 'isVisible' | 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ActiveToast = {
      ...toast,
      id,
      isVisible: true,
      onClose: () => removeToast(id)
    };

    setToasts(prev => [...prev, newToast]);
  }, [removeToast]);

  const showSuccess = useCallback((title: string, description?: string) => {
    showToast({ title, description, type: 'success' });
  }, [showToast]);

  const showError = useCallback((title: string, description?: string) => {
    showToast({ title, description, type: 'error' });
  }, [showToast]);

  const showWarning = useCallback((title: string, description?: string) => {
    showToast({ title, description, type: 'warning' });
  }, [showToast]);

  const showInfo = useCallback((title: string, description?: string) => {
    showToast({ title, description, type: 'info' });
  }, [showToast]);

  const value = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
