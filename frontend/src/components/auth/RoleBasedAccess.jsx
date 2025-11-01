import React from 'react'
import { useAuth } from '../../contexts/AuthContext'

export default function RoleBasedAccess({ allowedRoles = [], children, fallback = null }) {
  const { profile, isAuthenticated } = useAuth()

  // If not authenticated, don't show anything
  if (!isAuthenticated || !profile) {
    return fallback
  }

  // If no roles specified, show to all authenticated users
  if (allowedRoles.length === 0) {
    return children
  }

  // Check if user has one of the allowed roles
  if (allowedRoles.includes(profile.role)) {
    return children
  }

  // User doesn't have required role
  return fallback
}