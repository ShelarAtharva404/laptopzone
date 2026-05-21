import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, ShoppingCart, Heart, User, Menu, X, ChevronDown, Bell, Laptop, LogOut, Package, Settings } from 'lucide-react'
import { useAuthStore, useCartStore, useWishlistStore } from '../../store/authStore'
import styles from './Navbar.module.css'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, token, logout } = useAuthStore()
  const { items: cartItems } = useCartStore()
  const { items: wishlistItems } = useWishlistStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const userMenuRef = useRef()

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const navLinks = [
    { label: 'All Laptops', href: '/products' },
    { label: 'Gaming', href: '/products?subcategory=Gaming Laptops' },
    { label: 'Business', href: '/products?subcategory=Business Laptops' },
    { label: 'Ultrabooks', href: '/products?subcategory=Ultrabooks' },
    { label: 'Deals', href: '/products?sort=discount' },
  ]

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className="container">
        <nav className={styles.inner}>
          {/* Logo */}
          <Link to="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <Laptop size={20} />
            </div>
            <span>Laptop<strong>Zone</strong></span>
          </Link>

          {/* Desktop Nav Links */}
          <ul className={styles.navLinks}>
            {navLinks.map(link => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className={`${styles.navLink} ${location.pathname === link.href ? styles.active : ''}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchWrapper}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search laptops, brands..."
                className={styles.searchInput}
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className={styles.clearSearch}>
                  <X size={14} />
                </button>
              )}
            </div>
          </form>

          {/* Actions */}
          <div className={styles.actions}>
            {/* Wishlist */}
            <Link to="/wishlist" className={styles.iconBtn} title="Wishlist">
              <Heart size={20} />
              {wishlistItems.length > 0 && (
                <span className={styles.badge}>{wishlistItems.length}</span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className={styles.iconBtn} title="Cart">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className={`${styles.badge} ${styles.cartBadge}`}>{cartCount}</span>
              )}
            </Link>

            {/* User Menu */}
            {token ? (
              <div className={styles.userMenu} ref={userMenuRef}>
                <button
                  className={styles.userBtn}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className={styles.avatar} />
                  ) : (
                    <div className={styles.avatarFallback}>
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <ChevronDown size={14} className={userMenuOpen ? styles.rotated : ''} />
                </button>

                {userMenuOpen && (
                  <div className={styles.dropdown}>
                    <div className={styles.dropdownHeader}>
                      <p className={styles.dropdownName}>{user?.name}</p>
                      <p className={styles.dropdownEmail}>{user?.email}</p>
                    </div>
                    <div className={styles.dropdownItems}>
                      <Link to="/profile" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                        <User size={15} /> My Profile
                      </Link>
                      <Link to="/orders" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                        <Package size={15} /> My Orders
                      </Link>
                      <Link to="/wishlist" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                        <Heart size={15} /> Wishlist
                      </Link>
                      {user?.role === 'admin' && (
                        <Link to="/admin" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                          <Settings size={15} /> Admin Panel
                        </Link>
                      )}
                      <button
                        className={`${styles.dropdownItem} ${styles.logoutBtn}`}
                        onClick={() => { logout(); setUserMenuOpen(false) }}
                      >
                        <LogOut size={15} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/auth" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
                Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className={styles.mobileToggle}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className={styles.mobileMenu}>
          <form onSubmit={handleSearch} className={styles.mobileSearch}>
            <div className={styles.searchWrapper}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search laptops..."
                className={styles.searchInput}
              />
            </div>
          </form>
          <ul className={styles.mobileNavLinks}>
            {navLinks.map(link => (
              <li key={link.href}>
                <Link to={link.href} className={styles.mobileNavLink}>{link.label}</Link>
              </li>
            ))}
          </ul>
          {!token && (
            <Link to="/auth" className="btn btn-primary" style={{ margin: '16px', display: 'block', textAlign: 'center' }}>
              Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
