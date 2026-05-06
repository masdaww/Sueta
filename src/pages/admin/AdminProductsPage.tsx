import { useEffect, useState } from "react";
import { Pencil, Plus, Search, Trash2, EyeOff, Eye } from "lucide-react";
import { ProductImage } from "../../components/product/ProductImage";
import { Modal } from "../../components/ui/Modal";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { Skeleton } from "../../components/ui/Skeleton";
import {
  createProduct,
  deleteProduct,
  listCategories,
  listProducts,
  updateProduct,
} from "../../api/mockApi";
import type { Category, Product } from "../../types";
import { useApp } from "../../store/AppContext";
import { formatPrice } from "../../lib/format";
import clsx from "clsx";

const emojiOptions = ["📦", "🦝", "🥒", "☕", "🛌", "🥄", "🪑", "🥿", "🎛️", "📚", "🪤", "🪞", "⏰", "🤖", "🍵", "🥚", "🐔", "🦔", "🥾", "🧦", "🎧", "📕"];
const colorOptions = [
  ["#ffe5d9", "#ff7341"],
  ["#fff5d9", "#ffd23a"],
  ["#d9f5e7", "#21c997"],
  ["#e3d9ff", "#7c5cff"],
  ["#fbded2", "#a82a08"],
  ["#dfe6f1", "#5d6a83"],
  ["#ffd9e5", "#ff5d8f"],
  ["#d9eaff", "#3f4a60"],
];

export function AdminProductsPage() {
  const { pushToast } = useApp();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null | "new">(null);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  const reload = () => listProducts({ pageSize: 1000, includeHidden: true }).then((res) => setProducts(res.items));
  useEffect(() => {
    listCategories().then(setCategories);
    reload();
  }, []);

  const filtered = !products
    ? []
    : products.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="ozor-section-title">Товары</h1>
        <button onClick={() => setEditing("new")} className="ozor-btn-primary px-3 py-2 text-sm">
          <Plus size={14} /> Добавить товар
        </button>
      </div>

      <div className="ozor-card p-4">
        <div className="relative max-w-md mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            placeholder="Найти по названию"
            className="ozor-input pl-9 py-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {products === null ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-ink-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-2 pr-3">Товар</th>
                  <th className="py-2 px-3 hidden sm:table-cell">Категория</th>
                  <th className="py-2 px-3">Цена</th>
                  <th className="py-2 px-3 hidden md:table-cell">Остаток</th>
                  <th className="py-2 px-3 hidden md:table-cell">Рейтинг</th>
                  <th className="py-2 px-3">Видим.</th>
                  <th className="py-2 pl-3 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filtered.map((p) => {
                  const cat = categories.find((c) => c.id === p.categoryId);
                  return (
                    <tr key={p.id} className="hover:bg-ink-50">
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-3">
                          <ProductImage
                            emoji={p.emoji}
                            bgColor={p.bgColor}
                            bgColor2={p.bgColor2}
                            size="sm"
                            className="h-12 w-12 flex-none"
                          />
                          <div className="min-w-0">
                            <div className="font-medium text-ink-900 line-clamp-1">{p.title}</div>
                            <div className="text-xs text-ink-500">{p.brand}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3 hidden sm:table-cell">{cat ? `${cat.emoji} ${cat.name}` : "—"}</td>
                      <td className="py-2 px-3 font-semibold">{formatPrice(p.price)}</td>
                      <td className="py-2 px-3 hidden md:table-cell">{p.inStock}</td>
                      <td className="py-2 px-3 hidden md:table-cell">★ {p.rating.toFixed(1)} <span className="text-ink-400">({p.reviewCount})</span></td>
                      <td className="py-2 px-3">
                        <button
                          onClick={async () => {
                            await updateProduct(p.id, { hidden: !p.hidden });
                            reload();
                            pushToast({ type: "info", title: p.hidden ? "Товар показан" : "Товар скрыт" });
                          }}
                          className={clsx("rounded-lg p-1.5", p.hidden ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800")}
                          title={p.hidden ? "Показать" : "Скрыть"}
                        >
                          {p.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </td>
                      <td className="py-2 pl-3 text-right">
                        <button
                          onClick={() => setEditing(p)}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-ink-100 mr-1"
                          aria-label="Редактировать"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(p)}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-red-50 text-red-600"
                          aria-label="Удалить"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-ink-500">
                      Ничего не найдено
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ProductEditModal
        open={editing !== null}
        product={editing === "new" ? null : editing}
        categories={categories}
        onClose={() => setEditing(null)}
        onSaved={() => {
          reload();
          setEditing(null);
        }}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title={`Удалить «${confirmDelete?.title ?? ""}»?`}
        description="Это действие нельзя отменить, но енот всё равно постарается."
        destructive
        confirmLabel="Удалить"
        onConfirm={async () => {
          if (confirmDelete) {
            await deleteProduct(confirmDelete.id);
            pushToast({ type: "success", title: "Товар удалён" });
            reload();
          }
        }}
      />
    </div>
  );
}

function ProductEditModal({
  open,
  product,
  categories,
  onClose,
  onSaved,
}: {
  open: boolean;
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { pushToast } = useApp();
  const [form, setForm] = useState<Partial<Product>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (product) {
      setForm(product);
    } else {
      setForm({
        title: "",
        description: "",
        price: 999,
        categoryId: categories[0]?.id ?? "",
        brand: "ОЗОР",
        emoji: "📦",
        bgColor: "#ffe5d9",
        bgColor2: "#ff7341",
        inStock: 10,
        popularity: 50,
        rating: 5,
        reviewCount: 0,
        badges: [],
      });
    }
  }, [open, product, categories]);

  const set = <K extends keyof Product>(k: K, v: Product[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price) {
      pushToast({ type: "warning", title: "Заполните название и цену" });
      return;
    }
    setBusy(true);
    try {
      if (product) {
        await updateProduct(product.id, form);
        pushToast({ type: "success", title: "Сохранено" });
      } else {
        await createProduct(form as Omit<Product, "id" | "createdAt">);
        pushToast({ type: "success", title: "Товар добавлен" });
      }
      onSaved();
    } catch (err) {
      pushToast({ type: "error", title: "Ошибка", description: err instanceof Error ? err.message : undefined });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={product ? "Редактирование товара" : "Новый товар"}
      description={product ? "Изменения сохраняются локально (localStorage)." : "Заполните данные нового товара."}
      footer={
        <>
          <button className="ozor-btn-secondary px-4 py-2.5" onClick={onClose}>Отмена</button>
          <button form="product-form" className="ozor-btn-primary px-4 py-2.5" disabled={busy}>
            {busy ? "Сохраняем…" : "Сохранить"}
          </button>
        </>
      }
    >
      <form id="product-form" onSubmit={submit} className="grid md:grid-cols-2 gap-4">
        <div>
          <ProductImage
            emoji={form.emoji ?? "📦"}
            bgColor={form.bgColor ?? "#ffe5d9"}
            bgColor2={form.bgColor2 ?? "#ff7341"}
            size="lg"
          />
          <div className="mt-3">
            <div className="text-sm text-ink-700 mb-1">Эмодзи-картинка</div>
            <div className="flex flex-wrap gap-1">
              {emojiOptions.map((e) => (
                <button
                  type="button"
                  key={e}
                  onClick={() => set("emoji", e)}
                  className={clsx(
                    "h-9 w-9 rounded-lg text-xl flex items-center justify-center",
                    form.emoji === e ? "ring-2 ring-ozor-500 bg-ozor-50" : "bg-ink-100 hover:bg-ink-200",
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3">
            <div className="text-sm text-ink-700 mb-1">Цвет фона</div>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map(([a, b]) => (
                <button
                  type="button"
                  key={a + b}
                  onClick={() => {
                    set("bgColor", a);
                    set("bgColor2", b);
                  }}
                  className={clsx(
                    "h-8 w-12 rounded-lg",
                    form.bgColor === a && form.bgColor2 === b ? "ring-2 ring-ozor-500" : "ring-1 ring-ink-200",
                  )}
                  style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
                  aria-label={`Цвет ${a}/${b}`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-ink-700 mb-1 block">Название</label>
            <input className="ozor-input" value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} required />
          </div>
          <div>
            <label className="text-sm text-ink-700 mb-1 block">Описание</label>
            <textarea className="ozor-input" rows={3} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm text-ink-700 mb-1 block">Цена</label>
              <input type="number" className="ozor-input" value={form.price ?? 0} onChange={(e) => set("price", Number(e.target.value))} min={0} required />
            </div>
            <div>
              <label className="text-sm text-ink-700 mb-1 block">Старая цена</label>
              <input type="number" className="ozor-input" value={form.oldPrice ?? ""} onChange={(e) => set("oldPrice", e.target.value ? Number(e.target.value) : undefined)} min={0} />
            </div>
            <div>
              <label className="text-sm text-ink-700 mb-1 block">Остаток</label>
              <input type="number" className="ozor-input" value={form.inStock ?? 0} onChange={(e) => set("inStock", Number(e.target.value))} min={0} />
            </div>
            <div>
              <label className="text-sm text-ink-700 mb-1 block">Бренд</label>
              <input className="ozor-input" value={form.brand ?? ""} onChange={(e) => set("brand", e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="text-sm text-ink-700 mb-1 block">Категория</label>
              <select className="ozor-input" value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-sm text-ink-700 mb-1 block">Бейджи (через запятую)</label>
              <input
                className="ozor-input"
                value={(form.badges ?? []).join(", ")}
                onChange={(e) => set("badges", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                placeholder="хит, −20%, новинка"
              />
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
