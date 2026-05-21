import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react'
import { useCartStore, useAuthStore } from '../../store/authStore'
import { formatPrice } from '../../utils/api'

export default function CartPage() {
  const navigate = useNavigate()
  const { items, updateQuantity, removeFromCart } = useCartStore()
  const { token } = useAuthStore()

  const subtotal = items.reduce((sum, item) => {
    const price = item.product?.price?.discounted || item.product?.price?.original || 0
    return sum + price * item.quantity
  }, 0)
  const shipping = subtotal > 50000 ? 0 : 499
  const tax = Math.round(subtotal * 0.18)
  const total = subtotal + shipping + tax

  if (items.length === 0) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 80, marginBottom: 20 }}>🛒</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 10 }}>Your cart is empty</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 28 }}>Add some amazing laptops to get started!</p>
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
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 28 }}>
          Shopping Cart <span style={{ color: 'var(--text-muted)', fontSize: 18, fontWeight: 400 }}>({items.length} items)</span>
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
          {/* Cart Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {items.map(item => {
              const product = item.product
              if (!product) return null
              const price = product.price?.discounted || product.price?.original || 0
              const img = product.images?.find(i => i.isPrimary)?.url || product.images?.[0]?.url

              return (
                <div key={item._id || product._id} className="card" style={{ padding: '20px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  {/* Image */}
                  <Link to={`/products/${product.slug}`} style={{ flexShrink: 0 }}>
                    <div style={{
                      width: 100, height: 80, background: 'var(--surface-2)',
                      borderRadius: 'var(--radius-md)', overflow: 'hidden',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {img ? (
                        <img src={img} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }} />
                      ) : (
                        <span style={{ fontSize: 32 }}>💻</span>
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                      {product.brand}
                    </p>
                    <Link to={`/products/${product.slug}`} style={{ textDecoration: 'none' }}>
                      <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.4 }}>
                        {product.name}
                      </h3>
                    </Link>
                    {product.stock?.status === 'low_stock' && (
                      <p style={{ fontSize: 12, color: 'var(--warning)', fontWeight: 500 }}>⚡ Only a few left!</p>
                    )}
                  </div>

                  {/* Right side */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>
                      {formatPrice(price * item.quantity)}
                    </p>

                    {/* Quantity */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 2,
                      border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                    }}>
                      <button
                        onClick={() => updateQuantity(product._id, item.quantity - 1)}
                        style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'none', border: 'none', color: 'var(--text-secondary)' }}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ width: 32, textAlign: 'center', fontSize: 14, fontWeight: 600 }}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(product._id, item.quantity + 1)}
                        style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'none', border: 'none', color: 'var(--text-secondary)' }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(product._id)}
                      style={{ color: 'var(--error)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'var(--font-body)' }}
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Order Summary */}
          <div className="card" style={{ padding: 24, position: 'sticky', top: 90 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Order Summary</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <div className="flex-between" style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                <span>Subtotal ({items.length} items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex-between" style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                <span>Shipping</span>
                <span style={{ color: shipping === 0 ? 'var(--success)' : undefined }}>
                  {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex-between" style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                <span>GST (18%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              {subtotal < 50000 && (
                <div style={{ background: 'var(--primary-light)', borderRadius: 'var(--radius-md)', padding: '10px 12px', fontSize: 13, color: 'var(--primary)' }}>
                  Add {formatPrice(50000 - subtotal)} more for FREE shipping!
                </div>
              )}
            </div>

            <div style={{ borderTop: '2px solid var(--border)', paddingTop: 16, marginBottom: 20 }}>
              <div className="flex-between">
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>Total</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22 }}>{formatPrice(total)}</span>
              </div>
            </div>

            <button
              onClick={() => token ? navigate('/checkout') : navigate('/auth')}
              className="btn btn-primary"
              style={{ width: '100%', fontSize: 15, padding: '14px' }}
            >
              {token ? 'Proceed to Checkout' : 'Sign In to Checkout'} <ArrowRight size={18} />
            </button>

            <Link to="/products" style={{ display: 'block', textAlign: 'center', marginTop: 14, fontSize: 14, color: 'var(--text-secondary)', textDecoration: 'none' }}>
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 1fr 360px"] {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 640px) {
          div[style*="display: flex; gap: 16px; align-items: flex-start"] {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  )
}
