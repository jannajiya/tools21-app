// src/components/Navbar.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import { FiSun, FiMoon } from 'react-icons/fi'

interface NavbarProps {
  darkMode: boolean
  toggleDark: () => void
}

const Navbar: React.FC<NavbarProps> = ({ darkMode, toggleDark }) => (
  <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 transition-colors duration-500 shadow-md px-6 py-4 flex justify-between items-center">
    <Link to="/" className="text-xl font-bold text-blue-700 dark:text-white">Bank2Tally</Link>

    <div className="flex items-center gap-6">
      {['/', '/Downloads', '/Support'].map((path, idx) => (
        <Link
          key={idx}
          to={path}
          className="text-gray-700 dark:text-gray-300 hover:underline transition-colors duration-300"
        >
          {path === '/' ? 'Tools' : path.slice(1).replace('-', ' ')}
        </Link>
      ))}

      <button
        onClick={toggleDark}
        aria-label="Toggle Dark Mode"
        className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-500"
      >
        {darkMode ? <FiSun className="text-yellow-400 text-xl" /> : <FiMoon className="text-gray-800 dark:text-gray-200 text-xl" />}
      </button>
    </div>
  </nav>
)

export default Navbar
