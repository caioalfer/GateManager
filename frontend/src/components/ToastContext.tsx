import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" style={{
        position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 100000,
        display: 'flex', flexDirection: 'column', gap: '0.5rem'
      }}>
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`} style={{
            padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)', background: 'white',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            animation: 'slideIn 0.3s ease-out forwards',
            borderLeft: `4px solid ${toast.type === 'success' ? 'var(--accent-green)' : toast.type === 'error' ? '#ef4444' : '#3b82f6'}`
          }}>
            <span style={{ fontSize: '1.2rem' }}>
              {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}
            </span>
            <span style={{ fontWeight: 500, color: 'var(--text-main)', fontSize: '0.9rem' }}>{toast.message}</span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .toast-success { border-left-color: var(--accent-green); }
        .toast-error { border-left-color: #ef4444; }
        .toast-info { border-left-color: #3b82f6; }
      `}</style>
    </ToastContext.Provider>
  );
};
