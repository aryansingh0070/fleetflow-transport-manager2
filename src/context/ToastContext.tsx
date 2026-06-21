import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ToastContainer } from "../components/ui/ToastContainer";

export type ToastLevel = "success" | "error" | "info";

type Toast = {
  id: string;
  message: string;
  level: ToastLevel;
};

type ToastContextValue = {
  addToast: (toast: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue>({
  addToast: () => undefined,
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    setToasts((previous) => [{ id: crypto.randomUUID(), ...toast }, ...previous].slice(0, 5));
  }, []);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    toasts.forEach((toast) => {
      const timer = setTimeout(() => {
        setToasts((previous) => previous.filter((item) => item.id !== toast.id));
      }, 4000);
      timers.push(timer);
    });
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [toasts]);

  const removeToast = useCallback((id: string) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }, []);

  const contextValue = useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
