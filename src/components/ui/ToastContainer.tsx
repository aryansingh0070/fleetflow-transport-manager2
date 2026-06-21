import { Fragment } from "react";

type ToastContainerProps = {
  toasts: { id: string; message: string; level: "success" | "error" | "info" }[];
  onDismiss: (id: string) => void;
};

const iconMap = {
  success: "✔",
  error: "⚠",
  info: "ℹ",
};

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 flex flex-col gap-2 sm:inset-x-6 sm:bottom-6">
      {toasts.map((toast) => (
        <Fragment key={toast.id}>
          <div
            role="status"
            aria-live="polite"
            className="pointer-events-auto rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm shadow-lg shadow-slate-900/5 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="mr-2 text-lg" aria-hidden>
                {iconMap[toast.level]}
              </span>
              <p className="flex-1 text-slate-900 dark:text-slate-100">{toast.message}</p>
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => onDismiss(toast.id)}
                className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </Fragment>
      ))}
    </div>
  );
}
