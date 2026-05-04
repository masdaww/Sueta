import { useMemo, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { categories } from '@/data/seed'
import { useCatalog } from '@/store/catalog'
import { CategoryStrip } from '@/components/CategoryStrip'
import { ProductCard } from '@/components/ProductCard'
import { EmptyState } from '@/components/EmptyState'
import { formatPrice } from '@/lib/format'

type SortKey = 'popular' | 'price-asc' | 'price-desc' | 'rating' | 'new' | 'discount'

export default function CatalogPage() {
  const { categoryId } = useParams()
  const [params, setParams] = useSearchParams()
  const products = useCatalog((s) => s.products)
  const reviews = useCatalog((s) => s.reviews)

  const q = params.get('q') ?? ''
  const sort = (params.get('sort') as SortKey) ?? 'popular'
  const minP = Number(params.get('min') ?? 0)
  const maxP = Number(params.get('max') ?? 0)
  const onlyDiscount = params.get('discount') === '1'
  const inStock = params.get('stock') === '1'

  const [showFilters, setShowFilters] = useState(false)

  const cat = categoryId ? categories.find((c) => c.id === categoryId) : undefined
  const allBrands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand))).sort(),
    [products],
  )
  const activeBrands = (params.get('brand') ?? '').split(',').filter(Boolean)

  const filtered = useMemo(() => {
    let list = products.slice()
    if (categoryId) list = list.filter((p) => p.categoryId === categoryId)
    if (q.trim()) {
      const lc = q.trim().toLowerCase()
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(lc) ||
          p.description.toLowerCase().includes(lc) ||
          p.brand.toLowerCase().includes(lc),
      )
    }
    if (activeBrands.length) list = list.filter((p) => activeBrands.includes(p.brand))
    if (minP > 0) list = list.filter((p) => p.price >= minP)
    if (maxP > 0) list = list.filter((p) => p.price <= maxP)
    if (onlyDiscount) list = list.filter((p) => p.oldPrice && p.oldPrice > p.price)
    if (inStock) list = list.filter((p) => p.stock > 0)

    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        list.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        list.sort((a, b) => b.rating - a.rating)
        break
      case 'new':
        list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        break
      case 'discount':
        list.sort((a, b) => discountPct(b) - discountPct(a))
        break
      default:
        list.sort((a, b) => b.reviewsCount - a.reviewsCount)
    }
    return list
  }, [products, categoryId, q, activeBrands, minP, maxP, onlyDiscount, inStock, sort])

  const updateParam = (k: string, v: string | null) => {
    const next = new URLSearchParams(params)
    if (v == null || v === '') next.delete(k)
    else next.set(k, v)
    setParams(next, { replace: true })
  }

  const toggleBrand = (brand: string) => {
    const next = activeBrands.includes(brand)
      ? activeBrands.filter((b) => b !== brand)
      : [...activeBrands, brand]
    updateParam('brand', next.join(','))
  }

  const priceRange = useMemo(() => {
    if (!products.length) return [0, 0]
    return [Math.min(...products.map((p) => p.price)), Math.max(...products.map((p) => p.price))]
  }, [products])

  const recommended = useMemo(() => {
    const popularReviewed = reviews.reduce<Record<string, number>>((acc, r) => {
      acc[r.productId] = (acc[r.productId] ?? 0) + 1
      return acc
    }, {})
    return [...products]
      .sort((a, b) => (popularReviewed[b.id] ?? 0) - (popularReviewed[a.id] ?? 0))
      .slice(0, 4)
  }, [products, reviews])

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <nav className="mb-3 flex flex-wrap items-center gap-1 text-xs text-slate-500">
        <Link to="/" className="hover:text-sueta-700">Главная</Link>
        <span>/</span>
        <Link to="/c" className="hover:text-sueta-700">Каталог</Link>
        {cat && (
          <>
            <span>/</span>
            <span className="text-slate-700">{cat.name}</span>
          </>
        )}
      </nav>

      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
        {cat ? `${cat.emoji} ${cat.name}` : 'Каталог'}
      </h1>
      {cat && <p className="mt-1 text-sm text-slate-500">{cat.tagline}</p>}

      <div className="mt-4">
        <CategoryStrip activeId={categoryId} />
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block lg:w-64 lg:shrink-0`}>
          <div className="card space-y-5 p-4">
            <div>
              <div className="label">Поиск</div>
              <input
                value={q}
                onChange={(e) => updateParam('q', e.target.value)}
                placeholder="Что ищем?"
                className="input"
                type="search"
              />
            </div>

            <div>
              <div className="label">Цена, ₽</div>
              <div className="text-xs text-slate-400">
                {formatPrice(priceRange[0])} – {formatPrice(priceRange[1])}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input
                  type="number"
                  className="input"
                  placeholder="от"
                  value={minP || ''}
                  onChange={(e) => updateParam('min', e.target.value)}
                />
                <input
                  type="number"
                  className="input"
                  placeholder="до"
                  value={maxP || ''}
                  onChange={(e) => updateParam('max', e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="label">Бренд</div>
              <div className="space-y-1">
                {allBrands.map((b) => (
                  <label key={b} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-sueta-600 focus:ring-sueta-500"
                      checked={activeBrands.includes(b)}
                      onChange={() => toggleBrand(b)}
                    />
                    {b}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-sueta-600 focus:ring-sueta-500"
                  checked={onlyDiscount}
                  onChange={(e) => updateParam('discount', e.target.checked ? '1' : null)}
                />
                Только со скидкой
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-sueta-600 focus:ring-sueta-500"
                  checked={inStock}
                  onChange={(e) => updateParam('stock', e.target.checked ? '1' : null)}
                />
                В наличии
              </label>
            </div>

            <button
              type="button"
              className="btn-ghost w-full justify-center"
              onClick={() => setParams(new URLSearchParams(), { replace: true })}
            >
              Сбросить фильтры
            </button>
          </div>
        </aside>

        <div className="flex-1">
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              className="btn-secondary lg:hidden"
              onClick={() => setShowFilters((v) => !v)}
            >
              {showFilters ? 'Скрыть фильтры' : 'Фильтры'}
            </button>
            <div className="text-sm text-slate-500">Найдено: {filtered.length}</div>
            <select
              className="input h-9 w-auto"
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
            >
              <option value="popular">по популярности</option>
              <option value="rating">по рейтингу</option>
              <option value="price-asc">сначала дешевле</option>
              <option value="price-desc">сначала дороже</option>
              <option value="new">новинки</option>
              <option value="discount">скидка</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              emoji="🕵️"
              title="Ничего не найдено"
              description="Попробуйте другой запрос или сбросьте фильтры. Или просто отдохните, мы тоже."
              action={
                <button
                  className="btn-primary"
                  onClick={() => setParams(new URLSearchParams(), { replace: true })}
                >
                  Сбросить фильтры
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {filtered.length > 0 && (
            <section className="mt-12">
              <h2 className="mb-3 text-lg font-bold text-slate-900">Вам может понравиться</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {recommended.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

function discountPct(p: { price: number; oldPrice?: number }) {
  if (!p.oldPrice || p.oldPrice <= p.price) return 0
  return ((p.oldPrice - p.price) / p.oldPrice) * 100
}
