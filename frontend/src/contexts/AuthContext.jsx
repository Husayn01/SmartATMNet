import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active session
    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        await fetchUserProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        await fetchUserProfile(session.user.id)
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserProfile = async (userId) => {
    try {
      // Retry logic for newly created profiles (trigger may take a moment)
      let retries = 3
      let delay = 500 // Start with 500ms delay
      
      while (retries > 0) {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (!error && data) {
          setProfile(data)
          return
        }

        // If profile not found, wait and retry
        if (error?.code === 'PGRST116') {
          retries--
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, delay))
            delay *= 2 // Exponential backoff
            continue
          }
        }

        // If it's a different error, throw it
        if (error && error.code !== 'PGRST116') {
          throw error
        }
      }
      
      console.error('Profile not found after retries')
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const signUp = async (email, password, userData) => {
    try {
      // Sign up the user - trigger will auto-create profile
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.fullName,
            phone: userData.phone,
          }
        }
      })

      if (signUpError) throw signUpError

      // Note: Profile is automatically created by database trigger
      // The onAuthStateChange listener will fetch it automatically

      return { data: authData, error: null }
    } catch (error) {
      console.error('Error signing up:', error)
      return { data: null, error }
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Error signing in:', error)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
    role: profile?.role || null,
    isBankAdmin: profile?.role === 'bank_admin',
    isEngineer: profile?.role === 'engineer',
    isATMUser: profile?.role === 'atm_user',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}