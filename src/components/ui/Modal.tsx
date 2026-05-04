import { useEffect } from "react";
import type { ReactNode } from "react";
import clsx from "clsx";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  closeOnOverlay?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnOverlay = true,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  const widths: Record<string, string> = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <button
        aria-label="Закрыть"
        className="absolute inset-0 bg-ink-900/60 backdrop-blur-sm animate-fade-in"
        onClick={() => closeOnOverlay && onClose()}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        className={clsx(
          "relative z-[101] w-full bg-white shadow-pop animate-pop-in",
          "rounded-t-2xl sm:rounded-2xl",
          widths[size],
          "sm:my-6 sm:mx-4 max-h-[92dvh] flex flex-col",
        )}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-2 text-ink-500 hover:bg-ink-100 hover:text-ink-900"
          aria-label="Закрыть окно"
        >
          <X size={18} />
        </button>
        {(title || description) && (
          <div className="px-6 pt-6 pb-3">
            {title && <h2 className="text-xl font-bold text-ink-900 pr-10">{title}</h2>}
            {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
          </div>
        )}
        <div className="px-6 py-3 overflow-y-auto">{children}</div>
        {footer && (
          <div className="px-6 pt-3 pb-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t border-ink-100 mt-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
