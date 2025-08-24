// src/routes/AppRoutes.tsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import CsvParser from '../pages/CsvParser'
import Mapping from '../pages/CustomMapping'
import Support from '../pages/Support'
import Navbar from '../components/Navbar'
import GSTR2A from '../pages/GSTR2A'

export interface AppRoutesProps {
  darkMode: boolean
  toggleDark: () => void
}

const AppRoutes = ({ darkMode, toggleDark }: AppRoutesProps) => {
  return (
    <Router>
      <Navbar darkMode={darkMode} toggleDark={toggleDark} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/csv-parser" element={<CsvParser />} />
        <Route path="/mapping" element={<Mapping />} />
        <Route path="/support" element={<Support />} />
        <Route path="/gstr2a" element={<GSTR2A />} /> {/* New GSTR-2A page */}
      </Routes>
    </Router>
  )
}

export default AppRoutes
