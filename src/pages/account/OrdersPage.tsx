import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { listOrdersByUser } from "../../api/mockApi";
import { useApp } from "../../store/AppContext";
import type { Order } from "../../types";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { formatDateTime, formatPrice } from "../../lib/format";
import { OrderStatusPill, statusLabels } from "../../components/order/OrderStatusPill";

export function OrdersPage() {
  const { user } = useApp();
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    if (!user) return;
    listOrdersByUser(user.id).then(setOrders);
  }, [user]);

  if (!user) return null;

  if (orders === null) {
    return (
      <div className="space-y-3">
        <h1 className="ozor-section-title">Мои заказы</h1>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="space-y-5">
        <h1 className="ozor-section-title">Мои заказы</h1>
        <EmptyState
          emoji="📦"
          title="Заказов пока нет"
          description="Самое время попробовать что-нибудь сомнительное."
          action={
            <Link to="/catalog" className="ozor-btn-primary px-4 py-2">
              К каталогу
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h1 className="ozor-section-title mb-2">Мои заказы</h1>
      {orders.map((o) => (
        <Link
          key={o.id}
          to={`/account/orders/${o.id}`}
          className="ozor-card p-4 flex flex-wrap items-center gap-4 hover:shadow-pop transition-shadow"
        >
          <div className="flex-1 min-w-[180px]">
            <div className="text-xs text-ink-500">№ {o.id}</div>
            <div className="font-semibold text-ink-900">{formatPrice(o.total)} · {o.items.length} тов.</div>
            <div className="text-xs text-ink-500 mt-0.5">{formatDateTime(o.createdAt)}</div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {o.items.slice(0, 4).map((it, i) => (
              <span key={i} className="text-2xl">{it.emojiSnapshot}</span>
            ))}
            {o.items.length > 4 && <span className="text-sm text-ink-500">+{o.items.length - 4}</span>}
          </div>
          <OrderStatusPill status={o.status} />
          <ChevronRight className="text-ink-400" />
        </Link>
      ))}
      <p className="text-xs text-ink-500 mt-4">
        Всего статусов у заказа: {Object.keys(statusLabels).length}. Енот старается их менять регулярно.
      </p>
    </div>
  );
}
