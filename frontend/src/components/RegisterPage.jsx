import { useState } from 'react'
import { UserPlus, User, Mail, Lock, Shield, PenTool, Eye } from 'lucide-react'
import { authAPI } from '../services/api'

export default function RegisterPage({ onSwitch, onLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('viewer')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const roles = [
    { value: 'admin', label: 'Admin', icon: Shield, desc: 'Full access' },
    { value: 'editor', label: 'Editor', icon: PenTool, desc: 'Create & edit' },
    { value: 'viewer', label: 'Viewer', icon: Eye, desc: 'Read only' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) return setError('Passwords do not match')
    if (password.length < 6) return setError('Password must be at least 6 characters')
    setLoading(true)
    try {
      const res = await authAPI.register(name.trim(), email, password, role)
      if (res.success) onLogin(res.user)
    } catch (err) { setError(err.message) }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 max-h-[95vh] overflow-y-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={18} />
              <input type="text" value={name} onChange={e => setName(e.target.value)} required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Duc Duy" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="123@example.com" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <div className="grid grid-cols-3 gap-2">
              {roles.map(r => (
                <button key={r.value} type="button" onClick={() => setRole(r.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${role === r.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <r.icon size={20} className={`mx-auto mb-1 ${role === r.value ? 'text-blue-600' : 'text-gray-400'}`} />
                  <p className={`text-xs font-medium ${role === r.value ? 'text-blue-600' : 'text-gray-600'}`}>{r.label}</p>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">{roles.find(r => r.value === role)?.desc}</p>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••" />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium disabled:opacity-50">
            {loading ? 'Creating...' : <><UserPlus size={18} /> Create Account</>}
          </button>
        </form>
        <p className="mt-6 text-center text-gray-600">
          Already have an account? <button onClick={onSwitch} className="text-blue-600 hover:underline font-medium">Sign In</button>
        </p>
      </div>
    </div>
  )
}