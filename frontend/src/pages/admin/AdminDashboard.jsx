import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp, TrendingDown, ShoppingBag, Users, Package, DollarSign,
  ArrowRight, AlertTriangle, Clock, CheckCircle
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import api, { formatPrice, formatDate } from '../../utils/api'

const COLORS = ['#0066FF', '#FF6B35', '#00D4AA', '#FFB800', '#9B59B6', '#00C853', '#FF4444', '#00BCD4']

const StatCard = ({ title, value, subtitle, icon: Icon, color, growth, loading }) => (
  <div style={{
    background: '#fff', borderRadius: 16, padding: 24,
    border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
  }}>
    {loading ? (
      <>
        <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 32, width: '80%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 12, width: '50%' }} />
      </>
    ) : (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: `${color}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={22} style={{ color }} />
          </div>
          {growth !== undefined && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 13, fontWeight: 600,
              color: growth >= 0 ? '#00A843' : 'var(--error)',
            }}>
              {growth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {Math.abs(growth)}%
            </div>
          )}
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{title}</p>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{value}</p>
        {subtitle && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{subtitle}</p>}
      </>
    )}
  </div>
)

const ORDER_STATUS_COLORS = {
  pending: '#FFB300', confirmed: '#0066FF', processing: '#9B59B6',
  shipped: '#00BCD4', out_for_delivery: '#FF6B35', delivered: '#00C853',
  cancelled: '#FF4444', returned: '#9E9E9E',
}

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [salesData, setSalesData] = useState([])
  const [loading, setLoading] = useState(true)
  const [salesPeriod, setSalesPeriod] = useState('30d')

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes] = await Promise.all([api.get('/admin/dashboard')])
        setData(dashRes.data.data)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetchDashboard()
  }, [])

  useEffect(() => {
    api.get(`/admin/sales?period=${salesPeriod}`).then(r => setSalesData(r.data.data)).catch(() => {})
  }, [salesPeriod])

  const stats = data?.stats || {}

  return (
    <div>
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard title="Total Revenue" value={loading ? '—' : formatPrice(stats.totalRevenue || 0)} subtitle={`${formatPrice(stats.monthRevenue || 0)} this month`} icon={DollarSign} color="#0066FF" growth={stats.revenueGrowth} loading={loading} />
        <StatCard title="Total Orders" value={loading ? '—' : (stats.totalOrders || 0).toLocaleString()} subtitle={`${stats.monthOrders || 0} this month`} icon={ShoppingBag} color="#FF6B35" growth={stats.ordersGrowth} loading={loading} />
        <StatCard title="Total Customers" value={loading ? '—' : (stats.totalUsers || 0).toLocaleString()} subtitle={`${stats.monthUsers || 0} new this month`} icon={Users} color="#00D4AA" loading={loading} />
        <StatCard title="Active Products" value={loading ? '—' : (stats.totalProducts || 0).toLocaleString()} subtitle={`${stats.lowStockProducts || 0} low in stock`} icon={Package} color="#FFB800" loading={loading} />
      </div>

      {/* Quick Status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: '#FFB300', href: '/admin/orders?status=pending' },
          { label: 'Delivered Orders', value: stats.deliveredOrders, icon: CheckCircle, color: '#00C853', href: '/admin/orders?status=delivered' },
          { label: 'Low Stock', value: stats.lowStockProducts, icon: AlertTriangle, color: '#FF6B35', href: '/admin/products?status=low_stock' },
        ].map(item => (
          <Link key={item.label} to={item.href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#fff', borderRadius: 12, padding: '16px 20px',
              border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14,
              transition: 'var(--transition)',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = item.color; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = '' }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <item.icon size={18} style={{ color: item.color }} />
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>{loading ? '—' : item.value || 0}</p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, marginBottom: 24 }}>
        {/* Revenue Chart */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>Revenue Overview</h3>
            <div style={{ display: 'flex', gap: 4, background: 'var(--surface-2)', borderRadius: 8, padding: 3 }}>
              {['7d', '30d', '90d'].map(p => (
                <button key={p} onClick={() => setSalesPeriod(p)}
                  style={{
                    padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                    border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)',
                    background: salesPeriod === p ? '#fff' : 'transparent',
                    color: salesPeriod === p ? 'var(--primary)' : 'var(--text-muted)',
                    boxShadow: salesPeriod === p ? 'var(--shadow-sm)' : 'none',
                  }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={salesData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0066FF" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0066FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#9A9A9A' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9A9A9A' }} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip
                formatter={(v) => [formatPrice(v), 'Revenue']}
                contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 13 }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#0066FF" strokeWidth={2.5} fill="url(#revenueGrad)" dot={false} activeDot={{ r: 5, fill: '#0066FF' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by Status Pie */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Orders by Status</h3>
          {data?.ordersByStatus?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={data.ordersByStatus} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                    {data.ordersByStatus.map((entry, i) => (
                      <Cell key={i} fill={ORDER_STATUS_COLORS[entry._id] || COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n.replace(/_/g, ' ')]} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {data.ordersByStatus.slice(0, 5).map((s, i) => (
                  <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: ORDER_STATUS_COLORS[s._id] || COLORS[i] }} />
                      <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{s._id.replace(/_/g, ' ')}</span>
                    </div>
                    <span style={{ fontWeight: 600 }}>{s.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>No order data yet</div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent Orders */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>Recent Orders</h3>
            <Link to="/admin/orders" style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div style={{ padding: 24 }}>
                {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 40, marginBottom: 8, borderRadius: 8 }} />)}
              </div>
            ) : data?.recentOrders?.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map(order => (
                    <tr key={order._id}>
                      <td>
                        <Link to={`/admin/orders`} style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
                          #{order.orderNumber}
                        </Link>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(order.createdAt)}</p>
                      </td>
                      <td style={{ fontSize: 13 }}>{order.user?.name || 'Unknown'}</td>
                      <td style={{ fontWeight: 600, fontSize: 13 }}>{formatPrice(order.pricing?.total || 0)}</td>
                      <td>
                        <span style={{
                          padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                          background: `${ORDER_STATUS_COLORS[order.status]}18`,
                          color: ORDER_STATUS_COLORS[order.status] || 'var(--text-muted)',
                          textTransform: 'capitalize',
                        }}>
                          {order.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ padding: 24, color: 'var(--text-muted)', textAlign: 'center', fontSize: 14 }}>No orders yet</p>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>Top Selling Products</h3>
            <Link to="/admin/products" style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {loading ? [...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 52, borderRadius: 10 }} />) :
              data?.topProducts?.map((p, i) => (
                <div key={p._id} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '10px 12px',
                  borderRadius: 10, background: 'var(--surface-2)',
                }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: 6, background: i === 0 ? '#FFB800' : i === 1 ? '#9E9E9E' : i === 2 ? '#CD7F32' : 'var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, color: i < 3 ? '#fff' : 'var(--text-muted)', flexShrink: 0,
                  }}>
                    {i + 1}
                  </span>
                  <div style={{ width: 36, height: 28, background: '#fff', borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
                    {p.images?.[0]?.url ? (
                      <img src={p.images[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 2 }} />
                    ) : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 14 }}>💻</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.brand}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700 }}>{formatPrice(p.price?.discounted || p.price?.original || 0)}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.salesCount} sold</p>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Revenue by Brand */}
      {data?.revenueByBrand?.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid var(--border)', marginTop: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Revenue by Brand</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.revenueByBrand} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
              <XAxis dataKey="_id" tick={{ fontSize: 12, fill: '#9A9A9A' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9A9A9A' }} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={v => [formatPrice(v), 'Revenue']} contentStyle={{ borderRadius: 10, fontSize: 13 }} />
              <Bar dataKey="revenue" fill="#0066FF" radius={[6, 6, 0, 0]}>
                {data.revenueByBrand.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <style>{`
        @media (max-width: 1100px) {
          div[style*="grid-template-columns: 1fr 380px"] { grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
