import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, ShieldCheck, MapPin, CreditCard, ShoppingBag, AlertTriangle, CheckCircle, Truck, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import api, { formatPrice, formatDate } from '../../utils/api'

export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [showCancelModal, setShowCancelModal] = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`)
        setOrder(data.data)
      } catch (err) {
        console.error('Error fetching order details:', err)
        toast.error('Failed to load order details')
        navigate('/orders')
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id, navigate])

  const handleCancelOrder = async (e) => {
    e.preventDefault()
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation')
      return
    }
    setCancelling(true)
    try {
      const { data } = await api.post(`/orders/${id}/cancel`, { reason: cancelReason })
      setOrder(data.data)
      toast.success('Order cancelled successfully')
      setShowCancelModal(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order')
    } finally {
      setCancelling(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return '#00A843'
      case 'shipped': return '#D97706'
      case 'confirmed': return '#0369A1'
      case 'cancelled': return '#DC2626'
      case 'pending':
      default: return '#4B5563'
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: 50, height: 50, border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading order details...</p>
        </div>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    )
  }

  if (!order) return null

  const canCancel = ['pending', 'confirmed'].includes(order.status)
  const statusColor = getStatusColor(order.status)

  return (
    <div className="page-enter" style={{ padding: '32px 0 80px' }}>
      <div className="container" style={{ maxWidth: 1000 }}>
        {/* Back Link */}
        <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 14, marginBottom: 24 }}>
          <ArrowLeft size={16} /> Back to My Orders
        </Link>

        {/* Title / Summary Bar */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '2px solid var(--border)', paddingBottom: 20, marginBottom: 28
        }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, margin: '0 0 6px' }}>
              Order Details
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Order ID: <strong style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>#{order.orderNumber}</strong> &bull; Placed on {formatDate(order.createdAt)}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{
              backgroundColor: `${statusColor}10`,
              color: statusColor,
              border: `1.5px solid ${statusColor}40`,
              padding: '6px 16px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 700,
              textTransform: 'uppercase',
            }}>
              {order.status}
            </span>

            {canCancel && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="btn btn-outline"
                style={{ color: 'var(--error)', borderColor: 'var(--error)', fontSize: 13, padding: '8px 16px', cursor: 'pointer' }}
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, alignItems: 'start' }}>
          
          {/* Main content: Items and Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            
            {/* Ordered Items Card */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShoppingBag size={18} /> Items in this Order
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', borderBottom: idx < order.items.length - 1 ? '1px solid var(--border)' : 'none', paddingBottom: idx < order.items.length - 1 ? 20 : 0 }}>
                    <div style={{
                      width: 100, height: 75, background: 'var(--surface-2)',
                      borderRadius: 'var(--radius-md)', overflow: 'hidden',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      border: '1px solid var(--border)'
                    }}>
                      {item.image ? (
                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 6 }} />
                      ) : (
                        <span style={{ fontSize: 28 }}>💻</span>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                        {item.brand}
                      </p>
                      <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px', lineHeight: 1.4 }}>
                        {item.name}
                      </h4>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        Qty: <strong style={{ color: 'var(--text-primary)' }}>{item.quantity}</strong> &bull; {formatPrice(item.price)} each
                      </p>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Tracking Card */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={18} /> Order Progress
              </h3>

              <div style={{ position: 'relative', paddingLeft: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Vertical Line */}
                <div style={{ position: 'absolute', left: 11, top: 12, bottom: 12, width: 2, background: 'var(--border)' }}></div>

                {order.timeline.map((step, idx) => {
                  const isLatest = idx === order.timeline.length - 1
                  const stepColor = getStatusColor(step.status)
                  return (
                    <div key={idx} style={{ position: 'relative' }}>
                      {/* Circle indicator */}
                      <div style={{
                        position: 'absolute', left: -32, top: 4, width: 24, height: 24, borderRadius: '50%',
                        backgroundColor: isLatest ? stepColor : 'var(--surface)',
                        border: `2px solid ${stepColor}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1
                      }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: isLatest ? '#fff' : stepColor }}></div>
                      </div>

                      {/* Content */}
                      <div>
                        <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 2px', textTransform: 'capitalize' }}>
                          {step.status}
                        </h4>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 4px' }}>
                          {step.message}
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {formatDate(step.timestamp)} &bull; {new Date(step.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>

          {/* Sidebar: Address & Payment & Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            
            {/* Delivery Address */}
            <div className="card" style={{ padding: 20 }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={16} /> Delivery Address
              </h4>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                {order.shippingAddress.name || order.user?.name}
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 10px' }}>
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}<br />
                {order.shippingAddress.country || 'India'}
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Phone: <strong style={{ color: 'var(--text-primary)' }}>{order.shippingAddress.phone}</strong>
              </p>
            </div>

            {/* Payment Details */}
            <div className="card" style={{ padding: 20 }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CreditCard size={16} /> Payment Information
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                <div className="flex-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Method</span>
                  <strong style={{ textTransform: 'uppercase' }}>{order.payment.method}</strong>
                </div>
                <div className="flex-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                  <strong style={{ color: order.payment.status === 'paid' ? 'var(--success)' : 'var(--warning)', textTransform: 'capitalize' }}>
                    {order.payment.status}
                  </strong>
                </div>
                {order.payment.paidAt && (
                  <div className="flex-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Paid At</span>
                    <span>{formatDate(order.payment.paidAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price Summary */}
            <div className="card" style={{ padding: 20 }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={16} /> Price Summary
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 12 }}>
                <div className="flex-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                  <span>{formatPrice(order.pricing.subtotal)}</span>
                </div>
                <div className="flex-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Shipping</span>
                  <span style={{ color: order.pricing.shipping === 0 ? 'var(--success)' : 'var(--text-primary)' }}>
                    {order.pricing.shipping === 0 ? 'FREE' : formatPrice(order.pricing.shipping)}
                  </span>
                </div>
                <div className="flex-between">
                  <span style={{ color: 'var(--text-secondary)' }}>GST (18%)</span>
                  <span>{formatPrice(order.pricing.tax)}</span>
                </div>
                {order.pricing.discount > 0 && (
                  <div className="flex-between" style={{ color: 'var(--success)', fontWeight: 600 }}>
                    <span>Discount</span>
                    <span>-{formatPrice(order.pricing.discount)}</span>
                  </div>
                )}
              </div>
              <div className="flex-between" style={{ fontSize: 15, fontWeight: 700 }}>
                <span>Total Amount</span>
                <span style={{ fontSize: 18, color: 'var(--primary)' }}>{formatPrice(order.pricing.total)}</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: '90%', maxWidth: 450, padding: 28, animation: 'fadeIn 0.2s ease' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={22} color="var(--error)" /> Cancel Your Order?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20, lineHeight: 1.5 }}>
              Are you sure you want to cancel this order? This action cannot be undone. Please specify your reason:
            </p>
            <form onSubmit={handleCancelOrder}>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation (e.g. Changed my mind, found a better price elsewhere...)"
                required
                rows={3}
                style={{
                  width: '100%', padding: 12, borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)',
                  outline: 'none', resize: 'none', fontSize: 14, marginBottom: 20, fontFamily: 'var(--font-body)'
                }}
              />
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="btn btn-outline"
                  style={{ fontSize: 13, padding: '10px 16px' }}
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="btn btn-primary"
                  style={{ backgroundColor: 'var(--error)', borderColor: 'var(--error)', fontSize: 13, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 1fr 340px"] {
            grid-template-columns: 1fr !important;
          }
        }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  )
}
