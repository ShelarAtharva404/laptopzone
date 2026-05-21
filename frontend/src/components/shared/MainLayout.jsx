import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import { useAuthStore, useCartStore, useWishlistStore } from '../../store/authStore'

export default function MainLayout() {
  const { token, getMe } = useAuthStore()
  const { fetchCart } = useCartStore()
  const { fetchWishlist } = useWishlistStore()

  useEffect(() => {
    if (token) {
      getMe()
      fetchCart()
      fetchWishlist()
    }
  }, [token])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1, paddingTop: 'var(--nav-height)' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
