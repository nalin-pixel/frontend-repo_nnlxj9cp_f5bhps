import { useState } from 'react'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('doctor@example.com')
  const [role, setRole] = useState('doctor')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${baseUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role })
      })
      if (!res.ok) throw new Error('Login failed')
      const data = await res.json()
      onLogin({ ...data.user, role })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
        <h1 className="text-2xl font-semibold text-white mb-4">Hospital Management</h1>
        <p className="text-slate-300 mb-6">Sign in as Doctor, Patient, or Admin</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-slate-200 text-sm mb-1">Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email" className="w-full px-3 py-2 rounded bg-slate-900/60 border border-slate-700 text-white" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-slate-200 text-sm mb-1">Role</label>
            <select value={role} onChange={e=>setRole(e.target.value)} className="w-full px-3 py-2 rounded bg-slate-900/60 border border-slate-700 text-white">
              <option value="doctor">Doctor</option>
              <option value="patient">Patient</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button disabled={loading} className="w-full py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="mt-4 text-xs text-slate-400">
          Tip emails: doctor@example.com, patient@example.com, admin@example.com
        </div>
      </div>
    </div>
  )
}
