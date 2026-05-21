import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, Search, Filter, Eye, EyeOff, Package } from 'lucide-react'
import api, { formatPrice } from '../../utils/api'
import toast from 'react-hot-toast'

export default function AdminProducts() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({})
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 15 })
      if (search) params.set('search', search)
      const { data } = await api.get(`/products/admin/all?${params}`)
      setProducts(data.data)
      setPagination(data.pagination)
    } catch (e) { toast.error('Failed to load products') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchProducts() }, [page, search])

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`)
      toast.success('Product deactivated')
      setDeleteConfirm(null)
      fetchProducts()
    } catch (e) { toast.error('Failed to delete') }
  }

  const handleToggle = async (id, isActive) => {
    try {
      await api.put(`/products/${id}`, { isActive: !isActive })
      toast.success(isActive ? 'Product hidden' : 'Product visible')
      fetchProducts()
    } catch (e) { toast.error('Failed to update') }
  }

  const STOCK_BADGE = {
    in_stock: { bg: '#E8FFF1', color: '#00A843', label: 'In Stock' },
    low_stock: { bg: '#FFF8E8', color: '#E6A000', label: 'Low Stock' },
    out_of_stock: { bg: '#FFF0F0', color: 'var(--error)', label: 'Out of Stock' },
    pre_order: { bg: '#F0E8FF', color: '#7B2EFF', label: 'Pre-order' },
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>Products</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{pagination.total || 0} total products</p>
        </div>
        <Link to="/admin/products/new" className="btn btn-primary" style={{ gap: 8 }}>
          <Plus size={18} /> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', borderRadius: 14, padding: '16px 20px', border: '1px solid var(--border)', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="form-input"
              style={{ paddingLeft: 38, fontSize: 14 }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Brand</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Sales</th>
                <th>Rating</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(8)].map((_, j) => (
                      <td key={j}><div className="skeleton" style={{ height: 16, borderRadius: 4 }} /></td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                    <Package size={40} style={{ marginBottom: 10, opacity: 0.3 }} />
                    <p>No products found</p>
                  </td>
                </tr>
              ) : (
                products.map(p => {
                  const stockInfo = STOCK_BADGE[p.stock?.status] || STOCK_BADGE.in_stock
                  return (
                    <tr key={p._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 48, height: 36, background: 'var(--surface-2)', borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                            {p.images?.[0]?.url ? (
                              <img src={p.images[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
                            ) : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 16 }}>💻</span>}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{p.name}</p>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.sku || 'No SKU'}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{p.brand}</span>
                      </td>
                      <td>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 13 }}>{formatPrice(p.price?.discounted || p.price?.original || 0)}</p>
                          {p.discount?.percentage > 0 && (
                            <p style={{ fontSize: 11, color: 'var(--success)' }}>-{p.discount.percentage}%</p>
                          )}
                        </div>
                      </td>
                      <td>
                        <div>
                          <span style={{
                            padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                            background: stockInfo.bg, color: stockInfo.color,
                          }}>
                            {stockInfo.label}
                          </span>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{p.stock?.quantity || 0} units</p>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, fontWeight: 600 }}>{p.salesCount || 0}</td>
                      <td>
                        {p.ratings?.average > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ fontSize: 14 }}>⭐</span>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{p.ratings.average}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({p.ratings.count})</span>
                          </div>
                        ) : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No reviews</span>}
                      </td>
                      <td>
                        <span style={{
                          padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                          background: p.isActive ? '#E8FFF1' : '#F5F5F5',
                          color: p.isActive ? '#00A843' : 'var(--text-muted)',
                        }}>
                          {p.isActive ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                          <button
                            onClick={() => handleToggle(p._id, p.isActive)}
                            title={p.isActive ? 'Hide product' : 'Show product'}
                            style={{
                              width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', background: 'none', color: 'var(--text-secondary)',
                              transition: 'var(--transition)',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                          >
                            {p.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <Link to={`/admin/products/${p._id}/edit`}
                            style={{
                              width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', color: 'var(--text-secondary)', textDecoration: 'none',
                              transition: 'var(--transition)',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                          >
                            <Edit size={14} />
                          </Link>
                          <button
                            onClick={() => setDeleteConfirm(p._id)}
                            style={{
                              width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', background: 'none', color: 'var(--text-secondary)',
                              transition: 'var(--transition)',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--error)'; e.currentTarget.style.color = 'var(--error)' }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, pagination.total)} of {pagination.total}
            </p>
            <div className="pagination" style={{ marginTop: 0 }}>
              <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1} style={{ opacity: page === 1 ? 0.4 : 1 }}>‹</button>
              {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
                const p = i + 1
                return <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              })}
              <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === pagination.pages} style={{ opacity: page === pagination.pages ? 0.4 : 1 }}>›</button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <>
          <div className="overlay" onClick={() => setDeleteConfirm(null)} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: '#fff', borderRadius: 16, padding: 32, zIndex: 300,
            width: '90%', maxWidth: 400, boxShadow: 'var(--shadow-xl)',
          }}>
            <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 16 }}>🗑️</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, textAlign: 'center', marginBottom: 8 }}>Deactivate Product?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
              This product will be hidden from the store. You can reactivate it later.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteConfirm(null)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="btn" style={{ flex: 1, background: 'var(--error)', color: '#fff' }}>Deactivate</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
