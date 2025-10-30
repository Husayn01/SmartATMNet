import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

export function useATMs() {
  const [atms, setAtms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchATMs()
  }, [])

  async function fetchATMs() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('atms')
        .select('*')
        .order('atm_id')

      if (error) throw error
      setAtms(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching ATMs:', err)
    } finally {
      setLoading(false)
    }
  }

  return { atms, loading, error, refetch: fetchATMs }
}

export function useATMStats() {
  const [stats, setStats] = useState({
    total: 0,
    operational: 0,
    maintenance: 0,
    offline: 0,
    uptimePercentage: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      setLoading(true)
      
      // Get total count
      const { count: total } = await supabase
        .from('atms')
        .select('*', { count: 'exact', head: true })

      // Get operational count
      const { count: operational } = await supabase
        .from('atms')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'operational')

      // Get maintenance count
      const { count: maintenance } = await supabase
        .from('atms')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'maintenance')

      // Get offline count
      const { count: offline } = await supabase
        .from('atms')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'offline')

      const uptimePercentage = total > 0 ? ((operational / total) * 100) : 0

      setStats({
        total: total || 0,
        operational: operational || 0,
        maintenance: maintenance || 0,
        offline: offline || 0,
        uptimePercentage: uptimePercentage.toFixed(1)
      })
    } catch (err) {
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
    }
  }

  return { stats, loading, refetch: fetchStats }
}