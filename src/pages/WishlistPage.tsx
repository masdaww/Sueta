import { Link } from 'react-router-dom'
import { useWishlist } from '@/store/wishlist'
import { useCatalog } from '@/store/catalog'
import { ProductCard } from '@/components/ProductCard'
import { EmptyState } from '@/components/EmptyState'

export default function WishlistPage() {
  const ids = useWishlist((s) => s.ids)
  const products = useCatalog((s) => s.products)
  const list = ids.map((id) => products.find((p) => p.id === id)).filter(Boolean) as typeof products

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Избранное</h1>
      <p className="mt-1 text-sm text-slate-500">Товары, которые вы пока не решили купить, но уже эмоционально привязались.</p>

      {list.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            emoji="💔"
            title="Пока пусто"
            description="Добавляйте товары, нажимая на сердечко. Сердечкам приятно."
            action={<Link to="/c" className="btn-primary">Перейти в каталог</Link>}
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
