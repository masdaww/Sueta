import { useState } from "react";
import { updateUser } from "../../api/mockApi";
import { useApp } from "../../store/AppContext";

export function ProfilePage() {
  const { user, refreshUser, pushToast } = useApp();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [address, setAddress] = useState(user?.address ?? "");
  const [avatar, setAvatar] = useState(user?.avatar ?? "🦝");
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await updateUser(user.id, { name, phone, address, avatar });
      await refreshUser();
      pushToast({ type: "success", title: "Профиль обновлён", description: "Изменения уже в действии." });
    } catch {
      pushToast({ type: "error", title: "Не удалось сохранить" });
    } finally {
      setBusy(false);
    }
  };

  const avatars = ["🦝", "🦊", "🐱", "🐶", "🐸", "🐵", "🐧", "🦔", "👻", "👑", "🤡", "🧑‍🚀"];

  return (
    <div className="space-y-5">
      <h1 className="ozor-section-title">Профиль</h1>
      <form onSubmit={submit} className="ozor-card p-5 space-y-4 max-w-2xl">
        <div>
          <label className="text-sm text-ink-700 mb-2 block">Аватар</label>
          <div className="flex flex-wrap gap-2">
            {avatars.map((a) => (
              <button
                type="button"
                key={a}
                onClick={() => setAvatar(a)}
                className={`h-11 w-11 rounded-full text-2xl flex items-center justify-center ${avatar === a ? "ring-2 ring-ozor-500 bg-ozor-50" : "bg-ink-100 hover:bg-ink-200"}`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-ink-700 mb-1 block">Имя</label>
            <input className="ozor-input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm text-ink-700 mb-1 block">Email</label>
            <input className="ozor-input bg-ink-50" value={user.email} disabled />
          </div>
          <div>
            <label className="text-sm text-ink-700 mb-1 block">Телефон</label>
            <input className="ozor-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 ___ ___-__-__" />
          </div>
          <div>
            <label className="text-sm text-ink-700 mb-1 block">Адрес доставки</label>
            <input className="ozor-input" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
        </div>
        <button disabled={busy} className="ozor-btn-primary px-4 py-2.5">{busy ? "Сохраняем…" : "Сохранить"}</button>
      </form>
    </div>
  );
}
