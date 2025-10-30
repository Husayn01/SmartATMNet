import React from 'react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useATMStats, useATMs } from '../hooks/useATMs'
import { useRecentAlerts } from '../hooks/useTelemetry'
import { supabase } from '../services/supabase'
import { 
  Activity, AlertTriangle, TrendingUp, Clock, 
  MapPin, Users, Zap, ArrowRight, CheckCircle,
  Shield, BarChart3, Cpu, Mail, Phone, Globe,
  Github, Linkedin, Twitter
} from 'lucide-react'
import StatCard from '../components/common/StatCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { formatNumber, formatPercentage, formatTimeAgo, getSeverityColor } from '../utils/formatters'

export default function Landing() {
  const { stats, loading: statsLoading } = useATMStats()
  const { atms, loading: atmsLoading } = useATMs()
  const { alerts, loading: alertsLoading } = useRecentAlerts()
  const [recentMaintenance, setRecentMaintenance] = useState([])
  const [engineerCount, setEngineerCount] = useState(0)

  useEffect(() => {
    fetchAdditionalData()
  }, [])

  async function fetchAdditionalData() {
    try {
      // Get recent maintenance events
      const { data: maintenance } = await supabase
        .from('maintenance_events')
        .select('*, atms(zone)')
        .order('reported_at', { ascending: false })
        .limit(5)
      
      setRecentMaintenance(maintenance || [])

      // Get engineer count
      const { count } = await supabase
        .from('engineers')
        .select('*', { count: 'exact', head: true })
      
      setEngineerCount(count || 0)
    } catch (err) {
      console.error('Error fetching additional data:', err)
    }
  }

  if (statsLoading || atmsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Minimalistic */}
      <div className="relative overflow-hidden bg-white">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 opacity-60"></div>
        
        {/* Subtle animated orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-1/2 w-80 h-80 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8 border border-blue-100">
              <Zap className="w-4 h-4" />
              AI-Powered ATM Management
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              SmartATMNet
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Intelligent ATM Operations Platform for Enhanced Uptime, 
              Predictive Maintenance & Optimized Engineer Dispatch
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/dashboard"
                className="group inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-all duration-200"
              >
                View Dashboard
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/map"
                className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-all duration-200"
              >
                <MapPin className="w-4 h-4" />
                View ATM Map
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview - Clean Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                LIVE
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total ATMs</p>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.total)}</p>
            <p className="text-xs text-gray-500 mt-2">Active nationwide</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-xs font-medium text-green-600">
                +2.3%
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Network Uptime</p>
            <p className="text-2xl font-bold text-gray-900">{stats.uptimePercentage}%</p>
            <p className="text-xs text-gray-500 mt-2">{stats.operational} operational</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-amber-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              {alerts.length > 0 && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-1">Active Alerts</p>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(alerts.length)}</p>
            <p className="text-xs text-gray-500 mt-2">Requiring attention</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded">
                24/7
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Field Engineers</p>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(engineerCount)}</p>
            <p className="text-xs text-gray-500 mt-2">Available for dispatch</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Alerts - Clean Design */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Recent Alerts
              </h2>
              <Link to="/dashboard" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View all →
              </Link>
            </div>

            {alertsLoading ? (
              <LoadingSpinner />
            ) : alerts.length === 0 ? (
              <div className="text-center py-8 bg-green-50 rounded-lg">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <p className="text-gray-700 font-medium">All systems operational</p>
                <p className="text-sm text-gray-500 mt-1">No active alerts at this time</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-amber-500"></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{alert.atms?.atm_id}</span>
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                          {alert.atms?.zone}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        {alert.cash_percentage < 20 && (
                          <div className="flex items-center gap-2">
                            <span className="w-1 h-1 bg-orange-400 rounded-full"></span>
                            <span>Low cash: {alert.cash_percentage}%</span>
                          </div>
                        )}
                        {alert.card_reader_health < 85 && (
                          <div className="flex items-center gap-2">
                            <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                            <span>Card reader health: {alert.card_reader_health}%</span>
                          </div>
                        )}
                        {alert.dispenser_health < 85 && (
                          <div className="flex items-center gap-2">
                            <span className="w-1 h-1 bg-yellow-400 rounded-full"></span>
                            <span>Dispenser health: {alert.dispenser_health}%</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 mt-2 block">
                        {formatTimeAgo(alert.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Maintenance - Clean Design */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Recent Activity
              </h2>
            </div>

            <div className="space-y-4">
              {recentMaintenance.map((event) => (
                <div key={event.event_id} className="border-l-2 border-gray-200 pl-4 hover:border-blue-300 transition-colors">
                  <div className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-1 ${
                    event.severity === 'critical' ? 'bg-red-100 text-red-700' :
                    event.severity === 'major' ? 'bg-orange-100 text-orange-700' :
                    event.severity === 'minor' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {event.severity}
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {event.atm_id}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {event.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {formatTimeAgo(event.reported_at)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Grid - Minimalistic */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-300">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Predictive Maintenance</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              AI-powered predictions identify potential failures 24-72 hours in advance, preventing downtime.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-300">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Dispatch</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Optimal engineer routing based on skills, proximity, and availability for 42% faster response times.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-300">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Monitoring</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Live telemetry from all ATMs with instant alerts for critical issues and performance degradation.
            </p>
          </div>
        </div>

        {/* Additional Features Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose SmartATMNet?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform combines cutting-edge technology with intuitive design 
              to deliver unmatched ATM network management capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure & Reliable</h3>
              <p className="text-sm text-gray-600">
                Enterprise-grade security with 99.9% uptime guarantee
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
              <p className="text-sm text-gray-600">
                Deep insights with predictive analytics and reporting
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Cpu className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI-Powered</h3>
              <p className="text-sm text-gray-600">
                Machine learning algorithms for smart decision making
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-sm text-gray-600">
                Round-the-clock expert support and monitoring
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">SmartATMNet</h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Leading the future of ATM network management with intelligent solutions 
                that maximize uptime and operational efficiency.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/map" className="text-gray-600 hover:text-blue-600 transition-colors">
                    ATM Map
                  </Link>
                </li>
                <li>
                  <Link to="/analytics" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Analytics
                  </Link>
                </li>
                <li>
                  <Link to="/support" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Support
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Contact Us</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:support@smartatmnet.com" className="hover:text-blue-600 transition-colors">
                    support@smartatmnet.com
                  </a>
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <Globe className="w-4 h-4" />
                  <a href="#" className="hover:text-blue-600 transition-colors">
                    www.smartatmnet.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-600">
                © 2024 SmartATMNet. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Add subtle blob animation */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}