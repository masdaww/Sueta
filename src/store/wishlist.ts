import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type WishlistState = {
  ids: string[]
  toggle: (id: string) => boolean
  has: (id: string) => boolean
  clear: () => void
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const has = get().ids.includes(id)
        set((s) => ({ ids: has ? s.ids.filter((x) => x !== id) : [...s.ids, id] }))
        return !has
      },
      has: (id) => get().ids.includes(id),
      clear: () => set({ ids: [] }),
    }),
    { name: 'suetashop:wishlist:v1' },
  ),
)
