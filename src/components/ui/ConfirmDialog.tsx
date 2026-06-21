type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onClose: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
};

export function ConfirmDialog({
  open,
  title,
  description,
  onConfirm,
  onClose,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
}: ConfirmDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="w-full max-w-md space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/20 dark:border-slate-700 dark:bg-slate-900"
      >
        <h3 id="confirm-dialog-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h3>
        <p id="confirm-dialog-description" className="text-sm text-slate-600 dark:text-slate-300">
          {description}
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 dark:border-slate-700 dark:text-slate-200"
            onClick={onClose}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
