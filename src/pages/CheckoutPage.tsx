import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, CreditCard, Plane, Home, Truck } from "lucide-react";
import clsx from "clsx";
import { Modal } from "../components/ui/Modal";
import { ProductImage } from "../components/product/ProductImage";
import type { DeliveryMethod, PaymentMethod, Order, Product } from "../types";
import { createOrder, listProducts } from "../api/mockApi";
import { useApp } from "../store/AppContext";
import { formatPrice } from "../lib/format";

const deliveryOptions: {
  value: DeliveryMethod;
  title: string;
  desc: string;
  fee: number;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { value: "courier", title: "Курьер-озорник", desc: "1–3 дня. Принесёт прямо в руки.", fee: 199, Icon: Truck },
  { value: "pickup", title: "Самовывоз из норы", desc: "Бесплатно. На районе всегда есть точка ОЗОР.", fee: 0, Icon: Home },
  { value: "drone", title: "Дроном", desc: "30–90 мин. Иногда теряет посылки в кустах.", fee: 499, Icon: Plane },
  { value: "raccoon", title: "Енотом-эксклюзив", desc: "5–14 дней. Енот доставит, когда вспомнит.", fee: 0, Icon: () => <span className="text-xl">🦝</span> },
];

const paymentOptions: { value: PaymentMethod; title: string; desc: string }[] = [
  { value: "card", title: "Картой", desc: "Имитация — реальные данные не нужны." },
  { value: "cash", title: "Наличными", desc: "Курьеру в рукав." },
  { value: "credit", title: "В рассрочку 3×0", desc: "Без процентов и без рассрочки." },
  { value: "souls", title: "Душами", desc: "1 шт. на 1 ₽. Но это не точно." },
];

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, cart, clearCart, pushToast } = useApp();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [delivery, setDelivery] = useState<DeliveryMethod>("courier");
  const [payment, setPayment] = useState<PaymentMethod>("card");
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [address, setAddress] = useState(user?.address ?? "");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);

  const promoState = (location.state as { promo?: { code: string; discount: number } } | null) ?? null;
  const appliedPromo = promoState?.promo ?? null;

  useEffect(() => {
    let alive = true;
    listProducts({ pageSize: 1000 }).then((res) => {
      if (alive) setProducts(res.items);
    });
    return () => {
      alive = false;
    };
  }, []);

  const items = useMemo(() => {
    if (!products) return [];
    return cart
      .map((c) => {
        const p = products.find((p) => p.id === c.productId);
        return p ? { product: p, quantity: c.quantity } : null;
      })
      .filter((x): x is { product: Product; quantity: number } => x !== null);
  }, [cart, products]);

  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const discount = appliedPromo ? Math.round((subtotal * appliedPromo.discount) / 100) : 0;
  const deliveryFee = subtotal === 0 ? 0 : (deliveryOptions.find((d) => d.value === delivery)!.fee);
  const total = Math.max(0, subtotal - discount) + deliveryFee;

  if (products && items.length === 0 && !successOrder) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="text-5xl">🛒</div>
        <h1 className="ozor-section-title mt-3">Корзина пустая</h1>
        <p className="text-ink-500 mt-1">Добавьте товары и возвращайтесь.</p>
        <Link to="/catalog" className="ozor-btn-primary inline-flex mt-4 px-4 py-2">К каталогу</Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      pushToast({ type: "warning", title: "Войдите, чтобы оформить", description: "Иначе енот не знает, кому везти." });
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    if (!name.trim() || !address.trim() || !phone.trim()) {
      pushToast({ type: "warning", title: "Заполните данные", description: "Имя, телефон и адрес обязательны." });
      return;
    }
    setSubmitting(true);
    try {
      const order = await createOrder({
        userId: user.id,
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
          priceAtPurchase: i.product.price,
          titleSnapshot: i.product.title,
          emojiSnapshot: i.product.emoji,
        })),
        subtotal,
        deliveryFee,
        total,
        delivery,
        payment,
        address: `${address}${comment ? ` (${comment})` : ""}`,
        promo: appliedPromo ?? undefined,
      });
      clearCart();
      setSuccessOrder(order);
    } catch {
      pushToast({ type: "error", title: "Не получилось", description: "Попробуйте ещё раз." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="text-sm text-ink-500 mb-3 flex items-center gap-1">
        <Link to="/" className="hover:text-ozor-600">Главная</Link>
        <span>/</span>
        <Link to="/cart" className="hover:text-ozor-600">Корзина</Link>
        <span>/</span>
        <span className="text-ink-900 font-medium">Оформление</span>
      </div>
      <h1 className="ozor-section-title mb-5">Оформление заказа</h1>
      <form onSubmit={submit} className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        <div className="space-y-5">
          <section className="ozor-card p-5">
            <h2 className="font-semibold text-ink-900 text-lg mb-3">1. Кому везём</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-ink-700 mb-1 block">Имя</label>
                <input className="ozor-input" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <label className="text-sm text-ink-700 mb-1 block">Телефон</label>
                <input className="ozor-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 ___ ___-__-__" required />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-ink-700 mb-1 block">Адрес</label>
                <input className="ozor-input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Город, улица, дом, квартира" required />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-ink-700 mb-1 block">Комментарий курьеру</label>
                <input className="ozor-input" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Не звонить — спит енот" />
              </div>
            </div>
          </section>

          <section className="ozor-card p-5">
            <h2 className="font-semibold text-ink-900 text-lg mb-3">2. Доставка</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {deliveryOptions.map((opt) => {
                const Icon = opt.Icon;
                const active = delivery === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDelivery(opt.value)}
                    className={clsx(
                      "text-left rounded-2xl p-4 border-2 transition-all",
                      active
                        ? "border-ozor-500 bg-ozor-50"
                        : "border-ink-100 hover:border-ozor-200 bg-white",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold text-ink-900">
                        <Icon size={18} className="text-ozor-500" />
                        {opt.title}
                      </div>
                      <span className="text-sm font-semibold">{opt.fee === 0 ? "Бесплатно" : formatPrice(opt.fee)}</span>
                    </div>
                    <div className="text-sm text-ink-500 mt-1">{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="ozor-card p-5">
            <h2 className="font-semibold text-ink-900 text-lg mb-3">3. Оплата</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {paymentOptions.map((opt) => {
                const active = payment === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPayment(opt.value)}
                    className={clsx(
                      "text-left rounded-2xl p-4 border-2 transition-all",
                      active
                        ? "border-ozor-500 bg-ozor-50"
                        : "border-ink-100 hover:border-ozor-200 bg-white",
                    )}
                  >
                    <div className="flex items-center gap-2 font-semibold text-ink-900">
                      <CreditCard size={18} className="text-ozor-500" />
                      {opt.title}
                    </div>
                    <div className="text-sm text-ink-500 mt-1">{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="ozor-card p-5 sticky top-[calc(var(--header-h)+8px)]">
          <div className="font-semibold text-ink-900 text-lg mb-3">Ваш заказ</div>
          <div className="space-y-3 max-h-72 overflow-auto pr-1">
            {items.map((i) => (
              <div key={i.product.id} className="flex gap-3 items-start">
                <ProductImage
                  emoji={i.product.emoji}
                  bgColor={i.product.bgColor}
                  bgColor2={i.product.bgColor2}
                  size="sm"
                  className="h-14 w-14"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-ink-900 line-clamp-2">{i.product.title}</div>
                  <div className="text-xs text-ink-500">× {i.quantity}</div>
                </div>
                <div className="text-sm font-semibold text-ink-900">{formatPrice(i.product.price * i.quantity)}</div>
              </div>
            ))}
          </div>
          <div className="border-t border-ink-100 my-3" />
          <div className="space-y-1 text-sm">
            <Row label="Подытог" value={formatPrice(subtotal)} />
            {appliedPromo && <Row label={`Промокод ${appliedPromo.code}`} value={`-${formatPrice(discount)}`} />}
            <Row label="Доставка" value={deliveryFee === 0 ? "Бесплатно" : formatPrice(deliveryFee)} />
          </div>
          <div className="border-t border-ink-100 my-3" />
          <div className="flex items-baseline justify-between">
            <span className="font-semibold">К оплате</span>
            <span className="text-2xl font-extrabold text-ink-900">{formatPrice(total)}</span>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="ozor-btn-primary w-full mt-4 py-3"
          >
            {submitting ? "Озорим…" : "Подтвердить и оплатить"}
          </button>
          <p className="text-xs text-ink-500 mt-3">
            Нажимая «Подтвердить», вы соглашаетесь, что это пародия и енот не будет с вас ничего требовать.
          </p>
        </aside>
      </form>

      <Modal
        open={!!successOrder}
        onClose={() => navigate("/account/orders")}
        size="md"
        title={
          <span className="flex items-center gap-2">
            <CheckCircle2 className="text-emerald-500" /> Заказ оформлен!
          </span>
        }
        description="Енот уже выехал. Не пытайтесь его догнать."
        footer={
          <>
            <Link
              to="/catalog"
              className="ozor-btn-secondary px-4 py-2.5"
              onClick={() => setSuccessOrder(null)}
            >
              Купить ещё
            </Link>
            <Link
              to={successOrder ? `/account/orders/${successOrder.id}` : "/account/orders"}
              className="ozor-btn-primary px-4 py-2.5"
              onClick={() => setSuccessOrder(null)}
            >
              К моим заказам
            </Link>
          </>
        }
      >
        {successOrder && (
          <div className="space-y-3">
            <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-900">
              <div className="text-sm">Номер заказа</div>
              <div className="font-mono font-bold text-lg">{successOrder.id}</div>
            </div>
            <Row label="Сумма" value={formatPrice(successOrder.total)} />
            <Row label="Способ доставки" value={deliveryOptions.find((d) => d.value === successOrder.delivery)?.title ?? successOrder.delivery} />
            <Row label="Оплата" value={paymentOptions.find((p) => p.value === successOrder.payment)?.title ?? successOrder.payment} />
            <Row label="Адрес" value={successOrder.address} />
            <p className="text-sm text-ink-500">
              Статус заказа можно отслеживать в личном кабинете. Енот пишет статусы вручную, поэтому будет колоритно.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-ink-600">{label}</span>
      <span className="text-ink-900 font-medium text-right break-words">{value}</span>
    </div>
  );
}
