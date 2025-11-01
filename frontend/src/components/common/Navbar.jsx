import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Building2, Moon, Sun, Menu, X, LayoutDashboard, Users, 
  MapPin, BarChart3, User, LogOut, ChevronDown, AlertCircle
} from 'lucide-react'

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const { user, profile, signOut, isAuthenticated, isBankAdmin, isEngineer, isATMUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return user?.email?.[0]?.toUpperCase() || 'U'
  }

  // Get role badge color
  const getRoleBadgeColor = () => {
    if (isBankAdmin) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    if (isEngineer) return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
  }

  // Get role display name
  const getRoleDisplayName = () => {
    if (isBankAdmin) return 'Bank Admin'
    if (isEngineer) return 'Field Engineer'
    if (isATMUser) return 'ATM User'
    return 'User'
  }

  const navigationLinks = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: LayoutDashboard,
      allowed: ['bank_admin', 'engineer', 'atm_user']
    },
    { 
      name: 'Engineers', 
      path: '/engineers', 
      icon: Users,
      allowed: ['bank_admin', 'engineer']
    },
    { 
      name: 'Map View', 
      path: '/map', 
      icon: MapPin,
      allowed: ['bank_admin']
    },
    { 
      name: 'Analytics', 
      path: '/analytics', 
      icon: BarChart3,
      allowed: ['bank_admin']
    },
  ]

  // Filter navigation links based on user role
  const visibleLinks = navigationLinks.filter(link => 
    !profile || link.allowed.includes(profile.role)
  )

  const isActive = (path) => location.pathname === path

  if (!isAuthenticated) {
    return null // Don't show navbar on login/signup pages
  }

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="p-2 bg-blue-600 dark:bg-blue-500 rounded-lg group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                SmartATMNet
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {visibleLinks.map((link) => {
              const Icon = link.icon
              const active = isActive(link.path)
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    active
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Right Side - Theme Toggle & User Menu */}
          <div className="flex items-center gap-3">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>

            {/* User Menu - Desktop */}
            <div className="hidden md:block relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                  {getUserInitials()}
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {profile?.full_name || user?.email?.split('@')[0]}
                  </div>
                  <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${getRoleBadgeColor()}`}>
                    {getRoleDisplayName()}
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-20">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {profile?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                    
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile Settings</span>
                    </Link>

                    {isATMUser && (
                      <Link
                        to="/report-issue"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>Report ATM Issue</span>
                      </Link>
                    )}
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
            <div className="space-y-1 mb-4">
              {visibleLinks.map((link) => {
                const Icon = link.icon
                const active = isActive(link.path)
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      active
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.name}</span>
                  </Link>
                )
              })}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
              <div className="px-4 mb-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {profile?.full_name || user?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
                <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${getRoleBadgeColor()}`}>
                  {getRoleDisplayName()}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}