import { Heart, ListOrdered, MessageSquare, Star, User as UserIcon } from "lucide-react";
import type { ReactNode } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { useApp } from "../../store/AppContext";
import { useEffect } from "react";

const items = [
  { to: "/account", label: "Профиль", icon: UserIcon, end: true },
  { to: "/account/orders", label: "Мои заказы", icon: ListOrdered },
  { to: "/account/wishlist", label: "Избранное", icon: Heart },
  { to: "/account/reviews", label: "Мои отзывы", icon: MessageSquare },
];

export function AccountLayout({ children }: { children?: ReactNode }) {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) navigate("/login", { replace: true, state: { from: "/account" } });
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid lg:grid-cols-[260px_1fr] gap-6 items-start">
        <aside className="ozor-card p-4 lg:sticky lg:top-[calc(var(--header-h)+8px)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-accent-violet to-accent-rose flex items-center justify-center text-white text-2xl">
              {user.avatar ?? "🦝"}
            </div>
            <div>
              <div className="font-semibold text-ink-900">{user.name}</div>
              <div className="text-xs text-ink-500 flex items-center gap-1">
                <Star size={10} className="text-accent-sun fill-accent-sun" /> Озорник уровня «Бывалый»
              </div>
            </div>
          </div>
          <nav className="space-y-1">
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
                      isActive ? "bg-ozor-50 text-ozor-700 font-semibold" : "text-ink-700 hover:bg-ink-100",
                    )
                  }
                >
                  <Icon size={16} />
                  {it.label}
                </NavLink>
              );
            })}
          </nav>
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="w-full text-left mt-4 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50"
          >
            Выйти
          </button>
        </aside>
        <div>{children ?? <Outlet />}</div>
      </div>
    </div>
  );
}
