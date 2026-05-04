import { useState, useMemo } from 'react'
import { Link, NavLink, Routes, Route, Navigate } from 'react-router-dom'
import { useCatalog } from '@/store/catalog'
import { useOrders } from '@/store/orders'
import { useSession } from '@/store/session'
import { categories } from '@/data/seed'
import { Modal } from '@/components/Modal'
import { confirm } from '@/components/confirm'
import { notify } from '@/store/notify'
import { Rating } from '@/components/Rating'
import { EmptyState } from '@/components/EmptyState'
import { formatDate, formatDateTime, formatPrice, orderStatusLabel } from '@/lib/format'
import type { Product, Review, User } from '@/lib/types'

export default function AdminPage() {
  const userId = useSession((s) => s.userId)
  const isAdminMode = useSession((s) => s.isAdminMode)
  const setAdminMode = useSession((s) => s.setAdminMode)
  const users = useCatalog((s) => s.users)
  const me = users.find((u) => u.id === userId)
  const isAdmin = me?.role === 'admin' || isAdminMode

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState
          emoji="🛡️"
          title="Доступ только для админов"
          description="В пародийном режиме можно зайти за админа в один клик."
          action={
            <button
              className="btn-primary"
              onClick={() => {
                setAdminMode(true)
                notify.success('Вы — админ-пародия', 'Все действия — это симуляция.')
              }}
            >
              Войти как админ (демо)
            </button>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">🛠️ Админка</h1>
        <Link to="/" className="btn-ghost">← К магазину</Link>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Здесь можно управлять товарами, пользователями, отзывами и смотреть статистику. Все изменения хранятся локально.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="card p-2">
          <ul className="space-y-1">
            {[
              { to: '/admin', label: 'Дашборд', emoji: '📊', end: true },
              { to: '/admin/products', label: 'Товары', emoji: '📦' },
              { to: '/admin/users', label: 'Пользователи', emoji: '👥' },
              { to: '/admin/reviews', label: 'Модерация', emoji: '✉️' },
              { to: '/admin/orders', label: 'Заказы', emoji: '🧾' },
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

        <div>
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductsAdmin />} />
            <Route path="users" element={<UsersAdmin />} />
            <Route path="reviews" element={<ReviewsAdmin />} />
            <Route path="orders" element={<OrdersAdmin />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

function Dashboard() {
  const products = useCatalog((s) => s.products)
  const users = useCatalog((s) => s.users)
  const reviews = useCatalog((s) => s.reviews)
  const orders = useOrders((s) => s.orders)
  const resetSeed = useCatalog((s) => s.resetSeed)

  const revenue = orders.filter((o) => o.status !== 'cancelled').reduce((a, o) => a + o.total, 0)
  const pendingReviews = reviews.filter((r) => r.status === 'pending').length
  const blockedUsers = users.filter((u) => u.blocked).length

  const popularProducts = useMemo(() => {
    const sales: Record<string, number> = {}
    orders.forEach((o) => {
      if (o.status === 'cancelled') return
      o.items.forEach((it) => {
        sales[it.productId] = (sales[it.productId] ?? 0) + it.qty
      })
    })
    const list = Object.entries(sales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, qty]) => ({ product: products.find((p) => p.id === id), qty }))
      .filter((x) => x.product)
    if (list.length) return list
    return [...products].sort((a, b) => b.reviewsCount - a.reviewsCount).slice(0, 5).map((p) => ({ product: p, qty: p.reviewsCount }))
  }, [orders, products])

  const last7 = useMemo(() => {
    const days: { d: string; total: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const ds = date.toISOString().slice(0, 10)
      const total = orders
        .filter((o) => o.status !== 'cancelled' && o.createdAt.slice(0, 10) === ds)
        .reduce((a, o) => a + o.total, 0)
      days.push({ d: ds, total })
    }
    return days
  }, [orders])

  const maxDay = Math.max(1, ...last7.map((d) => d.total))

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat title="Выручка" value={formatPrice(revenue)} emoji="💰" />
        <Stat title="Заказов" value={orders.length.toString()} emoji="🧾" />
        <Stat title="Товаров" value={products.length.toString()} emoji="📦" />
        <Stat title="Пользователей" value={`${users.length} (${blockedUsers} в блоке)`} emoji="👥" />
      </div>

      <section className="card p-5">
        <h2 className="text-lg font-semibold text-slate-900">Продажи за последние 7 дней</h2>
        <div className="mt-3 flex items-end gap-2 sm:gap-3">
          {last7.map((d) => (
            <div key={d.d} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-32 w-full items-end">
                <div
                  className="w-full rounded-md bg-gradient-to-t from-sueta-200 to-sueta-600"
                  style={{ height: `${Math.max(6, (d.total / maxDay) * 100)}%` }}
                  title={formatPrice(d.total)}
                />
              </div>
              <div className="text-[10px] text-slate-500">{d.d.slice(5)}</div>
              <div className="text-[10px] font-medium text-slate-700">{d.total ? formatPrice(d.total) : '—'}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="text-lg font-semibold text-slate-900">Топ товаров</h2>
          <ul className="mt-3 space-y-2">
            {popularProducts.map(({ product, qty }) => (
              <li key={product!.id} className="flex items-center gap-3">
                <img src={product!.image} alt="" className="h-10 w-10 rounded-md object-cover" />
                <div className="flex-1 text-sm">
                  <div className="line-clamp-1 font-medium text-slate-900">{product!.title}</div>
                  <div className="text-xs text-slate-500">{formatPrice(product!.price)}</div>
                </div>
                <span className="chip">×{qty}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="card p-5">
          <h2 className="text-lg font-semibold text-slate-900">Активность</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>📝 Отзывов на модерации: <span className="font-semibold">{pendingReviews}</span></li>
            <li>🚫 Заблокированных пользователей: <span className="font-semibold">{blockedUsers}</span></li>
            <li>🆕 Последний пользователь: <span className="font-semibold">{users[0]?.name ?? '—'}</span></li>
            <li>📦 Последний заказ: <span className="font-semibold">{orders[0]?.id ?? 'пока нет'}</span></li>
          </ul>
          <button
            className="btn-secondary mt-4"
            onClick={async () => {
              if (await confirm({ title: 'Сбросить демо-данные?', message: 'Товары, пользователи и отзывы вернутся к исходным.', danger: true, confirmText: 'Сбросить' })) {
                resetSeed()
                notify.info('Демо-данные сброшены')
              }
            }}
          >
            Сбросить демо-данные
          </button>
        </section>
      </div>
    </div>
  )
}

function Stat({ title, value, emoji }: { title: string; value: string; emoji: string }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-sueta-50 text-xl">{emoji}</div>
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-500">{title}</div>
        <div className="text-lg font-extrabold text-slate-900">{value}</div>
      </div>
    </div>
  )
}

const emptyProductDraft: Omit<Product, 'id' | 'createdAt'> = {
  title: '',
  brand: 'СуетаДом',
  description: '',
  price: 990,
  oldPrice: undefined,
  rating: 5,
  reviewsCount: 0,
  categoryId: categories[0].id,
  image: 'https://picsum.photos/seed/new/640/640',
  badges: ['Новинка'],
  stock: 10,
}

function ProductsAdmin() {
  const products = useCatalog((s) => s.products)
  const addProduct = useCatalog((s) => s.addProduct)
  const updateProduct = useCatalog((s) => s.updateProduct)
  const deleteProduct = useCatalog((s) => s.deleteProduct)

  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<{ id?: string; data: typeof emptyProductDraft } | null>(null)

  const filtered = products.filter((p) =>
    !q.trim() || p.title.toLowerCase().includes(q.toLowerCase()) || p.brand.toLowerCase().includes(q.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          className="input flex-1"
          placeholder="Поиск по названию или бренду…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          className="btn-primary"
          onClick={() => setEditing({ data: { ...emptyProductDraft } })}
        >
          + Добавить товар
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-3 py-2">Товар</th>
              <th className="px-3 py-2">Категория</th>
              <th className="px-3 py-2">Цена</th>
              <th className="px-3 py-2">Остаток</th>
              <th className="px-3 py-2 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const cat = categories.find((c) => c.id === p.categoryId)
              return (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt="" className="h-10 w-10 rounded-md object-cover" />
                      <div>
                        <div className="line-clamp-1 font-medium text-slate-900">{p.title}</div>
                        <div className="text-xs text-slate-500">{p.brand}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-slate-600">{cat?.name ?? p.categoryId}</td>
                  <td className="px-3 py-2 font-semibold">{formatPrice(p.price)}</td>
                  <td className="px-3 py-2">{p.stock}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      className="btn-ghost text-xs"
                      onClick={() => setEditing({ id: p.id, data: { ...p } })}
                    >
                      Изм.
                    </button>
                    <button
                      className="btn-ghost text-xs text-rose-600 hover:!bg-rose-50"
                      onClick={async () => {
                        if (await confirm({ title: 'Удалить товар?', message: p.title, danger: true, confirmText: 'Удалить' })) {
                          deleteProduct(p.id)
                          notify.info('Товар удалён', p.title)
                        }
                      }}
                    >
                      Удал.
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="p-6 text-center text-sm text-slate-500">Ничего не нашли.</div>}
      </div>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Редактировать товар' : 'Новый товар'}
        size="lg"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setEditing(null)}>Отмена</button>
            <button
              className="btn-primary"
              onClick={() => {
                if (!editing) return
                if (!editing.data.title.trim()) {
                  notify.warn('Введите название')
                  return
                }
                if (editing.id) {
                  updateProduct(editing.id, editing.data)
                  notify.success('Товар сохранён')
                } else {
                  addProduct(editing.data)
                  notify.success('Товар добавлен')
                }
                setEditing(null)
              }}
            >
              Сохранить
            </button>
          </>
        }
      >
        {editing && (
          <ProductForm
            value={editing.data}
            onChange={(data) => setEditing((e) => (e ? { ...e, data } : e))}
          />
        )}
      </Modal>
    </div>
  )
}

function ProductForm({
  value,
  onChange,
}: {
  value: typeof emptyProductDraft
  onChange: (v: typeof emptyProductDraft) => void
}) {
  const set = (patch: Partial<typeof emptyProductDraft>) => onChange({ ...value, ...patch })
  const badges = value.badges.join(', ')

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2"><label className="label">Название</label><input className="input" value={value.title} onChange={(e) => set({ title: e.target.value })} /></div>
      <div><label className="label">Бренд</label><input className="input" value={value.brand} onChange={(e) => set({ brand: e.target.value })} /></div>
      <div>
        <label className="label">Категория</label>
        <select className="input" value={value.categoryId} onChange={(e) => set({ categoryId: e.target.value })}>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div><label className="label">Цена, ₽</label><input className="input" type="number" value={value.price} onChange={(e) => set({ price: Number(e.target.value) || 0 })} /></div>
      <div><label className="label">Старая цена, ₽</label><input className="input" type="number" value={value.oldPrice ?? ''} onChange={(e) => set({ oldPrice: e.target.value ? Number(e.target.value) : undefined })} /></div>
      <div><label className="label">Остаток, шт.</label><input className="input" type="number" value={value.stock} onChange={(e) => set({ stock: Number(e.target.value) || 0 })} /></div>
      <div><label className="label">Рейтинг</label><input className="input" type="number" min={0} max={5} step={0.1} value={value.rating} onChange={(e) => set({ rating: Number(e.target.value) || 0 })} /></div>
      <div className="sm:col-span-2"><label className="label">Изображение (URL)</label>
        <div className="flex gap-2">
          <input className="input" value={value.image} onChange={(e) => set({ image: e.target.value })} />
          <img src={value.image} alt="" className="h-10 w-10 rounded-md object-cover ring-1 ring-slate-200" />
        </div>
        <p className="mt-1 text-xs text-slate-500">Можно вставить любой URL — мы поверим.</p>
      </div>
      <div className="sm:col-span-2"><label className="label">Бэйджи (через запятую)</label>
        <input className="input" value={badges} onChange={(e) => set({ badges: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
      </div>
      <div className="sm:col-span-2"><label className="label">Описание</label>
        <textarea className="input min-h-24" value={value.description} onChange={(e) => set({ description: e.target.value })} />
      </div>
    </div>
  )
}

function UsersAdmin() {
  const users = useCatalog((s) => s.users)
  const addUser = useCatalog((s) => s.addUser)
  const updateUser = useCatalog((s) => s.updateUser)
  const deleteUser = useCatalog((s) => s.deleteUser)
  const toggleBlock = useCatalog((s) => s.toggleBlockUser)

  const [editing, setEditing] = useState<{ id?: string; data: Omit<User, 'id' | 'createdAt'> } | null>(null)

  const newDraft: Omit<User, 'id' | 'createdAt'> = {
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    blocked: false,
    avatar: 'https://picsum.photos/seed/new-user/200/200',
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button className="btn-primary" onClick={() => setEditing({ data: { ...newDraft } })}>+ Новый пользователь</button>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-3 py-2">Пользователь</th>
              <th className="px-3 py-2">Роль</th>
              <th className="px-3 py-2">Создан</th>
              <th className="px-3 py-2">Статус</th>
              <th className="px-3 py-2 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-3">
                    <img src={u.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                    <div>
                      <div className="font-medium text-slate-900">{u.name}</div>
                      <div className="text-xs text-slate-500">{u.email} · {u.phone}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <span className={`chip ${u.role === 'admin' ? 'bg-violet-100 text-violet-700' : ''}`}>{u.role === 'admin' ? 'Админ' : 'Покупатель'}</span>
                </td>
                <td className="px-3 py-2 text-slate-600">{formatDate(u.createdAt)}</td>
                <td className="px-3 py-2">
                  <span className={`chip ${u.blocked ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {u.blocked ? 'Заблокирован' : 'Активен'}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <button className="btn-ghost text-xs" onClick={() => setEditing({ id: u.id, data: { ...u } })}>Изм.</button>
                  <button className="btn-ghost text-xs" onClick={() => { toggleBlock(u.id); notify.info(u.blocked ? 'Разблокирован' : 'Заблокирован', u.name) }}>
                    {u.blocked ? 'Разбл.' : 'Заблок.'}
                  </button>
                  <button
                    className="btn-ghost text-xs text-rose-600 hover:!bg-rose-50"
                    onClick={async () => {
                      if (await confirm({ title: 'Удалить пользователя?', message: u.name, danger: true, confirmText: 'Удалить' })) {
                        deleteUser(u.id)
                        notify.info('Пользователь удалён', u.name)
                      }
                    }}
                  >
                    Удал.
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Редактировать пользователя' : 'Новый пользователь'}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setEditing(null)}>Отмена</button>
            <button
              className="btn-primary"
              onClick={() => {
                if (!editing) return
                if (!editing.data.name.trim()) return notify.warn('Введите имя')
                if (editing.id) {
                  updateUser(editing.id, editing.data)
                  notify.success('Пользователь сохранён')
                } else {
                  addUser(editing.data)
                  notify.success('Пользователь добавлен')
                }
                setEditing(null)
              }}
            >
              Сохранить
            </button>
          </>
        }
      >
        {editing && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2"><label className="label">Имя</label><input className="input" value={editing.data.name} onChange={(e) => setEditing({ ...editing, data: { ...editing.data, name: e.target.value } })} /></div>
            <div><label className="label">Email</label><input className="input" value={editing.data.email} onChange={(e) => setEditing({ ...editing, data: { ...editing.data, email: e.target.value } })} /></div>
            <div><label className="label">Телефон</label><input className="input" value={editing.data.phone} onChange={(e) => setEditing({ ...editing, data: { ...editing.data, phone: e.target.value } })} /></div>
            <div>
              <label className="label">Роль</label>
              <select className="input" value={editing.data.role} onChange={(e) => setEditing({ ...editing, data: { ...editing.data, role: e.target.value as User['role'] } })}>
                <option value="customer">Покупатель</option>
                <option value="admin">Админ</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-sueta-600 focus:ring-sueta-500"
                  checked={editing.data.blocked}
                  onChange={(e) => setEditing({ ...editing, data: { ...editing.data, blocked: e.target.checked } })}
                />
                Заблокирован
              </label>
            </div>
            <div className="sm:col-span-2"><label className="label">Аватар (URL)</label><input className="input" value={editing.data.avatar} onChange={(e) => setEditing({ ...editing, data: { ...editing.data, avatar: e.target.value } })} /></div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function ReviewsAdmin() {
  const reviews = useCatalog((s) => s.reviews)
  const products = useCatalog((s) => s.products)
  const setStatus = useCatalog((s) => s.setReviewStatus)
  const deleteReview = useCatalog((s) => s.deleteReview)

  const [filter, setFilter] = useState<Review['status'] | 'all'>('pending')
  const list = filter === 'all' ? reviews : reviews.filter((r) => r.status === filter)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((s) => (
          <button
            key={s}
            className={`chip cursor-pointer ${filter === s ? 'bg-sueta-600 !text-white' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s === 'all' ? 'Все' : s === 'pending' ? 'На модерации' : s === 'approved' ? 'Одобренные' : 'Отклонённые'}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <EmptyState emoji="🧘" title="Тут пусто и спокойно" />
      ) : (
        <ul className="space-y-3">
          {list.map((r) => {
            const p = products.find((x) => x.id === r.productId)
            return (
              <li key={r.id} className="card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="text-xs text-slate-500">{formatDateTime(r.createdAt)}</div>
                    <div className="text-sm font-semibold text-slate-900">{r.userName} → {p?.title ?? r.productId}</div>
                    <Rating value={r.rating} />
                    <p className="mt-1 text-sm text-slate-700">{r.text}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="btn-secondary text-xs" onClick={() => { setStatus(r.id, 'approved'); notify.success('Одобрено') }}>Одобрить</button>
                    <button className="btn-ghost text-xs" onClick={() => { setStatus(r.id, 'rejected'); notify.info('Отклонено') }}>Отклонить</button>
                    <button
                      className="btn-ghost text-xs text-rose-600 hover:!bg-rose-50"
                      onClick={async () => {
                        if (await confirm({ title: 'Удалить отзыв?', danger: true, confirmText: 'Удалить' })) {
                          deleteReview(r.id)
                          notify.info('Отзыв удалён')
                        }
                      }}
                    >Удалить</button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function OrdersAdmin() {
  const orders = useOrders((s) => s.orders)
  const setStatus = useOrders((s) => s.setStatus)

  if (orders.length === 0) {
    return <EmptyState emoji="🧾" title="Заказов пока нет" description="Сделайте тестовый заказ через корзину." />
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="px-3 py-2">Заказ</th>
            <th className="px-3 py-2">Дата</th>
            <th className="px-3 py-2">Сумма</th>
            <th className="px-3 py-2">Статус</th>
            <th className="px-3 py-2 text-right">Действия</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-t border-slate-100">
              <td className="px-3 py-2 font-medium text-slate-900">{o.id}</td>
              <td className="px-3 py-2 text-slate-600">{formatDateTime(o.createdAt)}</td>
              <td className="px-3 py-2 font-semibold">{formatPrice(o.total)}</td>
              <td className="px-3 py-2">
                <select
                  className="input h-8 w-auto"
                  value={o.status}
                  onChange={(e) => { setStatus(o.id, e.target.value as Parameters<typeof setStatus>[1]); notify.info('Статус изменён') }}
                >
                  {Object.entries(orderStatusLabel).map(([k, label]) => (
                    <option key={k} value={k}>{label}</option>
                  ))}
                </select>
              </td>
              <td className="px-3 py-2 text-right">
                <Link className="btn-ghost text-xs" to={`/order/${o.id}/track`}>Открыть</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
