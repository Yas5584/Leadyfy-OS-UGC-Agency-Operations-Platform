import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast, addToast: showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => {
          const icons = {
            success: <CheckCircle className="w-5 h-5 text-green-500" />,
            error: <XCircle className="w-5 h-5 text-red-500" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
            info: <Info className="w-5 h-5 text-blue-500" />
          };
          return (
            <div key={toast.id} className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-lg border border-gray-200 min-w-[300px] animate-slide-up">
              {icons[toast.type]}
              <span className="flex-1 text-sm font-medium text-gray-800">{toast.message}</span>
              <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
