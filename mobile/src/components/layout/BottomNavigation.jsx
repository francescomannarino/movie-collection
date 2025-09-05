import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Grid3X3, Search, Settings, Plus } from 'lucide-react'
import { hapticFeedback } from '../../utils/appInit'

const BottomNavigation = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const tabs = [
    {
      id: 'home',
      path: '/home',
      icon: Home,
      label: 'Home',
      badge: null
    },
    {
      id: 'collection',
      path: '/collection',
      icon: Grid3X3,
      label: 'Collezione',
      badge: null
    },
    {
      id: 'search',
      path: '/search',
      icon: Search,
      label: 'Cerca',
      badge: null
    },
    {
      id: 'settings',
      path: '/settings',
      icon: Settings,
      label: 'Impostazioni',
      badge: null
    }
  ]

  const handleTabPress = (tab) => {
    if (location.pathname === tab.path) {
      // Double tap on same tab - scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' })
      hapticFeedback.light()
    } else {
      // Navigate to new tab
      navigate(tab.path)
      hapticFeedback.medium()
    }
  }

  const handleFABPress = () => {
    navigate('/search')
    hapticFeedback.heavy()
  }

  return (
    <>
      {/* Bottom Navigation Bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-40 safe-bottom"
      >
        {/* Blur backdrop */}
        <div className="absolute inset-0 bg-cinema-900/80 backdrop-blur-xl border-t border-white/10" />
        
        {/* Navigation content */}
        <div className="relative flex items-center justify-around px-2 py-2">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path
            const IconComponent = tab.icon

            return (
              <motion.button
                key={tab.id}
                onClick={() => handleTabPress(tab)}
                className="tab-item relative touch-target"
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.1 }}
              >
                {/* Active indicator */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-1 left-1/2 w-1 h-1 bg-golden-500 rounded-full transform -translate-x-1/2"
                    />
                  )}
                </AnimatePresence>

                {/* Icon container */}
                <motion.div
                  className={`tab-icon p-2 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-golden-500/20 text-golden-500' 
                      : 'text-cinema-400 hover:text-white hover:bg-white/5'
                  }`}
                  animate={{ 
                    scale: isActive ? 1.1 : 1,
                    y: isActive ? -2 : 0
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <IconComponent size={20} strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>

                {/* Label */}
                <span className={`text-xs font-medium mt-1 transition-colors duration-200 ${
                  isActive ? 'text-golden-500' : 'text-cinema-400'
                }`}>
                  {tab.label}
                </span>

                {/* Badge */}
                <AnimatePresence>
                  {tab.badge && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                    >
                      {tab.badge}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* Floating Action Button */}
      <AnimatePresence>
        {location.pathname !== '/search' && (
          <motion.button
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleFABPress}
            className="fab shadow-glow-golden"
            transition={{ 
              type: "spring", 
              stiffness: 500, 
              damping: 30 
            }}
          >
            <Plus size={24} strokeWidth={3} />
            
            {/* Ripple effect */}
            <motion.div
              className="absolute inset-0 rounded-full bg-golden-300/30"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ 
                duration: 0.6,
                repeat: Infinity,
                repeatDelay: 1.5
              }}
            />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}

export default BottomNavigation
