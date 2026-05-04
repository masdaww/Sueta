import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";
import { useApp } from "../../store/AppContext";

export function Footer() {
  const [email, setEmail] = useState("");
  const { pushToast } = useApp();
  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      pushToast({ type: "warning", title: "Хм…", description: "Это не похоже на email. Попробуйте ещё раз." });
      return;
    }
    setEmail("");
    pushToast({
      type: "success",
      title: "Подписались!",
      description: "Енот обещает писать редко, но громко.",
    });
  };

  return (
    <footer className="mt-20 bg-ink-900 text-ink-100">
      <div className="container mx-auto px-4 py-12 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-ozor-300 to-ozor-600 flex items-center justify-center text-white font-extrabold">
              О
            </div>
            <div className="font-extrabold text-xl">ОЗОР</div>
          </div>
          <p className="text-sm text-ink-300 leading-relaxed">
            Пародийный маркетплейс. Существует, чтобы вы улыбнулись. Оплата енотами не принимается.
          </p>
        </div>
        <div>
          <div className="font-semibold mb-3">Покупателям</div>
          <ul className="space-y-2 text-sm text-ink-300">
            <li><Link to="/catalog" className="hover:text-white">Каталог</Link></li>
            <li><Link to="/account/orders" className="hover:text-white">Мои заказы</Link></li>
            <li><Link to="/account/wishlist" className="hover:text-white">Избранное</Link></li>
            <li><Link to="/cart" className="hover:text-white">Корзина</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3">Помощь</div>
          <ul className="space-y-2 text-sm text-ink-300">
            <li className="flex items-start gap-2"><Phone size={16} className="mt-0.5" /> <span>+7 (495) ОЗО-РИТЬ</span></li>
            <li className="flex items-start gap-2"><Mail size={16} className="mt-0.5" /> <span>help@ozor.example</span></li>
            <li className="flex items-start gap-2"><MapPin size={16} className="mt-0.5" /> <span>г. Озорск, ул. Шуточная, 7</span></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3">Енотовости на почту</div>
          <p className="text-sm text-ink-300 mb-3">Раз в неделю — самые странные новинки.</p>
          <form onSubmit={subscribe} className="flex">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ваш email"
              className="flex-1 rounded-l-xl bg-ink-800 border border-ink-700 px-3 py-2 text-sm text-white placeholder:text-ink-400 outline-none focus:border-ozor-400"
              required
            />
            <button type="submit" className="ozor-btn-primary rounded-l-none px-3 py-2 text-sm">
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-ink-800">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ink-400">
          <div>© {new Date().getFullYear()} ОЗОР — пародия, любые совпадения с реальностью совершенно не случайны.</div>
          <div className="flex gap-3">
            <span>Условия озорства</span>
            <span>Политика забывчивости</span>
            <span>Cookies (печеньки настоящие)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
