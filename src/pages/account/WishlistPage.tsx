import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ProductCard } from "../../components/product/ProductCard";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import type { Product } from "../../types";
import { listProducts } from "../../api/mockApi";
import { useApp } from "../../store/AppContext";

export function WishlistPage() {
  const { wishlist } = useApp();
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    let alive = true;
    listProducts({ pageSize: 1000 }).then((res) => {
      if (alive) setProducts(res.items);
    });
    return () => {
      alive = false;
    };
  }, []);

  const items = products?.filter((p) => wishlist.includes(p.id)) ?? [];

  if (products === null) {
    return (
      <div className="space-y-4">
        <h1 className="ozor-section-title">Избранное</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="space-y-5">
        <h1 className="ozor-section-title">Избранное</h1>
        <EmptyState
          emoji="❤️"
          title="Пока ничего не запало в душу"
          description="Сердечко в каталоге сделает товар избранным."
          action={
            <Link to="/catalog" className="ozor-btn-primary px-4 py-2">
              К каталогу
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="ozor-section-title">Избранное ({items.length})</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
