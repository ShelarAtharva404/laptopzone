import { useState, useEffect } from 'react'
import { Plus, Trash2, Ticket } from 'lucide-react'
import api, { formatDate } from '../../utils/api'
import toast from 'react-hot-toast'

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ code:'', type:'percentage', value:10, minOrderAmount:0, validUntil:'', usageLimit:'', isActive:true })

  const fetchCoupons = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/coupons')
      setCoupons(data.data || [])
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load coupons')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCoupons() }, [])

  const save = async () => {
    try {
      await api.post('/coupons', { ...form, value:Number(form.value), minOrderAmount:Number(form.minOrderAmount), usageLimit:form.usageLimit?Number(form.usageLimit):null })
      toast.success('Coupon created!'); setModal(false); fetchCoupons()
    } catch (e) { toast.error(e.response?.data?.message || 'Failed') }
  }

  const del = async (id) => {
    if (!confirm('Delete coupon?')) return
    try { await api.delete(`/coupons/${id}`); toast.success('Deleted'); fetchCoupons() } catch { toast.error('Failed') }
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700 }}>Coupons</h2>
        <button onClick={() => setModal(true)} className="btn btn-primary"><Plus size={16}/> Create Coupon</button>
      </div>
      <div style={{ background:'#fff', borderRadius:14, border:'1px solid var(--border)', overflow:'hidden' }}>
        <div className="table-responsive">
          <table>
            <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Min Order</th><th>Used</th><th>Valid Until</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {loading ? [...Array(5)].map((_,i) => <tr key={i}>{[...Array(8)].map((_,j) => <td key={j}><div className="skeleton" style={{height:14,borderRadius:4}}/></td>)}</tr>) :
                coupons.map(c => (
                  <tr key={c._id}>
                    <td><span style={{ fontFamily:'monospace', fontWeight:700, fontSize:13, background:'var(--surface-2)', padding:'3px 8px', borderRadius:6 }}>{c.code}</span></td>
                    <td style={{ fontSize:13, textTransform:'capitalize' }}>{c.type}</td>
                    <td style={{ fontWeight:600, fontSize:13 }}>{c.type==='percentage'?`${c.value}%`:`₹${c.value}`}</td>
                    <td style={{ fontSize:13 }}>₹{c.minOrderAmount?.toLocaleString('en-IN')}</td>
                    <td style={{ fontSize:13 }}>{c.usageCount}/{c.usageLimit||'∞'}</td>
                    <td style={{ fontSize:12, color:'var(--text-muted)' }}>{formatDate(c.validUntil)}</td>
                    <td><span style={{ padding:'3px 10px', borderRadius:6, fontSize:11, fontWeight:700, background:c.isActive&&new Date()<new Date(c.validUntil)?'#E8FFF1':'#FFF0F0', color:c.isActive&&new Date()<new Date(c.validUntil)?'#00A843':'var(--error)' }}>{c.isActive&&new Date()<new Date(c.validUntil)?'Active':'Expired'}</span></td>
                    <td><button onClick={() => del(c._id)} style={{ width:28, height:28, borderRadius:6, border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', background:'#FFF0F0', color:'var(--error)' }}><Trash2 size={13}/></button></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
      {modal && (
        <>
          <div className="overlay" onClick={() => setModal(false)} />
          <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'#fff', borderRadius:16, padding:32, zIndex:300, width:'90%', maxWidth:440, boxShadow:'var(--shadow-xl)', maxHeight:'90vh', overflowY:'auto' }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:18, marginBottom:20 }}>Create Coupon</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[['Code','code','text'],['Value','value','number'],['Min Order Amount (₹)','minOrderAmount','number'],['Usage Limit (blank = unlimited)','usageLimit','number']].map(([label,field,type]) => (
                <div key={field} className="form-group">
                  <label className="form-label">{label}</label>
                  <input type={type} className="form-input" value={form[field]} onChange={e => setForm(p=>({...p,[field]:e.target.value.toUpperCase ? e.target.value.toUpperCase() : e.target.value}))} style={{ fontFamily: field==='code'?'monospace':undefined, letterSpacing: field==='code'?2:undefined }} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-input" value={form.type} onChange={e => setForm(p=>({...p,type:e.target.value}))}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                  <option value="free_shipping">Free Shipping</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Valid Until</label>
                <input type="datetime-local" className="form-input" value={form.validUntil} onChange={e => setForm(p=>({...p,validUntil:e.target.value}))} />
              </div>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:20 }}>
              <button onClick={() => setModal(false)} className="btn btn-secondary" style={{flex:1}}>Cancel</button>
              <button onClick={save} className="btn btn-primary" style={{flex:1}}>Create</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
