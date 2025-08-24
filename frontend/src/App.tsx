import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import CsvParser from './pages/CsvParser'
import CustomMapping from './pages/CustomMapping'
import Support from './pages/Support'
import GSTR2A from './pages/GSTR2A';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark'
  })

  const toggleDark = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('theme', newMode ? 'dark' : 'light')
  }

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  return (
    <Router>
      <Layout darkMode={darkMode} toggleDark={toggleDark}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/csv-parser" element={<CsvParser />} />
          <Route path="/custom-mapping" element={<CustomMapping />} />
          <Route path="/gstr2a" element={<GSTR2A />} /> {/* New GSTR-2A page */}
          <Route path="/support" element={<Support />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App