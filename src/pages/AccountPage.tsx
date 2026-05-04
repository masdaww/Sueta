import { useState } from 'react'
import { Link, NavLink, Routes, Route, Navigate } from 'react-router-dom'
import { useSession } from '@/store/session'
import { useCatalog } from '@/store/catalog'
import { useOrders } from '@/store/orders'
import { useWishlist } from '@/store/wishlist'
import { ProductCard } from '@/components/ProductCard'
import { Modal } from '@/components/Modal'
import { Rating } from '@/components/Rating'
import { confirm } from '@/components/confirm'
import { formatDateTime, formatPrice, orderStatusEmoji, orderStatusLabel } from '@/lib/format'
import { notify } from '@/store/notify'
import { EmptyState } from '@/components/EmptyState'

export default function AccountPage() {
  const userId = useSession((s) => s.userId)
  const users = useCatalog((s) => s.users)
  const me = users.find((u) => u.id === userId)

  if (!me) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState emoji="🔐" title="Войдите в кабинет" action={<Link to="/" className="btn-primary">На главную</Link>} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <header className="card flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center">
        <img src={me.avatar} alt="" className="h-16 w-16 rounded-full object-cover ring-2 ring-white" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Привет, {me.name.split(' ')[0]}!</h1>
          <p className="text-sm text-slate-500">{me.email} · {me.phone}</p>
        </div>
        {me.role === 'admin' && (
          <Link to="/admin" className="btn-secondary">Открыть админку</Link>
        )}
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="card p-2">
          <ul className="space-y-1">
            {[
              { to: '/account', label: 'Профиль', emoji: '👤', end: true },
              { to: '/account/orders', label: 'Мои заказы', emoji: '📦' },
              { to: '/account/wishlist', label: 'Избранное', emoji: '♥' },
              { to: '/account/reviews', label: 'Мои отзывы', emoji: '✍️' },
            ].map((it) => (
              <li key={it.to}>
                <NavLink
                  to={it.to}
                  end={it.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                      isActive ? 'bg-sueta-50 font-semibold text-sueta-700' : 'text-slate-700 hover:bg-slate-100'
                    }`
                  }
                >
                  <span className="text-base">{it.emoji}</span>
                  {it.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <Routes>
          <Route index element={<ProfileSection />} />
          <Route path="orders" element={<OrdersSection />} />
          <Route path="wishlist" element={<AccountWishlist />} />
          <Route path="reviews" element={<MyReviews />} />
          <Route path="*" element={<Navigate to="/account" replace />} />
        </Routes>
      </div>
    </div>
  )
}

function ProfileSection() {
  const userId = useSession((s) => s.userId)
  const users = useCatalog((s) => s.users)
  const updateUser = useCatalog((s) => s.updateUser)
  const me = users.find((u) => u.id === userId)!
  const [name, setName] = useState(me.name)
  const [email, setEmail] = useState(me.email)
  const [phone, setPhone] = useState(me.phone)
  const [address, setAddress] = useState(me.address ?? '')
  const [bio, setBio] = useState(me.bio ?? '')

  const onSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateUser(me.id, { name, email, phone, address, bio })
    notify.success('Профиль сохранён')
  }

  return (
    <form onSubmit={onSave} className="card space-y-3 p-5">
      <h2 className="text-lg font-semibold text-slate-900">Личные данные</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><label className="label" htmlFor="pf-name">Имя</label><input id="pf-name" className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><label className="label" htmlFor="pf-email">Email</label><input id="pf-email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><label className="label" htmlFor="pf-phone">Телефон</label><input id="pf-phone" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
        <div><label className="label" htmlFor="pf-address">Адрес доставки</label><input id="pf-address" className="input" value={address} onChange={(e) => setAddress(e.target.value)} /></div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="pf-bio">О себе</label>
          <textarea id="pf-bio" className="input min-h-20" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Покупатель года 2024 в номинации «Только посмотреть»" />
        </div>
      </div>
      <div className="flex justify-end">
        <button className="btn-primary" type="submit">Сохранить</button>
      </div>
    </form>
  )
}

function OrdersSection() {
  const userId = useSession((s) => s.userId)
  const orders = useOrders((s) => s.orders.filter((o) => o.userId === userId))
  const setStatus = useOrders((s) => s.setStatus)

  if (orders.length === 0) {
    return (
      <EmptyState
        emoji="📦"
        title="Заказов пока нет"
        description="Самое время потратить чужие деньги. Шутка. Свои."
        action={<Link to="/c" className="btn-primary">К каталогу</Link>}
      />
    )
  }

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <article key={o.id} className="card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-sm font-semibold text-slate-900">Заказ {o.id}</div>
              <div className="text-xs text-slate-500">{formatDateTime(o.createdAt)}</div>
            </div>
            <span className={`chip ${o.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : o.status === 'cancelled' ? 'bg-rose-100 text-rose-700' : 'bg-sueta-50 text-sueta-700'}`}>
              {orderStatusEmoji[o.status]} {orderStatusLabel[o.status]}
            </span>
          </div>

          <ul className="mt-3 divide-y divide-slate-100">
            {o.items.slice(0, 3).map((it) => (
              <li key={it.productId} className="flex items-center gap-3 py-2">
                <img src={it.image} alt="" className="h-12 w-12 rounded-md object-cover" />
                <div className="flex-1 text-sm">
                  <Link to={`/p/${it.productId}`} className="line-clamp-1 font-medium text-slate-900 hover:text-sueta-700">{it.title}</Link>
                  <div className="text-xs text-slate-500">{it.qty} × {formatPrice(it.price)}</div>
                </div>
              </li>
            ))}
            {o.items.length > 3 && (
              <li className="py-2 text-xs text-slate-500">и ещё {o.items.length - 3}…</li>
            )}
          </ul>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-sm">
            <div className="text-slate-500">{o.delivery.emoji} {o.delivery.name}</div>
            <div className="text-base font-extrabold text-slate-900">{formatPrice(o.total)}</div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to={`/order/${o.id}/track`} className="btn-secondary">Отследить</Link>
            {o.status !== 'cancelled' && o.status !== 'delivered' && (
              <button
                className="btn-ghost text-rose-600 hover:!bg-rose-50"
                onClick={async () => {
                  if (await confirm({ title: 'Отменить заказ?', confirmText: 'Отменить', danger: true })) {
                    setStatus(o.id, 'cancelled')
                    notify.warn('Заказ отменён')
                  }
                }}
              >
                Отменить
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}

function AccountWishlist() {
  const ids = useWishlist((s) => s.ids)
  const products = useCatalog((s) => s.products)
  const list = ids.map((id) => products.find((p) => p.id === id)).filter(Boolean) as typeof products

  if (list.length === 0) {
    return (
      <EmptyState
        emoji="♡"
        title="В избранном пусто"
        action={<Link to="/c" className="btn-primary">К каталогу</Link>}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}

function MyReviews() {
  const userId = useSession((s) => s.userId)
  const reviews = useCatalog((s) => s.reviews.filter((r) => r.userId === userId))
  const products = useCatalog((s) => s.products)
  const deleteReview = useCatalog((s) => s.deleteReview)
  const updateReview = useCatalog((s) => s.setReviewStatus)
  const addReview = useCatalog((s) => s.addReview)
  const users = useCatalog((s) => s.users)
  const me = users.find((u) => u.id === userId)
  const [open, setOpen] = useState(false)
  const [productId, setProductId] = useState(products[0]?.id ?? '')
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!me) return
    if (!text.trim()) return notify.warn('Напишите хоть что-то')
    addReview({ productId, userId: me.id, userName: me.name, rating, text: text.trim() })
    notify.success('Отзыв отправлен на модерацию')
    setOpen(false)
    setText('')
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Мои отзывы</h2>
        <button className="btn-primary" onClick={() => setOpen(true)}>Написать</button>
      </div>

      {reviews.length === 0 ? (
        <EmptyState emoji="✍️" title="Пока ни одного отзыва" />
      ) : (
        <ul className="space-y-2">
          {reviews.map((r) => {
            const p = products.find((x) => x.id === r.productId)
            const statusColor =
              r.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
              r.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
              'bg-amber-100 text-amber-800'
            return (
              <li key={r.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <Link to={`/p/${r.productId}`} className="line-clamp-1 text-sm font-semibold text-slate-900 hover:text-sueta-700">
                      {p?.title ?? r.productId}
                    </Link>
                    <Rating value={r.rating} />
                    <p className="mt-1 text-sm text-slate-700">{r.text}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`chip ${statusColor}`}>{r.status === 'approved' ? 'Опубликован' : r.status === 'rejected' ? 'Отклонён' : 'На модерации'}</span>
                    <div className="flex gap-1">
                      {r.status !== 'approved' && (
                        <button className="btn-ghost text-xs" onClick={() => updateReview(r.id, 'approved')}>Опубликовать (демо)</button>
                      )}
                      <button
                        className="btn-ghost text-rose-600 hover:!bg-rose-50 text-xs"
                        onClick={async () => {
                          if (await confirm({ title: 'Удалить отзыв?', danger: true, confirmText: 'Удалить' })) {
                            deleteReview(r.id)
                            notify.info('Отзыв удалён')
                          }
                        }}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Новый отзыв"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setOpen(false)}>Отмена</button>
            <button className="btn-primary" form="my-review-form" type="submit">Отправить</button>
          </>
        }
      >
        <form id="my-review-form" className="space-y-3" onSubmit={submit}>
          <div>
            <label className="label" htmlFor="r-prod">Товар</label>
            <select id="r-prod" className="input" value={productId} onChange={(e) => setProductId(e.target.value)}>
              {products.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          <div>
            <div className="label">Оценка</div>
            <Rating value={rating} size="lg" onChange={setRating} />
          </div>
          <div>
            <label className="label" htmlFor="r-text">Текст</label>
            <textarea id="r-text" className="input min-h-24" value={text} onChange={(e) => setText(e.target.value)} />
          </div>
        </form>
      </Modal>
    </div>
  )
}
