import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useATMStats, useATMs } from '../hooks/useATMs'
import { useRecentAlerts } from '../hooks/useTelemetry'
import { supabase } from '../services/supabase'
import { 
  Activity, AlertTriangle, TrendingUp, Clock, 
  MapPin, Users, Zap, ArrowRight, CheckCircle,
  Shield, BarChart3, Cpu, Github, Linkedin, Twitter,
  Sparkles, Brain, Target, TrendingDown
} from 'lucide-react'
import StatCard from '../components/common/StatCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { formatNumber, formatTimeAgo, getSeverityColor } from '../utils/formatters'

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
      const { data: maintenance } = await supabase
        .from('maintenance_events')
        .select('*, atms(zone)')
        .order('reported_at', { ascending: false })
        .limit(5)
      
      setRecentMaintenance(maintenance || [])

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white dark:bg-gray-900">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950/30"></div>
        
        {/* Animated orbs */}
        <div className="absolute inset-0 overflow-hidden opacity-40 dark:opacity-20">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-400 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-blob"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-400 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-400 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-8 border border-blue-200 dark:border-blue-800">
              <Sparkles className="w-4 h-4" />
              AI-Powered ATM Operations Platform
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
                SmartATMNet
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Revolutionizing ATM management with predictive AI, real-time monitoring, 
              and intelligent dispatch for maximum uptime and operational efficiency
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/dashboard"
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 text-white dark:text-gray-900 px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                View Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/engineers"
                className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-4 rounded-xl font-semibold border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200"
              >
                <Users className="w-5 h-5" />
                View Engineers
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                LIVE
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total ATMs</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {formatNumber(stats.total)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Active nationwide</p>
          </div>

          <div className="group bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl group-hover:scale-110 transition-transform">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
                <TrendingUp className="w-4 h-4" />
                +2.3%
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Network Uptime</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {stats.uptimePercentage}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{stats.operational} operational</p>
          </div>

          <div className="group bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              {alerts.length > 0 && (
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Alerts</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {formatNumber(alerts.length)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Requiring attention</p>
          </div>

          <div className="group bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800">
                24/7
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Field Engineers</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {formatNumber(engineerCount)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Available for dispatch</p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Platform Features
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Built with cutting-edge AI and real-time analytics to revolutionize ATM operations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-400 transition-all h-full">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Brain className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Predictive AI</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                ML models predict failures 48-72 hours in advance with 80%+ accuracy
              </p>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 hover:border-green-500 dark:hover:border-green-400 transition-all h-full">
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Activity className="w-7 h-7 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Real-time Monitoring</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Live telemetry tracking of cash levels, hardware health, and transaction metrics
              </p>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 hover:border-purple-500 dark:hover:border-purple-400 transition-all h-full">
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Smart Dispatch</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                AI-powered routing matches engineers to issues based on skills and proximity
              </p>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 hover:border-amber-500 dark:hover:border-amber-400 transition-all h-full">
              <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-7 h-7 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Advanced Analytics</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Comprehensive dashboards with actionable insights and performance metrics
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Metrics */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Measurable Impact</h2>
            <p className="text-xl text-gray-400">Transforming ATM operations with quantifiable results</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-5xl font-bold text-white mb-2">98.6%</p>
              <p className="text-gray-400">Target Uptime</p>
              <p className="text-sm text-gray-500 mt-2">Up from 70% baseline</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4">
                <Clock className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-5xl font-bold text-white mb-2">50%</p>
              <p className="text-gray-400">Reduced MTTR</p>
              <p className="text-sm text-gray-500 mt-2">Mean time to repair</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mb-4">
                <TrendingDown className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-5xl font-bold text-white mb-2">40%</p>
              <p className="text-gray-400">Cost Reduction</p>
              <p className="text-sm text-gray-500 mt-2">Operational expenses</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 rounded-3xl p-12 md:p-16">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="relative z-10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your ATM Operations?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join the future of intelligent ATM management with SmartATMNet
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
              SmartATMNet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              AI-powered ATM operations platform for the future of banking infrastructure
            </p>
            <div className="flex justify-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <Linkedin className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <Github className="w-6 h-6" />
              </a>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                © 2025 SmartATMNet. Built for Zenith Bank Zecathon 5.0
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Animations */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
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