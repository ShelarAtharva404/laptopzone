import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../utils/api'
import toast from 'react-hot-toast'

// ─── Auth Store ──────────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,

      login: async (email, password) => {
        set({ loading: true })
        try {
          const { data } = await api.post('/auth/login', { email, password })
          set({ user: data.user, token: data.token, loading: false })
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
          toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`)
          return { success: true }
        } catch (error) {
          set({ loading: false })
          const msg = error.response?.data?.message || 'Login failed'
          toast.error(msg)
          return { success: false, message: msg }
        }
      },

      register: async (userData) => {
        set({ loading: true })
        try {
          const { data } = await api.post('/auth/register', userData)
          set({ user: data.user, token: data.token, loading: false })
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
          toast.success('Account created successfully!')
          return { success: true }
        } catch (error) {
          set({ loading: false })
          const msg = error.response?.data?.message || 'Registration failed'
          toast.error(msg)
          return { success: false, message: msg }
        }
      },

      logout: () => {
        set({ user: null, token: null })
        delete api.defaults.headers.common['Authorization']
        toast.success('Logged out successfully')
      },

      updateUser: (userData) => set({ user: { ...get().user, ...userData } }),

      getMe: async () => {
        const { token } = get()
        if (!token) return
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          const { data } = await api.get('/auth/me')
          set({ user: data.user })
        } catch (error) {
          if (error.response?.status === 401) {
            set({ user: null, token: null })
          }
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)

// ─── Cart Store ──────────────────────────────────────────────────
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      loading: false,

      fetchCart: async () => {
        const { token } = useAuthStore.getState()
        if (!token) return
        try {
          const { data } = await api.get('/cart')
          set({ items: data.data })
        } catch (error) {
          console.error('Cart fetch error:', error)
        }
      },

      addToCart: async (productId, quantity = 1) => {
        const { token } = useAuthStore.getState()
        if (!token) {
          toast.error('Please login to add items to cart')
          return false
        }
        try {
          const { data } = await api.post('/cart/add', { productId, quantity })
          set({ items: data.data })
          toast.success('Added to cart!')
          return true
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to add to cart')
          return false
        }
      },

      updateQuantity: async (productId, quantity) => {
        try {
          const { data } = await api.put('/cart/update', { productId, quantity })
          set({ items: data.data })
        } catch (error) {
          toast.error('Failed to update cart')
        }
      },

      removeFromCart: async (productId) => {
        try {
          const { data } = await api.delete(`/cart/remove/${productId}`)
          set({ items: data.data })
          toast.success('Removed from cart')
        } catch (error) {
          toast.error('Failed to remove item')
        }
      },

      clearCart: async () => {
        try {
          await api.delete('/cart/clear')
          set({ items: [] })
        } catch (error) {
          set({ items: [] })
        }
      },

      // For guest users (local cart)
      addToLocalCart: (product, quantity = 1) => {
        const { items } = get()
        const existing = items.find(i => i.product?._id === product._id || i._id === product._id)
        if (existing) {
          set({ items: items.map(i =>
            (i.product?._id === product._id || i._id === product._id)
              ? { ...i, quantity: i.quantity + quantity }
              : i
          )})
        } else {
          set({ items: [...items, { product, quantity, _id: product._id }] })
        }
        toast.success('Added to cart!')
      },

      get total() {
        return get().items.reduce((sum, item) => {
          const price = item.product?.price?.discounted || item.product?.price?.original || 0
          return sum + price * item.quantity
        }, 0)
      },

      get count() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    {
      name: 'cart-store',
      partialize: (state) => ({ items: state.items }),
    }
  )
)

// ─── Wishlist Store ──────────────────────────────────────────────
export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      fetchWishlist: async () => {
        const { token } = useAuthStore.getState()
        if (!token) return
        try {
          const { data } = await api.get('/wishlist')
          set({ items: data.data })
        } catch (error) {
          console.error('Wishlist fetch error:', error)
        }
      },

      toggleWishlist: async (productId) => {
        const { token } = useAuthStore.getState()
        if (!token) {
          toast.error('Please login to add to wishlist')
          return
        }
        try {
          const { data } = await api.post(`/wishlist/toggle/${productId}`)
          if (data.action === 'added') {
            toast.success('Added to wishlist!')
          } else {
            toast.success('Removed from wishlist')
          }
          await get().fetchWishlist()
        } catch (error) {
          toast.error('Failed to update wishlist')
        }
      },

      isInWishlist: (productId) => {
        return get().items.some(item => item._id === productId || item === productId)
      },
    }),
    {
      name: 'wishlist-store',
      partialize: (state) => ({ items: state.items }),
    }
  )
)
