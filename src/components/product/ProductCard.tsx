import { Heart, ShoppingCart, Zap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import clsx from "clsx";
import type { Product } from "../../types";
import { ProductImage } from "./ProductImage";
import { Rating } from "../ui/Rating";
import { useApp } from "../../store/AppContext";
import { formatPrice } from "../../lib/format";

interface Props {
  product: Product;
  variant?: "grid" | "list";
}

export function ProductCard({ product, variant = "grid" }: Props) {
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist, pushToast, cart } = useApp();
  const inCart = cart.some((c) => c.productId === product.id);
  const wished = isInWishlist(product.id);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, 1);
    pushToast({
      type: "success",
      title: "Добавлено в корзину",
      description: `${product.title}`,
    });
  };

  const handleBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inCart) addToCart(product.id, 1);
    navigate("/checkout");
  };

  const handleWish = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    pushToast({
      type: "info",
      title: wished ? "Убрано из избранного" : "Добавлено в избранное",
      description: product.title,
      durationMs: 2500,
    });
  };

  if (variant === "list") {
    return (
      <Link to={`/product/${product.id}`} className="ozor-card overflow-hidden flex hover:shadow-pop transition-shadow">
        <div className="w-40 flex-none">
          <ProductImage
            emoji={product.emoji}
            bgColor={product.bgColor}
            bgColor2={product.bgColor2}
            size="md"
            rounded="rounded-none"
          />
        </div>
        <div className="flex-1 p-4 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="font-semibold text-ink-900 line-clamp-2">{product.title}</div>
            <button onClick={handleWish} className="text-ink-400 hover:text-ozor-500" aria-label="В избранное">
              <Heart size={20} className={clsx(wished && "fill-ozor-500 text-ozor-500")} />
            </button>
          </div>
          <p className="text-sm text-ink-500 mt-1 line-clamp-2">{product.description}</p>
          <Rating value={product.rating} reviewCount={product.reviewCount} className="mt-2" />
          <div className="mt-auto pt-3 flex items-end justify-between">
            <Price product={product} />
            <div className="flex gap-2">
              <button onClick={handleAdd} className="ozor-btn-secondary px-3 py-2 text-sm">
                <ShoppingCart size={16} /> В корзину
              </button>
              <button onClick={handleBuy} className="ozor-btn-primary px-3 py-2 text-sm">
                <Zap size={16} /> Купить
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/product/${product.id}`}
      className="group ozor-card overflow-hidden flex flex-col hover:shadow-pop transition-shadow"
    >
      <div className="relative">
        <ProductImage
          emoji={product.emoji}
          bgColor={product.bgColor}
          bgColor2={product.bgColor2}
          size="md"
          rounded="rounded-none"
          className="group-hover:scale-[1.02] transition-transform duration-300"
        />
        {product.badges && product.badges.length > 0 && (
          <div className="absolute left-2 top-2 flex flex-wrap gap-1">
            {product.badges.slice(0, 2).map((b) => (
              <span
                key={b}
                className="ozor-chip bg-white/90 text-ink-800 text-[11px] uppercase tracking-wider"
              >
                {b}
              </span>
            ))}
          </div>
        )}
        <button
          onClick={handleWish}
          className={clsx(
            "absolute right-2 top-2 rounded-full p-2 backdrop-blur",
            wished ? "bg-ozor-500 text-white" : "bg-white/90 text-ink-700 hover:text-ozor-500",
          )}
          aria-label={wished ? "Убрать из избранного" : "Добавить в избранное"}
        >
          <Heart size={16} className={clsx(wished && "fill-white")} />
        </button>
        {product.inStock <= 5 && product.inStock > 0 && (
          <div className="absolute bottom-2 left-2 ozor-chip bg-amber-100 text-amber-800">
            осталось {product.inStock} шт.
          </div>
        )}
        {product.inStock === 0 && (
          <div className="absolute bottom-2 left-2 ozor-chip bg-ink-200 text-ink-700">нет в наличии</div>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <Rating value={product.rating} reviewCount={product.reviewCount} size={14} />
        <div className="font-semibold text-ink-900 mt-1.5 line-clamp-2 leading-snug">{product.title}</div>
        <p className="text-xs text-ink-500 mt-1 line-clamp-2">{product.description}</p>
        <div className="mt-auto pt-3">
          <Price product={product} />
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <button
              onClick={handleAdd}
              disabled={product.inStock === 0}
              className="ozor-btn-secondary text-sm py-2"
            >
              <ShoppingCart size={14} />
              {inCart ? "Ещё одну" : "В корзину"}
            </button>
            <button
              onClick={handleBuy}
              disabled={product.inStock === 0}
              className="ozor-btn-primary text-sm py-2"
            >
              <Zap size={14} /> Купить
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

function Price({ product }: { product: Product }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-lg font-extrabold text-ink-900">{formatPrice(product.price)}</span>
      {product.oldPrice && (
        <span className="text-sm text-ink-400 line-through">{formatPrice(product.oldPrice)}</span>
      )}
    </div>
  );
}
