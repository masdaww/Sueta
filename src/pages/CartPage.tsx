import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState } from "../components/ui/EmptyState";
import { ProductImage } from "../components/product/ProductImage";
import { Skeleton } from "../components/ui/Skeleton";
import type { Product } from "../types";
import { applyPromo, listProducts } from "../api/mockApi";
import { useApp } from "../store/AppContext";
import { formatPrice } from "../lib/format";

export function CartPage() {
  const { cart, setCartQty, removeFromCart, clearCart, pushToast } = useApp();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<Product | null>(null);
  const [promo, setPromo] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    listProducts({ pageSize: 1000 }).then((res) => {
      if (alive) setProducts(res.items);
    });
    return () => {
      alive = false;
    };
  }, []);

  const items = useMemo(() => {
    if (!products) return [];
    return cart
      .map((c) => {
        const p = products.find((p) => p.id === c.productId);
        if (!p) return null;
        return { product: p, quantity: c.quantity };
      })
      .filter((x): x is { product: Product; quantity: number } => x !== null);
  }, [cart, products]);

  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const discount = appliedPromo ? Math.round((subtotal * appliedPromo.discount) / 100) : 0;
  const delivery = subtotal === 0 ? 0 : subtotal >= 1999 ? 0 : 199;
  const total = Math.max(0, subtotal - discount) + delivery;

  const onApplyPromo = async () => {
    if (!promo.trim()) return;
    const res = await applyPromo(promo);
    if (res.valid) {
      setAppliedPromo({ code: promo.toUpperCase(), discount: res.discountPct });
      pushToast({
        type: "success",
        title: `Промокод применён: -${res.discountPct}%`,
        description: "Озор одобряет.",
      });
    } else {
      pushToast({ type: "warning", title: "Не сработало", description: res.reason ?? "Попробуйте другой код." });
    }
  };

  if (products === null) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Skeleton className="h-10 w-1/3 mb-4" />
        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <EmptyState
          emoji="🛒"
          title="Корзина пустует"
          description="Енот заглядывал — никого не нашёл. Самое время добавить чего-нибудь нелепого."
          action={
            <Link to="/catalog" className="ozor-btn-primary px-4 py-2">
              Перейти в каталог
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-end justify-between gap-3 mb-5">
        <h1 className="ozor-section-title flex items-center gap-2">
          <ShoppingBag className="text-ozor-500" size={28} /> Корзина
        </h1>
        <button onClick={() => setConfirmClear(true)} className="ozor-btn-ghost px-3 py-2 text-sm">
          <Trash2 size={14} /> Очистить
        </button>
      </div>
      <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        <div className="space-y-3">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="ozor-card p-3 flex gap-3">
              <Link to={`/product/${product.id}`} className="flex-none w-28">
                <ProductImage
                  emoji={product.emoji}
                  bgColor={product.bgColor}
                  bgColor2={product.bgColor2}
                  size="sm"
                  className="h-28 w-28"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${product.id}`} className="font-semibold text-ink-900 hover:text-ozor-600 line-clamp-2">
                  {product.title}
                </Link>
                <div className="text-xs text-ink-500 mt-1">Бренд: {product.brand}</div>
                <div className="mt-2 flex flex-wrap gap-3 items-center justify-between">
                  <div className="inline-flex items-center bg-ink-100 rounded-xl">
                    <button
                      onClick={() => setCartQty(product.id, Math.max(1, quantity - 1))}
                      className="p-1.5 text-ink-700"
                      aria-label="Уменьшить"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-2 font-semibold text-ink-900 min-w-[2rem] text-center">{quantity}</span>
                    <button
                      onClick={() => setCartQty(product.id, Math.min(product.inStock || 99, quantity + 1))}
                      className="p-1.5 text-ink-700"
                      aria-label="Увеличить"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="text-lg font-extrabold text-ink-900 ml-auto">
                    {formatPrice(product.price * quantity)}
                  </div>
                  <button
                    onClick={() => setConfirmRemove(product)}
                    className="text-ink-500 hover:text-red-500 p-2 rounded-lg hover:bg-red-50"
                    aria-label="Удалить"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <aside className="ozor-card p-5 sticky top-[calc(var(--header-h)+8px)]">
          <div className="font-semibold text-ink-900 text-lg mb-3">Итого</div>
          <div className="space-y-2 text-sm">
            <Row label={`Товары (${items.reduce((s, i) => s + i.quantity, 0)})`} value={formatPrice(subtotal)} />
            <Row label={`Скидка${appliedPromo ? ` (${appliedPromo.code})` : ""}`} value={appliedPromo ? `-${formatPrice(discount)}` : "—"} muted={!appliedPromo} />
            <Row
              label="Доставка"
              value={delivery === 0 ? "Бесплатно" : formatPrice(delivery)}
              hint={subtotal < 1999 ? "Бесплатно от 1 999 ₽" : undefined}
            />
          </div>
          <div className="border-t border-ink-100 my-3" />
          <div className="flex items-baseline justify-between">
            <span className="font-semibold">К оплате</span>
            <span className="text-2xl font-extrabold text-ink-900">{formatPrice(total)}</span>
          </div>

          <div className="mt-4">
            {appliedPromo ? (
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 text-emerald-800 px-3 py-2 text-sm">
                <span>Промокод: <b>{appliedPromo.code}</b> (−{appliedPromo.discount}%)</span>
                <button onClick={() => setAppliedPromo(null)} className="text-emerald-700 hover:underline">Убрать</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  className="ozor-input"
                  placeholder="Промокод (напр. ОЗОР10)"
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                />
                <button onClick={onApplyPromo} className="ozor-btn-secondary px-3 py-2 text-sm">
                  Применить
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate("/checkout", { state: { promo: appliedPromo } })}
            className="ozor-btn-primary w-full mt-4 py-3"
          >
            Оформить заказ
          </button>
          <Link to="/catalog" className="block text-center mt-3 text-sm text-ink-500 hover:text-ozor-600">
            ← Продолжить покупки
          </Link>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => {
          clearCart();
          setAppliedPromo(null);
          pushToast({ type: "info", title: "Корзина очищена", description: "Енот вздохнул облегчённо." });
        }}
        title="Очистить корзину?"
        description="Все товары исчезнут отсюда. Их можно будет добавить заново."
        confirmLabel="Да, очистить"
        destructive
      />
      <ConfirmDialog
        open={!!confirmRemove}
        onClose={() => setConfirmRemove(null)}
        onConfirm={() => {
          if (confirmRemove) removeFromCart(confirmRemove.id);
        }}
        title={`Удалить «${confirmRemove?.title ?? ""}»?`}
        description="Можно будет вернуть из избранного, если понадобится."
        confirmLabel="Удалить"
        destructive
      />
    </div>
  );
}

function Row({ label, value, hint, muted }: { label: string; value: string; hint?: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-ink-600">
        {label}
        {hint && <span className="block text-xs text-ink-400 mt-0.5">{hint}</span>}
      </span>
      <span className={muted ? "text-ink-400" : "text-ink-900 font-medium"}>{value}</span>
    </div>
  );
}
