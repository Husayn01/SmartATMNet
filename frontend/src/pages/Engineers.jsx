import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, Search, Filter, Phone, Mail, MapPin, 
  CheckCircle, Clock, TrendingUp, Award, Briefcase,
  Star, Activity, AlertCircle, Calendar, Navigation
} from 'lucide-react'
import { supabase } from '../services/supabase'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { formatNumber, formatTimeAgo } from '../utils/formatters'

export default function Engineers() {
  const [engineers, setEngineers] = useState([])
  const [dispatches, setDispatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterZone, setFilterZone] = useState('all')
  const [filterAvailability, setFilterAvailability] = useState('all')
  const [selectedEngineer, setSelectedEngineer] = useState(null)

  useEffect(() => {
    fetchEngineersData()
  }, [])

  const fetchEngineersData = async () => {
    try {
      setLoading(true)

      // Fetch engineers
      const { data: engineersData, error: engineersError } = await supabase
        .from('engineers')
        .select('*')
        .order('name')

      if (engineersError) throw engineersError
      setEngineers(engineersData || [])

      // Fetch recent dispatches
      const { data: dispatchData } = await supabase
        .from('dispatch_logs')
        .select(`
          *,
          atms(atm_id, zone, address),
          engineers(name, phone)
        `)
        .order('reported_at', { ascending: false })
        .limit(20)

      setDispatches(dispatchData || [])
    } catch (err) {
      console.error('Error fetching engineers data:', err)
    } finally {
      setLoading(false)
    }
  }

  const zones = useMemo(() => ['all', ...new Set(engineers.map(e => e.zone))], [engineers])

  const filteredEngineers = useMemo(() => {
    let filtered = engineers

    if (searchTerm) {
      filtered = filtered.filter(engineer =>
        engineer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        engineer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        engineer.phone?.includes(searchTerm)
      )
    }

    if (filterZone !== 'all') {
      filtered = filtered.filter(e => e.zone === filterZone)
    }

    if (filterAvailability !== 'all') {
      filtered = filtered.filter(e => e.availability === filterAvailability)
    }

    return filtered
  }, [engineers, searchTerm, filterZone, filterAvailability])

  const getAvailabilityColor = (availability) => {
    switch(availability) {
      case 'available': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
      case 'on_call': return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30'
      case 'busy': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'
    }
  }

  const getLevelColor = (level) => {
    switch(level) {
      case 'senior': return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30'
      case 'mid': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30'
      case 'junior': return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'
    }
  }

  const getDispatchStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
      case 'in_progress': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30'
      case 'dispatched': return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30'
      case 'pending': return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'
    }
  }

  // Calculate stats
  const stats = useMemo(() => {
    const available = engineers.filter(e => e.availability === 'available').length
    const onCall = engineers.filter(e => e.availability === 'on_call').length
    const avgSuccessRate = engineers.length > 0 
      ? (engineers.reduce((sum, e) => sum + (e.success_rate || 0), 0) / engineers.length).toFixed(1)
      : 0
    const avgResolutionTime = engineers.length > 0
      ? Math.round(engineers.reduce((sum, e) => sum + (e.avg_resolution_time_minutes || 0), 0) / engineers.length)
      : 0

    return { available, onCall, avgSuccessRate, avgResolutionTime }
  }, [engineers])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Field Engineers
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Manage and track field engineer assignments and performance
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Engineers</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{engineers.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Active field staff</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                {((stats.available / engineers.length) * 100).toFixed(0)}%
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Available</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.available}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{stats.onCall} on call</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Success Rate</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.avgSuccessRate}%</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Network average</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Resolution Time</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.avgResolutionTime}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">minutes</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Engineers List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search engineers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <select
                  value={filterZone}
                  onChange={(e) => setFilterZone(e.target.value)}
                  className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {zones.map(zone => (
                    <option key={zone} value={zone}>
                      {zone === 'all' ? 'All Zones' : zone}
                    </option>
                  ))}
                </select>

                <select
                  value={filterAvailability}
                  onChange={(e) => setFilterAvailability(e.target.value)}
                  className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="on_call">On Call</option>
                  <option value="busy">Busy</option>
                </select>
              </div>

              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredEngineers.length} of {engineers.length} engineers
              </div>
            </div>

            {/* Engineers Grid */}
            <div className="grid grid-cols-1 gap-4">
              {filteredEngineers.map((engineer) => (
                <div
                  key={engineer.engineer_id}
                  onClick={() => setSelectedEngineer(engineer)}
                  className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {engineer.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {engineer.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getLevelColor(engineer.level)}`}>
                            {engineer.level}
                          </span>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(engineer.availability)}`}>
                            {engineer.availability?.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.round((engineer.success_rate || 0) / 20) ? 'fill-current' : ''}`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {engineer.success_rate}% success
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Experience</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {engineer.years_experience} years
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Avg Time</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {engineer.avg_resolution_time_minutes} min
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Completed</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {engineer.assignments_completed}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Workload</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {engineer.current_workload} active
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      <span>{engineer.zone}</span>
                    </div>
                    {engineer.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4" />
                        <span>{engineer.phone}</span>
                      </div>
                    )}
                  </div>

                  {engineer.skills && engineer.skills.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {engineer.skills.slice(0, 4).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                        {engineer.skills.length > 4 && (
                          <span className="px-2 py-1 text-gray-600 dark:text-gray-400 text-xs">
                            +{engineer.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Dispatches */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Dispatches</h2>
                <Activity className="w-5 h-5 text-gray-400" />
              </div>

              <div className="space-y-3">
                {dispatches.slice(0, 8).map((dispatch) => (
                  <div key={dispatch.dispatch_id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {dispatch.engineers?.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {dispatch.atms?.atm_id} • {dispatch.issue_type}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getDispatchStatusColor(dispatch.status)}`}>
                        {dispatch.status?.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                      <span>{formatTimeAgo(new Date(dispatch.reported_at))}</span>
                      {dispatch.distance_km && (
                        <>
                          <span>•</span>
                          <span>{dispatch.distance_km}km</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Engineer Detail */}
            {selectedEngineer && (
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Engineer Details</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {selectedEngineer.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{selectedEngineer.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{selectedEngineer.level}</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                    {selectedEngineer.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-white">{selectedEngineer.phone}</span>
                      </div>
                    )}
                    {selectedEngineer.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-white">{selectedEngineer.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">{selectedEngineer.zone}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Success Rate</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedEngineer.success_rate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Avg Time</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedEngineer.avg_resolution_time_minutes}m</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Completed</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedEngineer.assignments_completed}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Experience</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedEngineer.years_experience}y</p>
                    </div>
                  </div>

                  {selectedEngineer.skills && selectedEngineer.skills.length > 0 && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">All Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedEngineer.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedEngineer(null)}
                    className="w-full mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}