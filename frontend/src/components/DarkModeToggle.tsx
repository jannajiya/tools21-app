// src/components/DarkModeToggle.tsx
import { useEffect, useState } from 'react'
import { FiMoon, FiSun } from 'react-icons/fi'

export default function DarkModeToggle() {
  const [dark, setDark] = useState<boolean>(
    () => localStorage.getItem('theme') === 'dark'
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <button onClick={() => setDark(!dark)} className="text-xl">
      {dark ? <FiSun /> : <FiMoon />}
    </button>
  )
}