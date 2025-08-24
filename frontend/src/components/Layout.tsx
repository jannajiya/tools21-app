// src/components/Layout.tsx
import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

interface LayoutProps {
  children: React.ReactNode
  darkMode: boolean
  toggleDark: () => void
}

export default function Layout({ children, darkMode, toggleDark }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-all duration-300">
      <Navbar toggleDark={toggleDark} darkMode={darkMode} />
      <main className="flex-grow px-6 sm:px-10 py-6">{children}</main>
      <Footer />
    </div>
  )
}
