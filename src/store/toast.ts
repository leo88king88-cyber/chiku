import { create } from 'zustand'

let timer: ReturnType<typeof setTimeout> | undefined

export const useToast = create<{ message: string | null; show: (m: string) => void }>((set) => ({
  message: null,
  show: (message) => {
    clearTimeout(timer)
    set({ message })
    timer = setTimeout(() => set({ message: null }), 3000)
  },
}))
