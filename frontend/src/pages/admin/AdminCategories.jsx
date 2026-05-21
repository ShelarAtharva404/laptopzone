import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name:'', description:'', sortOrder:0 })

  const fetchCats = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/categories')
      setCategories(data.data || [])
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load categories')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCats() }, [])

  const save = async () => {
    try {
      if (modal === 'add') await api.post('/categories', form)
      else await api.put(`/categories/${modal}`, form)
      toast.success('Saved!'); setModal(null); fetchCats()
    } catch (e) { toast.error(e.response?.data?.message || 'Failed') }
  }

  const del = async (id) => {
    if (!confirm('Delete this category?')) return
    try { await api.delete(`/categories/${id}`); toast.success('Deleted'); fetchCats() }
    catch { toast.error('Failed') }
  }

  const openEdit = (cat) => { setForm({ name:cat.name, description:cat.description||'', sortOrder:cat.sortOrder||0 }); setModal(cat._id) }
  const openAdd = () => { setForm({ name:'', description:'', sortOrder:0 }); setModal('add') }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700 }}>Categories</h2>
        <button onClick={openAdd} className="btn btn-primary"><Plus size={16}/> Add Category</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:16 }}>
        {loading ? [...Array(6)].map((_,i) => <div key={i} className="skeleton" style={{height:100,borderRadius:14}}/>) :
          categories.map(cat => (
            <div key={cat._id} style={{ background:'#fff', borderRadius:14, border:'1px solid var(--border)', padding:20 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <p style={{ fontWeight:700, fontSize:15 }}>{cat.name}</p>
                  <p style={{ fontSize:13, color:'var(--text-muted)', marginTop:4 }}>{cat.description}</p>
                  <p style={{ fontSize:12, color:'var(--text-secondary)', marginTop:8 }}>Order: {cat.sortOrder}</p>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={() => openEdit(cat)} style={{ width:30, height:30, borderRadius:8, border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', background:'none', color:'var(--text-secondary)' }}><Edit size={14}/></button>
                  <button onClick={() => del(cat._id)} style={{ width:30, height:30, borderRadius:8, border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', background:'none', color:'var(--error)' }}><Trash2 size={14}/></button>
                </div>
              </div>
            </div>
          ))
        }
      </div>
      {modal && (
        <>
          <div className="overlay" onClick={() => setModal(null)} />
          <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'#fff', borderRadius:16, padding:32, zIndex:300, width:'90%', maxWidth:420, boxShadow:'var(--shadow-xl)' }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:18, marginBottom:20 }}>{modal==='add'?'Add Category':'Edit Category'}</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} /></div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" rows={3} value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))} style={{resize:'vertical'}}/></div>
              <div className="form-group"><label className="form-label">Sort Order</label><input type="number" className="form-input" value={form.sortOrder} onChange={e => setForm(p=>({...p,sortOrder:Number(e.target.value)}))} /></div>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:20 }}>
              <button onClick={() => setModal(null)} className="btn btn-secondary" style={{flex:1}}>Cancel</button>
              <button onClick={save} className="btn btn-primary" style={{flex:1}}>Save</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
