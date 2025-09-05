import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Hooks
import { useMovieStore } from './store/movieStore'
import { useThemeStore } from './store/themeStore'

// Layout Components
import BottomNavigation from './components/layout/BottomNavigation'

// Screen Components
import HomeScreen from './screens/HomeScreen'
import CollectionScreen from './screens/CollectionScreen'
import SearchScreen from './screens/SearchScreen'
import SettingsScreen from './screens/SettingsScreen'
import MovieDetailModal from './components/modals/MovieDetailModal'

// Utils
import { initializeApp } from './utils/appInit'

function App() {
  const { isDarkMode, accentColor } = useThemeStore()
  const { selectedMovie, clearSelectedMovie } = useMovieStore()

  useEffect(() => {
    // Initialize app
    initializeApp()
    
    // Set theme class
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')
    }

    // Apply accent color as CSS custom properties
    const root = document.documentElement
    const accentColors = {
      golden: { 
        primary: '#fbbf24', 
        secondary: '#f59e0b',
        light: '#fef3c7',
        dark: '#92400e'
      },
      blue: { 
        primary: '#3b82f6', 
        secondary: '#2563eb',
        light: '#dbeafe',
        dark: '#1e40af'
      },
      green: { 
        primary: '#10b981', 
        secondary: '#059669',
        light: '#d1fae5',
        dark: '#065f46'
      },
      purple: { 
        primary: '#8b5cf6', 
        secondary: '#7c3aed',
        light: '#e9d5ff',
        dark: '#5b21b6'
      },
      pink: { 
        primary: '#ec4899', 
        secondary: '#db2777',
        light: '#fce7f3',
        dark: '#be185d'
      },
      red: { 
        primary: '#ef4444', 
        secondary: '#dc2626',
        light: '#fee2e2',
        dark: '#991b1b'
      }
    }

    const colors = accentColors[accentColor] || accentColors.golden
    root.style.setProperty('--accent-primary', colors.primary)
    root.style.setProperty('--accent-secondary', colors.secondary)
    root.style.setProperty('--accent-light', colors.light)
    root.style.setProperty('--accent-dark', colors.dark)
    
  }, [isDarkMode, accentColor])

  return (
    <div className="min-vh-100 bg-gray-50 dark:bg-cinema-950 text-cinema-900 dark:text-white overflow-x-hidden">
      {/* Main Content */}
      <main className="pb-20 pt-4">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/collection" element={<CollectionScreen />} />
            <Route path="/search" element={<SearchScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Movie Detail Modal */}
      <AnimatePresence>
        {selectedMovie && (
          <MovieDetailModal
            movie={selectedMovie}
            onClose={clearSelectedMovie}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
