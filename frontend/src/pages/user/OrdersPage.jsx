import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ArrowRight, Eye, Calendar, Tag, CreditCard } from 'lucide-react'
import api, { formatPrice, formatDate } from '../../utils/api'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/my')
        setOrders(data.data)
      } catch (err) {
        console.error('Error fetching orders:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const getStatusStyle = (status) => {
    switch (status) {
      case 'delivered':
        return { bg: '#E8FFF1', color: '#00A843', border: '1px solid #B0FFC8' }
      case 'shipped':
        return { bg: '#FFF7E6', color: '#D97706', border: '1px solid #FFE4B3' }
      case 'confirmed':
        return { bg: '#E8F5FF', color: '#0369A1', border: '1px solid #BAE6FD' }
      case 'cancelled':
        return { bg: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA' }
      case 'pending':
      default:
        return { bg: '#F3F4F6', color: '#4B5563', border: '1px solid #E5E7EB' }
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: 50, height: 50, border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading your orders...</p>
        </div>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 80, marginBottom: 20 }}>📦</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 10 }}>No Orders Yet</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 28 }}>You haven't placed any orders yet. Ready to grab a powerful new laptop?</p>
          <Link to="/products" className="btn btn-primary" style={{ fontSize: 15, padding: '14px 28px' }}>
            Explore Laptops <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-enter" style={{ padding: '32px 0 80px' }}>
      <div className="container" style={{ maxWidth: 880 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 28 }}>
          My Orders <span style={{ color: 'var(--text-muted)', fontSize: 18, fontWeight: 400 }}>({orders.length} orders)</span>
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {orders.map((order) => {
            const statusStyle = getStatusStyle(order.status)
            return (
              <div key={order._id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Header info */}
                <div style={{
                  background: 'var(--surface-2)', padding: '16px 24px',
                  display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'space-between',
                  borderBottom: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                    <div>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>
                        Order Placed
                      </p>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Calendar size={14} /> {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>
                        Total Amount
                      </p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>
                        {formatPrice(order.pricing.total)}
                      </p>
                    </div>

                    <div>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>
                        Order ID
                      </p>
                      <p style={{ fontSize: 14, fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                        #{order.orderNumber}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.color,
                      border: statusStyle.border,
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div style={{ padding: '24px 24px 16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {order.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div style={{
                          width: 80, height: 60, background: 'var(--surface-2)',
                          borderRadius: 'var(--radius-md)', overflow: 'hidden',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          border: '1px solid var(--border)'
                        }}>
                          {item.image ? (
                            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
                          ) : (
                            <span style={{ fontSize: 24 }}>💻</span>
                          )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px', lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.name}
                          </h4>
                          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                            Brand: <strong style={{ color: 'var(--text-primary)' }}>{item.brand}</strong> &bull; Qty: <strong style={{ color: 'var(--text-primary)' }}>{item.quantity}</strong>
                          </p>
                        </div>

                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {formatPrice(item.price)} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer action */}
                <div style={{
                  padding: '16px 24px', background: 'var(--surface-2)',
                  borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CreditCard size={14} /> Paid via: <strong style={{ textTransform: 'uppercase', color: 'var(--text-primary)' }}>{order.payment.method}</strong>
                  </p>
                  <Link to={`/orders/${order._id}`} className="btn btn-outline" style={{ fontSize: 13, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Eye size={14} /> View Order Details
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
