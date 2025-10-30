import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

export function useLatestTelemetry(atmId) {
  const [telemetry, setTelemetry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (atmId) {
      fetchLatestTelemetry()
    }
  }, [atmId])

  async function fetchLatestTelemetry() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('telemetry')
        .select('*')
        .eq('atm_id', atmId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      setTelemetry(data)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching telemetry:', err)
    } finally {
      setLoading(false)
    }
  }

  return { telemetry, loading, error, refetch: fetchLatestTelemetry }
}

export function useRecentAlerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentAlerts()
  }, [])

  async function fetchRecentAlerts() {
    try {
      setLoading(true)
      
      // Get telemetry records with low health or errors
      const { data, error } = await supabase
        .from('telemetry')
        .select(`
          *,
          atms (atm_id, zone, address)
        `)
        .or('card_reader_health.lt.85,dispenser_health.lt.85,printer_health.lt.85,cash_percentage.lt.20')
        .order('timestamp', { ascending: false })
        .limit(10)

      if (error) throw error
      setAlerts(data || [])
    } catch (err) {
      console.error('Error fetching alerts:', err)
    } finally {
      setLoading(false)
    }
  }

  return { alerts, loading, refetch: fetchRecentAlerts }
}