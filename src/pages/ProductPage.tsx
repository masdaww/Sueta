import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { categories } from '@/data/seed'
import { useCatalog } from '@/store/catalog'
import { useCart } from '@/store/cart'
import { useWishlist } from '@/store/wishlist'
import { useSession } from '@/store/session'
import { Rating } from '@/components/Rating'
import { ProductCard } from '@/components/ProductCard'
import { Modal } from '@/components/Modal'
import { Tooltip } from '@/components/Tooltip'
import { notify } from '@/store/notify'
import { formatDate, formatPrice } from '@/lib/format'
import { EmptyState } from '@/components/EmptyState'

export default function ProductPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const products = useCatalog((s) => s.products)
  const reviews = useCatalog((s) => s.reviews)
  const addReview = useCatalog((s) => s.addReview)
  const userId = useSession((s) => s.userId)
  const users = useCatalog((s) => s.users)
  const me = users.find((u) => u.id === userId)

  const add = useCart((s) => s.add)
  const toggleWish = useWishlist((s) => s.toggle)
  const inWishlist = useWishlist((s) => s.ids.includes(productId ?? ''))

  const product = products.find((p) => p.id === productId)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewText, setReviewText] = useState('')

  if (!product) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <EmptyState
          emoji="🫥"
          title="Товар не найден"
          description="Возможно, он только что убежал в новогодние праздники."
          action={
            <Link to="/c" className="btn-primary">К каталогу</Link>
          }
        />
      </div>
    )
  }

  const cat = categories.find((c) => c.id === product.categoryId)
  const productReviews = reviews.filter((r) => r.productId === product.id && r.status === 'approved')
  const related = products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4)

  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!me) return
    if (!reviewText.trim()) {
      notify.warn('Напишите хотя бы пару слов')
      return
    }
    addReview({
      productId: product.id,
      userId: me.id,
      userName: me.name,
      rating: reviewRating,
      text: reviewText.trim(),
    })
    notify.success('Отзыв отправлен на модерацию', 'Спасибо! Скоро появится после проверки.')
    setReviewOpen(false)
    setReviewText('')
    setReviewRating(5)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <nav className="mb-3 flex flex-wrap items-center gap-1 text-xs text-slate-500">
        <Link to="/" className="hover:text-sueta-700">Главная</Link>
        <span>/</span>
        <Link to="/c" className="hover:text-sueta-700">Каталог</Link>
        {cat && (
          <>
            <span>/</span>
            <Link to={`/c/${cat.id}`} className="hover:text-sueta-700">{cat.name}</Link>
          </>
        )}
        <span>/</span>
        <span className="line-clamp-1 text-slate-700">{product.title}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="relative aspect-square bg-slate-50">
            <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
            {discount > 0 && (
              <span className="absolute left-3 top-3 rounded-md bg-rose-600 px-2 py-1 text-xs font-bold text-white">
                −{discount}%
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {product.badges.map((b) => (
              <span key={b} className="chip">{b}</span>
            ))}
          </div>
          <h1 className="text-2xl font-bold leading-snug text-slate-900 sm:text-3xl">{product.title}</h1>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Rating value={product.rating} showValue />
            <span>·</span>
            <span>{product.reviewsCount} отзывов</span>
            <span>·</span>
            <span>Бренд: <span className="text-slate-900">{product.brand}</span></span>
          </div>

          <p className="text-slate-700">{product.description}</p>
          {product.funFact && (
            <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
              <span className="font-semibold">Факт от продавца: </span>
              {product.funFact}
            </div>
          )}

          <div className="card flex flex-col gap-4 p-4">
            <div className="flex items-end gap-3">
              <div className="text-3xl font-extrabold text-slate-900">{formatPrice(product.price)}</div>
              {product.oldPrice && (
                <div className="text-sm text-slate-400 line-through">{formatPrice(product.oldPrice)}</div>
              )}
              {discount > 0 && (
                <div className="rounded-md bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
                  −{discount}%
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Tooltip content="Это шуточная вещь. На реальный кэшбек не рассчитывайте.">
                <span className="chip cursor-help">💡 СуетаКэшбек {Math.round(product.price * 0.05).toLocaleString('ru-RU')} ₽</span>
              </Tooltip>
              <span className="chip">{product.stock > 0 ? `В наличии: ${product.stock} шт.` : 'Нет в наличии'}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                className="btn-primary flex-1"
                disabled={product.stock <= 0}
                onClick={() => {
                  add(product.id, 1)
                  notify.success('В корзине', product.title)
                }}
              >
                В корзину
              </button>
              <button
                className="btn-secondary flex-1"
                disabled={product.stock <= 0}
                onClick={() => {
                  add(product.id, 1)
                  navigate('/cart')
                }}
              >
                Купить сразу
              </button>
              <button
                className={`btn-secondary ${inWishlist ? '!text-rose-600' : ''}`}
                aria-label="В избранное"
                onClick={() => {
                  const added = toggleWish(product.id)
                  notify.success(added ? 'В избранном' : 'Удалено из избранного', product.title)
                }}
              >
                {inWishlist ? '♥' : '♡'} В избранное
              </button>
            </div>
          </div>

          <ul className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
            <li className="flex items-center gap-2"><span>🛴</span> Курьер сегодня — 290 ₽</li>
            <li className="flex items-center gap-2"><span>🏬</span> Самовывоз — бесплатно</li>
            <li className="flex items-center gap-2"><span>🕊️</span> Голубиная почта — 990 ₽</li>
            <li className="flex items-center gap-2"><span>🛡️</span> Возврат настроения — 14 дней</li>
          </ul>
        </div>
      </div>

      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Отзывы ({productReviews.length})</h2>
          <button className="btn-primary" onClick={() => setReviewOpen(true)}>Написать отзыв</button>
        </div>
        {productReviews.length === 0 ? (
          <div className="card p-6 text-sm text-slate-500">
            Пока тихо. Будьте первым — расскажите, как это изменило вашу среду в районе 15:42.
          </div>
        ) : (
          <ul className="space-y-3">
            {productReviews.map((r) => (
              <li key={r.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-900">{r.userName}</div>
                  <div className="text-xs text-slate-400">{formatDate(r.createdAt)}</div>
                </div>
                <Rating value={r.rating} />
                <p className="mt-1 text-sm text-slate-700">{r.text}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-xl font-bold text-slate-900">Похожее</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <Modal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        title="Ваш отзыв"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setReviewOpen(false)}>Отмена</button>
            <button className="btn-primary" onClick={submitReview} type="submit" form="review-form">
              Отправить
            </button>
          </>
        }
      >
        <form id="review-form" className="space-y-3" onSubmit={submitReview}>
          <div>
            <div className="label">Оценка</div>
            <Rating value={reviewRating} size="lg" onChange={setReviewRating} />
          </div>
          <div>
            <label htmlFor="review-text" className="label">Текст отзыва</label>
            <textarea
              id="review-text"
              className="input min-h-24"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Расскажите, как этот товар изменил вашу жизнь (или не изменил)…"
            />
          </div>
          <p className="text-xs text-slate-500">
            Перед публикацией отзывы проходят модерацию у нашего пятницы-редактора.
          </p>
        </form>
      </Modal>
    </div>
  )
}
