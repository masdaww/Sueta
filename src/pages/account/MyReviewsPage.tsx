import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Rating } from "../../components/ui/Rating";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { listProducts, listReviewsByUser } from "../../api/mockApi";
import { useApp } from "../../store/AppContext";
import { formatDate } from "../../lib/format";
import type { Product, Review } from "../../types";

export function MyReviewsPage() {
  const { user } = useApp();
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([listReviewsByUser(user.id), listProducts({ pageSize: 1000 })]).then(([rs, ps]) => {
      setReviews(rs);
      setProducts(ps.items);
    });
  }, [user]);

  if (!user) return null;
  if (reviews === null) {
    return (
      <div className="space-y-3">
        <h1 className="ozor-section-title">Мои отзывы</h1>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="space-y-5">
        <h1 className="ozor-section-title">Мои отзывы</h1>
        <EmptyState
          emoji="✍️"
          title="Вы ещё ничего не отозвали"
          description="Отзывы — это валюта внимания. Делитесь."
          action={
            <Link to="/catalog" className="ozor-btn-primary px-4 py-2">
              Найти товар
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="ozor-section-title">Мои отзывы</h1>
      <div className="space-y-3">
        {reviews.map((r) => {
          const p = products.find((p) => p.id === r.productId);
          return (
            <div key={r.id} className="ozor-card p-4">
              <div className="flex items-center justify-between gap-2">
                <Link to={`/product/${r.productId}`} className="font-semibold text-ink-900 hover:text-ozor-600 line-clamp-1">
                  {p?.title ?? "Товар"}
                </Link>
                <span
                  className={
                    r.status === "approved"
                      ? "ozor-chip bg-emerald-100 text-emerald-800"
                      : r.status === "pending"
                        ? "ozor-chip bg-amber-100 text-amber-800"
                        : "ozor-chip bg-red-100 text-red-700"
                  }
                >
                  {r.status === "approved" ? "опубликован" : r.status === "pending" ? "на модерации" : "отклонён"}
                </span>
              </div>
              <Rating value={r.rating} size={14} className="mt-1" />
              <p className="mt-2 text-ink-700">{r.text}</p>
              <div className="text-xs text-ink-500 mt-1">{formatDate(r.createdAt)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
