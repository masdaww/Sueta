import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Order, OrderStatus } from '@/lib/types'

type OrdersState = {
  orders: Order[]
  add: (order: Omit<Order, 'id' | 'createdAt' | 'history' | 'status'> & { status?: OrderStatus }) => Order
  setStatus: (id: string, status: OrderStatus) => void
  remove: (id: string) => void
}

const orderId = () => `SS-${Math.floor(Math.random() * 900000 + 100000)}`

export const useOrders = create<OrdersState>()(
  persist(
    (set) => ({
      orders: [],
      add: (o) => {
        const status: OrderStatus = o.status ?? 'created'
        const now = new Date().toISOString()
        const order: Order = {
          ...o,
          id: orderId(),
          status,
          createdAt: now,
          history: [{ status, at: now }],
        }
        set((s) => ({ orders: [order, ...s.orders] }))
        return order
      },
      setStatus: (id, status) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id
              ? {
                  ...o,
                  status,
                  history: [...o.history, { status, at: new Date().toISOString() }],
                }
              : o,
          ),
        })),
      remove: (id) => set((s) => ({ orders: s.orders.filter((o) => o.id !== id) })),
    }),
    { name: 'suetashop:orders:v1' },
  ),
)
