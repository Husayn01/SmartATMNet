import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import Navbar from './components/common/Navbar'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import ATMDetail from './pages/ATMDetail'
import Engineers from './pages/Engineers'

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/atm/:id" element={<ATMDetail />} />
          <Route path="/engineers" element={<Engineers />} />
          <Route path="/map" element={<Dashboard />} />
          <Route path="/analytics" element={<Dashboard />} />
        </Routes>
      </div>
    </ThemeProvider>
  )
}

export default App