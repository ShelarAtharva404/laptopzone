import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, ArrowRight, Laptop } from 'lucide-react'
import api from '../../utils/api'
import ProductCard from '../../components/user/ProductCard'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const searchProducts = async () => {
      setLoading(true)
      try {
        const { data } = await api.get(`/products?search=${encodeURIComponent(query)}`)
        setProducts(data.data)
      } catch (err) {
        console.error('Error searching products:', err)
      } finally {
        setLoading(false)
      }
    }
    if (query) {
      searchProducts()
    } else {
      setProducts([])
      setLoading(false)
    }
  }, [query])

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: 50, height: 50, border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Searching our laptop store...</p>
        </div>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    )
  }

  return (
    <div className="page-enter" style={{ padding: '32px 0 80px' }}>
      <div className="container">
        
        {/* Results Info */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Search size={26} color="var(--primary)" /> Search Results
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginTop: 4 }}>
            {products.length > 0 ? (
              <>Found <strong>{products.length}</strong> matching laptops for "<strong style={{ color: 'var(--text-primary)' }}>{query}</strong>"</>
            ) : (
              <>No exact matches found for "<strong style={{ color: 'var(--text-primary)' }}>{query}</strong>"</>
            )}
          </p>
        </div>

        {/* Empty State */}
        {products.length === 0 ? (
          <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)', padding: 40 }}>
            <div style={{ textAlign: 'center', maxWidth: 450 }}>
              <Laptop size={64} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, marginBottom: 8 }}>We Couldn't Find Anything</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
                Check the spelling or try searching for another term (e.g. "MacBook", "Gaming", "Lenovo", "i9", "RTX").
              </p>
              <Link to="/products" className="btn btn-primary" style={{ fontSize: 14, padding: '12px 24px' }}>
                Browse All Laptops <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ) : (
          /* Products Grid */
          <div className="products-grid">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

      </div>

      <style>{`
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }
        @media (max-width: 640px) {
          .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 16px;
          }
        }
      `}</style>
    </div>
  )
}
