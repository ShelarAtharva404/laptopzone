import { useState } from 'react'
import { User, Phone, Mail, Award, Clipboard, Wallet, MapPin, Key, Trash2, PlusCircle, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'
import api from '../../utils/api'

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  
  // Tabs: 'profile', 'addresses', 'password'
  const [activeTab, setActiveTab] = useState('profile')
  
  // Profile Form States
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [updatingProfile, setUpdatingProfile] = useState(false)

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [updatingPassword, setUpdatingPassword] = useState(false)

  // Address Form States
  const [addresses, setAddresses] = useState(user?.addresses || [])
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [addressLabel, setAddressLabel] = useState('Home')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [country, setCountry] = useState('India')
  const [isDefault, setIsDefault] = useState(false)
  const [addingAddress, setAddingAddress] = useState(false)

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setUpdatingProfile(true)
    try {
      const { data } = await api.put('/auth/profile', { name, phone })
      updateUser(data.user)
      toast.success('Profile updated successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setUpdatingProfile(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long')
      return
    }
    setUpdatingPassword(true)
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword })
      toast.success('Password updated successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password')
    } finally {
      setUpdatingPassword(false)
    }
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    setAddingAddress(true)
    try {
      const { data } = await api.post('/auth/address', {
        label: addressLabel, street, city, state, zipCode, country, isDefault
      })
      setAddresses(data.addresses)
      updateUser({ addresses: data.addresses })
      toast.success('Address added successfully')
      setShowAddressForm(false)
      // Reset form
      setAddressLabel('Home')
      setStreet('')
      setCity('')
      setState('')
      setZipCode('')
      setIsDefault(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add address')
    } finally {
      setAddingAddress(false)
    }
  }

  const handleDeleteAddress = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) return
    try {
      const { data } = await api.delete(`/auth/address/${addressId}`)
      setAddresses(data.addresses)
      updateUser({ addresses: data.addresses })
      toast.success('Address deleted successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete address')
    }
  }

  return (
    <div className="page-enter" style={{ padding: '32px 0 80px' }}>
      <div className="container" style={{ maxWidth: 960 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 28 }}>
          Account Settings
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 28, alignItems: 'start' }}>
          
          {/* Navigation Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={() => setActiveTab('profile')}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
                border: 'none', borderRadius: 'var(--radius-md)', background: activeTab === 'profile' ? 'var(--primary-light)' : 'none',
                color: activeTab === 'profile' ? 'var(--primary)' : 'var(--text-secondary)',
                fontSize: 14, fontWeight: 600, textAlign: 'left', cursor: 'pointer', transition: 'var(--transition)'
              }}
            >
              <User size={18} /> My Profile
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
                border: 'none', borderRadius: 'var(--radius-md)', background: activeTab === 'addresses' ? 'var(--primary-light)' : 'none',
                color: activeTab === 'addresses' ? 'var(--primary)' : 'var(--text-secondary)',
                fontSize: 14, fontWeight: 600, textAlign: 'left', cursor: 'pointer', transition: 'var(--transition)'
              }}
            >
              <MapPin size={18} /> Shipping Addresses
            </button>
            <button
              onClick={() => setActiveTab('password')}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
                border: 'none', borderRadius: 'var(--radius-md)', background: activeTab === 'password' ? 'var(--primary-light)' : 'none',
                color: activeTab === 'password' ? 'var(--primary)' : 'var(--text-secondary)',
                fontSize: 14, fontWeight: 600, textAlign: 'left', cursor: 'pointer', transition: 'var(--transition)'
              }}
            >
              <Key size={18} /> Change Password
            </button>
          </div>

          {/* Active Tab Panel */}
          <div>
            
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                
                {/* Stats Dashboard */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  <div className="card" style={{ padding: 20, textAlign: 'center' }}>
                    <Award size={28} color="var(--primary)" style={{ margin: '0 auto 10px' }} />
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Loyalty Points</p>
                    <h3 style={{ fontSize: 22, fontWeight: 800 }}>{user?.loyaltyPoints || 0}</h3>
                  </div>
                  <div className="card" style={{ padding: 20, textAlign: 'center' }}>
                    <Clipboard size={28} color="var(--secondary)" style={{ margin: '0 auto 10px' }} />
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Total Orders</p>
                    <h3 style={{ fontSize: 22, fontWeight: 800 }}>{user?.totalOrders || 0}</h3>
                  </div>
                  <div className="card" style={{ padding: 20, textAlign: 'center' }}>
                    <Wallet size={28} color="#00A843" style={{ margin: '0 auto 10px' }} />
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Total Spent</p>
                    <h3 style={{ fontSize: 22, fontWeight: 800 }}>₹{(user?.totalSpent || 0).toLocaleString('en-IN')}</h3>
                  </div>
                </div>

                {/* Profile Edit Card */}
                <div className="card" style={{ padding: 28 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Personal Information</h3>
                  <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Full Name</label>
                      <div style={{ position: 'relative' }}>
                        <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)', outline: 'none', fontSize: 14 }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Email Address</label>
                      <div style={{ position: 'relative' }}>
                        <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)', outline: 'none', fontSize: 14, backgroundColor: 'var(--surface-2)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                        />
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Email address cannot be changed</p>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Phone Number</label>
                      <div style={{ position: 'relative' }}>
                        <Phone size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Enter your phone number"
                          style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)', outline: 'none', fontSize: 14 }}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={updatingProfile}
                      className="btn btn-primary"
                      style={{ padding: '12px 24px', alignSelf: 'flex-start', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                    >
                      {updatingProfile ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ADDRESSES TAB */}
            {activeTab === 'addresses' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>Saved Shipping Addresses</h3>
                  {!showAddressForm && (
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="btn btn-outline"
                      style={{ fontSize: 13, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                    >
                      <PlusCircle size={15} /> Add New Address
                    </button>
                  )}
                </div>

                {/* Add Address Form */}
                {showAddressForm && (
                  <div className="card" style={{ padding: 24 }}>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 18 }}>Add Shipping Address</h4>
                    <form onSubmit={handleAddAddress} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Label</label>
                          <select
                            value={addressLabel}
                            onChange={(e) => setAddressLabel(e.target.value)}
                            style={{ width: '100%', padding: 10, borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)', outline: 'none', fontSize: 14 }}
                          >
                            <option value="Home">Home</option>
                            <option value="Work">Work</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Country</label>
                          <input
                            type="text"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            required
                            style={{ width: '100%', padding: 10, borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)', outline: 'none', fontSize: 14 }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Street Address</label>
                        <input
                          type="text"
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          required
                          placeholder="Flat, House no., Apartment, Street"
                          style={{ width: '100%', padding: 10, borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)', outline: 'none', fontSize: 14 }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>City</label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
                            style={{ width: '100%', padding: 10, borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)', outline: 'none', fontSize: 14 }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>State</label>
                          <input
                            type="text"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            required
                            style={{ width: '100%', padding: 10, borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)', outline: 'none', fontSize: 14 }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>PIN / Zip Code</label>
                          <input
                            type="text"
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value)}
                            required
                            style={{ width: '100%', padding: 10, borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)', outline: 'none', fontSize: 14 }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <input
                          type="checkbox"
                          id="defaultAddress"
                          checked={isDefault}
                          onChange={(e) => setIsDefault(e.target.checked)}
                          style={{ cursor: 'pointer' }}
                        />
                        <label htmlFor="defaultAddress" style={{ fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                          Set as default shipping address
                        </label>
                      </div>

                      <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                        <button
                          type="submit"
                          disabled={addingAddress}
                          className="btn btn-primary"
                          style={{ fontSize: 13, padding: '10px 20px', cursor: 'pointer' }}
                        >
                          {addingAddress ? 'Adding...' : 'Add Address'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddressForm(false)}
                          className="btn btn-outline"
                          style={{ fontSize: 13, padding: '10px 20px', cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Address Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                  {addresses.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px 20px', background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)' }}>
                      <MapPin size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                      <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No saved addresses found. Add one to make checkout faster!</p>
                    </div>
                  ) : (
                    addresses.map((address) => (
                      <div key={address._id} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 8, border: address.isDefault ? '1.5px solid var(--primary)' : '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', padding: '3px 8px', borderRadius: 4, background: 'var(--surface-2)', color: 'var(--text-primary)' }}>
                            {address.label}
                          </span>
                          {address.isDefault && (
                            <span style={{ fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary)' }}>
                              <Check size={12} /> Default
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1 }}>
                          {address.street}<br />
                          {address.city}, {address.state} - {address.zipCode}<br />
                          {address.country || 'India'}
                        </p>
                        <button
                          onClick={() => handleDeleteAddress(address._id)}
                          style={{ alignSelf: 'flex-end', border: 'none', background: 'none', color: 'var(--error)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* PASSWORD TAB */}
            {activeTab === 'password' && (
              <div className="card" style={{ padding: 28 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Change Account Password</h3>
                <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      style={{ width: '100%', padding: 10, borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)', outline: 'none', fontSize: 14 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      style={{ width: '100%', padding: 10, borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)', outline: 'none', fontSize: 14 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      style={{ width: '100%', padding: 10, borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)', outline: 'none', fontSize: 14 }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={updatingPassword}
                    className="btn btn-primary"
                    style={{ padding: '12px 24px', alignSelf: 'flex-start', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                  >
                    {updatingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  )
}
