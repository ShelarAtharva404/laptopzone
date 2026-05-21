import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Laptop, Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export default function AuthPage() {
  const navigate = useNavigate()
  const { login, register, loading } = useAuthStore()
  const [mode, setMode] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (mode === 'register' && !form.name.trim()) e.name = 'Name is required'
    if (!form.email.match(/^\S+@\S+\.\S+$/)) e.email = 'Valid email required'
    if (form.password.length < 8) e.password = 'Min 8 characters'
    if (mode === 'register' && form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    let result
    if (mode === 'login') {
      result = await login(form.email, form.password)
    } else {
      result = await register({ name: form.name, email: form.email, password: form.password, phone: form.phone })
    }

    if (result?.success) {
      navigate('/', { replace: true })
    }
  }

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }))
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }))
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      background: '#FAFAFA',
    }}>
      {/* Left - Brand Panel */}
      <div style={{
        background: 'linear-gradient(135deg, #0A0A1A 0%, #0D1B3E 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 64px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-20%', right: '-20%',
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(0,102,255,0.2) 0%, transparent 70%)',
        }} />

        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer',
            marginBottom: 60, background: 'none', border: 'none',
            fontFamily: 'var(--font-body)',
          }}
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div style={{ background: 'var(--primary)', borderRadius: 12, padding: 10, display: 'flex' }}>
              <Laptop size={24} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: '#fff' }}>
              Laptop<strong style={{ color: 'var(--primary)' }}>Zone</strong>
            </span>
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 800, color: '#fff', marginBottom: 16, lineHeight: 1.2 }}>
            {mode === 'login' ? 'Welcome back!' : 'Join LaptopZone'}
          </h2>
          <p style={{ color: '#8899BB', fontSize: 16, lineHeight: 1.7, maxWidth: 380 }}>
            {mode === 'login'
              ? 'Sign in to access your orders, wishlist, and exclusive member deals.'
              : 'Create an account to get exclusive deals, track orders, and more.'}
          </p>

          {/* Benefits */}
          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: '🎁', text: 'Exclusive member-only deals and discounts' },
              { icon: '📦', text: 'Track all your orders in real-time' },
              { icon: '❤️', text: 'Save laptops to your wishlist' },
              { icon: '⚡', text: 'Faster checkout with saved addresses' },
            ].map(b => (
              <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20 }}>{b.icon}</span>
                <span style={{ color: '#8899BB', fontSize: 14 }}>{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Form Panel */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 'clamp(32px, 5vw, 72px)',
        overflowY: 'auto',
      }}>
        <div style={{ maxWidth: 400, width: '100%', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 36 }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErrors({}); setForm({ name: '', email: '', password: '', phone: '', confirmPassword: '' }) }}
              style={{ color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 15 }}
            >
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={form.name}
                    onChange={set('name')}
                    placeholder="John Doe"
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    style={{ paddingLeft: 42 }}
                  />
                </div>
                {errors.name && <p style={{ color: 'var(--error)', fontSize: 12 }}>{errors.name}</p>}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="john@example.com"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  style={{ paddingLeft: 42 }}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p style={{ color: 'var(--error)', fontSize: 12 }}>{errors.email}</p>}
            </div>

            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">Phone Number (optional)</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={set('phone')}
                    placeholder="+91 98765 43210"
                    className="form-input"
                    style={{ paddingLeft: 42 }}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Min 8 characters"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  style={{ paddingLeft: 42, paddingRight: 42 }}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p style={{ color: 'var(--error)', fontSize: 12 }}>{errors.password}</p>}
            </div>

            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={set('confirmPassword')}
                    placeholder="Repeat password"
                    className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                    style={{ paddingLeft: 42 }}
                    autoComplete="new-password"
                  />
                </div>
                {errors.confirmPassword && <p style={{ color: 'var(--error)', fontSize: 12 }}>{errors.confirmPassword}</p>}
              </div>
            )}

            {mode === 'login' && (
              <div style={{ textAlign: 'right', marginTop: -8 }}>
                <button
                  type="button"
                  style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '14px', fontSize: 16, marginTop: 8 }}
            >
              {loading ? (
                <span className="spinner" style={{ width: 20, height: 20 }} />
              ) : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Demo credentials */}
          <div style={{ marginTop: 24, padding: 16, background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>🔑 Demo Credentials:</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Admin: admin@laptopzone.com / Admin@123456</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>User: Create your own account</p>
          </div>

          <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 20, lineHeight: 1.6 }}>
            By continuing, you agree to our{' '}
            <a href="#" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Terms</a> and{' '}
            <a href="#" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Privacy Policy</a>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="background: linear-gradient(135deg, #0A0A1A"] {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
