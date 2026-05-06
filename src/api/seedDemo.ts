import { createOrder, listOrders, listProducts, updateOrderStatus } from "./mockApi";
import type { OrderStatus } from "../types";

const DEMO_FLAG = "ozor.demo.seeded.v2";

const sample = (n: number) => Math.floor(Math.random() * n);

const STATUSES: OrderStatus[] = ["delivered", "delivering", "shipped", "packed", "ordered", "delivered"];

export async function ensureDemoOrders() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(DEMO_FLAG)) return;
  const existing = await listOrders();
  if (existing.length > 0) {
    localStorage.setItem(DEMO_FLAG, "1");
    return;
  }
  const products = (await listProducts({ pageSize: 1000 })).items;
  if (products.length === 0) return;
  const ownerIds = ["u-1", "u-2", "u-3", "u-1", "u-2"];
  for (let i = 0; i < 12; i++) {
    const itemsCount = 1 + sample(3);
    const items = Array.from({ length: itemsCount }).map(() => {
      const p = products[sample(products.length)];
      const quantity = 1 + sample(2);
      return {
        productId: p.id,
        quantity,
        priceAtPurchase: p.price,
        titleSnapshot: p.title,
        emojiSnapshot: p.emoji,
      };
    });
    const subtotal = items.reduce((s, i) => s + i.priceAtPurchase * i.quantity, 0);
    const deliveryFee = subtotal >= 1999 ? 0 : 199;
    const total = subtotal + deliveryFee;
    const userId = ownerIds[i % ownerIds.length];
    const order = await createOrder({
      userId,
      items,
      subtotal,
      deliveryFee,
      total,
      delivery: ["courier", "pickup", "raccoon", "drone"][sample(4)] as never,
      payment: ["card", "cash", "credit", "souls"][sample(4)] as never,
      address: ["г. Озорск, ул. Лежальная, 7", "г. Лужанск, пр. Утренний, 15", "г. Озорск, ул. Кошачья, 4-21"][i % 3],
    });
    const status = STATUSES[i % STATUSES.length];
    if (status !== "ordered") {
      // walk through statuses for tracking demo
      const sequence: OrderStatus[] = ["packed", "shipped", "delivering", "delivered"];
      for (const s of sequence) {
        await updateOrderStatus(order.id, s);
        if (s === status) break;
      }
    }
  }
  localStorage.setItem(DEMO_FLAG, "1");
}
