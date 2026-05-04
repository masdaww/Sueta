import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/lib/types'

type CartState = {
  items: CartItem[]
  add: (productId: string, qty?: number) => void
  remove: (productId: string) => void
  setQty: (productId: string, qty: number) => void
  inc: (productId: string) => void
  dec: (productId: string) => void
  clear: () => void
  count: () => number
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (productId, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.productId === productId)
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.productId === productId ? { ...i, qty: i.qty + qty } : i,
              ),
            }
          }
          return { items: [...s.items, { productId, qty }] }
        }),
      remove: (productId) =>
        set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
      setQty: (productId, qty) =>
        set((s) => ({
          items: s.items
            .map((i) => (i.productId === productId ? { ...i, qty } : i))
            .filter((i) => i.qty > 0),
        })),
      inc: (productId) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.productId === productId ? { ...i, qty: i.qty + 1 } : i,
          ),
        })),
      dec: (productId) =>
        set((s) => ({
          items: s.items
            .map((i) =>
              i.productId === productId ? { ...i, qty: Math.max(0, i.qty - 1) } : i,
            )
            .filter((i) => i.qty > 0),
        })),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((acc, i) => acc + i.qty, 0),
    }),
    { name: 'suetashop:cart:v1' },
  ),
)
