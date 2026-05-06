import clsx from "clsx";
import type { OrderStatus } from "../../types";

export const statusLabels: Record<OrderStatus, { label: string; cls: string; emoji: string }> = {
  ordered: { label: "Принят", cls: "bg-ink-100 text-ink-700", emoji: "📝" },
  packed: { label: "Упакован", cls: "bg-amber-100 text-amber-800", emoji: "📦" },
  shipped: { label: "Отправлен", cls: "bg-sky-100 text-sky-800", emoji: "🚚" },
  delivering: { label: "В пути", cls: "bg-violet-100 text-violet-800", emoji: "🛵" },
  delivered: { label: "Доставлен", cls: "bg-emerald-100 text-emerald-800", emoji: "✅" },
  cancelled: { label: "Отменён", cls: "bg-red-100 text-red-700", emoji: "✖️" },
};

export function OrderStatusPill({ status }: { status: OrderStatus }) {
  const m = statusLabels[status];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        m.cls,
      )}
    >
      <span aria-hidden>{m.emoji}</span>
      {m.label}
    </span>
  );
}
