import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronRight, Zap, Shield, Truck, Star, TrendingUp, Cpu, Monitor, Battery, HardDrive } from 'lucide-react'
import api, { formatPrice } from '../../utils/api'
import ProductCard from '../../components/user/ProductCard'

const BRANDS = [
  { name: 'Apple', color: '#555', logo: '🍎' },
  { name: 'Dell', color: '#007DB8', logo: '💻' },
  { name: 'HP', color: '#0096D6', logo: '🖥️' },
  { name: 'Lenovo', color: '#E2231A', logo: '💼' },
  { name: 'ASUS', color: '#00539C', logo: '⚡' },
  { name: 'Acer', color: '#83B81A', logo: '🎯' },
  { name: 'MSI', color: '#CC0000', logo: '🎮' },
  { name: 'Microsoft', color: '#F25022', logo: '🪟' },
  { name: 'Samsung', color: '#1428A0', logo: '📱' },
  { name: 'Razer', color: '#00FF00', logo: '🐍' },
]

const CATEGORIES = [
  { name: 'Gaming', slug: 'Gaming Laptops', icon: '🎮', desc: 'High-performance rigs', color: '#FF4D4D' },
  { name: 'Business', slug: 'Business Laptops', icon: '💼', desc: 'Professional productivity', color: '#0066FF' },
  { name: 'Ultrabooks', slug: 'Ultrabooks', icon: '✨', desc: 'Thin & powerful', color: '#9B59B6' },
  { name: 'MacBooks', slug: 'MacBooks', icon: '🍎', desc: 'Apple ecosystem', color: '#555' },
  { name: 'Workstations', slug: 'Workstations', icon: '🖥️', desc: 'Creative powerhouses', color: '#FF6B35' },
  { name: 'Budget', slug: 'Budget Laptops', icon: '💰', desc: 'Best value deals', color: '#00C853' },
  { name: '2-in-1', slug: '2-in-1 Laptops', icon: '🔄', desc: 'Laptop meets tablet', color: '#00BCD4' },
  { name: 'Chromebooks', slug: 'Chromebooks', icon: '🌐', desc: 'Cloud-first computing', color: '#FBBC04' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [featured, setFeatured] = useState([])
  const [bestSellers, setBestSellers] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('featured')

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [featuredRes, bestSellersRes, newArrivalsRes] = await Promise.all([
          api.get('/products/featured'),
          api.get('/products/bestsellers'),
          api.get('/products/new-arrivals'),
        ])
        setFeatured(featuredRes.data.data)
        setBestSellers(bestSellersRes.data.data)
        setNewArrivals(newArrivalsRes.data.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const activeProducts = { featured, bestSellers, newArrivals }[activeTab] || []

  return (
    <div className="page-enter">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #0A0A1A 0%, #0D1B3E 50%, #0A0A1A 100%)',
        padding: '80px 0 120px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute', top: '-20%', right: '-10%',
          width: '60vw', height: '60vw', maxWidth: 800,
          background: 'radial-gradient(circle, rgba(0,102,255,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-30%', left: '-5%',
          width: '40vw', height: '40vw', maxWidth: 600,
          background: 'radial-gradient(circle, rgba(255,107,53,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            {/* Left */}
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(0,102,255,0.15)', border: '1px solid rgba(0,102,255,0.3)',
                borderRadius: 'var(--radius-full)', padding: '8px 16px',
                marginBottom: 24, color: '#7BAAFF', fontSize: 13, fontWeight: 600,
              }}>
                <Zap size={14} /> India's #1 Laptop Store
              </div>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(36px, 5vw, 64px)',
                fontWeight: 800,
                color: '#fff',
                lineHeight: 1.1,
                marginBottom: 20,
              }}>
                Find Your<br />
                <span style={{ color: 'var(--primary)' }}>Perfect</span> Laptop
              </h1>
              <p style={{ color: '#8899BB', fontSize: 17, lineHeight: 1.7, marginBottom: 36, maxWidth: 440 }}>
                Explore 500+ laptops from 15+ top brands. Gaming, business, ultrabooks — we have it all with the best prices guaranteed.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/products')}
                  style={{ fontSize: 16, padding: '14px 28px' }}
                >
                  Shop Now <ArrowRight size={18} />
                </button>
                <button
                  className="btn"
                  onClick={() => navigate('/products?sort=discount')}
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.15)', fontSize: 16, padding: '14px 28px' }}
                >
                  View Deals
                </button>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: 32, marginTop: 48, flexWrap: 'wrap' }}>
                {[
                  { value: '500+', label: 'Laptops' },
                  { value: '15+', label: 'Brands' },
                  { value: '50K+', label: 'Happy Customers' },
                  { value: '4.8★', label: 'Rating' },
                ].map(s => (
                  <div key={s.label}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: '#fff' }}>{s.value}</p>
                    <p style={{ fontSize: 13, color: '#6677AA' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Featured laptop visual */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 'var(--radius-2xl)',
                padding: '32px',
                width: '100%',
                maxWidth: 440,
              }}>
                {/* Floating specs cards */}
                <div style={{ position: 'relative', paddingBottom: 20 }}>
                  <div style={{
                    background: 'rgba(0,102,255,0.9)', borderRadius: 12, padding: '12px 16px',
                    position: 'absolute', top: -10, right: 0, backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 24px rgba(0,102,255,0.4)',
                  }}>
                    <p style={{ color: '#fff', fontSize: 11, opacity: 0.7 }}>Processor</p>
                    <p style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>Intel Core i9</p>
                  </div>

                  {/* Laptop SVG illustration */}
                  <svg viewBox="0 0 400 250" style={{ width: '100%', display: 'block' }}>
                    <rect x="40" y="20" width="320" height="200" rx="12" fill="#1A1A2E" stroke="#333" strokeWidth="2"/>
                    <rect x="52" y="32" width="296" height="176" rx="6" fill="#0D1117"/>
                    <rect x="60" y="40" width="280" height="160" rx="4" fill="#0066FF" fillOpacity="0.1"/>
                    <text x="200" y="125" textAnchor="middle" fill="#0066FF" fontSize="24" fontWeight="bold" fontFamily="sans-serif">LaptopZone</text>
                    <text x="200" y="150" textAnchor="middle" fill="#8899BB" fontSize="12" fontFamily="sans-serif">Premium Selection</text>
                    <rect x="0" y="220" width="400" height="20" rx="4" fill="#1A1A2E"/>
                    <rect x="130" y="220" width="140" height="8" rx="4" fill="#333"/>
                  </svg>

                  <div style={{
                    background: 'rgba(255,107,53,0.9)', borderRadius: 12, padding: '12px 16px',
                    position: 'absolute', bottom: 10, left: 0, backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 24px rgba(255,107,53,0.4)',
                  }}>
                    <p style={{ color: '#fff', fontSize: 11, opacity: 0.7 }}>Starting from</p>
                    <p style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>₹25,990</p>
                  </div>
                </div>

                {/* Quick specs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                  {[
                    { icon: <Cpu size={14}/>, label: 'Latest Gen CPUs' },
                    { icon: <Monitor size={14}/>, label: 'Up to 4K OLED' },
                    { icon: <Battery size={14}/>, label: 'Up to 24hr Battery' },
                    { icon: <HardDrive size={14}/>, label: 'NVMe SSDs' },
                  ].map(s => (
                    <div key={s.label} style={{
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <span style={{ color: 'var(--primary)' }}>{s.icon}</span>
                      <span style={{ color: '#8899BB', fontSize: 12, fontWeight: 500 }}>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave bottom */}
        <div style={{ position: 'absolute', bottom: -2, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 60 }}>
            <path d="M0,40 C360,0 1080,80 1440,40 L1440,60 L0,60 Z" fill="#FAFAFA"/>
          </svg>
        </div>
      </section>

      {/* ── Brand Strip ──────────────────────────────────────── */}
      <section style={{ padding: '40px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 24 }}>
            Shop Top Brands
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px' }}>
            {BRANDS.map(brand => (
              <Link
                key={brand.name}
                to={`/products?brand=${brand.name}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 'var(--radius-full)',
                  border: '1.5px solid var(--border)', background: 'var(--surface)',
                  fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)',
                  transition: 'var(--transition)', textDecoration: 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-light)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--surface)'; }}
              >
                <span>{brand.logo}</span> {brand.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
            <div>
              <h2 className="section-title">Shop by Category</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Find the perfect laptop for your needs</p>
            </div>
            <Link to="/products" style={{ color: 'var(--primary)', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
              View All <ChevronRight size={16} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            {CATEGORIES.map(cat => (
              <Link
                key={cat.name}
                to={`/products?subcategory=${encodeURIComponent(cat.slug)}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)', padding: '20px 16px',
                  textAlign: 'center', transition: 'var(--transition)', cursor: 'pointer',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = cat.color; e.currentTarget.style.boxShadow = `0 8px 24px ${cat.color}22`; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = ''; }}
                >
                  <div style={{
                    fontSize: 32, marginBottom: 10,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                  }}>{cat.icon}</div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>{cat.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured / Best Sellers / New Arrivals ───────────── */}
      <section className="section" style={{ background: 'var(--surface-2)', padding: '80px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Our Laptops</h2>
            <div style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', padding: 4, gap: 2 }}>
              {[
                { key: 'featured', label: '⭐ Featured' },
                { key: 'bestSellers', label: '🔥 Best Sellers' },
                { key: 'newArrivals', label: '✨ New Arrivals' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: '8px 16px', borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', border: 'none', transition: 'var(--transition)', fontFamily: 'var(--font-body)',
                    background: activeTab === tab.key ? 'var(--primary)' : 'transparent',
                    color: activeTab === tab.key ? '#fff' : 'var(--text-secondary)',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="products-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                  <div className="skeleton" style={{ height: 200 }} />
                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div className="skeleton" style={{ height: 12, width: '60%' }} />
                    <div className="skeleton" style={{ height: 16, width: '90%' }} />
                    <div className="skeleton" style={{ height: 16, width: '70%' }} />
                    <div className="skeleton" style={{ height: 20, width: '40%' }} />
                    <div className="skeleton" style={{ height: 38 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : activeProducts.length > 0 ? (
            <div className="products-grid">
              {activeProducts.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <p style={{ fontSize: 16, color: 'var(--text-muted)' }}>No products available yet. Check back soon!</p>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/products" className="btn btn-primary" style={{ fontSize: 15, padding: '14px 32px' }}>
              View All Laptops <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 className="section-title">Why Choose LaptopZone?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
              We're committed to giving you the best laptop buying experience in India.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {[
              { icon: '🛡️', title: 'Genuine Products', desc: 'All laptops are 100% authentic with valid manufacturer warranty.', color: '#0066FF' },
              { icon: '💰', title: 'Best Price Guarantee', desc: 'Found it cheaper? We\'ll match or beat any verified Indian retailer.', color: '#00C853' },
              { icon: '🚀', title: 'Fast Delivery', desc: 'Same-day dispatch for orders placed before 2PM. Delivery in 2-5 days.', color: '#FF6B35' },
              { icon: '🔧', title: 'Expert Support', desc: '14-day easy returns. Our tech experts are available 24/7 for help.', color: '#9B59B6' },
            ].map(item => (
              <div key={item.title} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)', padding: 32,
              }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{item.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, fontFamily: 'var(--font-display)' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────── */}
      <section style={{ padding: '0 0 80px' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, #0066FF, #0033AA)',
            borderRadius: 'var(--radius-2xl)',
            padding: '60px 48px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 24,
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', right: -60, top: -60,
              width: 300, height: 300,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '50%',
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 4vw, 36px)', color: '#fff', marginBottom: 10, fontWeight: 800 }}>
                Student? Get Extra 5% Off!
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16 }}>
                Use code <strong style={{ color: '#fff' }}>STUDENT5</strong> at checkout. Valid on all laptops.
              </p>
            </div>
            <Link
              to="/products"
              style={{
                background: '#fff', color: 'var(--primary)',
                padding: '14px 28px', borderRadius: 'var(--radius-full)',
                fontWeight: 700, fontSize: 15, textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: 8,
                whiteSpace: 'nowrap', position: 'relative', zIndex: 1,
              }}
            >
              Shop Now <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
