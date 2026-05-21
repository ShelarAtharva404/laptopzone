import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Star, ShoppingCart, Heart, Share2, Shield, Truck, RefreshCw, ChevronRight, Minus, Plus } from 'lucide-react'
import api, { formatPrice } from '../../utils/api'
import { useCartStore, useWishlistStore } from '../../store/authStore'
import ProductCard from '../../components/user/ProductCard'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCartStore()
  const { toggleWishlist, isInWishlist } = useWishlistStore()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImg, setSelectedImg] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [activeTab, setActiveTab] = useState('specs')

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const [pRes] = await Promise.all([api.get(`/products/${slug}`)])
        setProduct(pRes.data.data)
        const rRes = await api.get(`/reviews/product/${pRes.data.data._id}`)
        setReviews(rRes.data.data)
      } catch (e) { navigate('/products') }
      finally { setLoading(false) }
    }
    fetch()
  }, [slug])

  if (loading) return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
          <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[200, 32, 48, 100, 56].map((h, i) => <div key={i} className="skeleton" style={{ height: h, borderRadius: 8 }} />)}
          </div>
        </div>
      </div>
    </div>
  )

  if (!product) return null
  const price = product.price?.discounted || product.price?.original || 0
  const inWishlist = isInWishlist(product._id)
  const outOfStock = product.stock?.status === 'out_of_stock'

  const handleAddToCart = async () => {
    setAddingToCart(true)
    await addToCart(product._id, quantity)
    setAddingToCart(false)
  }

  const specSections = [
    { title: 'Processor', data: product.specifications?.processor, fields: ['brand', 'model', 'cores', 'threads', 'baseSpeed', 'boostSpeed', 'cache', 'generation'] },
    { title: 'Memory (RAM)', data: product.specifications?.ram, fields: ['size', 'type', 'speed', 'slots', 'maxUpgradeable'] },
    { title: 'Display', data: product.specifications?.display, fields: ['size', 'resolution', 'type', 'refreshRate', 'brightness', 'colorGamut', 'touchscreen', 'hdr'] },
    { title: 'Graphics', data: product.specifications?.graphics, fields: ['type', 'brand', 'model', 'vram'] },
    { title: 'Storage', data: null, storage: product.specifications?.storage },
    { title: 'Battery', data: product.specifications?.battery, fields: ['capacity', 'life', 'fastCharging', 'chargerWatt'] },
    { title: 'Operating System', data: { os: product.specifications?.os }, fields: ['os'] },
    { title: 'Physical', data: product.specifications?.physical, fields: ['weight', 'thickness', 'material', 'color'] },
  ]

  return (
    <div className="page-enter" style={{ padding: '24px 0 80px' }}>
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, fontSize: 13, color: 'var(--text-muted)' }}>
          <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
          <ChevronRight size={14} />
          <Link to="/products" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Laptops</Link>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--text-primary)' }}>{product.brand}</span>
        </div>

        {/* Main Product Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginBottom: 60 }}>
          {/* Left - Images */}
          <div>
            <div style={{
              background: 'var(--surface-2)', borderRadius: 'var(--radius-xl)',
              overflow: 'hidden', marginBottom: 12, aspectRatio: '4/3',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid var(--border)',
            }}>
              {product.images?.[selectedImg]?.url ? (
                <img src={product.images[selectedImg].url} alt={product.name}
                  style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }} />
              ) : (
                <div style={{ fontSize: 80, opacity: 0.3 }}>💻</div>
              )}
            </div>
            {product.images?.length > 1 && (
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImg(i)}
                    style={{
                      flexShrink: 0, width: 72, height: 56, borderRadius: 10, overflow: 'hidden',
                      border: `2px solid ${i === selectedImg ? 'var(--primary)' : 'var(--border)'}`,
                      background: 'var(--surface-2)', cursor: 'pointer', padding: 4,
                    }}>
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right - Info */}
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              {product.isNew && <span className="badge badge-primary">New</span>}
              {product.isBestSeller && <span className="badge" style={{ background: '#FFF0E8', color: 'var(--secondary)' }}>Best Seller</span>}
              {product.discount?.percentage > 0 && (
                <span className="badge badge-success">{product.discount.percentage}% OFF</span>
              )}
            </div>

            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>{product.brand}</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, lineHeight: 1.3, marginBottom: 16 }}>{product.name}</h1>

            {/* Rating */}
            {product.ratings?.count > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 2, color: 'var(--gold)' }}>
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={16} fill={s <= Math.round(product.ratings.average) ? 'currentColor' : 'none'} />
                  ))}
                </div>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{product.ratings.average}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>({product.ratings.count} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800 }}>{formatPrice(price)}</span>
                {product.discount?.percentage > 0 && (
                  <span style={{ fontSize: 18, color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                    {formatPrice(product.price.original)}
                  </span>
                )}
              </div>
              {product.discount?.percentage > 0 && (
                <p style={{ color: 'var(--success)', fontSize: 14, fontWeight: 600, marginTop: 4 }}>
                  You save {formatPrice(product.price.original - price)} ({product.discount.percentage}%)
                </p>
              )}
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Inclusive of all taxes</p>
            </div>

            {/* Stock */}
            <div style={{ marginBottom: 20 }}>
              {outOfStock ? (
                <span className="badge badge-error">Out of Stock</span>
              ) : product.stock?.status === 'low_stock' ? (
                <span className="badge badge-warning">⚡ Only {product.stock.quantity} left!</span>
              ) : (
                <span className="badge badge-success">✓ In Stock</span>
              )}
            </div>

            {/* Key specs */}
            {product.specifications && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
                {[
                  product.specifications.processor?.model && { label: 'CPU', value: product.specifications.processor.model },
                  product.specifications.ram?.size && { label: 'RAM', value: `${product.specifications.ram.size}GB ${product.specifications.ram.type || ''}` },
                  product.specifications.display?.size && { label: 'Display', value: `${product.specifications.display.size}" ${product.specifications.display.type || ''}` },
                  product.specifications.graphics?.model && { label: 'GPU', value: product.specifications.graphics.model },
                ].filter(Boolean).map(spec => (
                  <div key={spec.label} style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '10px 14px', border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{spec.label}</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{spec.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity + Actions */}
            {!outOfStock && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    style={{ width: 40, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'none', border: 'none' }}>
                    <Minus size={16} />
                  </button>
                  <span style={{ width: 40, textAlign: 'center', fontWeight: 700, fontSize: 15 }}>{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)}
                    style={{ width: 40, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'none', border: 'none' }}>
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
              <button onClick={handleAddToCart} disabled={outOfStock || addingToCart}
                className="btn btn-primary" style={{ flex: 1, fontSize: 15, padding: '14px' }}>
                {addingToCart ? <span className="spinner" style={{ width: 20, height: 20 }} /> : <><ShoppingCart size={18} /> {outOfStock ? 'Out of Stock' : 'Add to Cart'}</>}
              </button>
              <button onClick={() => toggleWishlist(product._id)}
                style={{
                  width: 52, height: 52, border: `1.5px solid ${inWishlist ? '#FF4D6D' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', background: inWishlist ? '#FFF0F3' : 'none', color: inWishlist ? '#FF4D6D' : 'var(--text-secondary)',
                  flexShrink: 0, transition: 'var(--transition)',
                }}>
                <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Trust badges */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                { icon: <Shield size={16} />, text: `${product.warranty?.duration || 12} Month Warranty` },
                { icon: <Truck size={16} />, text: 'Fast Delivery' },
                { icon: <RefreshCw size={16} />, text: '15-Day Returns' },
              ].map(t => (
                <div key={t.text} style={{
                  background: 'var(--surface-2)', borderRadius: 10, padding: '10px 8px',
                  textAlign: 'center', border: '1px solid var(--border)',
                }}>
                  <div style={{ color: 'var(--primary)', display: 'flex', justifyContent: 'center', marginBottom: 4 }}>{t.icon}</div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{t.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs - Specs / Reviews */}
        <div style={{ borderBottom: '2px solid var(--border)', marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 0 }}>
            {['specs', 'reviews', 'description'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{
                  padding: '14px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  border: 'none', background: 'none', fontFamily: 'var(--font-body)',
                  color: activeTab === tab ? 'var(--primary)' : 'var(--text-secondary)',
                  borderBottom: `2px solid ${activeTab === tab ? 'var(--primary)' : 'transparent'}`,
                  marginBottom: -2, transition: 'var(--transition)',
                  textTransform: 'capitalize',
                }}>
                {tab === 'specs' ? 'Specifications' : tab === 'reviews' ? `Reviews (${reviews.length})` : 'Description'}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'specs' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {specSections.map(section => {
              if (section.storage) {
                if (!section.storage?.length) return null
                return (
                  <div key={section.title} className="card" style={{ padding: 20 }}>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 14, color: 'var(--text-primary)' }}>
                      {section.title}
                    </h4>
                    {section.storage.map((s, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Drive {i + 1}</span>
                        <span style={{ fontWeight: 500 }}>{s.capacity}GB {s.type} {s.interface}</span>
                      </div>
                    ))}
                  </div>
                )
              }
              if (!section.data || Object.keys(section.data).length === 0) return null
              return (
                <div key={section.title} className="card" style={{ padding: 20 }}>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 14 }}>{section.title}</h4>
                  {section.fields.map(field => {
                    const val = section.data[field]
                    if (val === null || val === undefined || val === '') return null
                    return (
                      <div key={field} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                        <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                          {field.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span style={{ fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>
                          {typeof val === 'boolean' ? (val ? '✓ Yes' : '✗ No') :
                           field === 'size' && section.title === 'Memory (RAM)' ? `${val} GB` :
                           field === 'size' && section.title === 'Display' ? `${val}"` :
                           field === 'capacity' ? `${val} Wh` :
                           field === 'weight' ? `${val} kg` :
                           String(val)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            {reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
                <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>No reviews yet. Be the first to review!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {reviews.map(r => (
                  <div key={r._id} className="card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                          {r.user?.name?.charAt(0)}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 14 }}>{r.user?.name}</p>
                          {r.isVerifiedPurchase && <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>✓ Verified Purchase</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 2, color: 'var(--gold)' }}>
                        {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= r.rating ? 'currentColor' : 'none'} />)}
                      </div>
                    </div>
                    {r.title && <p style={{ fontWeight: 600, marginBottom: 6 }}>{r.title}</p>}
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'description' && product.description?.full && (
          <div style={{ maxWidth: 800, lineHeight: 1.8, color: 'var(--text-secondary)', fontSize: 15 }}>
            <p>{product.description.full}</p>
          </div>
        )}

        {/* Related Products */}
        {product.relatedProducts?.length > 0 && (
          <div style={{ marginTop: 60 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginBottom: 24 }}>You May Also Like</h2>
            <div className="products-grid">
              {product.relatedProducts.slice(0, 4).map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}
      </div>
      <style>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 1fr 1fr"]:first-of-type { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
