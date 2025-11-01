import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../common/LoadingSpinner'

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, profile, loading } = useAuth()

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && profile) {
    if (!allowedRoles.includes(profile.role)) {
      // Redirect to appropriate page based on user's role
      if (profile.role === 'atm_user') {
        return <Navigate to="/report-issue" replace />
      } else if (profile.role === 'engineer') {
        return <Navigate to="/engineer/tasks" replace />
      } else {
        return <Navigate to="/dashboard" replace />
      }
    }
  }

  // User is authenticated and has required role
  return children
}