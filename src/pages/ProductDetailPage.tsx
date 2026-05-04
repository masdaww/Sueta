import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Heart, Minus, Plus, ShieldCheck, ShoppingCart, Truck, Zap } from "lucide-react";
import { ProductCard } from "../components/product/ProductCard";
import { ProductImage } from "../components/product/ProductImage";
import { Rating } from "../components/ui/Rating";
import { Skeleton } from "../components/ui/Skeleton";
import { Modal } from "../components/ui/Modal";
import type { Category, Product, Review } from "../types";
import {
  createReview,
  getProduct,
  getRelatedProducts,
  listCategories,
  listReviewsForProduct,
} from "../api/mockApi";
import { useApp } from "../store/AppContext";
import { formatDate, formatPrice } from "../lib/format";
import clsx from "clsx";

export function ProductDetailPage() {
  const { productId = "" } = useParams();
  const navigate = useNavigate();
  const { addToCart, isInWishlist, toggleWishlist, pushToast, user } = useApp();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [qty, setQty] = useState(1);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  useEffect(() => {
    let alive = true;
    setProduct(null);
    Promise.all([
      getProduct(productId),
      getRelatedProducts(productId, 8),
      listReviewsForProduct(productId),
      listCategories(),
    ]).then(([p, r, rev, cats]) => {
      if (!alive) return;
      setProduct(p ?? null);
      setRelated(r);
      setReviews(rev);
      setCategories(cats);
    });
    return () => {
      alive = false;
    };
  }, [productId]);

  if (product === null) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Skeleton className="h-96 mb-4" />
        <Skeleton className="h-8 w-2/3 mb-2" />
        <Skeleton className="h-6 w-1/3" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="text-5xl mb-3">🪤</div>
        <h2 className="text-2xl font-bold">Товар испарился</h2>
        <p className="text-ink-500 mt-1">Возможно, его кто-то уже купил. Или это вообще была иллюзия.</p>
        <Link to="/catalog" className="ozor-btn-primary px-4 py-2 mt-4 inline-flex">К каталогу</Link>
      </div>
    );
  }

  const wished = isInWishlist(product.id);
  const category = categories.find((c) => c.id === product.categoryId);

  const handleAdd = () => {
    addToCart(product.id, qty);
    pushToast({
      type: "success",
      title: "Добавлено в корзину",
      description: `${product.title} × ${qty}`,
    });
  };
  const handleBuy = () => {
    addToCart(product.id, qty);
    navigate("/checkout");
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      pushToast({ type: "warning", title: "Сначала войдите", description: "Отзывы оставляют только участники озорства." });
      return;
    }
    if (reviewText.trim().length < 5) {
      pushToast({ type: "warning", title: "Слишком коротко", description: "Хотя бы 5 символов искренности." });
      return;
    }
    await createReview({
      productId: product.id,
      userId: user.id,
      userName: user.name,
      rating: reviewRating,
      text: reviewText.trim(),
    });
    setReviewOpen(false);
    setReviewText("");
    setReviewRating(5);
    pushToast({
      type: "success",
      title: "Спасибо за отзыв!",
      description: "Появится после модерации (модератор сейчас грызёт сухарик).",
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="text-sm text-ink-500 mb-3 flex items-center gap-1 flex-wrap">
        <Link to="/" className="hover:text-ozor-600">Главная</Link>
        <span>/</span>
        <Link to="/catalog" className="hover:text-ozor-600">Каталог</Link>
        {category && (
          <>
            <span>/</span>
            <Link to={`/catalog?cat=${category.slug}`} className="hover:text-ozor-600">{category.name}</Link>
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr_420px] gap-8">
        <div>
          <ProductImage
            emoji={product.emoji}
            bgColor={product.bgColor}
            bgColor2={product.bgColor2}
            size="hero"
            parodyLabel="ОЗОР"
          />
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[product.emoji, "📦", "✨", "🦝"].map((e, i) => (
              <button
                key={i}
                className={clsx(
                  "rounded-2xl h-20 flex items-center justify-center text-3xl transition-shadow",
                  i === 0 ? "ring-2 ring-ozor-500" : "ring-1 ring-ink-200 hover:ring-ozor-300",
                )}
                style={{
                  background: `linear-gradient(135deg, ${product.bgColor}, ${product.bgColor2 ?? product.bgColor})`,
                }}
              >
                {e}
              </button>
            ))}
          </div>

          <section className="mt-10">
            <h2 className="text-xl font-bold text-ink-900">Описание</h2>
            <p className="mt-3 text-ink-700 leading-relaxed whitespace-pre-line">
              {product.description}
              {"\n\n"}
              Сертифицирован Енотовой коллегией качества. Не предназначен для серьёзных вещей.
              Поставляется в коробке из переработанного оптимизма.
            </p>
            <div className="mt-5 grid sm:grid-cols-2 gap-3 text-sm">
              <div className="ozor-card p-3 flex items-start gap-2">
                <Truck className="text-ozor-500 mt-0.5" size={18} />
                <div>
                  <div className="font-semibold">Доставка</div>
                  <div className="text-ink-500">Енотом, дроном, или по вашему желанию.</div>
                </div>
              </div>
              <div className="ozor-card p-3 flex items-start gap-2">
                <ShieldCheck className="text-accent-mint mt-0.5" size={18} />
                <div>
                  <div className="font-semibold">Гарантия</div>
                  <div className="text-ink-500">Пока вы помните, что купили — гарантия действует.</div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-10">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 className="text-xl font-bold text-ink-900">Отзывы ({reviews.length})</h2>
              <button onClick={() => setReviewOpen(true)} className="ozor-btn-secondary px-3 py-2 text-sm">
                Оставить отзыв
              </button>
            </div>
            {reviews.length === 0 ? (
              <div className="ozor-card p-6 text-center text-ink-500">
                Пока никто не отозвался. Будьте первым енотом-критиком.
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="ozor-card p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-ink-900">{r.userName}</div>
                      <div className="text-xs text-ink-500">{formatDate(r.createdAt)}</div>
                    </div>
                    <Rating value={r.rating} size={14} className="mt-1" />
                    <p className="mt-2 text-ink-700">{r.text}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-[calc(var(--header-h)+8px)] self-start">
          <div className="ozor-card p-5">
            {product.badges?.length ? (
              <div className="flex flex-wrap gap-1 mb-3">
                {product.badges.map((b) => (
                  <span key={b} className="ozor-chip bg-ozor-50 text-ozor-700 uppercase tracking-wide">{b}</span>
                ))}
              </div>
            ) : null}
            <h1 className="text-2xl font-extrabold text-ink-900 leading-tight">{product.title}</h1>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <Rating value={product.rating} reviewCount={product.reviewCount} showValue size={14} />
              <span className="text-ink-300">·</span>
              <span className="text-ink-500">Бренд: <span className="text-ink-800 font-medium">{product.brand}</span></span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-ink-900">{formatPrice(product.price)}</span>
              {product.oldPrice && (
                <span className="text-ink-400 line-through">{formatPrice(product.oldPrice)}</span>
              )}
            </div>
            <div className="mt-2 text-sm">
              {product.inStock > 0 ? (
                <span className="text-emerald-600 font-medium">В наличии — осталось {product.inStock} шт.</span>
              ) : (
                <span className="text-red-500 font-medium">Нет в наличии</span>
              )}
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="inline-flex items-center bg-ink-100 rounded-xl">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="p-2 text-ink-700 disabled:opacity-50"
                  disabled={qty <= 1}
                  aria-label="Уменьшить"
                >
                  <Minus size={16} />
                </button>
                <span className="px-3 font-semibold text-ink-900 min-w-[2rem] text-center">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.inStock || 99, q + 1))}
                  className="p-2 text-ink-700 disabled:opacity-50"
                  disabled={qty >= (product.inStock || 99)}
                  aria-label="Увеличить"
                >
                  <Plus size={16} />
                </button>
              </div>
              <button
                onClick={() => {
                  toggleWishlist(product.id);
                  pushToast({
                    type: "info",
                    title: wished ? "Убрано из избранного" : "В избранное",
                    description: product.title,
                  });
                }}
                className={clsx(
                  "h-10 w-10 rounded-xl flex items-center justify-center",
                  wished ? "bg-ozor-500 text-white" : "bg-ink-100 text-ink-700 hover:bg-ozor-100",
                )}
                aria-label="Избранное"
              >
                <Heart size={18} className={wished ? "fill-white" : ""} />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                disabled={product.inStock === 0}
                onClick={handleAdd}
                className="ozor-btn-secondary py-3"
              >
                <ShoppingCart size={16} /> В корзину
              </button>
              <button
                disabled={product.inStock === 0}
                onClick={handleBuy}
                className="ozor-btn-primary py-3"
              >
                <Zap size={16} /> Купить
              </button>
            </div>

            <div className="mt-4 rounded-xl bg-ink-50 p-3 text-xs text-ink-600 leading-relaxed">
              Покупка не влечёт ответственности. Не пытайтесь объяснить её родственникам.
            </div>
          </div>
        </aside>
      </div>

      <section className="mt-12">
        <h2 className="ozor-section-title mb-4">С этим часто берут</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <Modal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        title="Оставить отзыв"
        description="Будьте честны (или хотя бы смешны)."
        footer={
          <>
            <button className="ozor-btn-secondary px-4 py-2.5" onClick={() => setReviewOpen(false)}>
              Отмена
            </button>
            <button form="review-form" className="ozor-btn-primary px-4 py-2.5">
              Опубликовать
            </button>
          </>
        }
      >
        <form id="review-form" onSubmit={submitReview} className="space-y-4">
          <div>
            <div className="text-sm font-medium text-ink-700 mb-1">Ваша оценка</div>
            <Rating value={reviewRating} interactive onChange={setReviewRating} size={28} />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700 mb-1 block">Расскажите о товаре</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={5}
              className="ozor-input"
              placeholder="Например: енот пришёл вместе с товаром, очень доволен."
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
