import { Heart, LogIn, Menu, Search, ShoppingCart, Sparkles, User as UserIcon, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate, useSearchParams } from "react-router-dom";
import clsx from "clsx";
import { useApp } from "../../store/AppContext";
import { listCategories } from "../../api/mockApi";
import type { Category } from "../../types";

export function Header() {
  const { user, cartCount, wishlist, logout } = useApp();
  const [params] = useSearchParams();
  const initial = params.get("q") ?? "";
  const [search, setSearch] = useState(initial);
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    listCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setSearch(initial);
  }, [initial]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    navigate(q ? `/catalog?q=${encodeURIComponent(q)}` : "/catalog");
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-ink-100">
      <div className="bg-ozor-500 text-white text-xs">
        <div className="container mx-auto px-4 py-1.5 flex items-center justify-between">
          <span className="hidden sm:inline">Доставка енотом — бесплатно от 1 999 ₽. Иногда даже до того, как вы заказали.</span>
          <span className="sm:hidden">Доставка енотом — бесплатно от 1 999 ₽</span>
          <div className="hidden md:flex items-center gap-4">
            <Link to="/catalog" className="hover:underline">Каталог</Link>
            <Link to="/account/orders" className="hover:underline">Где мой заказ?</Link>
            <Link to="/admin" className="hover:underline">Стать продавцом</Link>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-3 flex items-center gap-3">
        <button
          className="md:hidden -ml-1 rounded-lg p-2 hover:bg-ink-100"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
        <Link to="/" className="flex items-center gap-2 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-ozor-300 to-ozor-600 flex items-center justify-center text-white font-extrabold shadow-card">
            О
          </div>
          <div className="leading-tight">
            <div className="font-extrabold text-xl tracking-tight text-ink-900 group-hover:text-ozor-600 transition-colors">
              ОЗОР
            </div>
            <div className="hidden sm:block text-[10px] uppercase tracking-[0.2em] text-ink-400 -mt-0.5">
              Маркетплейс полнейшего озорства
            </div>
          </div>
        </Link>

        <form onSubmit={submitSearch} className="flex-1 hidden md:flex">
          <div className="flex w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" size={18} />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Найти что-нибудь нелепое…"
                className="ozor-input pl-10 rounded-r-none border-r-0"
              />
            </div>
            <button type="submit" className="ozor-btn-primary px-5 rounded-l-none">
              Искать
            </button>
          </div>
        </form>

        <div className="ml-auto md:ml-0 flex items-center gap-2 md:gap-1">
          <Link
            to="/account/wishlist"
            className="hidden md:inline-flex flex-col items-center px-2 py-1.5 rounded-lg hover:bg-ink-100 text-ink-700 relative"
          >
            <Heart size={20} />
            <span className="text-[11px] mt-0.5">Избранное</span>
            {wishlist.length > 0 && (
              <span className="absolute -top-0.5 right-0 bg-ozor-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </Link>
          <Link
            to="/cart"
            className="inline-flex flex-col items-center px-2 py-1.5 rounded-lg hover:bg-ink-100 text-ink-700 relative"
          >
            <ShoppingCart size={20} />
            <span className="text-[11px] mt-0.5 hidden md:inline">Корзина</span>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 right-0 bg-ozor-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <div ref={profileRef} className="relative">
            {user ? (
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className="inline-flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-ink-100"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent-violet to-accent-rose flex items-center justify-center text-white text-base">
                  {user.avatar ?? "🦝"}
                </div>
                <span className="hidden md:flex flex-col items-start leading-tight">
                  <span className="text-[11px] text-ink-500">Вы — </span>
                  <span className="text-sm font-semibold text-ink-900">{user.name.split(" ")[0]}</span>
                </span>
              </button>
            ) : (
              <Link
                to="/login"
                className="inline-flex flex-col items-center px-2 py-1.5 rounded-lg hover:bg-ink-100 text-ink-700"
              >
                <LogIn size={20} />
                <span className="text-[11px] mt-0.5 hidden md:inline">Войти</span>
              </Link>
            )}
            {profileOpen && user && (
              <div className="absolute right-0 mt-2 w-60 ozor-card border border-ink-100 p-2 animate-pop-in">
                <div className="px-3 py-2 border-b border-ink-100">
                  <div className="text-sm font-semibold text-ink-900">{user.name}</div>
                  <div className="text-xs text-ink-500">{user.email}</div>
                </div>
                <ProfileMenu onClose={() => setProfileOpen(false)} isAdmin={user.role === "admin"} onLogout={logout} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search */}
      <form onSubmit={submitSearch} className="md:hidden px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" size={18} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Найти что-нибудь нелепое…"
            className="ozor-input pl-10"
          />
        </div>
      </form>

      {/* Categories nav (desktop) */}
      <nav className="hidden md:block border-t border-ink-100">
        <div className="container mx-auto px-4 flex items-center gap-1 overflow-x-auto no-scrollbar">
          <NavLink
            to="/catalog"
            end
            className={({ isActive }) =>
              clsx(
                "shrink-0 px-3 py-2.5 text-sm font-medium hover:text-ozor-600 transition-colors",
                isActive ? "text-ozor-600" : "text-ink-700",
              )
            }
          >
            <Sparkles className="inline mr-1" size={14} /> Все товары
          </NavLink>
          {categories.map((c) => (
            <NavLink
              key={c.id}
              to={`/catalog?cat=${c.slug}`}
              className="shrink-0 px-3 py-2.5 text-sm font-medium text-ink-700 hover:text-ozor-600 transition-colors"
            >
              <span className="mr-1">{c.emoji}</span> {c.name}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-ink-100 bg-white animate-fade-in">
          <div className="container mx-auto px-4 py-3 flex flex-col">
            <Link to="/catalog" onClick={() => setOpen(false)} className="py-2 text-ink-700 font-medium">
              Все товары
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/catalog?cat=${c.slug}`}
                onClick={() => setOpen(false)}
                className="py-2 text-ink-700"
              >
                <span className="mr-1">{c.emoji}</span> {c.name}
              </Link>
            ))}
            <div className="border-t border-ink-100 my-2" />
            <Link to="/account" onClick={() => setOpen(false)} className="py-2 text-ink-700">
              <UserIcon size={16} className="inline mr-1" /> Личный кабинет
            </Link>
            <Link to="/account/wishlist" onClick={() => setOpen(false)} className="py-2 text-ink-700">
              <Heart size={16} className="inline mr-1" /> Избранное
            </Link>
            <Link to="/account/orders" onClick={() => setOpen(false)} className="py-2 text-ink-700">
              Где мой заказ?
            </Link>
            <Link to="/admin" onClick={() => setOpen(false)} className="py-2 text-ink-700">
              Админ-панель
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function ProfileMenu({
  onClose,
  isAdmin,
  onLogout,
}: {
  onClose: () => void;
  isAdmin: boolean;
  onLogout: () => void;
}) {
  return (
    <div className="py-1">
      <Link to="/account" onClick={onClose} className="block px-3 py-2 rounded-lg hover:bg-ink-100 text-sm">
        Мой профиль
      </Link>
      <Link to="/account/orders" onClick={onClose} className="block px-3 py-2 rounded-lg hover:bg-ink-100 text-sm">
        Мои заказы
      </Link>
      <Link to="/account/wishlist" onClick={onClose} className="block px-3 py-2 rounded-lg hover:bg-ink-100 text-sm">
        Избранное
      </Link>
      <Link to="/account/reviews" onClick={onClose} className="block px-3 py-2 rounded-lg hover:bg-ink-100 text-sm">
        Мои отзывы
      </Link>
      {isAdmin && (
        <Link
          to="/admin"
          onClick={onClose}
          className="block px-3 py-2 rounded-lg hover:bg-ink-100 text-sm font-semibold text-ozor-600"
        >
          Админ-панель
        </Link>
      )}
      <button
        onClick={() => {
          onLogout();
          onClose();
        }}
        className="w-full text-left px-3 py-2 rounded-lg hover:bg-ink-100 text-sm text-red-600"
      >
        Выйти
      </button>
    </div>
  );
}
