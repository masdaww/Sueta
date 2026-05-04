export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-sueta-500 to-sueta-700 text-sm font-bold text-white">С</span>
            <span className="text-base font-extrabold text-slate-900">СуетаШоп</span>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Маркетплейс, где всё немного не так. Это пародия — все цены условные, голуби — настоящие.
          </p>
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">Покупателям</div>
          <ul className="mt-2 space-y-1 text-sm text-slate-500">
            <li>Доставка голубем</li>
            <li>Гарантия — это вера</li>
            <li>Возврат настроения</li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">Партнёрам</div>
          <ul className="mt-2 space-y-1 text-sm text-slate-500">
            <li>Стать продавцом</li>
            <li>Программа «Друзья суеты»</li>
            <li>Открытое API (закрытое)</li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">Контакты</div>
          <ul className="mt-2 space-y-1 text-sm text-slate-500">
            <li>+7 (999) 000-00-00</li>
            <li>support@suetashop.ru</li>
            <li>с 9:00 до 9:01</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} СуетаШоп. Все совпадения с реальными маркетплейсами случайны и забавны.
      </div>
    </footer>
  )
}
