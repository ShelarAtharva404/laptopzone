import { Link } from 'react-router-dom'
import { Laptop, Mail, Phone, MapPin, Twitter, Instagram, Youtube, Facebook, Shield, Truck, RefreshCw, Headphones } from 'lucide-react'

export default function Footer() {
  const features = [
    { icon: <Truck size={22} />, title: 'Free Shipping', desc: 'On orders above ₹50,000' },
    { icon: <Shield size={22} />, title: 'Secure Payment', desc: '100% secure transactions' },
    { icon: <RefreshCw size={22} />, title: 'Easy Returns', desc: '15-day hassle-free returns' },
    { icon: <Headphones size={22} />, title: '24/7 Support', desc: 'Expert assistance always' },
  ]

  return (
    <footer style={{ background: '#0A0A0A', color: '#fff', marginTop: 'auto' }}>
      {/* Feature Strip */}
      <div style={{ borderBottom: '1px solid #1E1E1E', padding: '32px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            {features.map(f => (
              <div key={f.title} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ color: 'var(--primary)', flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '15px', marginBottom: '2px' }}>{f.title}</p>
                  <p style={{ color: '#888', fontSize: '13px' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div style={{ padding: '60px 0 40px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '48px' }}>
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ background: 'var(--primary)', borderRadius: '10px', padding: '8px', display: 'flex' }}>
                  <Laptop size={20} />
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>
                  Laptop<strong style={{ color: 'var(--primary)' }}>Zone</strong>
                </span>
              </div>
              <p style={{ color: '#888', fontSize: '14px', lineHeight: '1.7', maxWidth: '280px', marginBottom: '20px' }}>
                Your trusted destination for premium laptops. We offer the widest selection of laptops from top brands with unbeatable prices.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                {[Twitter, Instagram, Youtube, Facebook].map((Icon, i) => (
                  <a key={i} href="#" style={{
                    width: 36, height: 36, borderRadius: '8px', border: '1px solid #2A2A2A',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888',
                    transition: 'all 0.2s', textDecoration: 'none'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A2A'; e.currentTarget.style.color = '#888'; }}
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', marginBottom: '20px', color: '#fff' }}>Quick Links</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'All Laptops', href: '/products' },
                  { label: 'Gaming Laptops', href: '/products?subcategory=Gaming Laptops' },
                  { label: 'Business Laptops', href: '/products?subcategory=Business Laptops' },
                  { label: 'Best Sellers', href: '/products?sort=popular' },
                  { label: 'New Arrivals', href: '/products?isNew=true' },
                  { label: 'Deals & Offers', href: '/products?sort=discount' },
                ].map(link => (
                  <li key={link.href}>
                    <Link to={link.href} style={{ color: '#888', fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.target.style.color = '#fff'}
                      onMouseLeave={e => e.target.style.color = '#888'}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Account */}
            <div>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', marginBottom: '20px' }}>Account</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'My Profile', href: '/profile' },
                  { label: 'My Orders', href: '/orders' },
                  { label: 'Wishlist', href: '/wishlist' },
                  { label: 'Cart', href: '/cart' },
                  { label: 'Sign In', href: '/auth' },
                  { label: 'Track Order', href: '/orders' },
                ].map(link => (
                  <li key={link.href}>
                    <Link to={link.href} style={{ color: '#888', fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.target.style.color = '#fff'}
                      onMouseLeave={e => e.target.style.color = '#888'}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', marginBottom: '20px' }}>Contact</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <li style={{ display: 'flex', gap: '10px', color: '#888', fontSize: '14px' }}>
                  <MapPin size={16} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
                  <span>42 Tech Park, Surat, Gujarat 395003</span>
                </li>
                <li>
                  <a href="tel:+919876543210" style={{ display: 'flex', gap: '10px', color: '#888', fontSize: '14px', textDecoration: 'none' }}>
                    <Phone size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    +91 98765 43210
                  </a>
                </li>
                <li>
                  <a href="mailto:support@laptopzone.com" style={{ display: 'flex', gap: '10px', color: '#888', fontSize: '14px', textDecoration: 'none' }}>
                    <Mail size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    support@laptopzone.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ borderTop: '1px solid #1E1E1E', padding: '20px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <p style={{ color: '#666', fontSize: '13px' }}>
            © {new Date().getFullYear()} LaptopZone. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            {['Privacy Policy', 'Terms of Service', 'Return Policy'].map(text => (
              <a key={text} href="#" style={{ color: '#666', fontSize: '13px', textDecoration: 'none' }}
                onMouseEnter={e => e.target.style.color = '#fff'}
                onMouseLeave={e => e.target.style.color = '#666'}
              >
                {text}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
