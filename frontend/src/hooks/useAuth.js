import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('placeiq_user') || 'null'),
  token: localStorage.getItem('placeiq_token') || null,
  isAuthenticated: !!localStorage.getItem('placeiq_token'),
  isLoading: false,

  setAuth: (user, token) => {
    localStorage.setItem('placeiq_token', token)
    localStorage.setItem('placeiq_user', JSON.stringify(user))
    set({ user, token, isAuthenticated: true })
  },

  updateUser: (user) => {
    localStorage.setItem('placeiq_user', JSON.stringify(user))
    set({ user })
  },

  logout: () => {
    localStorage.removeItem('placeiq_token')
    localStorage.removeItem('placeiq_user')
    set({ user: null, token: null, isAuthenticated: false })
  },

  setLoading: (isLoading) => set({ isLoading }),
}))

export default useAuthStore
