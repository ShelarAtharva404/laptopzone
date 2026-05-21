import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, CreditCard, Tag } from 'lucide-react'
import { useCartStore, useAuthStore } from '../../store/authStore'
import api, { formatPrice } from '../../utils/api'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const [placing, setPlacing] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [address, setAddress] = useState({
    name: user?.name || '', phone: user?.phone || '',
    street: '', city: '', state: '', zipCode: '', country: 'India'
  })
  const [paymentMethod, setPaymentMethod] = useState('cod')

  const subtotal = items.reduce((s, i) => s + (i.product?.price?.discounted || i.product?.price?.original || 0) * i.quantity, 0)
  const shipping = subtotal > 50000 ? 0 : 499
  const tax = Math.round(subtotal * 0.18)
  const discount = coupon ? (coupon.type === 'percentage' ? Math.min(subtotal * coupon.value / 100, coupon.maxDiscount || Infinity) : coupon.value) : 0
  const total = subtotal + shipping + tax - discount

  const verifyCoupon = async () => {
    try {
      const { data } = await api.post('/payment/verify-coupon', { code: couponCode })
      setCoupon(data.data)
      toast.success('Coupon applied!')
    } catch (e) { toast.error(e.response?.data?.message || 'Invalid coupon') }
  }

  const placeOrder = async () => {
    if (!address.street || !address.city || !address.state || !address.zipCode) return toast.error('Please fill all address fields')
    setPlacing(true)
    try {
      const { data } = await api.post('/orders', {
        items: items.map(i => ({ product: i.product._id, quantity: i.quantity })),
        shippingAddress: address,
        payment: { method: paymentMethod },
        couponCode: coupon?.code,
      })
      await clearCart()
      toast.success('Order placed successfully!')
      navigate(`/orders/${data.data._id}`)
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to place order') }
    setPlacing(false)
  }

  if (items.length === 0) { navigate('/cart'); return null }

  return (
    <div className="page-enter" style={{ padding: '32px 0 80px' }}>
      <div className="container">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 28 }}>Checkout</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
          <div>
            <div className="card" style={{ padding: 24, marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 20, display: 'flex', gap: 8, alignItems: 'center' }}>
                <MapPin size={18} /> Delivery Address
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[['name','Full Name','text'],['phone','Phone','tel'],['street','Street Address','text'],['city','City','text'],['state','State','text'],['zipCode','ZIP Code','text']].map(([field, label, type]) => (
                  <div key={field} className="form-group" style={{ gridColumn: field === 'street' ? '1 / -1' : undefined }}>
                    <label className="form-label">{label}</label>
                    <input type={type} className="form-input" value={address[field]}
                      onChange={e => setAddress(p => ({ ...p, [field]: e.target.value }))} />
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 20, display: 'flex', gap: 8, alignItems: 'center' }}>
                <CreditCard size={18} /> Payment Method
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[['cod','💵','Cash on Delivery','Pay when your order arrives'],['card','💳','Credit/Debit Card','All major cards accepted'],['upi','📱','UPI Payment','PhonePe, GPay, Paytm'],['netbanking','🏦','Net Banking','All major banks']].map(([val,icon,label,desc]) => (
                  <label key={val} style={{
                    display:'flex',alignItems:'center',gap:14,padding:'14px 16px',
                    border:`1.5px solid ${paymentMethod===val?'var(--primary)':'var(--border)'}`,
                    borderRadius:'var(--radius-md)',cursor:'pointer',
                    background:paymentMethod===val?'var(--primary-light)':'none',transition:'var(--transition)',
                  }}>
                    <input type="radio" name="payment" value={val} checked={paymentMethod===val} onChange={() => setPaymentMethod(val)} style={{ accentColor:'var(--primary)' }} />
                    <span style={{ fontSize:20 }}>{icon}</span>
                    <div>
                      <p style={{ fontWeight:600, fontSize:14 }}>{label}</p>
                      <p style={{ fontSize:12, color:'var(--text-muted)' }}>{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="card" style={{ padding: 24, marginBottom: 16 }}>
              <h3 style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:16,marginBottom:16 }}>Order Summary</h3>
              <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 14 }}>
                {items.map(item => (
                  <div key={item.product._id} className="flex-between" style={{ fontSize:13,marginBottom:8,color:'var(--text-secondary)' }}>
                    <span style={{ overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'60%' }}>{item.product.name} ×{item.quantity}</span>
                    <span style={{ fontWeight:600,color:'var(--text-primary)',flexShrink:0 }}>{formatPrice((item.product.price?.discounted||item.product.price?.original||0)*item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop:'1px solid var(--border)',paddingTop:14,display:'flex',flexDirection:'column',gap:10 }}>
                {[['Subtotal',formatPrice(subtotal)],['Shipping',shipping===0?'FREE':formatPrice(shipping)],['GST (18%)',formatPrice(tax)],discount>0&&['Coupon Discount',`-${formatPrice(discount)}`]].filter(Boolean).map(([k,v]) => (
                  <div key={k} className="flex-between" style={{ fontSize:14,color:'var(--text-secondary)' }}><span>{k}</span><span style={{ color: k==='Coupon Discount'?'var(--success)':undefined }}>{v}</span></div>
                ))}
                <div className="flex-between" style={{ fontWeight:800,fontSize:18,borderTop:'2px solid var(--border)',paddingTop:12,marginTop:4 }}>
                  <span style={{ fontFamily:'var(--font-display)' }}>Total</span>
                  <span style={{ fontFamily:'var(--font-display)',color:'var(--primary)' }}>{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding:20,marginBottom:16 }}>
              <h4 style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:14,marginBottom:12,display:'flex',gap:6,alignItems:'center' }}>
                <Tag size={16} /> Coupon Code
              </h4>
              {coupon ? (
                <div style={{ background:'#E8FFF1',borderRadius:10,padding:'10px 14px',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                  <div>
                    <p style={{ fontWeight:700,color:'#00A843',fontSize:14 }}>{coupon.code}</p>
                    <p style={{ fontSize:12,color:'var(--text-secondary)' }}>-{formatPrice(discount)} saved!</p>
                  </div>
                  <button onClick={() => { setCoupon(null); setCouponCode('') }} style={{ color:'var(--error)',fontSize:12,cursor:'pointer',background:'none',border:'none',fontFamily:'var(--font-body)',fontWeight:600 }}>Remove</button>
                </div>
              ) : (
                <div style={{ display:'flex',gap:8 }}>
                  <input className="form-input" placeholder="Enter coupon code" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} style={{ flex:1,fontSize:13,padding:'10px 14px' }} />
                  <button onClick={verifyCoupon} className="btn btn-secondary" style={{ fontSize:13,padding:'10px 16px',whiteSpace:'nowrap' }}>Apply</button>
                </div>
              )}
            </div>

            <button onClick={placeOrder} disabled={placing} className="btn btn-primary" style={{ width:'100%',padding:'15px',fontSize:16 }}>
              {placing ? <span className="spinner" style={{ width:20,height:20 }} /> : `Place Order · ${formatPrice(total)}`}
            </button>
            <p style={{ fontSize:12,color:'var(--text-muted)',textAlign:'center',marginTop:12 }}>
              By placing this order you agree to our Terms & Conditions
            </p>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:900px){div[style*="grid-template-columns: 1fr 360px"]{grid-template-columns:1fr!important;}}`}</style>
    </div>
  )
}
