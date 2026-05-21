import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X, ChevronDown, ChevronUp, Grid, List } from 'lucide-react'
import api, { formatPrice } from '../../utils/api'
import ProductCard from '../../components/user/ProductCard'

const BRANDS = ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'MSI', 'Samsung', 'Microsoft', 'Razer', 'LG']
const RAM_OPTIONS = [4, 8, 16, 32, 64]
const STORAGE_OPTIONS = [128, 256, 512, 1024, 2048]
const GPU_BRANDS = ['NVIDIA', 'AMD', 'Intel', 'Apple']
const DISPLAY_SIZES = [13, 14, 15, 16, 17]

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({})
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState({ brand: true, price: true, ram: true })

  // Filter state
  const [filters, setFilters] = useState({
    brand: searchParams.get('brand')?.split(',').filter(Boolean) || [],
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    ram: searchParams.get('ram')?.split(',').filter(Boolean).map(Number) || [],
    storage: searchParams.get('storage')?.split(',').filter(Boolean).map(Number) || [],
    gpu: searchParams.get('gpu')?.split(',').filter(Boolean) || [],
    displaySize: searchParams.get('displaySize')?.split(',').filter(Boolean).map(Number) || [],
    inStock: searchParams.get('inStock') === 'true',
    sort: searchParams.get('sort') || 'newest',
    subcategory: searchParams.get('subcategory') || '',
    page: parseInt(searchParams.get('page')) || 1,
  })

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.brand.length) params.set('brand', filters.brand.join(','))
      if (filters.minPrice) params.set('minPrice', filters.minPrice)
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
      if (filters.ram.length) params.set('ram', filters.ram.join(','))
      if (filters.storage.length) params.set('storage', filters.storage.join(','))
      if (filters.gpu.length) params.set('gpu', filters.gpu.join(','))
      if (filters.displaySize.length) params.set('displaySize', filters.displaySize.join(','))
      if (filters.inStock) params.set('inStock', 'true')
      if (filters.sort) params.set('sort', filters.sort)
      if (filters.subcategory) params.set('subcategory', filters.subcategory)
      params.set('page', filters.page)
      params.set('limit', 12)

      const { data } = await api.get(`/products?${params}`)
      setProducts(data.data)
      setPagination(data.pagination)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchProducts() }, [filters])

  useEffect(() => {
    setFilters({
      brand: searchParams.get('brand')?.split(',').filter(Boolean) || [],
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      ram: searchParams.get('ram')?.split(',').filter(Boolean).map(Number) || [],
      storage: searchParams.get('storage')?.split(',').filter(Boolean).map(Number) || [],
      gpu: searchParams.get('gpu')?.split(',').filter(Boolean) || [],
      displaySize: searchParams.get('displaySize')?.split(',').filter(Boolean).map(Number) || [],
      inStock: searchParams.get('inStock') === 'true',
      sort: searchParams.get('sort') || 'newest',
      subcategory: searchParams.get('subcategory') || '',
      page: parseInt(searchParams.get('page')) || 1,
    })
  }, [searchParams])

  const toggleFilter = (type, value) => {
    setFilters(prev => {
      const arr = prev[type]
      const newArr = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
      return { ...prev, [type]: newArr, page: 1 }
    })
  }

  const clearFilters = () => {
    setFilters({ brand: [], minPrice: '', maxPrice: '', ram: [], storage: [], gpu: [], displaySize: [], inStock: false, sort: 'newest', subcategory: '', page: 1 })
  }

  const activeFilterCount = filters.brand.length + filters.ram.length + filters.storage.length + filters.gpu.length + filters.displaySize.length + (filters.minPrice ? 1 : 0) + (filters.maxPrice ? 1 : 0) + (filters.inStock ? 1 : 0)

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const FilterSection = ({ title, sectionKey, children }) => (
    <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 20, marginBottom: 20 }}>
      <button
        onClick={() => toggleSection(sectionKey)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'none', border: 'none', cursor: 'pointer', marginBottom: expandedSections[sectionKey] ? 14 : 0,
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)',
          padding: '4px 0',
        }}
      >
        {title}
        {expandedSections[sectionKey] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {expandedSections[sectionKey] && children}
    </div>
  )

  return (
    <div className="page-enter" style={{ paddingTop: 24, paddingBottom: 80 }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800 }}>
              {filters.subcategory || 'All Laptops'}
            </h1>
            {!loading && (
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
                {pagination.total || 0} products found
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {/* Sort */}
            <select
              value={filters.sort}
              onChange={(e) => setFilters(p => ({ ...p, sort: e.target.value, page: 1 }))}
              className="form-input"
              style={{ width: 'auto', padding: '10px 16px', cursor: 'pointer' }}
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Best Rated</option>
              <option value="discount">Biggest Discount</option>
            </select>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setFiltersOpen(true)}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span style={{
                  background: 'var(--primary)', color: '#fff', borderRadius: '50%',
                  width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Active filters chips */}
        {activeFilterCount > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {filters.brand.map(b => (
              <span key={b} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px',
                background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-full)',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }} onClick={() => toggleFilter('brand', b)}>
                {b} <X size={12} />
              </span>
            ))}
            {filters.ram.map(r => (
              <span key={r} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px',
                background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-full)',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }} onClick={() => toggleFilter('ram', r)}>
                {r}GB RAM <X size={12} />
              </span>
            ))}
            <button
              onClick={clearFilters}
              style={{
                padding: '4px 12px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)',
                fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer', background: 'none',
                fontFamily: 'var(--font-body)',
              }}
            >
              Clear all
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24 }}>
          {/* ── Sidebar Filters (desktop) ── */}
          <aside style={{ display: 'none' }} className="desktop-sidebar">
            <FilterSidebar
              filters={filters}
              setFilters={setFilters}
              toggleFilter={toggleFilter}
              clearFilters={clearFilters}
              expandedSections={expandedSections}
              toggleSection={toggleSection}
              activeFilterCount={activeFilterCount}
            />
          </aside>

          {/* ── Product Grid ── */}
          <div>
            {loading ? (
              <div className="products-grid">
                {[...Array(12)].map((_, i) => (
                  <div key={i} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <div className="skeleton" style={{ height: 200 }} />
                    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div className="skeleton" style={{ height: 12, width: '60%' }} />
                      <div className="skeleton" style={{ height: 16 }} />
                      <div className="skeleton" style={{ height: 20, width: '50%' }} />
                      <div className="skeleton" style={{ height: 36 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>😕</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 8 }}>No laptops found</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Try adjusting your filters or search terms</p>
                <button onClick={clearFilters} className="btn btn-primary">Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {products.map(p => <ProductCard key={p._id} product={p} />)}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="pagination">
                    <button
                      className="page-btn"
                      onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
                      disabled={filters.page === 1}
                      style={{ opacity: filters.page === 1 ? 0.4 : 1 }}
                    >
                      ‹
                    </button>
                    {[...Array(Math.min(pagination.pages, 7))].map((_, i) => {
                      const page = i + 1
                      return (
                        <button
                          key={page}
                          className={`page-btn ${filters.page === page ? 'active' : ''}`}
                          onClick={() => setFilters(p => ({ ...p, page }))}
                        >
                          {page}
                        </button>
                      )
                    })}
                    <button
                      className="page-btn"
                      onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
                      disabled={filters.page === pagination.pages}
                      style={{ opacity: filters.page === pagination.pages ? 0.4 : 1 }}
                    >
                      ›
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter overlay */}
      {filtersOpen && (
        <>
          <div className="overlay" onClick={() => setFiltersOpen(false)} />
          <div style={{
            position: 'fixed', right: 0, top: 0, bottom: 0, width: '85%', maxWidth: 360,
            background: 'var(--surface)', zIndex: 200, overflowY: 'auto',
            padding: 24, boxShadow: 'var(--shadow-xl)',
            animation: 'slideFromRight 0.3s ease',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>Filters</h3>
              <button onClick={() => setFiltersOpen(false)} style={{ color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }}>
                <X size={22} />
              </button>
            </div>
            <FilterSidebar
              filters={filters}
              setFilters={setFilters}
              toggleFilter={toggleFilter}
              clearFilters={clearFilters}
              expandedSections={expandedSections}
              toggleSection={toggleSection}
              activeFilterCount={activeFilterCount}
              onClose={() => setFiltersOpen(false)}
            />
          </div>
        </>
      )}

      <style>{`
        @media (min-width: 900px) {
          .desktop-sidebar { display: block !important; }
        }
        @keyframes slideFromRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}

function FilterSidebar({ filters, setFilters, toggleFilter, clearFilters, activeFilterCount, onClose }) {
  const CheckItem = ({ label, checked, onChange }) => (
    <label style={{
      display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
      padding: '4px 0', fontSize: 14, color: checked ? 'var(--primary)' : 'var(--text-secondary)',
      fontWeight: checked ? 600 : 400,
    }}>
      <input type="checkbox" checked={checked} onChange={onChange}
        style={{ accentColor: 'var(--primary)', width: 15, height: 15, cursor: 'pointer' }} />
      {label}
    </label>
  )

  return (
    <div>
      {activeFilterCount > 0 && (
        <button onClick={clearFilters} style={{
          width: '100%', padding: '10px', borderRadius: 'var(--radius-md)',
          border: '1.5px solid var(--border)', background: 'none', cursor: 'pointer',
          fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)',
          marginBottom: 20, fontFamily: 'var(--font-body)',
        }}>
          Clear All Filters ({activeFilterCount})
        </button>
      )}

      {/* Brand */}
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 20, marginBottom: 20 }}>
        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Brand</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'MSI', 'Samsung', 'Microsoft', 'Razer'].map(b => (
            <CheckItem key={b} label={b} checked={filters.brand.includes(b)} onChange={() => toggleFilter('brand', b)} />
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 20, marginBottom: 20 }}>
        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Price Range (₹)</h4>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => setFilters(p => ({ ...p, minPrice: e.target.value, page: 1 }))}
            className="form-input"
            style={{ fontSize: 13, padding: '8px 12px' }}
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => setFilters(p => ({ ...p, maxPrice: e.target.value, page: 1 }))}
            className="form-input"
            style={{ fontSize: 13, padding: '8px 12px' }}
          />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {[
            { label: 'Under ₹40K', min: '', max: 40000 },
            { label: '₹40K-70K', min: 40000, max: 70000 },
            { label: '₹70K-1L', min: 70000, max: 100000 },
            { label: 'Above ₹1L', min: 100000, max: '' },
          ].map(r => (
            <button
              key={r.label}
              onClick={() => setFilters(p => ({ ...p, minPrice: r.min, maxPrice: r.max, page: 1 }))}
              style={{
                padding: '4px 10px', borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border)', fontSize: 12, cursor: 'pointer',
                background: (filters.minPrice === r.min && filters.maxPrice === r.max) ? 'var(--primary-light)' : 'none',
                color: (filters.minPrice === r.min && filters.maxPrice === r.max) ? 'var(--primary)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-body)',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* RAM */}
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 20, marginBottom: 20 }}>
        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 12 }}>RAM</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {[4, 8, 16, 32, 64].map(r => (
            <button
              key={r}
              onClick={() => toggleFilter('ram', r)}
              style={{
                padding: '6px 14px', borderRadius: 'var(--radius-full)',
                border: `1.5px solid ${filters.ram.includes(r) ? 'var(--primary)' : 'var(--border)'}`,
                fontSize: 13, cursor: 'pointer', fontWeight: 500,
                background: filters.ram.includes(r) ? 'var(--primary-light)' : 'none',
                color: filters.ram.includes(r) ? 'var(--primary)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-body)',
              }}
            >
              {r}GB
            </button>
          ))}
        </div>
      </div>

      {/* GPU */}
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 20, marginBottom: 20 }}>
        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 12 }}>GPU Brand</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {['NVIDIA', 'AMD', 'Intel', 'Apple'].map(g => (
            <CheckItem key={g} label={g} checked={filters.gpu.includes(g)} onChange={() => toggleFilter('gpu', g)} />
          ))}
        </div>
      </div>

      {/* Display Size */}
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 20, marginBottom: 20 }}>
        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Display Size</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {[13, 14, 15, 16, 17].map(s => (
            <button
              key={s}
              onClick={() => toggleFilter('displaySize', s)}
              style={{
                padding: '6px 14px', borderRadius: 'var(--radius-full)',
                border: `1.5px solid ${filters.displaySize.includes(s) ? 'var(--primary)' : 'var(--border)'}`,
                fontSize: 13, cursor: 'pointer', fontWeight: 500,
                background: filters.displaySize.includes(s) ? 'var(--primary-light)' : 'none',
                color: filters.displaySize.includes(s) ? 'var(--primary)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-body)',
              }}
            >
              {s}"
            </button>
          ))}
        </div>
      </div>

      {/* In Stock */}
      <div>
        <CheckItem
          label="In Stock Only"
          checked={filters.inStock}
          onChange={() => setFilters(p => ({ ...p, inStock: !p.inStock, page: 1 }))}
        />
      </div>

      {onClose && (
        <button onClick={onClose} className="btn btn-primary" style={{ width: '100%', marginTop: 24 }}>
          Show Results
        </button>
      )}
    </div>
  )
}
