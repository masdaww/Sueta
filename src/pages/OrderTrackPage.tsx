import { Link, useParams } from 'react-router-dom'
import { useOrders } from '@/store/orders'
import { formatDateTime, orderStatusEmoji, orderStatusLabel } from '@/lib/format'
import { EmptyState } from '@/components/EmptyState'
import type { OrderStatus } from '@/lib/types'
import { notify } from '@/store/notify'

const flow: OrderStatus[] = ['created', 'paid', 'packed', 'shipped', 'delivered']

export default function OrderTrackPage() {
  const { orderId } = useParams()
  const order = useOrders((s) => s.orders.find((o) => o.id === orderId))
  const setStatus = useOrders((s) => s.setStatus)

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState emoji="📦" title="Заказ не найден" action={<Link to="/account/orders" className="btn-primary">Мои заказы</Link>} />
      </div>
    )
  }

  const cancelled = order.status === 'cancelled'
  const currentIdx = cancelled ? -1 : flow.indexOf(order.status as OrderStatus)
  const nextStatus = currentIdx >= 0 && currentIdx < flow.length - 1 ? flow[currentIdx + 1] : null

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/account/orders" className="text-sm text-sueta-700 hover:underline">← К списку заказов</Link>
      <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Отслеживание заказа {order.id}</h1>

      <div className="card mt-4 p-5">
        {cancelled ? (
          <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">
            Заказ отменён. Курьер плачет, но мы это переживём.
          </div>
        ) : (
          <ol className="relative space-y-5 border-l-2 border-slate-200 pl-6">
            {flow.map((s, i) => {
              const passed = i <= currentIdx
              const at = order.history.find((h) => h.status === s)?.at
              return (
                <li key={s} className="relative">
                  <span
                    className={`absolute -left-[33px] grid h-6 w-6 place-items-center rounded-full text-xs ${
                      passed ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {orderStatusEmoji[s]}
                  </span>
                  <div className={`text-sm font-semibold ${passed ? 'text-slate-900' : 'text-slate-400'}`}>
                    {orderStatusLabel[s]}
                  </div>
                  <div className="text-xs text-slate-400">{at ? formatDateTime(at) : '—'}</div>
                </li>
              )
            })}
          </ol>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {nextStatus && (
          <button
            className="btn-secondary"
            onClick={() => {
              setStatus(order.id, nextStatus)
              notify.info('Симуляция: статус обновлён', orderStatusLabel[nextStatus])
            }}
          >
            Симулировать следующий шаг → {orderStatusLabel[nextStatus]}
          </button>
        )}
        {!cancelled && order.status !== 'delivered' && (
          <button
            className="btn-ghost text-rose-600 hover:!bg-rose-50"
            onClick={() => {
              setStatus(order.id, 'cancelled')
              notify.warn('Заказ отменён')
            }}
          >
            Отменить заказ
          </button>
        )}
      </div>
    </div>
  )
}
