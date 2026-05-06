import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import clsx from "clsx";
import { ProductImage } from "../../components/product/ProductImage";
import { Skeleton } from "../../components/ui/Skeleton";
import { OrderStatusPill, statusLabels } from "../../components/order/OrderStatusPill";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { getOrder, updateOrderStatus } from "../../api/mockApi";
import { useApp } from "../../store/AppContext";
import { formatDateTime, formatPrice } from "../../lib/format";
import type { Order, OrderStatus } from "../../types";

const TIMELINE: OrderStatus[] = ["ordered", "packed", "shipped", "delivering", "delivered"];

export function OrderDetailPage() {
  const { user, pushToast } = useApp();
  const { orderId = "" } = useParams();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    let alive = true;
    getOrder(orderId).then((o) => {
      if (!alive) return;
      setOrder(o ?? null);
    });
    return () => {
      alive = false;
    };
  }, [orderId]);

  const cancel = async () => {
    if (!order) return;
    const o = await updateOrderStatus(order.id, "cancelled", "Заказ отменён покупателем.");
    if (o) {
      setOrder(o);
      pushToast({ type: "info", title: "Заказ отменён", description: "Енот огорчён, но всё понимает." });
    }
  };

  if (order === undefined) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="ozor-card p-10 text-center">
        <div className="text-5xl mb-2">🤷</div>
        <h2 className="text-xl font-bold">Заказ не найден</h2>
        <p className="text-ink-500 mt-1">Возможно, его съел енот.</p>
        <Link to="/account/orders" className="ozor-btn-primary mt-4 inline-flex px-4 py-2">
          К заказам
        </Link>
      </div>
    );
  }

  if (order.userId !== user?.id) {
    return (
      <div className="ozor-card p-10 text-center">
        <h2 className="text-xl font-bold">Это не ваш заказ</h2>
        <p className="text-ink-500 mt-1">А подсматривать нехорошо.</p>
      </div>
    );
  }

  const currentIndex = TIMELINE.indexOf(order.status);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Link to="/account/orders" className="text-sm text-ink-500 hover:text-ozor-600">← К заказам</Link>
        <h1 className="ozor-section-title">Заказ № {order.id}</h1>
        <OrderStatusPill status={order.status} />
      </div>
      <div className="grid lg:grid-cols-[1fr_320px] gap-5 items-start">
        <div className="space-y-4">
          {order.status !== "cancelled" && (
            <div className="ozor-card p-5">
              <div className="font-semibold text-ink-900 mb-3">Прогресс</div>
              <div className="flex items-center justify-between">
                {TIMELINE.map((s, i) => {
                  const reached = i <= currentIndex;
                  const m = statusLabels[s];
                  return (
                    <div key={s} className="flex-1 flex flex-col items-center text-center">
                      <div
                        className={clsx(
                          "h-10 w-10 rounded-full flex items-center justify-center text-base mb-1",
                          reached ? "bg-ozor-500 text-white" : "bg-ink-100 text-ink-500",
                        )}
                      >
                        {m.emoji}
                      </div>
                      <div className={clsx("text-[11px]", reached ? "text-ink-900 font-semibold" : "text-ink-500")}>
                        {m.label}
                      </div>
                      {i < TIMELINE.length - 1 && (
                        <div
                          className={clsx(
                            "h-0.5 w-full -mt-5 -mr-2",
                            i < currentIndex ? "bg-ozor-500" : "bg-ink-100",
                          )}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="ozor-card p-5">
            <div className="font-semibold text-ink-900 mb-3">История статусов</div>
            <div className="space-y-3">
              {order.trackingHistory.slice().reverse().map((h, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <div className="text-2xl">{statusLabels[h.status].emoji}</div>
                  <div>
                    <div className="font-semibold text-ink-900">{statusLabels[h.status].label}</div>
                    <div className="text-ink-500">{h.note}</div>
                    <div className="text-xs text-ink-400">{formatDateTime(h.at)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="ozor-card p-5">
            <div className="font-semibold text-ink-900 mb-3">Состав заказа</div>
            <div className="space-y-3">
              {order.items.map((it, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-14 w-14">
                    <ProductImage emoji={it.emojiSnapshot} bgColor="#fff5d9" bgColor2="#ffd23a" size="sm" className="h-14 w-14" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${it.productId}`} className="font-medium text-ink-900 hover:text-ozor-600 line-clamp-2">{it.titleSnapshot}</Link>
                    <div className="text-xs text-ink-500">× {it.quantity}</div>
                  </div>
                  <div className="font-semibold">{formatPrice(it.priceAtPurchase * it.quantity)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="ozor-card p-5 lg:sticky lg:top-[calc(var(--header-h)+8px)]">
          <div className="font-semibold text-ink-900 mb-2">Сводка</div>
          <Row label="Подытог" value={formatPrice(order.subtotal)} />
          {order.promo && <Row label={`Промокод ${order.promo.code}`} value={`-${order.promo.discount}%`} />}
          <Row label="Доставка" value={order.deliveryFee === 0 ? "Бесплатно" : formatPrice(order.deliveryFee)} />
          <div className="border-t border-ink-100 my-2" />
          <Row label={<b>К оплате</b>} value={<span className="font-extrabold">{formatPrice(order.total)}</span>} />
          <div className="mt-4 text-sm space-y-1.5">
            <div><span className="text-ink-500">Доставка: </span><b>{deliveryName(order.delivery)}</b></div>
            <div><span className="text-ink-500">Оплата: </span><b>{paymentName(order.payment)}</b></div>
            <div><span className="text-ink-500">Адрес: </span>{order.address}</div>
            <div><span className="text-ink-500">Создан: </span>{formatDateTime(order.createdAt)}</div>
          </div>
          {order.status !== "delivered" && order.status !== "cancelled" && (
            <button
              className="mt-4 ozor-btn-danger w-full py-2.5 text-sm"
              onClick={() => setConfirmCancel(true)}
            >
              Отменить заказ
            </button>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={cancel}
        title="Отменить заказ?"
        description="Енот вернётся в нору, но это его расстроит."
        confirmLabel="Отменить заказ"
        destructive
      />
    </div>
  );
}

function deliveryName(v: string) {
  return ({
    courier: "Курьер-озорник",
    pickup: "Самовывоз из норы",
    drone: "Дроном",
    raccoon: "Енотом-эксклюзив",
  } as Record<string, string>)[v] ?? v;
}

function paymentName(v: string) {
  return ({
    card: "Картой",
    cash: "Наличными",
    credit: "В рассрочку 3×0",
    souls: "Душами",
  } as Record<string, string>)[v] ?? v;
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-2 text-sm py-0.5">
      <span className="text-ink-600">{label}</span>
      <span className="text-ink-900">{value}</span>
    </div>
  );
}
