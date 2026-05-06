import clsx from "clsx";
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from "lucide-react";
import { useApp } from "../../store/AppContext";

export function ToastViewport() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 w-[min(92vw,360px)]">
      {toasts.map((t) => {
        const Icon =
          t.type === "success"
            ? CheckCircle2
            : t.type === "warning"
              ? AlertTriangle
              : t.type === "error"
                ? AlertOctagon
                : Info;
        const iconColor =
          t.type === "success"
            ? "text-accent-mint"
            : t.type === "warning"
              ? "text-amber-500"
              : t.type === "error"
                ? "text-red-500"
                : "text-accent-violet";
        return (
          <div
            key={t.id}
            role="status"
            aria-live="polite"
            className={clsx(
              "ozor-card animate-slide-up p-3 pr-2 flex items-start gap-3 border border-ink-100",
            )}
          >
            <Icon className={clsx("flex-none mt-0.5", iconColor)} size={20} />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-ink-900 leading-tight">{t.title}</div>
              {t.description && (
                <div className="text-sm text-ink-500 mt-0.5 break-words">{t.description}</div>
              )}
            </div>
            <button
              onClick={() => dismissToast(t.id)}
              aria-label="Закрыть уведомление"
              className="flex-none rounded-full p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
