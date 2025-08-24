// src/main.tsx
import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import AppRoutes from './routes/AppRoutes'
import './index.css'
import { Toaster } from 'react-hot-toast'
import { CsvProvider } from './context/CsvContext'

const MainApp = () => {
  const [darkMode, setDarkMode] = useState<boolean>(
    localStorage.getItem('theme') === 'dark'
  )

  const toggleDark = () => {
    setDarkMode(prev => {
      const newTheme = !prev
      localStorage.setItem('theme', newTheme ? 'dark' : 'light')
      document.documentElement.classList.toggle('dark', newTheme)
      return newTheme
    })
  }

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  return (
    <React.StrictMode>
      <Toaster position="top-right" />
      <CsvProvider>
        <AppRoutes darkMode={darkMode} toggleDark={toggleDark} />
      </CsvProvider>
    </React.StrictMode>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<MainApp />)
