import { useState, useEffect } from 'react'
import { Users, Search } from 'lucide-react'
import api, { formatDate, formatPrice } from '../../utils/api'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [search, setSearch] = useState('')

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/users?page=${page}&limit=20`)
      setUsers(data.data); setPagination(data.pagination)
    } catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [page])

  const toggleStatus = async (id, isActive) => {
    try {
      await api.patch(`/users/${id}/status`, { isActive: !isActive })
      toast.success(isActive ? 'User deactivated' : 'User activated')
      fetchUsers()
    } catch { toast.error('Failed') }
  }

  const filtered = search ? users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.includes(search.toLowerCase())) : users

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700 }}>Customers</h2>
        <p style={{ fontSize:13, color:'var(--text-muted)', marginTop:2 }}>{pagination.total || 0} registered users</p>
      </div>
      <div style={{ background:'#fff', borderRadius:14, padding:'14px 20px', border:'1px solid var(--border)', marginBottom:16 }}>
        <div style={{ position:'relative', maxWidth:300 }}>
          <Search size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
          <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="form-input" style={{ paddingLeft:38, fontSize:14 }} />
        </div>
      </div>
      <div style={{ background:'#fff', borderRadius:14, border:'1px solid var(--border)', overflow:'hidden' }}>
        <div className="table-responsive">
          <table>
            <thead>
              <tr><th>User</th><th>Phone</th><th>Orders</th><th>Total Spent</th><th>Joined</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {loading ? [...Array(10)].map((_,i) => (
                <tr key={i}>{[...Array(7)].map((_,j) => <td key={j}><div className="skeleton" style={{height:14,borderRadius:4}}/></td>)}</tr>
              )) : filtered.map(user => (
                <tr key={user._id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:34, height:34, borderRadius:'50%', background:'var(--primary)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14, flexShrink:0 }}>
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight:600, fontSize:13 }}>{user.name}</p>
                        <p style={{ fontSize:11, color:'var(--text-muted)' }}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize:13 }}>{user.phone || '—'}</td>
                  <td style={{ fontWeight:600, fontSize:13 }}>{user.totalOrders || 0}</td>
                  <td style={{ fontWeight:600, fontSize:13 }}>{formatPrice(user.totalSpent || 0)}</td>
                  <td style={{ fontSize:12, color:'var(--text-muted)' }}>{formatDate(user.createdAt)}</td>
                  <td>
                    <span style={{ padding:'3px 10px', borderRadius:6, fontSize:11, fontWeight:700, background:user.isActive?'#E8FFF1':'#FFF0F0', color:user.isActive?'#00A843':'var(--error)' }}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => toggleStatus(user._id, user.isActive)}
                      style={{ fontSize:12, color:user.isActive?'var(--error)':'var(--success)', background:'none', border:'1px solid currentColor', borderRadius:6, padding:'4px 10px', cursor:'pointer', fontFamily:'var(--font-body)', fontWeight:600 }}>
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
