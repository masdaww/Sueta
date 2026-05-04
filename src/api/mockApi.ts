import type {
  Category,
  Order,
  OrderStatus,
  Product,
  Review,
  User,
} from "../types";
import { seedCategories, seedProducts, seedReviews, seedUsers } from "../data/seed";

const STORAGE_KEY = "ozor.db.v1";

export interface DB {
  categories: Category[];
  products: Product[];
  reviews: Review[];
  users: User[];
  orders: Order[];
}

const defaultDB = (): DB => ({
  categories: seedCategories.slice(),
  products: seedProducts.slice(),
  reviews: seedReviews.slice(),
  users: seedUsers.slice(),
  orders: [],
});

let db: DB = loadDB();

function loadDB(): DB {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return defaultDB();
    const parsed = JSON.parse(raw) as Partial<DB>;
    return {
      categories: parsed.categories ?? seedCategories.slice(),
      products: parsed.products ?? seedProducts.slice(),
      reviews: parsed.reviews ?? seedReviews.slice(),
      users: parsed.users ?? seedUsers.slice(),
      orders: parsed.orders ?? [],
    };
  } catch {
    return defaultDB();
  }
}

function persist() {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    }
  } catch {
    // ignore quota errors
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const id = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;

export async function resetDB(): Promise<void> {
  db = defaultDB();
  persist();
}

// Categories
export async function listCategories(): Promise<Category[]> {
  await sleep(80);
  return db.categories.slice();
}

// Products
export interface ProductQuery {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  brands?: string[];
  minRating?: number;
  inStockOnly?: boolean;
  sort?: "popular" | "price-asc" | "price-desc" | "rating-desc" | "newest";
  page?: number;
  pageSize?: number;
  includeHidden?: boolean;
}

export interface ProductResult {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  brands: string[];
  priceRange: [number, number];
}

export async function listProducts(q: ProductQuery = {}): Promise<ProductResult> {
  await sleep(120);
  const all = db.products.filter((p) => (q.includeHidden ? true : !p.hidden));
  const allBrands = Array.from(new Set(all.map((p) => p.brand))).sort();
  const allPrices = all.map((p) => p.price);
  const priceRange: [number, number] = [
    allPrices.length ? Math.min(...allPrices) : 0,
    allPrices.length ? Math.max(...allPrices) : 0,
  ];

  let items = all.slice();
  if (q.search) {
    const s = q.search.trim().toLowerCase();
    if (s) {
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(s) ||
          p.description.toLowerCase().includes(s) ||
          p.brand.toLowerCase().includes(s),
      );
    }
  }
  if (q.categoryId) items = items.filter((p) => p.categoryId === q.categoryId);
  if (q.minPrice != null) items = items.filter((p) => p.price >= q.minPrice!);
  if (q.maxPrice != null) items = items.filter((p) => p.price <= q.maxPrice!);
  if (q.brands && q.brands.length) items = items.filter((p) => q.brands!.includes(p.brand));
  if (q.minRating != null) items = items.filter((p) => p.rating >= q.minRating!);
  if (q.inStockOnly) items = items.filter((p) => p.inStock > 0);

  switch (q.sort) {
    case "price-asc":
      items.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      items.sort((a, b) => b.price - a.price);
      break;
    case "rating-desc":
      items.sort((a, b) => b.rating - a.rating);
      break;
    case "newest":
      items.sort((a, b) => b.createdAt - a.createdAt);
      break;
    case "popular":
    default:
      items.sort((a, b) => b.popularity - a.popularity);
  }

  const total = items.length;
  const page = q.page ?? 1;
  const pageSize = q.pageSize ?? 24;
  const start = (page - 1) * pageSize;
  const paged = items.slice(start, start + pageSize);

  return { items: paged, total, page, pageSize, brands: allBrands, priceRange };
}

export async function getProduct(productId: string): Promise<Product | undefined> {
  await sleep(80);
  return db.products.find((p) => p.id === productId);
}

export async function getRelatedProducts(productId: string, limit = 8): Promise<Product[]> {
  await sleep(80);
  const product = db.products.find((p) => p.id === productId);
  if (!product) return [];
  return db.products
    .filter((p) => p.id !== productId && !p.hidden && p.categoryId === product.categoryId)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

export async function getRecommended(limit = 12): Promise<Product[]> {
  await sleep(80);
  return db.products
    .filter((p) => !p.hidden)
    .slice()
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

export async function getNewest(limit = 12): Promise<Product[]> {
  await sleep(80);
  return db.products
    .filter((p) => !p.hidden)
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);
}

export async function createProduct(p: Omit<Product, "id" | "createdAt"> & { id?: string }): Promise<Product> {
  await sleep(150);
  const newP: Product = {
    ...p,
    id: p.id ?? id("p"),
    createdAt: Date.now(),
  };
  db.products = [newP, ...db.products];
  persist();
  return newP;
}

export async function updateProduct(productId: string, patch: Partial<Product>): Promise<Product | undefined> {
  await sleep(120);
  let updated: Product | undefined;
  db.products = db.products.map((p) => {
    if (p.id === productId) {
      updated = { ...p, ...patch };
      return updated;
    }
    return p;
  });
  persist();
  return updated;
}

export async function deleteProduct(productId: string): Promise<void> {
  await sleep(120);
  db.products = db.products.filter((p) => p.id !== productId);
  // also drop related reviews
  db.reviews = db.reviews.filter((r) => r.productId !== productId);
  persist();
}

// Reviews
export async function listReviewsForProduct(productId: string): Promise<Review[]> {
  await sleep(80);
  return db.reviews
    .filter((r) => r.productId === productId && r.status === "approved")
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function listAllReviews(): Promise<Review[]> {
  await sleep(80);
  return db.reviews.slice().sort((a, b) => b.createdAt - a.createdAt);
}

export async function listReviewsByUser(userId: string): Promise<Review[]> {
  await sleep(80);
  return db.reviews.filter((r) => r.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
}

export async function createReview(input: Omit<Review, "id" | "createdAt" | "status">): Promise<Review> {
  await sleep(150);
  const r: Review = { ...input, id: id("r"), createdAt: Date.now(), status: "pending" };
  db.reviews = [r, ...db.reviews];
  // bump product reviewCount when approved later — for prototype, count immediately by updating rating average lazily
  persist();
  return r;
}

export async function updateReviewStatus(reviewId: string, status: Review["status"]): Promise<Review | undefined> {
  await sleep(120);
  let updated: Review | undefined;
  db.reviews = db.reviews.map((r) => {
    if (r.id === reviewId) {
      updated = { ...r, status };
      return updated;
    }
    return r;
  });
  // recompute product aggregates when approved
  if (updated && status === "approved") {
    const productReviews = db.reviews.filter((r) => r.productId === updated!.productId && r.status === "approved");
    const avg = productReviews.reduce((s, r) => s + r.rating, 0) / Math.max(1, productReviews.length);
    db.products = db.products.map((p) =>
      p.id === updated!.productId ? { ...p, rating: Math.round(avg * 10) / 10, reviewCount: productReviews.length } : p,
    );
  }
  persist();
  return updated;
}

export async function deleteReview(reviewId: string): Promise<void> {
  await sleep(120);
  db.reviews = db.reviews.filter((r) => r.id !== reviewId);
  persist();
}

// Users
export async function listUsers(): Promise<User[]> {
  await sleep(80);
  return db.users.slice().sort((a, b) => b.createdAt - a.createdAt);
}

export async function getUser(userId: string): Promise<User | undefined> {
  await sleep(50);
  return db.users.find((u) => u.id === userId);
}

export async function createUser(input: Omit<User, "id" | "createdAt">): Promise<User> {
  await sleep(150);
  if (db.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error("Пользователь с таким email уже существует");
  }
  const u: User = { ...input, id: id("u"), createdAt: Date.now() };
  db.users = [u, ...db.users];
  persist();
  return u;
}

export async function updateUser(userId: string, patch: Partial<User>): Promise<User | undefined> {
  await sleep(120);
  let updated: User | undefined;
  db.users = db.users.map((u) => {
    if (u.id === userId) {
      updated = { ...u, ...patch };
      return updated;
    }
    return u;
  });
  persist();
  return updated;
}

export async function deleteUser(userId: string): Promise<void> {
  await sleep(120);
  db.users = db.users.filter((u) => u.id !== userId);
  persist();
}

export async function login(email: string, password: string): Promise<User> {
  await sleep(180);
  const u = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!u) throw new Error("Неверный email или пароль");
  if (u.blocked) throw new Error("Аккаунт заблокирован администратором");
  return u;
}

export async function register(input: { email: string; name: string; password: string }): Promise<User> {
  await sleep(180);
  if (db.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error("Пользователь с таким email уже существует");
  }
  const u: User = {
    id: id("u"),
    email: input.email,
    name: input.name,
    password: input.password,
    role: "user",
    avatar: ["🦝", "🦊", "🐱", "🐶", "🐸", "🐵", "🐧", "🦔"][Math.floor(Math.random() * 8)],
    createdAt: Date.now(),
  };
  db.users = [u, ...db.users];
  persist();
  return u;
}

// Orders
export async function listOrders(): Promise<Order[]> {
  await sleep(80);
  return db.orders.slice().sort((a, b) => b.createdAt - a.createdAt);
}

export async function listOrdersByUser(userId: string): Promise<Order[]> {
  await sleep(80);
  return db.orders.filter((o) => o.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
}

export async function getOrder(orderId: string): Promise<Order | undefined> {
  await sleep(60);
  return db.orders.find((o) => o.id === orderId);
}

export async function createOrder(input: Omit<Order, "id" | "createdAt" | "updatedAt" | "trackingHistory" | "status">): Promise<Order> {
  await sleep(220);
  const now = Date.now();
  const o: Order = {
    ...input,
    id: id("o"),
    createdAt: now,
    updatedAt: now,
    status: "ordered",
    trackingHistory: [
      { status: "ordered", at: now, note: "Заказ принят. Енот-курьер выехал из норы." },
    ],
  };
  db.orders = [o, ...db.orders];
  // Decrease stock
  db.products = db.products.map((p) => {
    const item = input.items.find((i) => i.productId === p.id);
    if (!item) return p;
    return { ...p, inStock: Math.max(0, p.inStock - item.quantity) };
  });
  persist();
  return o;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, note?: string): Promise<Order | undefined> {
  await sleep(120);
  let updated: Order | undefined;
  db.orders = db.orders.map((o) => {
    if (o.id === orderId) {
      updated = {
        ...o,
        status,
        updatedAt: Date.now(),
        trackingHistory: [
          ...o.trackingHistory,
          { status, at: Date.now(), note: note ?? defaultStatusNote(status) },
        ],
      };
      return updated;
    }
    return o;
  });
  persist();
  return updated;
}

function defaultStatusNote(s: OrderStatus): string {
  switch (s) {
    case "ordered": return "Заказ оформлен.";
    case "packed": return "Упаковано: енот-кладовщик пыхтит.";
    case "shipped": return "Отправлено в ваш регион. Енот сел в фуру.";
    case "delivering": return "Курьер в пути. Захватите ему печеньку.";
    case "delivered": return "Доставлено. Пожалуйста, не жмите енота слишком сильно.";
    case "cancelled": return "Заказ отменён. Енот вздохнул.";
  }
}

export async function applyPromo(code: string): Promise<{ valid: boolean; discountPct: number; reason?: string }> {
  await sleep(120);
  const map: Record<string, number> = {
    OZOR10: 10,
    "ОЗОР10": 10,
    SUETA: 15,
    "СУЕТА": 15,
    ENOT2026: 25,
    "ЕНОТ2026": 25,
  };
  const pct = map[code.trim().toUpperCase()];
  if (pct) return { valid: true, discountPct: pct };
  return { valid: false, discountPct: 0, reason: "Промокод не подошёл. Озор не одобряет." };
}

// Stats
export interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  totalReviews: number;
  pendingReviews: number;
  ordersByStatus: { status: OrderStatus; count: number }[];
  revenueLast7Days: { date: string; total: number }[];
  topProducts: { productId: string; title: string; emoji: string; sold: number; revenue: number }[];
  topCategories: { categoryId: string; name: string; emoji: string; sold: number }[];
  signupsLast7Days: { date: string; count: number }[];
}

export async function getStats(): Promise<Stats> {
  await sleep(120);
  const totalOrders = db.orders.length;
  const totalRevenue = db.orders.reduce((s, o) => s + o.total, 0);
  const totalProducts = db.products.length;
  const totalUsers = db.users.length;
  const totalReviews = db.reviews.length;
  const pendingReviews = db.reviews.filter((r) => r.status === "pending").length;

  const statuses: OrderStatus[] = ["ordered", "packed", "shipped", "delivering", "delivered", "cancelled"];
  const ordersByStatus = statuses.map((status) => ({
    status,
    count: db.orders.filter((o) => o.status === status).length,
  }));

  const days = 7;
  const dayMs = 86_400_000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const revenueLast7Days = Array.from({ length: days }, (_, i) => {
    const d = new Date(today.getTime() - (days - 1 - i) * dayMs);
    const next = d.getTime() + dayMs;
    const total = db.orders
      .filter((o) => o.createdAt >= d.getTime() && o.createdAt < next)
      .reduce((s, o) => s + o.total, 0);
    return { date: d.toISOString().slice(5, 10), total };
  });

  const signupsLast7Days = Array.from({ length: days }, (_, i) => {
    const d = new Date(today.getTime() - (days - 1 - i) * dayMs);
    const next = d.getTime() + dayMs;
    const count = db.users.filter((u) => u.createdAt >= d.getTime() && u.createdAt < next).length;
    return { date: d.toISOString().slice(5, 10), count };
  });

  // top products: from orders
  const productAgg = new Map<string, { sold: number; revenue: number }>();
  for (const o of db.orders) {
    for (const item of o.items) {
      const prev = productAgg.get(item.productId) ?? { sold: 0, revenue: 0 };
      productAgg.set(item.productId, {
        sold: prev.sold + item.quantity,
        revenue: prev.revenue + item.priceAtPurchase * item.quantity,
      });
    }
  }
  // fallback to seed popularity if no orders
  let topProducts: Stats["topProducts"];
  if (productAgg.size > 0) {
    topProducts = [...productAgg.entries()]
      .map(([productId, v]) => {
        const p = db.products.find((p) => p.id === productId);
        return {
          productId,
          title: p?.title ?? "Удалённый товар",
          emoji: p?.emoji ?? "❓",
          sold: v.sold,
          revenue: v.revenue,
        };
      })
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 8);
  } else {
    topProducts = db.products
      .slice()
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 8)
      .map((p) => ({
        productId: p.id,
        title: p.title,
        emoji: p.emoji,
        sold: Math.round(p.popularity * 1.2),
        revenue: Math.round(p.popularity * 1.2) * p.price,
      }));
  }

  // top categories
  const catAgg = new Map<string, number>();
  for (const o of db.orders) {
    for (const item of o.items) {
      const p = db.products.find((p) => p.id === item.productId);
      if (!p) continue;
      catAgg.set(p.categoryId, (catAgg.get(p.categoryId) ?? 0) + item.quantity);
    }
  }
  let topCategories: Stats["topCategories"];
  if (catAgg.size > 0) {
    topCategories = [...catAgg.entries()]
      .map(([categoryId, sold]) => {
        const c = db.categories.find((c) => c.id === categoryId);
        return { categoryId, name: c?.name ?? "?", emoji: c?.emoji ?? "❓", sold };
      })
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 6);
  } else {
    topCategories = db.categories.slice(0, 6).map((c, i) => ({
      categoryId: c.id,
      name: c.name,
      emoji: c.emoji,
      sold: 120 - i * 14,
    }));
  }

  return {
    totalOrders,
    totalRevenue,
    totalProducts,
    totalUsers,
    totalReviews,
    pendingReviews,
    ordersByStatus,
    revenueLast7Days,
    topProducts,
    topCategories,
    signupsLast7Days,
  };
}
