import { Link, useParams } from 'react-router-dom'
import { useOrders } from '@/store/orders'
import { formatDateTime, formatPrice, orderStatusLabel } from '@/lib/format'
import { EmptyState } from '@/components/EmptyState'

export default function OrderSuccessPage() {
  const { orderId } = useParams()
  const order = useOrders((s) => s.orders.find((o) => o.id === orderId))

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState
          emoji="🧾"
          title="Заказ не найден"
          action={<Link to="/account/orders" className="btn-primary">Мои заказы</Link>}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-2xl bg-gradient-to-br from-emerald-100 to-sky-100 p-6 text-center shadow-card">
        <div className="text-5xl">🎉</div>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">Заказ {order.id} оформлен</h1>
        <p className="mt-1 text-sm text-slate-600">
          Курьер уже одевается. Это симуляция, поэтому он одевается долго и со вкусом.
        </p>
      </div>

      <div className="card mt-6 space-y-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="chip">{orderStatusLabel[order.status]}</span>
          <span className="text-slate-500">{formatDateTime(order.createdAt)}</span>
        </div>
        <ul className="divide-y divide-slate-100">
          {order.items.map((it) => (
            <li key={it.productId} className="flex items-center gap-3 py-3">
              <img src={it.image} alt="" className="h-14 w-14 rounded-md object-cover" />
              <div className="flex-1 text-sm">
                <div className="line-clamp-1 font-medium text-slate-900">{it.title}</div>
                <div className="text-xs text-slate-500">{it.qty} × {formatPrice(it.price)}</div>
              </div>
              <div className="text-sm font-semibold text-slate-900">
                {formatPrice(it.price * it.qty)}
              </div>
            </li>
          ))}
        </ul>
        <div className="grid gap-1 border-t border-slate-100 pt-3 text-sm sm:grid-cols-2">
          <div><span className="text-slate-500">Доставка: </span>{order.delivery.name}</div>
          <div><span className="text-slate-500">Адрес: </span>{order.address}</div>
          <div><span className="text-slate-500">Оплата: </span>{order.payment.toUpperCase()}</div>
          <div className="text-right text-base font-extrabold text-slate-900 sm:col-span-2">
            Итого: {formatPrice(order.total)}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link to={`/order/${order.id}/track`} className="btn-primary">Отследить заказ</Link>
        <Link to="/account/orders" className="btn-secondary">Мои заказы</Link>
        <Link to="/c" className="btn-ghost">Ещё суеты →</Link>
      </div>
    </div>
  )
}
