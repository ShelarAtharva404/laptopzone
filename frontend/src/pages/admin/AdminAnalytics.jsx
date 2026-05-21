import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import api, { formatPrice } from '../../utils/api'

export default function AdminAnalytics() {
  const [data, setData] = useState([])
  const [period, setPeriod] = useState('30d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get(`/admin/sales?period=${period}`).then(r => { setData(r.data.data); setLoading(false) }).catch(() => setLoading(false))
  }, [period])

  const totalRevenue = data.reduce((s, d) => s + (d.revenue || 0), 0)
  const totalOrders = data.reduce((s, d) => s + (d.orders || 0), 0)
  const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700 }}>Sales Analytics</h2>
        <div style={{ display:'flex', gap:4, background:'#fff', borderRadius:10, padding:4, border:'1px solid var(--border)' }}>
          {['7d','30d','90d','365d'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              style={{ padding:'6px 14px', borderRadius:7, fontSize:13, fontWeight:600, border:'none', cursor:'pointer', fontFamily:'var(--font-body)', background:period===p?'var(--primary)':'transparent', color:period===p?'#fff':'var(--text-secondary)' }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16, marginBottom:24 }}>
        {[
          { label:'Total Revenue', value: formatPrice(totalRevenue) },
          { label:'Total Orders', value: totalOrders.toLocaleString() },
          { label:'Avg Order Value', value: formatPrice(avgOrder) },
        ].map(s => (
          <div key={s.label} style={{ background:'#fff', borderRadius:14, padding:24, border:'1px solid var(--border)' }}>
            <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:6 }}>{s.label}</p>
            <p style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:800 }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ background:'#fff', borderRadius:14, padding:24, border:'1px solid var(--border)', marginBottom:20 }}>
        <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:16, marginBottom:20 }}>Revenue Trend</h3>
        {loading ? <div className="skeleton" style={{height:240,borderRadius:10}}/> : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data} margin={{top:5,right:10,bottom:5,left:10}}>
              <defs><linearGradient id="grad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0066FF" stopOpacity={0.15}/><stop offset="95%" stopColor="#0066FF" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0"/>
              <XAxis dataKey="_id" tick={{fontSize:11,fill:'#9A9A9A'}} tickLine={false}/>
              <YAxis tick={{fontSize:11,fill:'#9A9A9A'}} tickLine={false} tickFormatter={v=>`₹${(v/1000).toFixed(0)}K`}/>
              <Tooltip formatter={v=>[formatPrice(v),'Revenue']} contentStyle={{borderRadius:10,border:'1px solid var(--border)',fontSize:13}}/>
              <Area type="monotone" dataKey="revenue" stroke="#0066FF" strokeWidth={2.5} fill="url(#grad)" dot={false} activeDot={{r:5}}/>
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div style={{ background:'#fff', borderRadius:14, padding:24, border:'1px solid var(--border)' }}>
        <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:16, marginBottom:20 }}>Daily Orders</h3>
        {loading ? <div className="skeleton" style={{height:200,borderRadius:10}}/> : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{top:5,right:10,bottom:5,left:10}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false}/>
              <XAxis dataKey="_id" tick={{fontSize:11,fill:'#9A9A9A'}} tickLine={false}/>
              <YAxis tick={{fontSize:11,fill:'#9A9A9A'}} tickLine={false}/>
              <Tooltip contentStyle={{borderRadius:10,border:'1px solid var(--border)',fontSize:13}}/>
              <Bar dataKey="orders" fill="#0066FF" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
