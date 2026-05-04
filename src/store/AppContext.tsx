import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { CartItem, Toast, User } from "../types";
import * as api from "../api/mockApi";

interface AppState {
  // auth
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, name: string, password: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;

  // cart
  cart: CartItem[];
  addToCart: (productId: string, qty?: number) => void;
  setCartQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartCount: number;

  // wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // toasts
  toasts: Toast[];
  pushToast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

const LS_USER = "ozor.session.user";
const LS_CART = "ozor.session.cart";
const LS_WISH = "ozor.session.wishlist";

function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLS<T>(key: string, val: T) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // ignore
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readLS<User | null>(LS_USER, null));
  const [cart, setCart] = useState<CartItem[]>(() => readLS<CartItem[]>(LS_CART, []));
  const [wishlist, setWishlist] = useState<string[]>(() => readLS<string[]>(LS_WISH, []));
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => writeLS(LS_USER, user), [user]);
  useEffect(() => writeLS(LS_CART, cart), [cart]);
  useEffect(() => writeLS(LS_WISH, wishlist), [wishlist]);

  // Toasts
  const dismissToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
    const tm = toastTimers.current.get(id);
    if (tm) {
      clearTimeout(tm);
      toastTimers.current.delete(id);
    }
  }, []);

  const pushToast = useCallback((t: Omit<Toast, "id">) => {
    const id = `t-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
    const duration = t.durationMs ?? 4000;
    setToasts((prev) => [...prev, { ...t, id }]);
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
      toastTimers.current.delete(id);
    }, duration);
    toastTimers.current.set(id, timer);
  }, []);

  // Auth
  const login = useCallback(async (email: string, password: string) => {
    const u = await api.login(email, password);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (email: string, name: string, password: string) => {
    const u = await api.register({ email, name, password });
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!user) return;
    const u = await api.getUser(user.id);
    if (u) {
      if (u.blocked) {
        setUser(null);
      } else {
        setUser(u);
      }
    } else {
      setUser(null);
    }
  }, [user]);

  // Cart
  const addToCart = useCallback((productId: string, qty: number = 1) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.productId === productId);
      if (ex) return prev.map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + qty } : i));
      return [...prev, { productId, quantity: qty }];
    });
  }, []);

  const setCartQty = useCallback((productId: string, qty: number) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i)),
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);

  // Wishlist
  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    );
  }, []);
  const isInWishlist = useCallback((productId: string) => wishlist.includes(productId), [wishlist]);

  const value: AppState = {
    user,
    login,
    register,
    logout,
    refreshUser,
    cart,
    addToCart,
    setCartQty,
    removeFromCart,
    clearCart,
    cartCount,
    wishlist,
    toggleWishlist,
    isInWishlist,
    toasts,
    pushToast,
    dismissToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
