import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Star, Zap, Eye } from 'lucide-react'
import { useCartStore, useWishlistStore, useAuthStore } from '../../store/authStore'
import { formatPrice } from '../../utils/api'

export default function ProductCard({ product }) {
  const { addToCart } = useCartStore()
  const { toggleWishlist, isInWishlist } = useWishlistStore()
  const { token } = useAuthStore()
  const [addingToCart, setAddingToCart] = useState(false)
  const [imgError, setImgError] = useState(false)

  if (!product) return null

  const price = product.price?.discounted || product.price?.original || 0
  const originalPrice = product.price?.original || 0
  const discount = product.discount?.percentage || 0
  const inWishlist = isInWishlist(product._id)
  const outOfStock = product.stock?.status === 'out_of_stock'
  const primaryImg = product.images?.find(i => i.isPrimary)?.url || product.images?.[0]?.url

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (outOfStock) return
    setAddingToCart(true)
    await addToCart(product._id, 1)
    setAddingToCart(false)
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product._id)
  }

  return (
    <Link to={`/products/${product.slug}`} className="product-card-link" style={{ textDecoration: 'none', display: 'block' }}>
      <article className="product-card">
        {/* Image Area */}
        <div className="product-card-image">
          {!imgError && primaryImg ? (
            <img
              src={primaryImg}
              alt={product.name}
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div className="product-card-placeholder">
              <svg width="80" height="60" viewBox="0 0 80 60" fill="none">
                <rect x="4" y="8" width="72" height="44" rx="4" fill="#E8E8E8" stroke="#D0D0D0" strokeWidth="1.5"/>
                <rect x="10" y="14" width="60" height="32" rx="2" fill="#F5F5F5"/>
                <rect x="24" y="52" width="32" height="4" rx="2" fill="#E8E8E8"/>
                <rect x="20" y="56" width="40" height="2" rx="1" fill="#E0E0E0"/>
                <circle cx="40" cy="30" r="10" fill="#E0E0E0"/>
                <path d="M35 30L38 33L45 26" stroke="#B0B0B0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>{product.brand}</p>
            </div>
          )}

          {/* Badges */}
          <div className="product-card-badges">
            {product.isNew && <span className="product-badge badge-new">New</span>}
            {product.isBestSeller && <span className="product-badge badge-hot">🔥 Hot</span>}
            {discount > 0 && <span className="product-badge badge-discount">-{discount}%</span>}
            {outOfStock && <span className="product-badge badge-oos">Out of Stock</span>}
          </div>

          {/* Wishlist button */}
          <button
            className={`product-wishlist-btn ${inWishlist ? 'active' : ''}`}
            onClick={handleWishlist}
            aria-label="Toggle wishlist"
          >
            <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
          </button>

          {/* Quick view overlay */}
          <div className="product-card-overlay">
            <Eye size={16} /> Quick View
          </div>
        </div>

        {/* Info */}
        <div className="product-card-info">
          <p className="product-card-brand">{product.brand}</p>
          <h3 className="product-card-name">{product.name}</h3>

          {/* Specs chips */}
          {product.specifications && (
            <div className="product-card-specs">
              {product.specifications.display?.size && (
                <span className="spec-chip">{product.specifications.display.size}"</span>
              )}
              {product.specifications.ram?.size && (
                <span className="spec-chip">{product.specifications.ram.size}GB RAM</span>
              )}
              {product.specifications.processor?.model && (
                <span className="spec-chip" style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {product.specifications.processor.model.split(' ').slice(0, 3).join(' ')}
                </span>
              )}
            </div>
          )}

          {/* Rating */}
          {product.ratings?.count > 0 && (
            <div className="product-card-rating">
              <div className="stars" style={{ fontSize: 13 }}>
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={12} fill={s <= Math.round(product.ratings.average) ? 'currentColor' : 'none'} />
                ))}
              </div>
              <span className="product-card-rating-count">({product.ratings.count})</span>
            </div>
          )}

          {/* Price */}
          <div className="product-card-price">
            <span className="price-current">{formatPrice(price)}</span>
            {discount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="price-original">{formatPrice(originalPrice)}</span>
                <span className="price-discount">Save {formatPrice(originalPrice - price)}</span>
              </div>
            )}
          </div>

          {/* Add to Cart */}
          <button
            className={`product-card-btn ${outOfStock ? 'disabled' : ''} ${addingToCart ? 'loading' : ''}`}
            onClick={handleAddToCart}
            disabled={outOfStock || addingToCart}
          >
            {addingToCart ? (
              <span className="spinner" style={{ width: 16, height: 16 }} />
            ) : outOfStock ? (
              'Out of Stock'
            ) : (
              <><ShoppingCart size={15} /> Add to Cart</>
            )}
          </button>
        </div>
      </article>

      <style>{`
        .product-card-link:hover .product-card { box-shadow: var(--shadow-lg); transform: translateY(-4px); }
        .product-card {
          background: var(--surface);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          overflow: hidden;
          transition: var(--transition);
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .product-card-image {
          position: relative;
          aspect-ratio: 4/3;
          overflow: hidden;
          background: var(--surface-2);
        }
        .product-card-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 16px;
          transition: transform 0.4s ease;
        }
        .product-card-link:hover .product-card-image img { transform: scale(1.05); }
        .product-card-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .product-card-badges {
          position: absolute;
          top: 10px;
          left: 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .product-badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          line-height: 1.4;
        }
        .badge-new { background: #E8F0FF; color: var(--primary); }
        .badge-hot { background: #FFF0E8; color: var(--secondary); }
        .badge-discount { background: #E8FFF1; color: #00A843; }
        .badge-oos { background: var(--surface-2); color: var(--text-muted); }
        .product-wishlist-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--surface);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          transition: var(--transition);
          cursor: pointer;
          opacity: 0;
        }
        .product-card-link:hover .product-wishlist-btn { opacity: 1; }
        .product-wishlist-btn.active { color: #FF4D6D; border-color: #FF4D6D; opacity: 1; }
        .product-wishlist-btn:hover { color: #FF4D6D; border-color: #FF4D6D; transform: scale(1.1); }
        .product-card-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0,0,0,0.75);
          color: #fff;
          font-size: 13px;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px;
          transform: translateY(100%);
          transition: transform 0.25s ease;
        }
        .product-card-link:hover .product-card-overlay { transform: translateY(0); }
        .product-card-info {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }
        .product-card-brand {
          font-size: 12px;
          font-weight: 600;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .product-card-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .product-card-specs {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        .spec-chip {
          display: inline-block;
          padding: 2px 8px;
          background: var(--surface-2);
          border-radius: 4px;
          font-size: 11px;
          color: var(--text-secondary);
          font-weight: 500;
        }
        .product-card-rating {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .product-card-rating-count {
          font-size: 12px;
          color: var(--text-muted);
        }
        .product-card-price {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-top: auto;
        }
        .product-card-btn {
          width: 100%;
          padding: 10px;
          border-radius: var(--radius-md);
          background: var(--primary);
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
          border: none;
          transition: var(--transition);
          font-family: var(--font-body);
          margin-top: 8px;
        }
        .product-card-btn:hover:not(.disabled) { background: var(--primary-dark); }
        .product-card-btn.disabled { background: var(--border); color: var(--text-muted); cursor: not-allowed; }
        @media (max-width: 640px) {
          .product-card-info { padding: 12px; }
          .product-card-name { font-size: 13px; }
        }
      `}</style>
    </Link>
  )
}
