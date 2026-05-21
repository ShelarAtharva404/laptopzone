import { useState, useEffect, createContext, useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, X, Save } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const FormContext = createContext(null)

const deepMerge = (target, source) => {
  const res = JSON.parse(JSON.stringify(target))
  if (!source) return res
  Object.keys(source).forEach(key => {
    if (source[key] && typeof source[key] === 'object') {
      if (Array.isArray(source[key])) {
        res[key] = source[key].length > 0 ? JSON.parse(JSON.stringify(source[key])) : res[key]
      } else {
        res[key] = deepMerge(res[key] || {}, source[key])
      }
    } else if (source[key] !== undefined) {
      res[key] = source[key]
    }
  })
  return res
}

const Field = ({ label, children, required, col }) => (
  <div className="form-group" style={{ gridColumn: col }}>
    <label className="form-label">{label}{required && <span style={{ color: 'var(--error)', marginLeft: 2 }}>*</span>}</label>
    {children}
  </div>
)

const Input = ({ path, type = 'text', placeholder, min, max, step }) => {
  const { form, set } = useContext(FormContext)
  return (
    <input
      type={type} placeholder={placeholder} min={min} max={max} step={step}
      className="form-input"
      value={path.split('.').reduce((o, k) => o?.[k], form) ?? ''}
      onChange={e => set(path, type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
    />
  )
}

const Check = ({ path, label }) => {
  const { form, set } = useContext(FormContext)
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
      <input type="checkbox" style={{ accentColor: 'var(--primary)', width: 16, height: 16 }}
        checked={Boolean(path.split('.').reduce((o, k) => o?.[k], form))}
        onChange={e => set(path, e.target.checked)} />
      {label}
    </label>
  )
}

const Select = ({ path, options }) => {
  const { form, set } = useContext(FormContext)
  return (
    <select className="form-input" value={path.split('.').reduce((o, k) => o?.[k], form) ?? ''}
      onChange={e => set(path, e.target.value)}>
      {options.map(o => typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

const BRANDS = ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'MSI', 'Samsung', 'Microsoft', 'Razer', 'LG', 'Huawei', 'Other']
const SUBCATEGORIES = ['Gaming Laptops', 'Business Laptops', 'Ultrabooks', 'Workstations', 'Budget Laptops', 'MacBooks', 'Chromebooks', '2-in-1 Laptops']

const INITIAL = {
  name: '', brand: 'Dell', subcategory: 'Business Laptops', sku: '',
  description: { short: '', full: '' },
  images: [{ url: '', alt: '', isPrimary: true }],
  price: { original: '', discounted: '' },
  stock: { quantity: 0, lowStockThreshold: 5 },
  warranty: { duration: 12, type: 'Domestic', description: '' },
  isFeatured: false, isNew: true, isBestSeller: false, isActive: true,
  specifications: {
    processor: { brand: 'Intel', model: '', cores: '', threads: '', baseSpeed: '', boostSpeed: '', cache: '', generation: '' },
    ram: { size: 16, type: 'DDR5', speed: '', slots: 2, maxUpgradeable: 32 },
    storage: [{ type: 'NVMe SSD', capacity: 512, speed: '', interface: 'PCIe 4.0' }],
    display: { size: 15.6, resolution: '1920x1080', type: 'IPS', refreshRate: 60, brightness: 300, colorGamut: '100% sRGB', touchscreen: false, hdr: false },
    graphics: { type: 'Integrated', brand: 'Intel', model: 'Intel Iris Xe', vram: 0 },
    battery: { capacity: 56, life: 'up to 8 hours', fastCharging: false, chargerWatt: 65 },
    ports: { usb_a: 2, usb_c: 1, thunderbolt: 0, hdmi: true, sdCard: false, ethernet: false, headphone: true },
    wireless: { wifi: 'Wi-Fi 6', bluetooth: '5.1' },
    physical: { weight: 1.8, thickness: 19.9, material: 'Plastic' },
    keyboard: { backlit: true, backlitType: 'Single-color', numpad: false },
    os: 'Windows 11 Home',
    webcam: '720p',
    fingerprint: false, faceRecognition: false,
  },
  features: [''],
  tags: [],
  shippingInfo: { freeShipping: false, estimatedDelivery: '3-5 business days' },
}

export default function AdminProductForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const [form, setForm] = useState(INITIAL)
  const [categories, setCategories] = useState([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)
  const [activeSection, setActiveSection] = useState('basic')
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.data || []))
    if (isEdit) {
      // For edit, fetch by ID via admin endpoint
      api.get(`/products/admin/${id}`).then(r => {
        const p = r.data.data
        if (p) {
          const merged = deepMerge(INITIAL, p)
          setForm({
            ...merged,
            category: p.category?._id || p.category || '',
            price: {
              original: p.price?.original ?? '',
              discounted: p.price?.discounted ?? ''
            }
          })
        }
        setLoading(false)
      }).catch(err => {
        toast.error('Failed to load product details')
        console.error(err)
        setLoading(false)
      })
    }
  }, [id])

  const set = (path, value) => {
    setForm(prev => {
      const keys = path.split('.')
      const updated = JSON.parse(JSON.stringify(prev))
      let obj = updated
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i]
        if (!obj[key] || typeof obj[key] !== 'object') {
          obj[key] = {}
        }
        obj = obj[key]
      }
      obj[keys[keys.length - 1]] = value
      return updated
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.brand || !form.price.original) return toast.error('Fill required fields: Name, Brand, Price')
    if (!form.category) return toast.error('Please select a category')
    setSaving(true)
    try {
      const payload = { ...form, price: { original: Number(form.price.original), discounted: Number(form.price.discounted) || undefined } }
      if (isEdit) {
        await api.put(`/products/${id}`, payload)
        toast.success('Product updated!')
      } else {
        await api.post('/products', payload)
        toast.success('Product created!')
      }
      navigate('/admin/products')
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  const addTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!form.tags.includes(tagInput.trim())) {
        set('tags', [...form.tags, tagInput.trim()])
      }
      setTagInput('')
    }
  }

  const SECTIONS = [
    { key: 'basic', label: '📝 Basic Info' },
    { key: 'pricing', label: '💰 Pricing & Stock' },
    { key: 'specs', label: '⚙️ Specifications' },
    { key: 'media', label: '🖼️ Images' },
    { key: 'features', label: '✨ Features & Tags' },
  ]

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>

  // Helper components moved outside component body to prevent recreation and focus loss.

  return (
    <FormContext.Provider value={{ form, set }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => navigate('/admin/products')}
            style={{ width: 36, height: 36, borderRadius: 10, border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'none', color: 'var(--text-secondary)' }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20 }}>{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{isEdit ? 'Update product details' : 'Fill in the product information'}</p>
          </div>
        </div>
        <button onClick={handleSubmit} disabled={saving} className="btn btn-primary">
          {saving ? <span className="spinner" style={{ width: 18, height: 18 }} /> : <><Save size={16} /> {isEdit ? 'Update Product' : 'Save Product'}</>}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Section Nav */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', padding: 8, position: 'sticky', top: 20 }}>
          {SECTIONS.map(s => (
            <button key={s.key} onClick={() => setActiveSection(s.key)}
              style={{
                width: '100%', textAlign: 'left', padding: '10px 14px', borderRadius: 10, border: 'none',
                background: activeSection === s.key ? 'var(--primary-light)' : 'transparent',
                color: activeSection === s.key ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: activeSection === s.key ? 600 : 400, cursor: 'pointer', fontSize: 13,
                fontFamily: 'var(--font-body)', marginBottom: 2, display: 'block',
              }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit}>
          {activeSection === 'basic' && (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', padding: 28 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20 }}>Basic Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Product Name" required col="1 / -1"><Input path="name" placeholder="e.g. Dell XPS 15 9530 (2023)" /></Field>
                <Field label="Brand" required><Select path="brand" options={BRANDS} /></Field>
                <Field label="Subcategory"><Select path="subcategory" options={SUBCATEGORIES} /></Field>
                <Field label="Category">
                  <select className="form-input" value={form.category || ''} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    <option value="">Select category...</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="SKU"><Input path="sku" placeholder="DELL-XPS15-9530" /></Field>
                <Field label="Short Description" col="1 / -1">
                  <textarea className="form-input" rows={3} placeholder="Brief product summary (max 500 chars)"
                    value={form.description?.short || ''} onChange={e => set('description.short', e.target.value)}
                    style={{ resize: 'vertical' }} />
                </Field>
                <Field label="Full Description" col="1 / -1">
                  <textarea className="form-input" rows={6} placeholder="Detailed product description..."
                    value={form.description?.full || ''} onChange={e => set('description.full', e.target.value)}
                    style={{ resize: 'vertical' }} />
                </Field>
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  <Check path="isFeatured" label="Featured Product" />
                  <Check path="isNew" label="New Arrival" />
                  <Check path="isBestSeller" label="Best Seller" />
                  <Check path="isActive" label="Active (visible)" />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'pricing' && (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', padding: 28 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20 }}>Pricing & Inventory</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="MRP / Original Price (₹)" required><Input path="price.original" type="number" min={0} placeholder="89990" /></Field>
                <Field label="Selling Price (₹)"><Input path="price.discounted" type="number" min={0} placeholder="79990" /></Field>
                <Field label="Stock Quantity"><Input path="stock.quantity" type="number" min={0} /></Field>
                <Field label="Low Stock Alert Threshold"><Input path="stock.lowStockThreshold" type="number" min={1} /></Field>
                <Field label="Warranty (months)"><Input path="warranty.duration" type="number" min={0} /></Field>
                <Field label="Warranty Type">
                  <Select path="warranty.type" options={['International', 'Domestic', 'OnSite', 'Carry-in', 'None']} />
                </Field>
                <Field label="Warranty Description" col="1 / -1">
                  <Input path="warranty.description" placeholder="e.g. 1 year onsite warranty by manufacturer" />
                </Field>
                <Field label="Estimated Delivery"><Input path="shippingInfo.estimatedDelivery" placeholder="3-5 business days" /></Field>
                <div style={{ gridColumn: '1 / -1' }}>
                  <Check path="shippingInfo.freeShipping" label="Free Shipping" />
                </div>
                {form.price.original && form.price.discounted && Number(form.price.discounted) < Number(form.price.original) && (
                  <div style={{ gridColumn: '1 / -1', background: '#E8FFF1', borderRadius: 10, padding: '12px 16px', fontSize: 14, color: '#00A843', fontWeight: 500 }}>
                    ✓ Discount: {Math.round(((form.price.original - form.price.discounted) / form.price.original) * 100)}% off · Save ₹{(form.price.original - form.price.discounted).toLocaleString('en-IN')}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'specs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Processor */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', padding: 24 }}>
                <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16, fontSize: 15 }}>🖥️ Processor</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="Brand"><Select path="specifications.processor.brand" options={['Intel', 'AMD', 'Apple', 'Qualcomm']} /></Field>
                  <Field label="Model"><Input path="specifications.processor.model" placeholder="Core i9-13900H" /></Field>
                  <Field label="Cores"><Input path="specifications.processor.cores" type="number" /></Field>
                  <Field label="Threads"><Input path="specifications.processor.threads" type="number" /></Field>
                  <Field label="Base Speed"><Input path="specifications.processor.baseSpeed" placeholder="2.6 GHz" /></Field>
                  <Field label="Boost Speed"><Input path="specifications.processor.boostSpeed" placeholder="5.4 GHz" /></Field>
                  <Field label="Cache"><Input path="specifications.processor.cache" placeholder="24MB" /></Field>
                  <Field label="Generation"><Input path="specifications.processor.generation" placeholder="13th Gen" /></Field>
                </div>
              </div>

              {/* RAM */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', padding: 24 }}>
                <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16, fontSize: 15 }}>💾 Memory (RAM)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="Size (GB)"><Input path="specifications.ram.size" type="number" /></Field>
                  <Field label="Type"><Select path="specifications.ram.type" options={['DDR5', 'DDR4', 'LPDDR5', 'LPDDR4X', 'Unified']} /></Field>
                  <Field label="Speed"><Input path="specifications.ram.speed" placeholder="4800MHz" /></Field>
                  <Field label="Max Upgradeable (GB)"><Input path="specifications.ram.maxUpgradeable" type="number" /></Field>
                </div>
              </div>

              {/* Display */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', padding: 24 }}>
                <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16, fontSize: 15 }}>🖥️ Display</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="Size (inches)"><Input path="specifications.display.size" type="number" step={0.1} /></Field>
                  <Field label="Resolution"><Input path="specifications.display.resolution" placeholder="1920x1080" /></Field>
                  <Field label="Type"><Select path="specifications.display.type" options={['IPS', 'OLED', 'AMOLED', 'Mini-LED', 'TN', 'VA']} /></Field>
                  <Field label="Refresh Rate (Hz)"><Input path="specifications.display.refreshRate" type="number" /></Field>
                  <Field label="Brightness (nits)"><Input path="specifications.display.brightness" type="number" /></Field>
                  <Field label="Color Gamut"><Input path="specifications.display.colorGamut" placeholder="100% sRGB" /></Field>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 20 }}>
                    <Check path="specifications.display.touchscreen" label="Touchscreen" />
                    <Check path="specifications.display.hdr" label="HDR Support" />
                  </div>
                </div>
              </div>

              {/* Graphics */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', padding: 24 }}>
                <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16, fontSize: 15 }}>🎮 Graphics</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="Type"><Select path="specifications.graphics.type" options={['Dedicated', 'Integrated']} /></Field>
                  <Field label="Brand"><Select path="specifications.graphics.brand" options={['NVIDIA', 'AMD', 'Intel', 'Apple']} /></Field>
                  <Field label="Model"><Input path="specifications.graphics.model" placeholder="RTX 4070" /></Field>
                  <Field label="VRAM (GB)"><Input path="specifications.graphics.vram" type="number" /></Field>
                </div>
              </div>

              {/* Battery */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', padding: 24 }}>
                <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16, fontSize: 15 }}>🔋 Battery</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="Capacity (Wh)"><Input path="specifications.battery.capacity" type="number" /></Field>
                  <Field label="Battery Life"><Input path="specifications.battery.life" placeholder="up to 10 hours" /></Field>
                  <Field label="Charger (Watt)"><Input path="specifications.battery.chargerWatt" type="number" /></Field>
                  <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 4 }}>
                    <Check path="specifications.battery.fastCharging" label="Fast Charging" />
                  </div>
                </div>
              </div>

              {/* OS & Other */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', padding: 24 }}>
                <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16, fontSize: 15 }}>🖥️ System & Physical</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="OS"><Select path="specifications.os" options={['Windows 11 Home', 'Windows 11 Pro', 'macOS Sonoma', 'macOS Ventura', 'ChromeOS', 'FreeDOS', 'Ubuntu']} /></Field>
                  <Field label="Webcam"><Input path="specifications.webcam" placeholder="1080p IR" /></Field>
                  <Field label="Weight (kg)"><Input path="specifications.physical.weight" type="number" step={0.1} /></Field>
                  <Field label="Thickness (mm)"><Input path="specifications.physical.thickness" type="number" step={0.1} /></Field>
                  <Field label="Material"><Input path="specifications.physical.material" placeholder="Aluminum" /></Field>
                  <Field label="Color"><Input path="specifications.physical.color" placeholder="Space Gray" /></Field>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                    <Check path="specifications.fingerprint" label="Fingerprint Reader" />
                    <Check path="specifications.faceRecognition" label="Face Recognition" />
                    <Check path="specifications.keyboard.backlit" label="Backlit Keyboard" />
                    <Check path="specifications.keyboard.numpad" label="Numpad" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'media' && (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Product Images</h3>
                <button type="button"
                  onClick={() => setForm(p => ({ ...p, images: [...p.images, { url: '', alt: '', isPrimary: false }] }))}
                  className="btn btn-secondary" style={{ fontSize: 13 }}>
                  <Plus size={14} /> Add Image
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {(form.images || []).map((img, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 200px auto', gap: 10, alignItems: 'center', padding: '14px', background: 'var(--surface-2)', borderRadius: 10 }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: 12 }}>Image URL</label>
                      <input className="form-input" placeholder="https://example.com/image.jpg"
                        value={img.url}
                        onChange={e => setForm(p => ({ ...p, images: p.images.map((im, j) => j === i ? { ...im, url: e.target.value } : im) }))}
                        style={{ fontSize: 13 }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                        <input type="radio" name="primaryImg" checked={img.isPrimary}
                          onChange={() => setForm(p => ({ ...p, images: p.images.map((im, j) => ({ ...im, isPrimary: j === i })) }))}
                          style={{ accentColor: 'var(--primary)' }} />
                        Primary
                      </label>
                      {img.url && (
                        <div style={{ width: 60, height: 45, background: '#fff', borderRadius: 6, overflow: 'hidden', border: '1px solid var(--border)' }}>
                          <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} onError={e => e.target.style.display = 'none'} />
                        </div>
                      )}
                    </div>
                    {form.images.length > 1 && (
                      <button type="button"
                        onClick={() => setForm(p => ({ ...p, images: p.images.filter((_, j) => j !== i) }))}
                        style={{ color: 'var(--error)', cursor: 'pointer', background: 'none', border: 'none', display: 'flex', alignSelf: 'center' }}>
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'features' && (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', padding: 28 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20 }}>Features & Tags</h3>

              {/* Key Features */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <label className="form-label" style={{ margin: 0 }}>Key Features</label>
                  <button type="button"
                    onClick={() => setForm(p => ({ ...p, features: [...p.features, ''] }))}
                    style={{ fontSize: 13, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                    + Add Feature
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(form.features || []).map((f, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8 }}>
                      <input className="form-input" placeholder={`Feature ${i + 1}...`}
                        value={f} onChange={e => setForm(p => ({ ...p, features: p.features.map((ff, j) => j === i ? e.target.value : ff) }))} />
                      {form.features.length > 1 && (
                        <button type="button"
                          onClick={() => setForm(p => ({ ...p, features: p.features.filter((_, j) => j !== i) }))}
                          style={{ color: 'var(--error)', cursor: 'pointer', background: 'none', border: 'none', display: 'flex', padding: '0 4px' }}>
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="form-label">Tags</label>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>Press Enter to add a tag</p>
                <input className="form-input" placeholder="Add tag and press Enter..." value={tagInput}
                  onChange={e => setTagInput(e.target.value)} onKeyDown={addTag} style={{ marginBottom: 12 }} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(form.tags || []).map((tag, i) => (
                    <span key={i} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px',
                      background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 500,
                    }}>
                      {tag}
                      <button type="button" onClick={() => setForm(p => ({ ...p, tags: p.tags.filter((_, j) => j !== i) }))}
                        style={{ color: 'var(--primary)', cursor: 'pointer', background: 'none', border: 'none', display: 'flex', padding: 0 }}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
            <button type="button" onClick={() => navigate('/admin/products')} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? <span className="spinner" style={{ width: 18, height: 18 }} /> : <><Save size={16} /> {isEdit ? 'Update Product' : 'Save Product'}</>}
            </button>
          </div>
        </form>
      </div>

      <style>{`@media(max-width:768px){div[style*="grid-template-columns: 200px 1fr"]{grid-template-columns:1fr!important;}}`}</style>
      </div>
    </FormContext.Provider>
  )
}
