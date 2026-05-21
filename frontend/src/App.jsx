import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

// Layouts
import MainLayout from './components/shared/MainLayout'
import AdminLayout from './components/admin/AdminLayout'

// User Pages
import HomePage from './pages/user/HomePage'
import ProductsPage from './pages/user/ProductsPage'
import ProductDetailPage from './pages/user/ProductDetailPage'
import CartPage from './pages/user/CartPage'
import WishlistPage from './pages/user/WishlistPage'
import CheckoutPage from './pages/user/CheckoutPage'
import OrdersPage from './pages/user/OrdersPage'
import OrderDetailPage from './pages/user/OrderDetailPage'
import ProfilePage from './pages/user/ProfilePage'
import AuthPage from './pages/user/AuthPage'
import SearchPage from './pages/user/SearchPage'
import NotFoundPage from './pages/user/NotFoundPage'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminOrders from './pages/admin/AdminOrders'
import AdminUsers from './pages/admin/AdminUsers'
import AdminCategories from './pages/admin/AdminCategories'
import AdminCoupons from './pages/admin/AdminCoupons'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminProductForm from './pages/admin/AdminProductForm'

// Protected route components
const ProtectedRoute = ({ children }) => {
  const { user, token } = useAuthStore()
  if (!token) return <Navigate to="/auth" replace />
  return children
}

const AdminRoute = ({ children }) => {
  const { user, token } = useAuthStore()
  if (!token) return <Navigate to="/auth" replace />
  if (user?.role !== 'admin') return <Navigate to="/" replace />
  return children
}

const GuestRoute = ({ children }) => {
  const { token } = useAuthStore()
  if (token) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/auth" element={<GuestRoute><AuthPage /></GuestRoute>} />

      {/* Main User Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:slug" element={<ProductDetailPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
        <Route path="checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<AdminProductForm />} />
        <Route path="products/:id/edit" element={<AdminProductForm />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="analytics" element={<AdminAnalytics />} />
      </Route>
    </Routes>
  )
}
