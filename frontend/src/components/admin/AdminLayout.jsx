import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag, BarChart3,
  Ticket, ChevronLeft, ChevronRight, Bell, Menu, X, Laptop, LogOut, ExternalLink
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const NAV_ITEMS = [
  { label: 'Dashboard',   href: '/admin',            icon: LayoutDashboard },
  { label: 'Products',    href: '/admin/products',   icon: Package },
  { label: 'Orders',      href: '/admin/orders',     icon: ShoppingBag },
  { label: 'Users',       href: '/admin/users',      icon: Users },
  { label: 'Categories',  href: '/admin/categories', icon: Tag },
  { label: 'Coupons',     href: '/admin/coupons',    icon: Ticket },
  { label: 'Analytics',   href: '/admin/analytics',  icon: BarChart3 },
]

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const Sidebar = ({ mobile = false }) => (
    <aside style={{
      width: mobile ? 280 : (collapsed ? 72 : 240),
      background: '#0F172A',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      transition: 'width 0.25s ease',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed && !mobile ? 'center' : 'space-between',
        padding: collapsed && !mobile ? '0 16px' : '0 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {(!collapsed || mobile) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: 'var(--primary)', borderRadius: 8, padding: 6, display: 'flex' }}>
              <Laptop size={18} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: 16, fontWeight: 700 }}>
              Laptop<strong style={{ color: 'var(--primary)' }}>Zone</strong>
            </span>
          </div>
        )}
        {collapsed && !mobile && (
          <div style={{ background: 'var(--primary)', borderRadius: 8, padding: 6, display: 'flex' }}>
            <Laptop size={18} color="#fff" />
          </div>
        )}
        {!mobile && (
          <button onClick={() => setCollapsed(!collapsed)}
            style={{ color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', background: 'none', border: 'none', padding: 4 }}>
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 10px', overflowY: 'auto' }}>
        <p style={{
          fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
          color: 'rgba(255,255,255,0.3)', padding: '0 10px', marginBottom: 8,
          display: collapsed && !mobile ? 'none' : 'block',
        }}>
          Menu
        </p>
        {NAV_ITEMS.map(item => {
          const isActive = location.pathname === item.href || (item.href !== '/admin' && location.pathname.startsWith(item.href))
          return (
            <Link key={item.href} to={item.href}
              onClick={() => mobile && setMobileOpen(false)}
              title={collapsed && !mobile ? item.label : ''}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 10,
                marginBottom: 2,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                background: isActive ? 'rgba(0,102,255,0.2)' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(0,102,255,0.3)' : 'transparent'}`,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.15s',
                justifyContent: collapsed && !mobile ? 'center' : 'flex-start',
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff' } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' } }}
            >
              <item.icon size={18} style={{ flexShrink: 0 }} />
              {(!collapsed || mobile) && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <Link to="/" target="_blank" style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
          borderRadius: 10, color: 'rgba(255,255,255,0.4)', fontSize: 13,
          textDecoration: 'none', marginBottom: 4,
          justifyContent: collapsed && !mobile ? 'center' : 'flex-start',
        }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'transparent' }}
        >
          <ExternalLink size={16} />
          {(!collapsed || mobile) && 'View Store'}
        </Link>
        <button onClick={() => { logout(); navigate('/') }}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
            borderRadius: 10, color: 'rgba(255,100,100,0.7)', fontSize: 13,
            cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'var(--font-body)',
            justifyContent: collapsed && !mobile ? 'center' : 'flex-start',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#FF6B6B'; e.currentTarget.style.background = 'rgba(255,100,100,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,100,100,0.7)'; e.currentTarget.style.background = 'transparent' }}
        >
          <LogOut size={16} />
          {(!collapsed || mobile) && 'Logout'}
        </button>
      </div>
    </aside>
  )

  const pageName = NAV_ITEMS.find(i => location.pathname === i.href || (i.href !== '/admin' && location.pathname.startsWith(i.href)))?.label || 'Dashboard'

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F8FAFC' }}>
      {/* Desktop sidebar */}
      <div style={{ display: 'none' }} className="admin-desktop-sidebar">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div className="overlay" onClick={() => setMobileOpen(false)} style={{ zIndex: 150 }} />
          <div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 200 }}>
            <Sidebar mobile />
          </div>
        </>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{
          height: 64, background: '#fff', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', padding: '0 24px',
          justifyContent: 'space-between', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => setMobileOpen(true)}
              className="admin-mobile-menu-btn"
              style={{ display: 'none', color: 'var(--text-secondary)', cursor: 'pointer', background: 'none', border: 'none' }}>
              <Menu size={22} />
            </button>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>{pageName}</h1>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>LaptopZone Admin Panel</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button style={{
              width: 38, height: 38, borderRadius: 10, border: '1.5px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', background: 'none', color: 'var(--text-secondary)', position: 'relative',
            }}>
              <Bell size={18} />
              <span style={{
                position: 'absolute', top: 6, right: 6, width: 8, height: 8,
                background: 'var(--error)', borderRadius: '50%', border: '2px solid #fff',
              }} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>
                {user?.name?.charAt(0)}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{user?.name?.split(' ')[0]}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.2 }}>Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (min-width: 900px) { .admin-desktop-sidebar { display: block !important; } }
        @media (max-width: 900px) { .admin-mobile-menu-btn { display: flex !important; } }
      `}</style>
    </div>
  )
}
