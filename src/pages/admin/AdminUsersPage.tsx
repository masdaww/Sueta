import { useEffect, useState } from "react";
import { Pencil, Plus, Search, ShieldCheck, ShieldOff, Trash2, UserCog } from "lucide-react";
import clsx from "clsx";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { Modal } from "../../components/ui/Modal";
import { Skeleton } from "../../components/ui/Skeleton";
import {
  createUser,
  deleteUser,
  listUsers,
  updateUser,
} from "../../api/mockApi";
import type { User } from "../../types";
import { useApp } from "../../store/AppContext";
import { formatDate } from "../../lib/format";

export function AdminUsersPage() {
  const { pushToast, user: currentUser } = useApp();
  const [users, setUsers] = useState<User[] | null>(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<User | null | "new">(null);
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);
  const [confirmBlock, setConfirmBlock] = useState<User | null>(null);

  const reload = () => listUsers().then(setUsers);
  useEffect(() => {
    reload();
  }, []);

  const filtered = (users ?? []).filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="ozor-section-title">Пользователи</h1>
        <button onClick={() => setEditing("new")} className="ozor-btn-primary px-3 py-2 text-sm">
          <Plus size={14} /> Добавить
        </button>
      </div>

      <div className="ozor-card p-4">
        <div className="relative max-w-md mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            placeholder="Найти по имени или email"
            className="ozor-input pl-9 py-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {users === null ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-ink-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-2 pr-3">Пользователь</th>
                  <th className="py-2 px-3 hidden sm:table-cell">Email</th>
                  <th className="py-2 px-3">Роль</th>
                  <th className="py-2 px-3 hidden md:table-cell">Регистрация</th>
                  <th className="py-2 px-3">Статус</th>
                  <th className="py-2 pl-3 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-ink-50">
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-full bg-ink-100 flex items-center justify-center text-xl">
                          {u.avatar ?? "🦝"}
                        </div>
                        <div className="font-medium">{u.name}</div>
                      </div>
                    </td>
                    <td className="py-2 px-3 hidden sm:table-cell text-ink-600">{u.email}</td>
                    <td className="py-2 px-3">
                      {u.role === "admin" ? (
                        <span className="ozor-chip bg-violet-100 text-violet-800"><UserCog size={12} /> Админ</span>
                      ) : (
                        <span className="ozor-chip bg-ink-100 text-ink-700">Покупатель</span>
                      )}
                    </td>
                    <td className="py-2 px-3 hidden md:table-cell text-ink-500">{formatDate(u.createdAt)}</td>
                    <td className="py-2 px-3">
                      {u.blocked ? (
                        <span className="ozor-chip bg-red-100 text-red-700">Заблокирован</span>
                      ) : (
                        <span className="ozor-chip bg-emerald-100 text-emerald-800">Активен</span>
                      )}
                    </td>
                    <td className="py-2 pl-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setConfirmBlock(u)}
                        disabled={u.id === currentUser?.id}
                        className={clsx(
                          "inline-flex items-center justify-center h-8 w-8 rounded-lg mr-1",
                          u.blocked ? "hover:bg-emerald-50 text-emerald-700" : "hover:bg-amber-50 text-amber-700",
                          u.id === currentUser?.id && "opacity-30 cursor-not-allowed",
                        )}
                        aria-label={u.blocked ? "Разблокировать" : "Заблокировать"}
                        title={u.blocked ? "Разблокировать" : "Заблокировать"}
                      >
                        {u.blocked ? <ShieldCheck size={14} /> : <ShieldOff size={14} />}
                      </button>
                      <button
                        onClick={() => setEditing(u)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-ink-100 mr-1"
                        aria-label="Редактировать"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(u)}
                        disabled={u.id === currentUser?.id}
                        className={clsx(
                          "inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-red-50 text-red-600",
                          u.id === currentUser?.id && "opacity-30 cursor-not-allowed",
                        )}
                        aria-label="Удалить"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-ink-500">Никого не найдено</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UserEditModal
        open={editing !== null}
        user={editing === "new" ? null : editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          reload();
          setEditing(null);
        }}
      />

      <ConfirmDialog
        open={!!confirmBlock}
        onClose={() => setConfirmBlock(null)}
        title={confirmBlock?.blocked ? "Разблокировать пользователя?" : "Заблокировать пользователя?"}
        description={confirmBlock?.blocked ? "Снова сможет заходить и покупать." : "Не сможет входить, пока вы не разблокируете."}
        destructive={!confirmBlock?.blocked}
        confirmLabel={confirmBlock?.blocked ? "Разблокировать" : "Заблокировать"}
        onConfirm={async () => {
          if (!confirmBlock) return;
          await updateUser(confirmBlock.id, { blocked: !confirmBlock.blocked });
          pushToast({ type: "info", title: confirmBlock.blocked ? "Пользователь разблокирован" : "Пользователь заблокирован" });
          reload();
        }}
      />
      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title={`Удалить «${confirmDelete?.name ?? ""}»?`}
        description="Все его данные будут удалены безвозвратно."
        destructive
        confirmLabel="Удалить"
        onConfirm={async () => {
          if (!confirmDelete) return;
          await deleteUser(confirmDelete.id);
          pushToast({ type: "success", title: "Пользователь удалён" });
          reload();
        }}
      />
    </div>
  );
}

function UserEditModal({
  open,
  user,
  onClose,
  onSaved,
}: {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { pushToast } = useApp();
  const [form, setForm] = useState<Partial<User> & { password?: string }>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(
      user ?? {
        email: "",
        name: "",
        password: "",
        role: "user",
        avatar: "🦝",
        phone: "",
        address: "",
      },
    );
  }, [open, user]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (user) {
        await updateUser(user.id, form as Partial<User>);
        pushToast({ type: "success", title: "Сохранено" });
      } else {
        if (!form.email || !form.name || !form.password) {
          pushToast({ type: "warning", title: "Email, имя и пароль обязательны" });
          setBusy(false);
          return;
        }
        await createUser({
          email: form.email!,
          name: form.name!,
          password: form.password!,
          role: form.role as User["role"],
          avatar: form.avatar,
          phone: form.phone,
          address: form.address,
        });
        pushToast({ type: "success", title: "Пользователь добавлен" });
      }
      onSaved();
    } catch (err) {
      pushToast({ type: "error", title: "Ошибка", description: err instanceof Error ? err.message : undefined });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={user ? `Пользователь: ${user.name}` : "Новый пользователь"}
      footer={
        <>
          <button className="ozor-btn-secondary px-4 py-2.5" onClick={onClose}>Отмена</button>
          <button form="user-form" className="ozor-btn-primary px-4 py-2.5" disabled={busy}>
            {busy ? "Сохраняем…" : "Сохранить"}
          </button>
        </>
      }
    >
      <form id="user-form" onSubmit={submit} className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-ink-700 mb-1 block">Имя</label>
            <input className="ozor-input" value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} required />
          </div>
          <div>
            <label className="text-sm text-ink-700 mb-1 block">Email</label>
            <input type="email" className="ozor-input" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} required disabled={!!user} />
          </div>
          <div>
            <label className="text-sm text-ink-700 mb-1 block">{user ? "Новый пароль (необязательно)" : "Пароль"}</label>
            <input className="ozor-input" value={form.password ?? ""} onChange={(e) => set("password", e.target.value)} required={!user} />
          </div>
          <div>
            <label className="text-sm text-ink-700 mb-1 block">Роль</label>
            <select
              className="ozor-input"
              value={form.role ?? "user"}
              onChange={(e) => set("role", e.target.value as User["role"])}
            >
              <option value="user">Покупатель</option>
              <option value="admin">Администратор</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-ink-700 mb-1 block">Телефон</label>
            <input className="ozor-input" value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-ink-700 mb-1 block">Адрес</label>
            <input className="ozor-input" value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} />
          </div>
        </div>
      </form>
    </Modal>
  );
}
