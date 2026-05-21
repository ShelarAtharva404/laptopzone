import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ArrowRight } from 'lucide-react'
import { useWishlistStore } from '../../store/authStore'
import ProductCard from '../../components/user/ProductCard'

export default function WishlistPage() {
  const { items, fetchWishlist } = useWishlistStore()

  useEffect(() => {
    fetchWishlist()
  }, [fetchWishlist])

  if (items.length === 0) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 80, marginBottom: 20, color: 'var(--error)' }}>❤️</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 10 }}>Your Wishlist is Empty</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 28 }}>Save your favorite laptops here to buy them later!</p>
          <Link to="/products" className="btn btn-primary" style={{ fontSize: 15, padding: '14px 28px' }}>
            Browse Laptops <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-enter" style={{ padding: '32px 0 80px' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800 }}>
            My Wishlist <span style={{ color: 'var(--text-muted)', fontSize: 18, fontWeight: 400 }}>({items.length} items)</span>
          </h1>
          <Link to="/products" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            Continue Shopping <ArrowRight size={16} />
          </Link>
        </div>

        <div className="products-grid">
          {items.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>

      <style>{`
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }
        @media (max-width: 640px) {
          .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 16px;
          }
        }
      `}</style>
    </div>
  )
}
