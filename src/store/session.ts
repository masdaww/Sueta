import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { currentUserId } from '@/data/seed'

type SessionState = {
  userId: string
  setUserId: (id: string) => void
  isAdminMode: boolean
  setAdminMode: (v: boolean) => void
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      userId: currentUserId,
      setUserId: (id) => set({ userId: id }),
      isAdminMode: false,
      setAdminMode: (v) => set({ isAdminMode: v }),
    }),
    { name: 'suetashop:session:v1' },
  ),
)
