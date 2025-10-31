import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  Activity, AlertTriangle, TrendingUp, TrendingDown, Clock, 
  MapPin, DollarSign, Zap, CheckCircle, XCircle, 
  ArrowUpRight, Filter, Search, RefreshCw, Calendar
} from 'lucide-react'
import { useATMs, useATMStats } from '../hooks/useATMs'
import { useRecentAlerts } from '../hooks/useTelemetry'
import { supabase } from '../services/supabase'
import LoadingSpinner from '../components/common/LoadingSpinner'
import StatCard from '../components/common/StatCard'
import { formatNumber, formatPercentage, formatTimeAgo, formatCurrency, getSeverityColor } from '../utils/formatters'

export default function Dashboard() {
  const { stats, loading: statsLoading, refetch: refetchStats } = useATMStats()
  const { atms, loading: atmsLoading, refetch: refetchATMs } = useATMs()
  const { alerts, loading: alertsLoading, refetch: refetchAlerts } = useRecentAlerts()
  
  const [recentMaintenance, setRecentMaintenance] = useState([])
  const [transactions, setTransactions] = useState({ total: 0, successful: 0, failed: 0 })
  const [zoneStats, setZoneStats] = useState([])
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedZone, setSelectedZone] = useState('all')
  const [lastRefresh, setLastRefresh] = useState(new Date())

  useEffect(() => {
    fetchDashboardData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      handleRefresh()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch recent maintenance
      const { data: maintenanceData } = await supabase
        .from('maintenance_events')
        .select('*, atms(atm_id, zone, address)')
        .order('reported_at', { ascending: false })
        .limit(5)
      
      setRecentMaintenance(maintenanceData || [])

      // Fetch transaction stats
      const { data: transData, error: transError } = await supabase
        .from('transactions')
        .select('status')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      
      if (transData) {
        const successful = transData.filter(t => t.status === 'completed').length
        const failed = transData.filter(t => t.status === 'failed').length
        setTransactions({
          total: transData.length,
          successful,
          failed
        })
      }

      // Fetch zone statistics
      const { data: zoneData } = await supabase
        .from('atms')
        .select('zone, status')
      
      if (zoneData) {
        const zoneMap = {}
        zoneData.forEach(atm => {
          if (!zoneMap[atm.zone]) {
            zoneMap[atm.zone] = { total: 0, operational: 0, maintenance: 0, offline: 0 }
          }
          zoneMap[atm.zone].total++
          zoneMap[atm.zone][atm.status]++
        })
        
        const zoneArray = Object.entries(zoneMap).map(([zone, data]) => ({
          zone,
          ...data,
          uptime: ((data.operational / data.total) * 100).toFixed(1)
        })).sort((a, b) => b.uptime - a.uptime)
        
        setZoneStats(zoneArray)
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
    }
  }

  const handleRefresh = () => {
    refetchStats()
    refetchATMs()
    refetchAlerts()
    fetchDashboardData()
    setLastRefresh(new Date())
  }

  // Filter ATMs based on search and filters
  const filteredATMs = useMemo(() => {
    let filtered = atms

    if (filterStatus !== 'all') {
      filtered = filtered.filter(atm => atm.status === filterStatus)
    }

    if (selectedZone !== 'all') {
      filtered = filtered.filter(atm => atm.zone === selectedZone)
    }

    if (searchTerm) {
      filtered = filtered.filter(atm => 
        atm.atm_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        atm.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        atm.zone.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }, [atms, filterStatus, selectedZone, searchTerm])

  const getStatusIcon = (status) => {
    switch(status) {
      case 'operational': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'maintenance': return <Clock className="w-4 h-4 text-amber-500" />
      case 'offline': return <XCircle className="w-4 h-4 text-red-500" />
      default: return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      operational: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      maintenance: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
      offline: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
    }
    return styles[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
  }

  const zones = useMemo(() => ['all', ...new Set(atms.map(atm => atm.zone))], [atms])

  if (statsLoading || atmsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const successRate = transactions.total > 0 
    ? ((transactions.successful / transactions.total) * 100).toFixed(1) 
    : 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Operations Dashboard
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Real-time ATM network monitoring and analytics
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="hidden sm:inline">Last updated: </span>
                {formatTimeAgo(lastRefresh)}
              </div>
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-200 hover:scale-105"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400">
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium">Live</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total ATMs</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.total)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Across {zones.length - 1} zones</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium">+2.3%</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Network Uptime</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.uptimePercentage}%</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{stats.operational} operational</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
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
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatNumber(alerts.length)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Requiring attention</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400">
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium">+5.2%</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Success Rate (24h)</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{successRate}%</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{formatNumber(transactions.successful)} successful</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ATM List - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search ATMs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                </div>
                
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                >
                  {zones.map(zone => (
                    <option key={zone} value={zone}>
                      {zone === 'all' ? 'All Zones' : zone}
                    </option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                >
                  <option value="all">All Status</option>
                  <option value="operational">Operational</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="offline">Offline</option>
                </select>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Showing {filteredATMs.length} of {atms.length} ATMs
                </span>
              </div>
            </div>

            {/* ATM Grid */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="divide-y divide-gray-200 dark:divide-gray-800 max-h-[600px] overflow-y-auto">
                {filteredATMs.map((atm) => (
                  <Link
                    key={atm.atm_id}
                    to={`/atm/${atm.atm_id}`}
                    className="block p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(atm.status)}
                          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {atm.atm_id}
                          </h3>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(atm.status)}`}>
                            {atm.status}
                          </span>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{atm.address}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-medium text-gray-700 dark:text-gray-300">{atm.zone}</span>
                            <span>•</span>
                            <span>{atm.model}</span>
                            <span>•</span>
                            <span>{atm.location_type}</span>
                          </div>
                        </div>
                      </div>

                      <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Takes 1 column */}
          <div className="space-y-6">
            {/* Active Alerts */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Active Alerts</h2>
                <Link to="/alerts" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  View all
                </Link>
              </div>

              <div className="space-y-3">
                {alerts.slice(0, 5).map((alert, idx) => {
                  const severity = alert.card_reader_health < 50 || alert.dispenser_health < 50 ? 'critical' : 
                                 alert.cash_percentage < 15 ? 'high' : 'medium'
                  return (
                    <Link
                      key={idx}
                      to={`/atm/${alert.atm_id}`}
                      className="block p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 ${getSeverityColor(severity)}`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {alert.atms?.atm_id || alert.atm_id}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {alert.cash_percentage < 20 && `Low cash: ${alert.cash_percentage}%`}
                            {alert.card_reader_health < 85 && ` Card reader: ${alert.card_reader_health}%`}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {formatTimeAgo(new Date(alert.timestamp))}
                          </p>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Zone Performance */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Zone Performance</h2>
              
              <div className="space-y-4">
                {zoneStats.slice(0, 5).map((zone) => (
                  <div key={zone.zone}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{zone.zone}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{zone.uptime}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          zone.uptime >= 95 ? 'bg-green-500' : 
                          zone.uptime >= 85 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${zone.uptime}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-600 dark:text-gray-400">
                      <span>{zone.operational} operational</span>
                      <span>•</span>
                      <span>{zone.maintenance} maintenance</span>
                      {zone.offline > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-red-600 dark:text-red-400">{zone.offline} offline</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Maintenance */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Maintenance</h2>
                <Link to="/maintenance" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  View all
                </Link>
              </div>

              <div className="space-y-3">
                {recentMaintenance.map((event) => (
                  <div key={event.event_id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {event.atms?.atm_id || event.atm_id}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {event.issue_type}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {formatTimeAgo(new Date(event.reported_at))}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                        event.resolved_at 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                          : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                      }`}>
                        {event.resolved_at ? 'Resolved' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}