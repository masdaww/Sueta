import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Filter, LayoutGrid, List, RefreshCcw, X } from "lucide-react";
import clsx from "clsx";
import { ProductCard } from "../components/product/ProductCard";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { Rating } from "../components/ui/Rating";
import type { Category, Product } from "../types";
import {
  listCategories,
  listProducts,
  type ProductQuery,
  type ProductResult,
} from "../api/mockApi";

const sortLabels: { value: NonNullable<ProductQuery["sort"]>; label: string }[] = [
  { value: "popular", label: "По популярности" },
  { value: "rating-desc", label: "По рейтингу" },
  { value: "price-asc", label: "Сначала дешевле" },
  { value: "price-desc", label: "Сначала дороже" },
  { value: "newest", label: "Сначала новые" },
];

export function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [result, setResult] = useState<ProductResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [minPriceInput, setMinPriceInput] = useState<string>("");
  const [maxPriceInput, setMaxPriceInput] = useState<string>("");

  const search = params.get("q") ?? "";
  const catSlug = params.get("cat") ?? "";
  const sort = (params.get("sort") as ProductQuery["sort"]) ?? "popular";
  const minPrice = params.get("min");
  const maxPrice = params.get("max");
  const minRating = params.get("rating");
  const inStockOnly = params.get("instock") === "1";
  const brandsParam = params.get("brands") ?? "";
  const brands = brandsParam ? brandsParam.split(",") : [];
  const page = Number(params.get("page") ?? 1);

  useEffect(() => {
    listCategories().then(setCategories);
  }, []);

  const category = categories.find((c) => c.slug === catSlug);

  useEffect(() => {
    setMinPriceInput(minPrice ?? "");
    setMaxPriceInput(maxPrice ?? "");
  }, [minPrice, maxPrice]);

  useEffect(() => {
    setLoading(true);
    listProducts({
      search,
      categoryId: category?.id,
      sort,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minRating: minRating ? Number(minRating) : undefined,
      inStockOnly,
      brands: brands.length ? brands : undefined,
      page,
      pageSize: 16,
    }).then((res) => {
      setResult(res);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, catSlug, sort, minPrice, maxPrice, minRating, inStockOnly, brandsParam, page, categories.length]);

  const updateParam = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(params);
    if (value == null || value === "") next.delete(key);
    else next.set(key, value);
    next.delete("page");
    setParams(next, { replace: true });
  };

  const toggleBrand = (b: string) => {
    const set = new Set(brands);
    if (set.has(b)) set.delete(b);
    else set.add(b);
    updateParam("brands", set.size ? [...set].join(",") : undefined);
  };

  const clearAll = () => {
    const next = new URLSearchParams();
    if (search) next.set("q", search);
    if (catSlug) next.set("cat", catSlug);
    setParams(next, { replace: true });
  };

  const total = result?.total ?? 0;
  const totalPages = result ? Math.max(1, Math.ceil(total / result.pageSize)) : 1;

  const activeChips = useMemo(() => {
    const arr: { label: string; onRemove: () => void }[] = [];
    if (search) arr.push({ label: `“${search}”`, onRemove: () => updateParam("q", undefined) });
    if (category) arr.push({ label: category.name, onRemove: () => updateParam("cat", undefined) });
    if (minPrice) arr.push({ label: `от ${minPrice} ₽`, onRemove: () => updateParam("min", undefined) });
    if (maxPrice) arr.push({ label: `до ${maxPrice} ₽`, onRemove: () => updateParam("max", undefined) });
    if (minRating) arr.push({ label: `★ ${minRating}+`, onRemove: () => updateParam("rating", undefined) });
    if (inStockOnly) arr.push({ label: "В наличии", onRemove: () => updateParam("instock", undefined) });
    for (const b of brands) arr.push({ label: b, onRemove: () => toggleBrand(b) });
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, minPrice, maxPrice, minRating, inStockOnly, brandsParam]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="text-sm text-ink-500 mb-2 flex items-center gap-1">
        <Link to="/" className="hover:text-ozor-600">Главная</Link>
        <span>/</span>
        <Link to="/catalog" className="hover:text-ozor-600">Каталог</Link>
        {category && (
          <>
            <span>/</span>
            <span className="text-ink-900 font-medium">{category.name}</span>
          </>
        )}
      </div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h1 className="ozor-section-title">
            {category ? `${category.emoji} ${category.name}` : search ? `Поиск: ${search}` : "Все товары"}
          </h1>
          {category?.jokeTagline && <div className="text-ink-500 mt-1">{category.jokeTagline}</div>}
          <div className="text-sm text-ink-500 mt-1">{total.toLocaleString("ru-RU")} товаров</div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            className="lg:hidden ozor-btn-secondary px-3 py-2 text-sm"
            onClick={() => setFiltersOpen((o) => !o)}
          >
            <Filter size={16} /> Фильтры
          </button>
          <select
            className="ozor-input w-auto text-sm py-2"
            value={sort}
            onChange={(e) => updateParam("sort", e.target.value)}
          >
            {sortLabels.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <div className="hidden md:flex items-center bg-ink-100 rounded-xl p-1">
            <button
              onClick={() => setView("grid")}
              className={clsx(
                "p-1.5 rounded-lg",
                view === "grid" ? "bg-white shadow text-ozor-600" : "text-ink-500",
              )}
              aria-label="Сеткой"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setView("list")}
              className={clsx(
                "p-1.5 rounded-lg",
                view === "list" ? "bg-white shadow text-ozor-600" : "text-ink-500",
              )}
              aria-label="Списком"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {activeChips.map((c, i) => (
            <button
              key={i}
              onClick={c.onRemove}
              className="ozor-chip bg-ozor-50 text-ozor-700 hover:bg-ozor-100"
            >
              {c.label} <X size={12} />
            </button>
          ))}
          <button onClick={clearAll} className="ozor-chip bg-ink-100 text-ink-700 hover:bg-ink-200">
            <RefreshCcw size={12} /> Сбросить всё
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-[260px_1fr] gap-6">
        <aside
          className={clsx(
            "lg:block",
            filtersOpen ? "block" : "hidden",
          )}
        >
          <div className="ozor-card p-4 space-y-5 sticky top-[calc(var(--header-h)+8px)]">
            <div>
              <div className="font-semibold text-ink-900 mb-2">Категории</div>
              <div className="space-y-1">
                <button
                  onClick={() => updateParam("cat", undefined)}
                  className={clsx(
                    "w-full text-left px-2 py-1.5 rounded-lg text-sm",
                    !catSlug ? "bg-ozor-50 text-ozor-700 font-semibold" : "hover:bg-ink-100 text-ink-700",
                  )}
                >
                  Все
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => updateParam("cat", c.slug)}
                    className={clsx(
                      "w-full text-left px-2 py-1.5 rounded-lg text-sm flex items-center gap-2",
                      catSlug === c.slug ? "bg-ozor-50 text-ozor-700 font-semibold" : "hover:bg-ink-100 text-ink-700",
                    )}
                  >
                    <span>{c.emoji}</span> {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="font-semibold text-ink-900 mb-2">Цена, ₽</div>
              <div className="flex gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="от"
                  className="ozor-input text-sm"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                  onBlur={() => updateParam("min", minPriceInput || undefined)}
                />
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="до"
                  className="ozor-input text-sm"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                  onBlur={() => updateParam("max", maxPriceInput || undefined)}
                />
              </div>
            </div>

            <div>
              <div className="font-semibold text-ink-900 mb-2">Рейтинг</div>
              <div className="flex flex-col gap-1">
                {[5, 4, 3].map((r) => (
                  <button
                    key={r}
                    onClick={() => updateParam("rating", String(r))}
                    className={clsx(
                      "px-2 py-1.5 rounded-lg text-sm flex items-center justify-between hover:bg-ink-100",
                      Number(minRating) === r && "bg-ozor-50 text-ozor-700",
                    )}
                  >
                    <Rating value={r} size={14} />
                    <span className="text-xs text-ink-500">и выше</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-ink-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => updateParam("instock", e.target.checked ? "1" : undefined)}
                  className="h-4 w-4 rounded border-ink-300 text-ozor-500 focus:ring-ozor-300"
                />
                Только в наличии
              </label>
            </div>

            {result?.brands && result.brands.length > 0 && (
              <div>
                <div className="font-semibold text-ink-900 mb-2">Бренды-озорники</div>
                <div className="space-y-1 max-h-56 overflow-auto pr-1">
                  {result.brands.map((b) => (
                    <label key={b} className="flex items-center gap-2 text-sm text-ink-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={brands.includes(b)}
                        onChange={() => toggleBrand(b)}
                        className="h-4 w-4 rounded border-ink-300 text-ozor-500 focus:ring-ozor-300"
                      />
                      {b}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        <div>
          {loading ? (
            <div
              className={clsx(
                view === "grid"
                  ? "grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4"
                  : "flex flex-col gap-3",
              )}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className={view === "grid" ? "h-72" : "h-40"} />
              ))}
            </div>
          ) : !result || result.items.length === 0 ? (
            <EmptyState
              emoji="🦝"
              title="Енот не нашёл то, что вы ищете"
              description="Попробуйте сбросить фильтры или придумать что-то менее серьёзное."
              action={
                <button onClick={clearAll} className="ozor-btn-primary px-4 py-2">
                  Сбросить фильтры
                </button>
              }
            />
          ) : (
            <>
              <div
                className={clsx(
                  view === "grid"
                    ? "grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4"
                    : "flex flex-col gap-3",
                )}
              >
                {result.items.map((p: Product) => (
                  <ProductCard key={p.id} product={p} variant={view === "list" ? "list" : "grid"} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2 flex-wrap">
                  <button
                    className="ozor-btn-secondary px-3 py-2 text-sm"
                    disabled={page <= 1}
                    onClick={() => updateParam("page", String(Math.max(1, page - 1)))}
                  >
                    Назад
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const n = i + 1;
                    return (
                      <button
                        key={n}
                        onClick={() => updateParam("page", String(n))}
                        className={clsx(
                          "min-w-[40px] h-10 rounded-xl text-sm font-medium",
                          n === page
                            ? "bg-ozor-500 text-white"
                            : "bg-white text-ink-700 hover:bg-ink-100 border border-ink-100",
                        )}
                      >
                        {n}
                      </button>
                    );
                  })}
                  <button
                    className="ozor-btn-secondary px-3 py-2 text-sm"
                    disabled={page >= totalPages}
                    onClick={() => updateParam("page", String(Math.min(totalPages, page + 1)))}
                  >
                    Вперёд
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
