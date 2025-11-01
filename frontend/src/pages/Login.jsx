import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Building2, Lock, Mail, AlertCircle, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Demo credentials
  const demoAccounts = [
    {
      role: 'Bank Admin',
      email: 'admin@zenithbank.com',
      password: 'admin123',
      description: 'Full dashboard access, dispatch management',
      color: 'blue'
    },
    {
      role: 'Field Engineer',
      email: 'engineer1@zenithbank.com',
      password: 'engineer123',
      description: 'Task management, maintenance tracking',
      color: 'purple'
    }
  ]

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error } = await signIn(formData.email, formData.password)

    if (error) {
      setError(error.message || 'Invalid email or password')
      setLoading(false)
    } else if (data) {
      // Redirect based on role will be handled by the auth state change
      navigate('/dashboard')
    }
  }

  const fillDemoCredentials = (email, password) => {
    setFormData({ email, password })
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8">
        
        {/* Left Side - Login Form */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-800">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                SmartATMNet
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in to access the ATM operations platform
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                  placeholder="you@zenithbank.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-700 rounded-lg 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 
                       text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ATM User?{' '}
              <Link 
                to="/signup" 
                className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side - Demo Credentials */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6" />
              <h2 className="text-2xl font-bold">Demo Credentials</h2>
            </div>
            <p className="text-blue-100 mb-6">
              Use these accounts to explore different user roles and features
            </p>

            <div className="space-y-4">
              {demoAccounts.map((account, index) => (
                <div 
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{account.role}</h3>
                      <p className="text-sm text-blue-100">{account.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-200" />
                      <code className="text-sm bg-white/10 px-2 py-1 rounded font-mono">
                        {account.email}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-blue-200" />
                      <code className="text-sm bg-white/10 px-2 py-1 rounded font-mono">
                        {account.password}
                      </code>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => fillDemoCredentials(account.email, account.password)}
                    className="w-full px-4 py-2 bg-white text-blue-600 font-medium rounded-lg 
                             hover:bg-blue-50 transition-colors text-sm"
                  >
                    Use These Credentials
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Note for Demo
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              These demo accounts have been pre-configured in Supabase. Bank Admin and Engineer accounts 
              are created manually by the system administrator. ATM Users can self-register through the 
              signup page.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}