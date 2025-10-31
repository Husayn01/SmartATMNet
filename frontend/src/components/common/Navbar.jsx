import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Activity, Moon, Sun, Menu, X, LayoutDashboard, MapPin, Users, BarChart3 } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    // { to: '/map', label: 'Map', icon: MapPin },
    { to: '/engineers', label: 'Engineers', icon: Users },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white/80 dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                SmartATMNet
              </span>
              <p className="text-xs text-gray-600 dark:text-gray-400 -mt-1">AI-Powered ATM Management</p>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              const active = isActive(link.to)
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`
                    group relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                    ${active
                      ? 'text-white dark:text-gray-900'
                      : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                >
                  {active && (
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 rounded-lg"></div>
                  )}
                  <Icon className={`w-4 h-4 relative z-10 ${active ? '' : 'group-hover:scale-110 transition-transform'}`} />
                  <span className="relative z-10">{link.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Theme Toggle & Mobile Menu */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-gray-200 dark:border-gray-800">
            {navLinks.map((link) => {
              const Icon = link.icon
              const active = isActive(link.to)
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200
                    ${active
                      ? 'bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 text-white dark:text-gray-900'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </nav>
  )
}