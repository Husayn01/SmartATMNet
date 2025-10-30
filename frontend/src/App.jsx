import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/common/Navbar'
import Landing from './pages/Landing'
// import Dashboard from './pages/Dashboard'
// import ATMDetail from './pages/ATMDetail'
// import Engineers from './pages/Engineers'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        {/* <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/atm/:id" element={<ATMDetail />} />
        <Route path="/engineers" element={<Engineers />} />
        <Route path="/map" element={<Dashboard />} /> */}
      </Routes>
    </div>
  )
}

export default App