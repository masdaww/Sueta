export type ID = string;

export interface Category {
  id: ID;
  slug: string;
  name: string;
  emoji: string;
  color: string; // gradient anchor color
  jokeTagline: string;
}

export interface Product {
  id: ID;
  title: string;
  description: string;
  price: number;
  oldPrice?: number;
  rating: number; // 0..5
  reviewCount: number;
  categoryId: ID;
  brand: string;
  emoji: string;
  bgColor: string; // base bg gradient color
  bgColor2?: string; // secondary gradient color
  images?: string[]; // optional override URLs
  badges?: string[]; // ["хит", "новинка", "↑2 коп.", ...]
  inStock: number;
  popularity: number; // for sorting
  createdAt: number;
  hidden?: boolean;
}

export interface Review {
  id: ID;
  productId: ID;
  userId: ID;
  userName: string;
  rating: number;
  text: string;
  createdAt: number;
  status: "approved" | "pending" | "rejected";
}

export interface User {
  id: ID;
  email: string;
  name: string;
  password: string; // plaintext, prototype only
  role: "user" | "admin";
  blocked?: boolean;
  avatar?: string; // emoji
  phone?: string;
  address?: string;
  createdAt: number;
}

export interface CartItem {
  productId: ID;
  quantity: number;
}

export type OrderStatus =
  | "ordered"
  | "packed"
  | "shipped"
  | "delivering"
  | "delivered"
  | "cancelled";

export type DeliveryMethod = "pickup" | "courier" | "drone" | "raccoon";
export type PaymentMethod = "card" | "cash" | "credit" | "souls";

export interface Order {
  id: ID;
  userId: ID;
  items: { productId: ID; quantity: number; priceAtPurchase: number; titleSnapshot: string; emojiSnapshot: string }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  delivery: DeliveryMethod;
  payment: PaymentMethod;
  address: string;
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
  trackingHistory: { status: OrderStatus; at: number; note: string }[];
  promo?: { code: string; discount: number };
}

export interface Toast {
  id: ID;
  type: "info" | "success" | "warning" | "error";
  title: string;
  description?: string;
  durationMs?: number;
}
