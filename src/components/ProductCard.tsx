import { Link } from 'react-router-dom'
import type { Product } from '@/lib/types'
import { formatPrice } from '@/lib/format'
import { Rating } from './Rating'
import { useCart } from '@/store/cart'
import { useWishlist } from '@/store/wishlist'
import { notify } from '@/store/notify'

const badgeColor: Record<string, string> = {
  Хит: 'bg-rose-100 text-rose-700',
  'Топ продаж': 'bg-rose-100 text-rose-700',
  Топ: 'bg-rose-100 text-rose-700',
  Скидка: 'bg-amber-100 text-amber-800',
  Новинка: 'bg-emerald-100 text-emerald-700',
  Эксклюзив: 'bg-violet-100 text-violet-700',
  Любимое: 'bg-pink-100 text-pink-700',
  Кэшбек: 'bg-sky-100 text-sky-700',
  Эко: 'bg-emerald-100 text-emerald-700',
  'Хит мемов': 'bg-fuchsia-100 text-fuchsia-700',
  'Бестселлер мотивации': 'bg-indigo-100 text-indigo-700',
}

export function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add)
  const toggleWish = useWishlist((s) => s.toggle)
  const inWishlist = useWishlist((s) => s.ids.includes(product.id))

  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-card transition hover:shadow-md">
      <Link to={`/p/${product.id}`} className="relative aspect-square overflow-hidden bg-slate-50">
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        {discount > 0 && (
          <span className="absolute left-2 top-2 rounded-md bg-rose-600 px-1.5 py-0.5 text-xs font-bold text-white">
            −{discount}%
          </span>
        )}
        <button
          type="button"
          aria-label={inWishlist ? 'Убрать из избранного' : 'В избранное'}
          onClick={(e) => {
            e.preventDefault()
            const added = toggleWish(product.id)
            notify.success(added ? 'Добавлено в избранное' : 'Удалено из избранного', product.title)
          }}
          className={`absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-base shadow-sm backdrop-blur transition ${
            inWishlist ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'
          }`}
        >
          {inWishlist ? '♥' : '♡'}
        </button>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex flex-wrap gap-1">
          {product.badges.slice(0, 2).map((b) => (
            <span key={b} className={`badge ${badgeColor[b] ?? 'bg-slate-100 text-slate-700'}`}>
              {b}
            </span>
          ))}
        </div>
        <Link to={`/p/${product.id}`} className="line-clamp-2 text-sm font-medium text-slate-900 hover:text-sueta-700">
          {product.title}
        </Link>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Rating value={product.rating} />
          <span>· {product.reviewsCount}</span>
        </div>
        <div className="mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-slate-900">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="text-xs text-slate-400 line-through">{formatPrice(product.oldPrice)}</span>
            )}
          </div>
          <button
            className="btn-primary mt-2 w-full"
            onClick={() => {
              add(product.id, 1)
              notify.success('В корзине', product.title)
            }}
          >
            В корзину
          </button>
        </div>
      </div>
    </article>
  )
}
