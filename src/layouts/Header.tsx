import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '@/store/cart'
import { useWishlist } from '@/store/wishlist'
import { useSession } from '@/store/session'
import { useCatalog } from '@/store/catalog'

export function Header() {
  const navigate = useNavigate()
  const cartCount = useCart((s) => s.items.reduce((a, i) => a + i.qty, 0))
  const wishlistCount = useWishlist((s) => s.ids.length)
  const userId = useSession((s) => s.userId)
  const isAdminMode = useSession((s) => s.isAdminMode)
  const setAdminMode = useSession((s) => s.setAdminMode)
  const users = useCatalog((s) => s.users)
  const me = users.find((u) => u.id === userId)
  const isAdmin = me?.role === 'admin' || isAdminMode

  const [q, setQ] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/c?q=${encodeURIComponent(q.trim())}`)
    setMobileOpen(false)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="-ml-1 inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Меню"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-sueta-500 to-sueta-700 text-base font-bold text-white shadow">
            С
          </span>
          <span className="hidden text-lg font-extrabold tracking-tight text-slate-900 sm:inline">
            СуетаШоп
          </span>
        </Link>

        <form onSubmit={onSearch} className="ml-2 hidden flex-1 sm:block">
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              type="search"
              placeholder="Найти что-нибудь сомнительное…"
              className="input h-10 pl-10"
            />
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          </div>
        </form>

        <nav className="ml-auto flex items-center gap-1 text-slate-600 sm:gap-2">
          <NavLink to="/c" className={({ isActive }) => navLinkCls(isActive)} title="Каталог">
            <span className="hidden sm:inline">Каталог</span>
            <span className="sm:hidden text-base">📚</span>
          </NavLink>
          <NavLink to="/wishlist" className={({ isActive }) => navLinkCls(isActive) + ' relative'} title="Избранное">
            <span className="hidden sm:inline">Избранное</span>
            <span className="sm:hidden text-base">♥</span>
            {wishlistCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </NavLink>
          <NavLink to="/account" className={({ isActive }) => navLinkCls(isActive)} title="Личный кабинет">
            <span className="hidden sm:inline">Кабинет</span>
            <span className="sm:hidden text-base">👤</span>
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => navLinkCls(isActive) + ' hidden sm:inline-flex'} title="Админ">
              Админ
            </NavLink>
          )}
          <NavLink to="/cart" className={({ isActive }) => navLinkCls(isActive) + ' relative'} title="Корзина">
            <span className="hidden sm:inline">Корзина</span>
            <span className="sm:hidden text-base">🛒</span>
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-sueta-600 px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </NavLink>
          {!isAdmin && (
            <button
              type="button"
              className="hidden rounded-md px-2 py-1 text-xs text-slate-400 hover:text-slate-700 sm:inline"
              title="Войти как админ (демо)"
              onClick={() => setAdminMode(true)}
            >
              admin
            </button>
          )}
        </nav>
      </div>

      <form onSubmit={onSearch} className="px-4 pb-3 sm:hidden">
        <div className="relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="search"
            placeholder="Найти товар…"
            className="input h-10 pl-10"
          />
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        </div>
      </form>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
          <ul className="flex flex-col gap-1 text-sm">
            <li><Link to="/" onClick={() => setMobileOpen(false)} className="block rounded px-2 py-2 hover:bg-slate-100">🏠 Главная</Link></li>
            <li><Link to="/c" onClick={() => setMobileOpen(false)} className="block rounded px-2 py-2 hover:bg-slate-100">📚 Каталог</Link></li>
            <li><Link to="/wishlist" onClick={() => setMobileOpen(false)} className="block rounded px-2 py-2 hover:bg-slate-100">♥ Избранное</Link></li>
            <li><Link to="/cart" onClick={() => setMobileOpen(false)} className="block rounded px-2 py-2 hover:bg-slate-100">🛒 Корзина</Link></li>
            <li><Link to="/account" onClick={() => setMobileOpen(false)} className="block rounded px-2 py-2 hover:bg-slate-100">👤 Кабинет</Link></li>
            {isAdmin && (
              <li><Link to="/admin" onClick={() => setMobileOpen(false)} className="block rounded px-2 py-2 hover:bg-slate-100">🛠️ Админка</Link></li>
            )}
          </ul>
        </div>
      )}
    </header>
  )
}

function navLinkCls(isActive: boolean) {
  return `inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium ${
    isActive ? 'bg-sueta-50 text-sueta-700' : 'hover:bg-slate-100 hover:text-slate-900'
  }`
}
