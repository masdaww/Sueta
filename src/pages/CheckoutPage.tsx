import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '@/store/cart'
import { useCatalog } from '@/store/catalog'
import { useOrders } from '@/store/orders'
import { useSession } from '@/store/session'
import { deliveryOptions } from '@/data/seed'
import { formatPrice } from '@/lib/format'
import { notify } from '@/store/notify'
import { EmptyState } from '@/components/EmptyState'

type PaymentMethod = 'card' | 'sbp' | 'cash' | 'sueta-coins'

const payments: { id: PaymentMethod; name: string; emoji: string; note: string }[] = [
  { id: 'card', name: 'Картой онлайн', emoji: '💳', note: 'Без 3-D Secure (тоже не настоящий)' },
  { id: 'sbp', name: 'СБП по QR', emoji: '📱', note: 'Сканируйте — и сами знаете' },
  { id: 'cash', name: 'Наличными при получении', emoji: '💵', note: 'У курьера сдачи никогда нет' },
  { id: 'sueta-coins', name: 'СуетаКоинами', emoji: '🪙', note: 'Курс: 1 коин = много суеты' },
]

export default function CheckoutPage() {
  const navigate = useNavigate()
  const items = useCart((s) => s.items)
  const clearCart = useCart((s) => s.clear)
  const products = useCatalog((s) => s.products)
  const userId = useSession((s) => s.userId)
  const users = useCatalog((s) => s.users)
  const me = users.find((u) => u.id === userId)
  const addOrder = useOrders((s) => s.add)

  const detailed = items
    .map((i) => ({ ...i, product: products.find((p) => p.id === i.productId) }))
    .filter((i) => i.product)

  const subtotal = detailed.reduce((a, i) => a + (i.product!.price * i.qty), 0)

  const [delivery, setDelivery] = useState(deliveryOptions[1])
  const [payment, setPayment] = useState<PaymentMethod>('card')
  const [name, setName] = useState(me?.name ?? '')
  const [email, setEmail] = useState(me?.email ?? '')
  const [phone, setPhone] = useState(me?.phone ?? '')
  const [address, setAddress] = useState(me?.address ?? 'Москва, ул. Суетная, 1')
  const [agreed, setAgreed] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const total = useMemo(() => subtotal + delivery.price, [subtotal, delivery])

  if (detailed.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState
          emoji="🧐"
          title="Сначала положите что-нибудь в корзину"
          action={<Link to="/c" className="btn-primary">К каталогу</Link>}
        />
      </div>
    )
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim() || !address.trim()) {
      notify.warn('Заполните контактные данные')
      return
    }
    if (!agreed) {
      notify.warn('Согласитесь с условиями (мы тоже не в восторге, но надо)')
      return
    }
    setSubmitting(true)
    setTimeout(() => {
      const order = addOrder({
        userId: me?.id ?? 'guest',
        items: detailed.map((d) => ({
          productId: d.product!.id,
          title: d.product!.title,
          price: d.product!.price,
          qty: d.qty,
          image: d.product!.image,
        })),
        total,
        delivery,
        address,
        payment,
        status: 'paid',
      })
      clearCart()
      notify.success('Заказ оформлен!', `Номер ${order.id}. Курьер уже надевает шапку.`)
      navigate(`/order/${order.id}`)
    }, 700)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Оформление заказа</h1>
      <p className="mt-1 text-sm text-slate-500">
        Никакие реальные платежи здесь не проходят. Проходит только настроение.
      </p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <section className="card space-y-3 p-4">
            <h2 className="text-lg font-semibold text-slate-900">1. Контакты</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="co-name">Имя</label>
                <input id="co-name" className="input" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <label className="label" htmlFor="co-phone">Телефон</label>
                <input id="co-phone" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="co-email">Email</label>
                <input id="co-email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
          </section>

          <section className="card space-y-3 p-4">
            <h2 className="text-lg font-semibold text-slate-900">2. Доставка</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {deliveryOptions.map((d) => (
                <label
                  key={d.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                    delivery.id === d.id
                      ? 'border-sueta-500 bg-sueta-50/60 ring-1 ring-sueta-200'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    className="mt-1 h-4 w-4 text-sueta-600 focus:ring-sueta-500"
                    checked={delivery.id === d.id}
                    onChange={() => setDelivery(d)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{d.emoji}</span>
                      <div className="text-sm font-semibold text-slate-900">{d.name}</div>
                    </div>
                    <div className="text-xs text-slate-500">{d.description}</div>
                    <div className="mt-1 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Доставка: {d.eta}</span>
                      <span className="font-semibold text-slate-900">
                        {d.price === 0 ? 'бесплатно' : formatPrice(d.price)}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <div>
              <label className="label" htmlFor="co-address">Адрес</label>
              <input
                id="co-address"
                className="input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Город, улица, дом, квартира…"
                required
              />
            </div>
          </section>

          <section className="card space-y-3 p-4">
            <h2 className="text-lg font-semibold text-slate-900">3. Оплата</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {payments.map((p) => (
                <label
                  key={p.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                    payment === p.id
                      ? 'border-sueta-500 bg-sueta-50/60 ring-1 ring-sueta-200'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    className="mt-1 h-4 w-4 text-sueta-600 focus:ring-sueta-500"
                    checked={payment === p.id}
                    onChange={() => setPayment(p.id)}
                  />
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <span className="text-lg">{p.emoji}</span> {p.name}
                    </div>
                    <div className="text-xs text-slate-500">{p.note}</div>
                  </div>
                </label>
              ))}
            </div>
          </section>
        </div>

        <aside>
          <div className="card sticky top-24 space-y-3 p-4">
            <h2 className="text-lg font-semibold text-slate-900">Ваш заказ</h2>
            <ul className="max-h-64 space-y-2 overflow-y-auto pr-1 text-sm">
              {detailed.map(({ product, qty }) => (
                <li key={product!.id} className="flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-md bg-slate-50">
                    <img src={product!.image} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-1 text-slate-900">{product!.title}</div>
                    <div className="text-xs text-slate-500">{qty} × {formatPrice(product!.price)}</div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-1 border-t border-slate-100 pt-3 text-sm">
              <div className="flex justify-between"><span>Товары</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between">
                <span>Доставка ({delivery.name.split(' ')[0]})</span>
                <span>{delivery.price === 0 ? 'бесплатно' : formatPrice(delivery.price)}</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between border-t border-slate-100 pt-2">
                <span>Итого</span>
                <span className="text-2xl font-extrabold text-slate-900">{formatPrice(total)}</span>
              </div>
            </div>
            <label className="flex cursor-pointer items-start gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sueta-600 focus:ring-sueta-500"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              Согласен(на) на обработку и получение остроумных уведомлений.
            </label>
            <button type="submit" className="btn-primary w-full justify-center" disabled={submitting}>
              {submitting ? 'Оформляем…' : 'Подтвердить заказ'}
            </button>
            <Link to="/cart" className="btn-ghost w-full justify-center">Назад в корзину</Link>
          </div>
        </aside>
      </form>
    </div>
  )
}
