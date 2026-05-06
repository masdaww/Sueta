import { BarChart3, Box, MessageSquare, Users } from "lucide-react";
import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { useApp } from "../../store/AppContext";

const items = [
  { to: "/admin", label: "Статистика", icon: BarChart3, end: true },
  { to: "/admin/products", label: "Товары", icon: Box },
  { to: "/admin/users", label: "Пользователи", icon: Users },
  { to: "/admin/reviews", label: "Отзывы", icon: MessageSquare },
];

export function AdminLayout() {
  const { user, pushToast } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true, state: { from: "/admin" } });
      return;
    }
    if (user.role !== "admin") {
      pushToast({ type: "warning", title: "Только для админов", description: "Зайдите как admin@ozor.ru / admin12345" });
      navigate("/", { replace: true });
    }
  }, [user, navigate, pushToast]);

  if (!user || user.role !== "admin") return null;

  return (
    <div>
      <div className="bg-ink-900 text-white">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <div className="text-xl font-extrabold">🦊 Озор-админка</div>
          <span className="ozor-chip bg-ozor-500 text-white text-[10px] uppercase tracking-widest">Beta</span>
          <div className="ml-auto text-sm text-ink-300">{user.name}</div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-6 grid lg:grid-cols-[240px_1fr] gap-6 items-start">
        <aside className="ozor-card p-2 lg:sticky lg:top-[calc(var(--header-h)+8px)]">
          <nav className="space-y-0.5">
            {items.map((it) => {
              const Icon = it.icon;
              return (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={it.end}
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center gap-2 rounded-xl px-3 py-2 text-sm",
                      isActive
                        ? "bg-ozor-500 text-white font-semibold"
                        : "text-ink-700 hover:bg-ink-100",
                    )
                  }
                >
                  <Icon size={16} />
                  {it.label}
                </NavLink>
              );
            })}
          </nav>
        </aside>
        <Outlet />
      </div>
    </div>
  );
}
