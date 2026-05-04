import { Link } from 'react-router-dom'
import { useCart } from '@/store/cart'
import { useCatalog } from '@/store/catalog'
import { formatPrice, pluralizeRu } from '@/lib/format'
import { EmptyState } from '@/components/EmptyState'
import { confirm } from '@/components/confirm'
import { notify } from '@/store/notify'

export default function CartPage() {
  const items = useCart((s) => s.items)
  const inc = useCart((s) => s.inc)
  const dec = useCart((s) => s.dec)
  const setQty = useCart((s) => s.setQty)
  const remove = useCart((s) => s.remove)
  const clear = useCart((s) => s.clear)

  const products = useCatalog((s) => s.products)

  const detailed = items
    .map((i) => ({ ...i, product: products.find((p) => p.id === i.productId) }))
    .filter((i) => i.product)

  const total = detailed.reduce((acc, i) => acc + (i.product!.price * i.qty), 0)
  const totalOld = detailed.reduce(
    (acc, i) => acc + ((i.product!.oldPrice ?? i.product!.price) * i.qty),
    0,
  )
  const saved = Math.max(0, totalOld - total)
  const totalCount = detailed.reduce((a, i) => a + i.qty, 0)

  if (detailed.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState
          emoji="🛒"
          title="Корзина пуста"
          description="Кажется, вы держитесь молодцом. Но у нас есть пара суетных предложений."
          action={<Link to="/c" className="btn-primary">Перейти в каталог</Link>}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex items-end justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Корзина</h1>
        <button
          className="btn-ghost text-rose-600 hover:!bg-rose-50"
          onClick={async () => {
            if (
              await confirm({
                title: 'Очистить корзину?',
                message: 'Все товары будут удалены. Это нельзя отменить (но можно расстроиться).',
                confirmText: 'Очистить',
                danger: true,
              })
            ) {
              clear()
              notify.info('Корзина очищена')
            }
          }}
        >
          Очистить
        </button>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        {totalCount} {pluralizeRu(totalCount, ['товар', 'товара', 'товаров'])} на сумму {formatPrice(total)}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {detailed.map(({ product, qty }) => (
            <div key={product!.id} className="card flex gap-3 p-3 sm:p-4">
              <Link to={`/p/${product!.id}`} className="block h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-50 sm:h-28 sm:w-28">
                <img src={product!.image} alt={product!.title} className="h-full w-full object-cover" />
              </Link>
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <Link to={`/p/${product!.id}`} className="line-clamp-2 text-sm font-medium text-slate-900 hover:text-sueta-700">
                    {product!.title}
                  </Link>
                  <button
                    className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-600"
                    aria-label="Удалить"
                    onClick={() => {
                      remove(product!.id)
                      notify.info('Удалено из корзины', product!.title)
                    }}
                  >
                    🗑
                  </button>
                </div>
                <div className="text-xs text-slate-500">{product!.brand}</div>
                <div className="mt-auto flex items-center justify-between gap-2">
                  <div className="inline-flex items-center rounded-lg ring-1 ring-slate-200">
                    <button
                      className="grid h-9 w-9 place-items-center text-lg text-slate-600 hover:bg-slate-50"
                      onClick={() => dec(product!.id)}
                      aria-label="Меньше"
                    >−</button>
                    <input
                      type="number"
                      min={1}
                      value={qty}
                      onChange={(e) => setQty(product!.id, Math.max(1, Number(e.target.value) || 1))}
                      className="h-9 w-12 border-0 bg-transparent text-center text-sm focus:outline-none"
                    />
                    <button
                      className="grid h-9 w-9 place-items-center text-lg text-slate-600 hover:bg-slate-50"
                      onClick={() => inc(product!.id)}
                      aria-label="Больше"
                    >+</button>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold text-slate-900">{formatPrice(product!.price * qty)}</div>
                    {product!.oldPrice && (
                      <div className="text-xs text-slate-400 line-through">
                        {formatPrice(product!.oldPrice * qty)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="space-y-3">
          <div className="card sticky top-24 space-y-3 p-4">
            <h2 className="text-lg font-semibold text-slate-900">Итого</h2>
            <div className="flex justify-between text-sm text-slate-600">
              <span>Товары</span>
              <span>{formatPrice(totalOld)}</span>
            </div>
            {saved > 0 && (
              <div className="flex justify-between text-sm text-emerald-700">
                <span>Скидка</span>
                <span>−{formatPrice(saved)}</span>
              </div>
            )}
            <div className="flex items-baseline justify-between border-t border-slate-100 pt-3">
              <span className="text-sm text-slate-600">К оплате</span>
              <span className="text-2xl font-extrabold text-slate-900">{formatPrice(total)}</span>
            </div>
            <Link to="/checkout" className="btn-primary w-full justify-center">Оформить заказ</Link>
            <Link to="/c" className="btn-ghost w-full justify-center">Продолжить покупки</Link>
            <p className="text-xs text-slate-400">
              Это пародия. Реальные деньги никуда не денутся (потому что и не возьмутся).
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
