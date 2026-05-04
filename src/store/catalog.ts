import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { products as seedProducts, reviews as seedReviews, users as seedUsers } from '@/data/seed'
import type { Product, Review, User } from '@/lib/types'

type CatalogState = {
  products: Product[]
  reviews: Review[]
  users: User[]
  addProduct: (p: Omit<Product, 'id' | 'createdAt'> & { id?: string }) => Product
  updateProduct: (id: string, patch: Partial<Product>) => void
  deleteProduct: (id: string) => void

  addReview: (r: Omit<Review, 'id' | 'createdAt' | 'status'>) => Review
  setReviewStatus: (id: string, status: Review['status']) => void
  deleteReview: (id: string) => void

  addUser: (u: Omit<User, 'id' | 'createdAt'>) => User
  updateUser: (id: string, patch: Partial<User>) => void
  toggleBlockUser: (id: string) => void
  deleteUser: (id: string) => void

  resetSeed: () => void
}

const id = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`

export const useCatalog = create<CatalogState>()(
  persist(
    (set) => ({
      products: seedProducts,
      reviews: seedReviews,
      users: seedUsers,

      addProduct: (p) => {
        const product: Product = {
          ...p,
          id: p.id ?? id('p'),
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ products: [product, ...s.products] }))
        return product
      },
      updateProduct: (id, patch) =>
        set((s) => ({
          products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      deleteProduct: (id) =>
        set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

      addReview: (r) => {
        const review: Review = {
          ...r,
          id: id('r'),
          createdAt: new Date().toISOString(),
          status: 'pending',
        }
        set((s) => ({ reviews: [review, ...s.reviews] }))
        return review
      },
      setReviewStatus: (id, status) =>
        set((s) => ({ reviews: s.reviews.map((r) => (r.id === id ? { ...r, status } : r)) })),
      deleteReview: (id) =>
        set((s) => ({ reviews: s.reviews.filter((r) => r.id !== id) })),

      addUser: (u) => {
        const user: User = {
          ...u,
          id: id('u'),
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ users: [user, ...s.users] }))
        return user
      },
      updateUser: (id, patch) =>
        set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) })),
      toggleBlockUser: (id) =>
        set((s) => ({
          users: s.users.map((u) => (u.id === id ? { ...u, blocked: !u.blocked } : u)),
        })),
      deleteUser: (id) =>
        set((s) => ({ users: s.users.filter((u) => u.id !== id) })),

      resetSeed: () =>
        set({ products: seedProducts, reviews: seedReviews, users: seedUsers }),
    }),
    {
      name: 'suetashop:catalog:v1',
    },
  ),
)
