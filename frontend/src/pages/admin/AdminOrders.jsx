import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, ChevronDown } from 'lucide-react'
import api, { formatPrice, formatDate } from '../../utils/api'
import toast from 'react-hot-toast'

const STATUSES = ['all','pending','confirmed','processing','shipped','out_for_delivery','delivered','cancelled','returned']
const STATUS_COLORS = {
  pending: { bg:'#FFF8E8', color:'#E6A000' }, confirmed: { bg:'#E8F0FF', color:'var(--primary)' },
  processing: { bg:'#F0E8FF', color:'#7B2EFF' }, shipped: { bg:'#E8F5FF', color:'#0091FF' },
  out_for_delivery: { bg:'#FFF0E8', color:'var(--secondary)' }, delivered: { bg:'#E8FFF1', color:'#00A843' },
  cancelled: { bg:'#FFF0F0', color:'var(--error)' }, returned: { bg:'#F5F5F5', color:'var(--text-muted)' },
}
const NEXT_STATUS = { pending:'confirmed', confirmed:'processing', processing:'shipped', shipped:'out_for_delivery', out_for_delivery:'delivered' }

export default function AdminOrders() {
  const [searchParams] = useSearchParams()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({})
  const [status, setStatus] = useState(searchParams.get('status') || 'all')
  const [page, setPage] = useState(1)
  const [updating, setUpdating] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [trackingInfo, setTrackingInfo] = useState({ trackingNumber: '', carrier: '' })

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      if (status !== 'all') params.set('status', status)
      const { data } = await api.get(`/orders/admin/all?${params}`)
      setOrders(data.data); setPagination(data.pagination)
    } catch (e) { toast.error('Failed to load orders') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchOrders() }, [page, status])

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(orderId)
    try {
      const payload = { status: newStatus }
      if (newStatus === 'shipped') { payload.trackingNumber = trackingInfo.trackingNumber; payload.carrier = trackingInfo.carrier }
      await api.put(`/orders/${orderId}/status`, payload)
      toast.success(`Order marked as ${newStatus.replace(/_/g, ' ')}`)
      setSelectedOrder(null)
      fetchOrders()
    } catch (e) { toast.error('Failed to update') }
    finally { setUpdating(null) }
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700 }}>Orders</h2>
        <p style={{ fontSize:13, color:'var(--text-muted)', marginTop:2 }}>{pagination.total || 0} total orders</p>
      </div>

      {/* Status Tabs */}
      <div style={{ display:'flex', gap:4, overflowX:'auto', marginBottom:16, background:'#fff', borderRadius:12, padding:6, border:'1px solid var(--border)', flexWrap:'wrap' }}>
        {STATUSES.map(s => (
          <button key={s} onClick={() => { setStatus(s); setPage(1) }}
            style={{
              padding:'7px 14px', borderRadius:8, fontSize:13, fontWeight:600,
              border:'none', cursor:'pointer', fontFamily:'var(--font-body)', whiteSpace:'nowrap',
              background: status===s ? 'var(--primary)' : 'transparent',
              color: status===s ? '#fff' : 'var(--text-secondary)',
            }}>
            {s === 'all' ? 'All' : s.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div style={{ background:'#fff', borderRadius:14, border:'1px solid var(--border)', overflow:'hidden' }}>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(8)].map((_,i) => (
                <tr key={i}>{[...Array(8)].map((_,j) => <td key={j}><div className="skeleton" style={{height:14,borderRadius:4}}/></td>)}</tr>
              )) : orders.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign:'center', padding:'48px 0', color:'var(--text-muted)', fontSize:14 }}>No orders found</td></tr>
              ) : orders.map(order => {
                const s = STATUS_COLORS[order.status] || { bg:'#F5F5F5', color:'#666' }
                const next = NEXT_STATUS[order.status]
                return (
                  <tr key={order._id}>
                    <td>
                      <p style={{ fontWeight:700, fontSize:13, color:'var(--primary)' }}>#{order.orderNumber}</p>
                    </td>
                    <td>
                      <p style={{ fontSize:13, fontWeight:500 }}>{order.user?.name}</p>
                      <p style={{ fontSize:11, color:'var(--text-muted)' }}>{order.user?.email}</p>
                    </td>
                    <td style={{ fontSize:13 }}>{order.items?.length} item(s)</td>
                    <td style={{ fontWeight:700, fontSize:13 }}>{formatPrice(order.pricing?.total || 0)}</td>
                    <td>
                      <div>
                        <span style={{ fontSize:12, textTransform:'capitalize' }}>{order.payment?.method}</span>
                        <span style={{
                          display:'block', fontSize:11, fontWeight:700, marginTop:2,
                          color: order.payment?.status === 'paid' ? '#00A843' : '#E6A000',
                        }}>{order.payment?.status}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ padding:'4px 10px', borderRadius:6, fontSize:11, fontWeight:700, background:s.bg, color:s.color, whiteSpace:'nowrap', textTransform:'capitalize' }}>
                        {order.status?.replace(/_/g,' ')}
                      </span>
                    </td>
                    <td style={{ fontSize:12, color:'var(--text-muted)', whiteSpace:'nowrap' }}>{formatDate(order.createdAt)}</td>
                    <td>
                      {next && (
                        <button
                          onClick={() => next === 'shipped' ? setSelectedOrder(order) : updateStatus(order._id, next)}
                          disabled={updating === order._id}
                          style={{
                            padding:'6px 10px', borderRadius:8, fontSize:11, fontWeight:700,
                            background:'var(--primary-light)', color:'var(--primary)', border:'none',
                            cursor:'pointer', fontFamily:'var(--font-body)', whiteSpace:'nowrap',
                          }}>
                          {updating === order._id ? '...' : `Mark ${next.replace(/_/g,' ')}`}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {pagination.pages > 1 && (
          <div style={{ padding:'14px 24px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'flex-end' }}>
            <div className="pagination" style={{ marginTop:0 }}>
              <button className="page-btn" onClick={() => setPage(p => p-1)} disabled={page===1} style={{ opacity:page===1?0.4:1 }}>‹</button>
              {[...Array(Math.min(pagination.pages,5))].map((_,i) => {
                const p = i+1; return <button key={p} className={`page-btn ${page===p?'active':''}`} onClick={() => setPage(p)}>{p}</button>
              })}
              <button className="page-btn" onClick={() => setPage(p => p+1)} disabled={page===pagination.pages} style={{ opacity:page===pagination.pages?0.4:1 }}>›</button>
            </div>
          </div>
        )}
      </div>

      {/* Ship modal */}
      {selectedOrder && (
        <>
          <div className="overlay" onClick={() => setSelectedOrder(null)} />
          <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'#fff', borderRadius:16, padding:32, zIndex:300, width:'90%', maxWidth:400, boxShadow:'var(--shadow-xl)' }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:18, marginBottom:20 }}>Ship Order #{selectedOrder.orderNumber}</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="form-group">
                <label className="form-label">Carrier / Courier</label>
                <input className="form-input" placeholder="e.g. BlueDart, Delhivery" value={trackingInfo.carrier} onChange={e => setTrackingInfo(p => ({...p, carrier:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Tracking Number</label>
                <input className="form-input" placeholder="Tracking ID" value={trackingInfo.trackingNumber} onChange={e => setTrackingInfo(p => ({...p, trackingNumber:e.target.value}))} />
              </div>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:20 }}>
              <button onClick={() => setSelectedOrder(null)} className="btn btn-secondary" style={{ flex:1 }}>Cancel</button>
              <button onClick={() => updateStatus(selectedOrder._id, 'shipped')} className="btn btn-primary" style={{ flex:1 }} disabled={!trackingInfo.carrier}>
                Mark Shipped
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
