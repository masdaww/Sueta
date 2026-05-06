import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { useApp } from "../store/AppContext";

type Tab = "login" | "register";

export function LoginPage() {
  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, pushToast } = useApp();
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (tab === "login") {
        const u = await login(email, password);
        pushToast({ type: "success", title: `С возвращением, ${u.name.split(" ")[0]}!` });
        navigate(u.role === "admin" ? "/admin" : from, { replace: true });
      } else {
        const u = await register(email, name, password);
        pushToast({ type: "success", title: `Добро пожаловать в озорство, ${u.name}!` });
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Что-то пошло не так");
    } finally {
      setBusy(false);
    }
  };

  const fill = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-md mx-auto ozor-card p-6">
        <h1 className="text-2xl font-extrabold text-ink-900">{tab === "login" ? "Вход" : "Регистрация"}</h1>
        <p className="text-sm text-ink-500 mt-1">
          {tab === "login" ? "Снова озорить — это к нам." : "Создайте аккаунт и присоединяйтесь к озорникам."}
        </p>
        <div className="mt-4 flex bg-ink-100 rounded-xl p-1 text-sm">
          <button
            onClick={() => setTab("login")}
            className={clsx(
              "flex-1 py-2 rounded-lg font-medium",
              tab === "login" ? "bg-white shadow text-ink-900" : "text-ink-600",
            )}
          >
            Вход
          </button>
          <button
            onClick={() => setTab("register")}
            className={clsx(
              "flex-1 py-2 rounded-lg font-medium",
              tab === "register" ? "bg-white shadow text-ink-900" : "text-ink-600",
            )}
          >
            Регистрация
          </button>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-3">
          {tab === "register" && (
            <div>
              <label className="text-sm text-ink-700 mb-1 block">Имя</label>
              <input className="ozor-input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}
          <div>
            <label className="text-sm text-ink-700 mb-1 block">Email</label>
            <input
              type="email"
              className="ozor-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm text-ink-700 mb-1 block">Пароль</label>
            <input
              type="password"
              className="ozor-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={4}
              required
            />
          </div>
          {error && (
            <div className="rounded-xl bg-red-50 text-red-800 px-3 py-2 text-sm">{error}</div>
          )}
          <button type="submit" disabled={busy} className="ozor-btn-primary w-full py-2.5">
            {busy ? "Озорим…" : tab === "login" ? "Войти" : "Зарегистрироваться"}
          </button>
        </form>

        {tab === "login" && (
          <div className="mt-5 rounded-xl border border-dashed border-ink-200 p-3 text-xs text-ink-500">
            <div className="font-semibold text-ink-700 mb-1">Демо-аккаунты</div>
            <button
              type="button"
              onClick={() => fill("user@ozor.ru", "user12345")}
              className="block w-full text-left hover:bg-ink-50 rounded-md px-2 py-1"
            >
              👤 <b>user@ozor.ru</b> / user12345 — обычный покупатель
            </button>
            <button
              type="button"
              onClick={() => fill("admin@ozor.ru", "admin12345")}
              className="block w-full text-left hover:bg-ink-50 rounded-md px-2 py-1"
            >
              🦊 <b>admin@ozor.ru</b> / admin12345 — администратор
            </button>
          </div>
        )}

        <Link to="/" className="block text-center mt-4 text-sm text-ink-500 hover:text-ozor-600">
          ← На главную
        </Link>
      </div>
    </div>
  );
}
