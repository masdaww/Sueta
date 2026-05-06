import { useEffect, useState } from "react";
import { ArrowUpRight, MessageSquare, Package, ShoppingCart, Users, Wallet } from "lucide-react";
import { Skeleton } from "../../components/ui/Skeleton";
import { getStats, type Stats } from "../../api/mockApi";
import { OrderStatusPill, statusLabels } from "../../components/order/OrderStatusPill";
import { formatPrice } from "../../lib/format";
import type { OrderStatus } from "../../types";

export function AdminStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let mounted = true;
    const reload = () => getStats().then((s) => mounted && setStats(s));
    reload();
    const t = setInterval(reload, 8000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, []);

  if (!stats) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  const maxRev = Math.max(...stats.revenueLast7Days.map((d) => d.total), 1);
  const maxSign = Math.max(...stats.signupsLast7Days.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      <h1 className="ozor-section-title">Статистика озорства</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat icon={ShoppingCart} label="Заказы" value={stats.totalOrders.toString()} accent="bg-ozor-500" />
        <Stat icon={Wallet} label="Выручка" value={formatPrice(stats.totalRevenue)} accent="bg-emerald-500" />
        <Stat icon={Package} label="Товары" value={stats.totalProducts.toString()} accent="bg-violet-500" />
        <Stat icon={Users} label="Пользователи" value={stats.totalUsers.toString()} accent="bg-amber-500" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="ozor-card p-5">
          <div className="font-semibold mb-3 flex items-center gap-2">
            <ArrowUpRight className="text-emerald-500" size={18} /> Выручка за 7 дней
          </div>
          <div className="flex items-end gap-2 h-40">
            {stats.revenueLast7Days.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center justify-end gap-1">
                <div
                  className="w-full bg-gradient-to-t from-ozor-500 to-ozor-300 rounded-md min-h-[4px]"
                  style={{ height: `${(d.total / maxRev) * 100}%` }}
                  title={formatPrice(d.total)}
                />
                <div className="text-[10px] text-ink-500">{d.date}</div>
              </div>
            ))}
          </div>
          <div className="text-xs text-ink-500 mt-2">Сумма всех принятых заказов по дням.</div>
        </div>
        <div className="ozor-card p-5">
          <div className="font-semibold mb-3 flex items-center gap-2">
            <Users className="text-violet-500" size={18} /> Регистрации за 7 дней
          </div>
          <div className="flex items-end gap-2 h-40">
            {stats.signupsLast7Days.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center justify-end gap-1">
                <div
                  className="w-full bg-gradient-to-t from-violet-500 to-violet-300 rounded-md min-h-[4px]"
                  style={{ height: `${(d.count / maxSign) * 100}%` }}
                  title={`${d.count}`}
                />
                <div className="text-[10px] text-ink-500">{d.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="ozor-card p-5">
          <div className="font-semibold mb-3">Заказы по статусам</div>
          <div className="space-y-2">
            {stats.ordersByStatus.map((s) => {
              const max = Math.max(...stats.ordersByStatus.map((x) => x.count), 1);
              const pct = (s.count / max) * 100;
              return (
                <div key={s.status} className="flex items-center gap-3">
                  <div className="w-28">
                    <OrderStatusPill status={s.status as OrderStatus} />
                  </div>
                  <div className="flex-1 h-3 bg-ink-100 rounded-full overflow-hidden">
                    <div className="h-full bg-ink-700" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="w-10 text-right font-semibold tabular-nums">{s.count}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="ozor-card p-5">
          <div className="font-semibold mb-3 flex items-center gap-2">
            <MessageSquare className="text-amber-500" size={18} /> Отзывы
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-2xl bg-ink-50 p-4">
              <div className="text-3xl font-extrabold">{stats.totalReviews}</div>
              <div className="text-xs text-ink-500 uppercase tracking-wider">всего</div>
            </div>
            <div className="rounded-2xl bg-amber-50 p-4">
              <div className="text-3xl font-extrabold text-amber-700">{stats.pendingReviews}</div>
              <div className="text-xs text-amber-700/80 uppercase tracking-wider">на модерации</div>
            </div>
          </div>
          <p className="text-xs text-ink-500 mt-3">
            Незаслуженно негативные отзывы лучше согласовать с енотом.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="ozor-card p-5">
          <div className="font-semibold mb-3">Топ товаров</div>
          <div className="space-y-2">
            {stats.topProducts.map((p, i) => (
              <div key={p.productId} className="flex items-center gap-3">
                <span className="w-6 text-ink-400 font-bold tabular-nums">{i + 1}.</span>
                <span className="text-2xl">{p.emoji}</span>
                <div className="flex-1 min-w-0 truncate">{p.title}</div>
                <span className="text-sm text-ink-500">{p.sold} шт.</span>
                <span className="font-semibold w-24 text-right">{formatPrice(p.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="ozor-card p-5">
          <div className="font-semibold mb-3">Топ категорий</div>
          <div className="space-y-2">
            {stats.topCategories.map((c, i) => (
              <div key={c.categoryId} className="flex items-center gap-3">
                <span className="w-6 text-ink-400 font-bold tabular-nums">{i + 1}.</span>
                <span className="text-2xl">{c.emoji}</span>
                <div className="flex-1 min-w-0">{c.name}</div>
                <span className="font-semibold">{c.sold} шт.</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-ink-400">
        Все цифры пародийные и обновляются автоматически каждые 8 секунд. {Object.keys(statusLabels).length} статусов заказа поддерживается.
      </p>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="ozor-card p-4 flex items-center gap-3">
      <div className={`h-10 w-10 rounded-xl ${accent} text-white flex items-center justify-center`}>
        <Icon size={18} />
      </div>
      <div>
        <div className="text-xs text-ink-500 uppercase tracking-wider">{label}</div>
        <div className="text-xl font-extrabold text-ink-900">{value}</div>
      </div>
    </div>
  );
}
