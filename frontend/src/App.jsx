import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/common/Navbar'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import ATMDetail from './pages/ATMDetail'
import Engineers from './pages/Engineers'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Routes - All Authenticated Users */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <Dashboard />
                  </>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/atm/:id" 
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <ATMDetail />
                  </>
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Routes - Bank Admin and Engineer Only */}
            <Route 
              path="/engineers" 
              element={
                <ProtectedRoute allowedRoles={['bank_admin', 'engineer']}>
                  <>
                    <Navbar />
                    <Engineers />
                  </>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/map" 
              element={
                <ProtectedRoute allowedRoles={['bank_admin']}>
                  <>
                    <Navbar />
                    <Dashboard />
                  </>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute allowedRoles={['bank_admin']}>
                  <>
                    <Navbar />
                    <Dashboard />
                  </>
                </ProtectedRoute>
              } 
            />

            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App