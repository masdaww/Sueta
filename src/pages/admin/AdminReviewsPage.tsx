import { useEffect, useState } from "react";
import { Check, Trash2, X } from "lucide-react";
import clsx from "clsx";
import { Skeleton } from "../../components/ui/Skeleton";
import { Rating } from "../../components/ui/Rating";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import {
  deleteReview,
  listAllReviews,
  listProducts,
  updateReviewStatus,
} from "../../api/mockApi";
import type { Product, Review } from "../../types";
import { useApp } from "../../store/AppContext";
import { formatDateTime } from "../../lib/format";

const tabs: { value: Review["status"] | "all"; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "pending", label: "На модерации" },
  { value: "approved", label: "Опубликованные" },
  { value: "rejected", label: "Отклонённые" },
];

export function AdminReviewsPage() {
  const { pushToast } = useApp();
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [tab, setTab] = useState<Review["status"] | "all">("pending");
  const [confirmDelete, setConfirmDelete] = useState<Review | null>(null);

  const reload = () => listAllReviews().then(setReviews);
  useEffect(() => {
    listProducts({ pageSize: 1000, includeHidden: true }).then((res) => setProducts(res.items));
    reload();
  }, []);

  const filtered = (reviews ?? []).filter((r) => tab === "all" || r.status === tab);

  return (
    <div className="space-y-4">
      <h1 className="ozor-section-title">Модерация отзывов</h1>
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const count = (reviews ?? []).filter((r) => t.value === "all" || r.status === t.value).length;
          return (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={clsx(
                "rounded-full px-3 py-1.5 text-sm",
                tab === t.value ? "bg-ozor-500 text-white" : "bg-ink-100 text-ink-700 hover:bg-ink-200",
              )}
            >
              {t.label} <span className="opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {reviews === null ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="ozor-card p-10 text-center text-ink-500">Здесь пока пусто. Енот доволен.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const p = products.find((p) => p.id === r.productId);
            return (
              <div key={r.id} className="ozor-card p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-2xl">{p?.emoji ?? "❓"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-ink-900 line-clamp-1">{p?.title ?? "Удалённый товар"}</div>
                    <div className="text-xs text-ink-500">{r.userName} · {formatDateTime(r.createdAt)}</div>
                  </div>
                  <Rating value={r.rating} size={14} />
                  <span
                    className={clsx(
                      "ozor-chip",
                      r.status === "approved"
                        ? "bg-emerald-100 text-emerald-800"
                        : r.status === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-700",
                    )}
                  >
                    {r.status === "approved" ? "опубликован" : r.status === "pending" ? "на модерации" : "отклонён"}
                  </span>
                </div>
                <p className="mt-2 text-ink-700">{r.text}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {r.status !== "approved" && (
                    <button
                      onClick={async () => {
                        await updateReviewStatus(r.id, "approved");
                        pushToast({ type: "success", title: "Отзыв опубликован" });
                        reload();
                      }}
                      className="ozor-btn-primary px-3 py-1.5 text-sm"
                    >
                      <Check size={14} /> Опубликовать
                    </button>
                  )}
                  {r.status !== "rejected" && (
                    <button
                      onClick={async () => {
                        await updateReviewStatus(r.id, "rejected");
                        pushToast({ type: "info", title: "Отзыв отклонён" });
                        reload();
                      }}
                      className="ozor-btn-secondary px-3 py-1.5 text-sm"
                    >
                      <X size={14} /> Отклонить
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmDelete(r)}
                    className="ozor-btn-ghost text-red-600 px-3 py-1.5 text-sm"
                  >
                    <Trash2 size={14} /> Удалить
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Удалить отзыв?"
        description="Это действие нельзя отменить."
        destructive
        confirmLabel="Удалить"
        onConfirm={async () => {
          if (confirmDelete) {
            await deleteReview(confirmDelete.id);
            pushToast({ type: "success", title: "Отзыв удалён" });
            reload();
          }
        }}
      />
    </div>
  );
}
