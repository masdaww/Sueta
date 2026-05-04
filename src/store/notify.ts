import { create } from 'zustand'
import type { Notification } from '@/lib/types'

type NotifyState = {
  toasts: Notification[]
  push: (t: Omit<Notification, 'id'>) => string
  remove: (id: string) => void
}

export const useNotify = create<NotifyState>((set) => ({
  toasts: [],
  push: (t) => {
    const id = `n-${Math.random().toString(36).slice(2, 8)}`
    const toast: Notification = { id, ...t }
    set((s) => ({ toasts: [...s.toasts, toast] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }))
    }, 3500)
    return id
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}))

export const notify = {
  success: (title: string, message?: string) =>
    useNotify.getState().push({ type: 'success', title, message }),
  info: (title: string, message?: string) =>
    useNotify.getState().push({ type: 'info', title, message }),
  warn: (title: string, message?: string) =>
    useNotify.getState().push({ type: 'warn', title, message }),
  error: (title: string, message?: string) =>
    useNotify.getState().push({ type: 'error', title, message }),
}
