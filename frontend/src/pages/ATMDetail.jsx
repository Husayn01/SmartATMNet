import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Activity, MapPin, Calendar, Thermometer, Wifi, 
  HardDrive, CreditCard, Printer, AlertTriangle, CheckCircle,
  Clock, DollarSign, TrendingUp, TrendingDown, Zap, Info,
  Wrench, Package, User
} from 'lucide-react'
import { supabase } from '../services/supabase'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { formatNumber, formatCurrency, formatTimeAgo, formatDate } from '../utils/formatters'

export default function ATMDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [atm, setAtm] = useState(null)
  const [telemetry, setTelemetry] = useState([])
  const [maintenance, setMaintenance] = useState([])
  const [transactions, setTransactions] = useState([])
  const [cashRecords, setCashRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (id) {
      fetchATMData()
    }
  }, [id])

  const fetchATMData = async () => {
    try {
      setLoading(true)

      // Fetch ATM details
      const { data: atmData, error: atmError } = await supabase
        .from('atms')
        .select('*')
        .eq('atm_id', id)
        .single()

      if (atmError) throw atmError
      setAtm(atmData)

      // Fetch latest telemetry
      const { data: telemetryData } = await supabase
        .from('telemetry')
        .select('*')
        .eq('atm_id', id)
        .order('timestamp', { ascending: false })
        .limit(20)

      setTelemetry(telemetryData || [])

      // Fetch maintenance history
      const { data: maintenanceData } = await supabase
        .from('maintenance_events')
        .select('*, engineers(name, phone)')
        .eq('atm_id', id)
        .order('reported_at', { ascending: false })
        .limit(10)

      setMaintenance(maintenanceData || [])

      // Fetch recent transactions
      const { data: transData } = await supabase
        .from('transactions')
        .select('*')
        .eq('atm_id', id)
        .order('timestamp', { ascending: false })
        .limit(50)

      setTransactions(transData || [])

      // Fetch cash records
      const { data: cashData } = await supabase
        .from('cash_records')
        .select('*')
        .eq('atm_id', id)
        .order('date', { ascending: false })
        .limit(7)

      setCashRecords(cashData || [])

    } catch (err) {
      console.error('Error fetching ATM data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!atm) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">ATM not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const latestTelemetry = telemetry[0]
  const getStatusColor = (status) => {
    switch(status) {
      case 'operational': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
      case 'maintenance': return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30'
      case 'offline': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'
    }
  }

  const getHealthColor = (health) => {
    if (health >= 90) return 'text-green-600 dark:text-green-400'
    if (health >= 70) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getHealthBg = (health) => {
    if (health >= 90) return 'bg-green-500'
    if (health >= 70) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const successfulTransactions = transactions.filter(t => t.status === 'completed').length
  const successRate = transactions.length > 0 ? (successfulTransactions / transactions.length * 100).toFixed(1) : 0

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'telemetry', label: 'Telemetry' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'transactions', label: 'Transactions' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {atm.atm_id}
                </h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(atm.status)}`}>
                  {atm.status}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{atm.address}</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <span className="text-sm">{atm.zone}</span>
                <span className="hidden sm:inline">•</span>
                <span className="text-sm">{atm.model}</span>
              </div>
            </div>

            {latestTelemetry && latestTelemetry.cash_percentage < 25 && (
              <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-200">Low Cash Alert</p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    Cash level at {latestTelemetry.cash_percentage}% - Replenishment recommended
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="mt-6 border-b border-gray-200 dark:border-gray-800">
            <nav className="flex gap-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    pb-3 px-1 text-sm font-medium transition-colors relative
                    ${activeTab === tab.id
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && latestTelemetry && (
          <div className="space-y-6">
            {/* Hardware Health */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Hardware Health</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Card Reader</span>
                    </div>
                    <span className={`text-lg font-bold ${getHealthColor(latestTelemetry.card_reader_health)}`}>
                      {latestTelemetry.card_reader_health}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full transition-all ${getHealthBg(latestTelemetry.card_reader_health)}`}
                      style={{ width: `${latestTelemetry.card_reader_health}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dispenser</span>
                    </div>
                    <span className={`text-lg font-bold ${getHealthColor(latestTelemetry.dispenser_health)}`}>
                      {latestTelemetry.dispenser_health}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full transition-all ${getHealthBg(latestTelemetry.dispenser_health)}`}
                      style={{ width: `${latestTelemetry.dispenser_health}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Printer className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Printer</span>
                    </div>
                    <span className={`text-lg font-bold ${getHealthColor(latestTelemetry.printer_health)}`}>
                      {latestTelemetry.printer_health}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full transition-all ${getHealthBg(latestTelemetry.printer_health)}`}
                      style={{ width: `${latestTelemetry.printer_health}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Cash Level</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {latestTelemetry.cash_percentage}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {formatCurrency(latestTelemetry.cash_level)} available
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {successRate}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {successfulTransactions} of {transactions.length} successful
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Wifi className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Network</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {latestTelemetry.network_latency_ms}ms
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {atm.network_type} connection
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <Thermometer className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Temperature</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {latestTelemetry.temperature_c}°C
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {latestTelemetry.temperature_c > 30 ? 'Elevated' : 'Normal'}
                </p>
              </div>
            </div>

            {/* ATM Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">ATM Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Model</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{atm.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Location Type</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{atm.location_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Install Date</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(atm.install_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Cash Capacity</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(atm.cash_capacity)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Power Backup</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{atm.power_backup ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Surveillance</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{atm.surveillance ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Transactions (1h)</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{latestTelemetry.transactions_last_hour} transactions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Uptime Status</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{latestTelemetry.uptime_status}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Last Maintenance</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{formatTimeAgo(new Date(atm.last_maintenance))}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Telemetry Tab */}
        {activeTab === 'telemetry' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cash %</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Card Reader</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dispenser</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Printer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Temp (°C)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {telemetry.map((record, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatTimeAgo(new Date(record.timestamp))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${record.cash_percentage < 20 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                          {record.cash_percentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getHealthColor(record.card_reader_health)}`}>
                          {record.card_reader_health}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getHealthColor(record.dispenser_health)}`}>
                          {record.dispenser_health}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getHealthColor(record.printer_health)}`}>
                          {record.printer_health}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {record.temperature_c}°C
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {record.uptime_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Maintenance Tab */}
        {activeTab === 'maintenance' && (
          <div className="space-y-4">
            {maintenance.map((event) => (
              <div key={event.event_id} className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Wrench className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{event.issue_type}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{event.description}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    event.resolved_at 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                  }`}>
                    {event.resolved_at ? 'Resolved' : 'Pending'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">Severity</p>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">{event.severity}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">Reported</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatTimeAgo(new Date(event.reported_at))}</p>
                  </div>
                  {event.resolved_at && (
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">Resolution Time</p>
                      <p className="font-medium text-gray-900 dark:text-white">{event.resolution_time_minutes} min</p>
                    </div>
                  )}
                  {event.engineers && (
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">Engineer</p>
                      <p className="font-medium text-gray-900 dark:text-white">{event.engineers.name}</p>
                    </div>
                  )}
                </div>

                {event.parts_replaced && event.parts_replaced.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Parts Replaced:</p>
                    <div className="flex flex-wrap gap-2">
                      {event.parts_replaced.map((part, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs">
                          {part}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {event.cost_naira && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Cost: <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(event.cost_naira)}</span>
                    </p>
                  </div>
                )}
              </div>
            ))}

            {maintenance.length === 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl p-12 border border-gray-200 dark:border-gray-800 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No maintenance history</p>
              </div>
            )}
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {transactions.slice(0, 30).map((tx, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatTimeAgo(new Date(tx.timestamp))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {tx.transaction_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(tx.amount_naira)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tx.status === 'completed' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {tx.duration_seconds}s
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}