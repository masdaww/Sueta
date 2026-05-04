import { Link } from 'react-router-dom'
import { categories } from '@/data/seed'
import { useCatalog } from '@/store/catalog'
import { ProductCard } from '@/components/ProductCard'

export default function HomePage() {
  const products = useCatalog((s) => s.products)

  const popular = [...products].sort((a, b) => b.reviewsCount - a.reviewsCount).slice(0, 8)
  const fresh = [...products].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 4)
  const discounted = products.filter((p) => p.oldPrice && p.oldPrice > p.price).slice(0, 4)

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-6 sm:py-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-sueta-600 via-sueta-500 to-fuchsia-500 px-6 py-10 text-white shadow-card sm:px-12 sm:py-14">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              🐸 Чёрная пятница на дне рождения у бабушки
            </span>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-5xl">
              Покупайте то, что вам не нужно — со скидкой до 73%
            </h1>
            <p className="mt-3 text-sm text-white/85 sm:text-base">
              Каждый день — новые категории, шуточные товары, серьёзная корзина и абсолютно настоящий курьер на самокате.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/c" className="btn-secondary !bg-white !text-slate-900 hover:!bg-slate-100">
                Перейти в каталог
              </Link>
              <Link to="/c?q=мем" className="btn-ghost !text-white hover:!bg-white/10">
                Посмотреть мемы →
              </Link>
            </div>
          </div>
          <div className="hidden items-center gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur sm:flex">
            <div className="text-5xl">🛒</div>
            <div>
              <div className="text-xs uppercase tracking-wide text-white/70">Сегодня в чате поддержки</div>
              <div className="text-sm font-semibold">Барбара отвечает за 11 минут</div>
              <div className="mt-1 text-xs text-white/70">(вчера было 9 часов)</div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-slate-900 sm:text-2xl">Категории</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/c/${c.id}`}
              className="group flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-sueta-50 text-2xl">
                {c.emoji}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900 group-hover:text-sueta-700">{c.name}</div>
                <div className="line-clamp-2 text-xs text-slate-500">{c.tagline}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Популярное у соседей</h2>
          <Link to="/c" className="text-sm font-medium text-sueta-700 hover:underline">все →</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {popular.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-gradient-to-br from-amber-100 to-rose-100 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Скидки, потому что мы тоже устали</h3>
            <Link to="/c?sort=discount" className="text-sm font-medium text-rose-700 hover:underline">все →</Link>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {discounted.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-100 to-sky-100 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Новинки прямо с дивана</h3>
            <Link to="/c?sort=new" className="text-sm font-medium text-emerald-700 hover:underline">все →</Link>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {fresh.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
