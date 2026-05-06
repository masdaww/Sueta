import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Flame, Sparkles, Truck } from "lucide-react";
import { ProductCard } from "../components/product/ProductCard";
import { Skeleton } from "../components/ui/Skeleton";
import type { Category, Product } from "../types";
import { getNewest, getRecommended, listCategories } from "../api/mockApi";

export function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [popular, setPopular] = useState<Product[]>([]);
  const [newest, setNewest] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.all([listCategories(), getRecommended(8), getNewest(8)]).then(([c, p, n]) => {
      if (!alive) return;
      setCategories(c);
      setPopular(p);
      setNewest(n);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="container mx-auto px-4 pt-6 md:pt-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ozor-100 via-white to-accent-violet/20 p-8 md:p-14">
          <div className="grid md:grid-cols-2 items-center gap-8 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 ozor-chip bg-white/80 text-ozor-600">
                <Sparkles size={14} /> Сегодня скидки до 146%
              </div>
              <h1 className="mt-3 text-3xl md:text-5xl font-extrabold text-ink-900 leading-tight">
                Озорите без меры. <span className="text-ozor-500">Со скидками.</span>
              </h1>
              <p className="mt-3 text-ink-600 text-base md:text-lg max-w-md">
                Маркетплейс самых нелепых, обаятельных и совершенно ненужных товаров рунета. Доставка енотом, оплата эмоциями, гарантия — пока вы помните.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/catalog" className="ozor-btn-primary px-5 py-3">
                  Поозорить <ArrowRight size={16} />
                </Link>
                <Link to="/catalog?sort=popular" className="ozor-btn-secondary px-5 py-3">
                  <Flame size={16} /> Хиты енотов
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-4 text-sm text-ink-500">
                <span className="flex items-center gap-1.5"><Truck size={14} /> Доставка от 0 ₽</span>
                <span>★ 4.9 / 5 — 12 387 енотов</span>
              </div>
            </div>
            <div className="relative h-72 md:h-80">
              <div className="absolute -top-2 right-6 h-40 w-40 rounded-3xl bg-gradient-to-br from-ozor-300 to-ozor-600 flex items-center justify-center text-white text-7xl shadow-pop rotate-6 animate-pop-in">
                🦝
              </div>
              <div className="absolute top-24 -right-6 h-28 w-28 rounded-2xl bg-gradient-to-br from-accent-violet to-accent-rose flex items-center justify-center text-5xl shadow-pop -rotate-6 animate-pop-in">
                🥒
              </div>
              <div className="absolute top-44 right-32 h-24 w-24 rounded-2xl bg-gradient-to-br from-accent-mint to-emerald-500 flex items-center justify-center text-4xl shadow-pop rotate-3 animate-pop-in">
                ☕
              </div>
              <div className="absolute -bottom-2 right-12 h-32 w-32 rounded-2xl bg-gradient-to-br from-accent-sun to-amber-400 flex items-center justify-center text-5xl shadow-pop -rotate-12 animate-pop-in">
                🛌
              </div>
            </div>
          </div>
          <div aria-hidden className="absolute -bottom-12 -left-10 h-56 w-56 rounded-full bg-ozor-200/40 blur-3xl" />
          <div aria-hidden className="absolute -top-10 -right-12 h-56 w-56 rounded-full bg-accent-violet/20 blur-3xl" />
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex items-end justify-between gap-3 mb-5">
          <h2 className="ozor-section-title">Категории озорства</h2>
          <Link to="/catalog" className="text-sm text-ozor-600 font-semibold hover:underline">
            Все категории →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {(loading ? Array.from({ length: 12 }) : categories).map((c, i) => {
            if (loading) return <Skeleton key={i} className="h-28" />;
            const cat = c as Category;
            return (
              <Link
                key={cat.id}
                to={`/catalog?cat=${cat.slug}`}
                className="group rounded-2xl p-3 md:p-4 bg-white shadow-card hover:shadow-pop transition-shadow flex flex-col items-start"
              >
                <div
                  className="h-12 w-12 md:h-14 md:w-14 rounded-2xl flex items-center justify-center text-2xl md:text-3xl"
                  style={{ background: `linear-gradient(135deg, ${cat.color}33, ${cat.color}88)` }}
                >
                  {cat.emoji}
                </div>
                <div className="mt-3 font-semibold text-ink-900 text-sm md:text-base group-hover:text-ozor-600 transition-colors">
                  {cat.name}
                </div>
                <div className="text-[11px] md:text-xs text-ink-500 mt-0.5 line-clamp-1">{cat.jokeTagline}</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Popular */}
      <section className="container mx-auto px-4">
        <div className="flex items-end justify-between gap-3 mb-5">
          <h2 className="ozor-section-title">
            <Flame className="inline -mt-1 mr-1 text-ozor-500" size={26} /> Хиты — берут даже еноты
          </h2>
          <Link to="/catalog?sort=popular" className="text-sm text-ozor-600 font-semibold hover:underline">
            Смотреть все →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {(loading ? Array.from({ length: 8 }) : popular).map((p, i) => {
            if (loading) return <Skeleton key={i} className="h-72" />;
            return <ProductCard key={(p as Product).id} product={p as Product} />;
          })}
        </div>
      </section>

      {/* Promo strip */}
      <section className="container mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-gradient-to-br from-ozor-500 to-ozor-700 text-white p-6 relative overflow-hidden">
            <div className="text-sm uppercase tracking-widest opacity-80">Акция дня</div>
            <div className="text-2xl font-extrabold mt-1">Купи кружку — получи смешок бесплатно</div>
            <div className="text-sm opacity-90 mt-1">Только сегодня и завтра. И ещё пару лет.</div>
            <div className="absolute -right-4 -bottom-4 text-9xl opacity-30">☕</div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-accent-violet to-indigo-700 text-white p-6 relative overflow-hidden">
            <div className="text-sm uppercase tracking-widest opacity-80">Промокод</div>
            <div className="text-2xl font-extrabold mt-1">ЕНОТ2026 — −25%</div>
            <div className="text-sm opacity-90 mt-1">На всё, что вы давно хотели и боялись признать.</div>
            <div className="absolute -right-4 -bottom-4 text-9xl opacity-30">🦝</div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-accent-mint to-emerald-700 text-white p-6 relative overflow-hidden">
            <div className="text-sm uppercase tracking-widest opacity-80">Новинка</div>
            <div className="text-2xl font-extrabold mt-1">Огурец ХXL — теперь с автографом</div>
            <div className="text-sm opacity-90 mt-1">Засолено от руки. Ну почти.</div>
            <div className="absolute -right-4 -bottom-4 text-9xl opacity-30">🥒</div>
          </div>
        </div>
      </section>

      {/* Newest */}
      <section className="container mx-auto px-4 pb-12">
        <div className="flex items-end justify-between gap-3 mb-5">
          <h2 className="ozor-section-title">
            <Sparkles className="inline -mt-1 mr-1 text-accent-violet" size={26} /> Только что привезли
          </h2>
          <Link to="/catalog?sort=newest" className="text-sm text-ozor-600 font-semibold hover:underline">
            Смотреть все →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {(loading ? Array.from({ length: 8 }) : newest).map((p, i) => {
            if (loading) return <Skeleton key={i} className="h-72" />;
            return <ProductCard key={(p as Product).id} product={p as Product} />;
          })}
        </div>
      </section>
    </div>
  );
}
