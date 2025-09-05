import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Moon, 
  Sun, 
  Palette, 
  Download, 
  Share2, 
  Trash2, 
  Info,
  Smartphone,
  Zap,
  Shield,
  Bell,
  Wifi,
  Database,
  ChevronRight,
  Check,
  X
} from 'lucide-react'

// Components
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'

// Store & Utils
import { useThemeStore } from '../store/themeStore'
import { useMovieStore } from '../store/movieStore'
import { deviceInfo, hapticFeedback } from '../utils/appInit'
import { networkUtils } from '../services/api'

const SettingsScreen = () => {
  const { isDarkMode, toggleDarkMode, accentColor, setAccentColor } = useThemeStore()
  const { movies, stats, clearError } = useMovieStore()
  
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [showConfirmClear, setShowConfirmClear] = useState(false)
  
  useEffect(() => {
    // Network status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // PWA install prompt
    const handleInstallPrompt = (e) => {
      setInstallPrompt(e.detail.prompt)
      setShowInstallPrompt(true)
    }
    
    const handleHideInstallPrompt = () => {
      setShowInstallPrompt(false)
    }
    
    window.addEventListener('show-install-prompt', handleInstallPrompt)
    window.addEventListener('hide-install-prompt', handleHideInstallPrompt)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('show-install-prompt', handleInstallPrompt)
      window.removeEventListener('hide-install-prompt', handleHideInstallPrompt)
    }
  }, [])
  
  const handleInstallApp = async () => {
    if (window.installPWA) {
      const installed = await window.installPWA()
      if (installed) {
        hapticFeedback.success()
        setShowInstallPrompt(false)
      }
    }
  }
  
  const handleExportData = async () => {
    setIsExporting(true)
    hapticFeedback.light()
    
    try {
      const exportData = {
        movies: movies,
        stats: stats,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `movie-collection-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      hapticFeedback.success()
    } catch (error) {
      console.error('Export error:', error)
      hapticFeedback.error()
    } finally {
      setIsExporting(false)
    }
  }
  
  const handleShareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Movie Collection',
          text: 'Gestisci la tua collezione di film con stile!',
          url: window.location.origin
        })
        hapticFeedback.success()
      } catch (error) {
        console.log('Share cancelled or failed')
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.origin)
      hapticFeedback.medium()
      // Show toast notification
      window.dispatchEvent(new CustomEvent('show-notification', {
        detail: { message: 'Link copiato negli appunti', type: 'success' }
      }))
    }
  }
  
  const handleClearData = () => {
    localStorage.clear()
    sessionStorage.clear()
    
    // Clear Zustand stores
    useMovieStore.persist.clearStorage()
    useThemeStore.persist.clearStorage()
    
    hapticFeedback.heavy()
    setShowConfirmClear(false)
    
    // Show success message
    window.dispatchEvent(new CustomEvent('show-notification', {
      detail: { message: 'Dati cancellati con successo', type: 'success' }
    }))
    
    // Reload page
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }
  
  const accentColors = [
    { name: 'Dorato', value: 'golden', color: '#fbbf24' },
    { name: 'Blu', value: 'blue', color: '#3b82f6' },
    { name: 'Verde', value: 'green', color: '#10b981' },
    { name: 'Viola', value: 'purple', color: '#8b5cf6' },
    { name: 'Rosa', value: 'pink', color: '#ec4899' },
    { name: 'Rosso', value: 'red', color: '#ef4444' }
  ]
  
  const deviceStats = {
    platform: deviceInfo.isIOS() ? 'iOS' : deviceInfo.isAndroid() ? 'Android' : 'Web',
    standalone: deviceInfo.isStandalone(),
    online: isOnline,
    storage: localStorage.length + ' elementi'
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50 dark:bg-cinema-950 px-4 py-6 space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="space-y-2"
      >
        <h1 className="text-2xl font-bold text-cinema-900 dark:text-white">Impostazioni</h1>
        <p className="text-gray-600 dark:text-cinema-400 text-sm">
          Personalizza la tua esperienza cinematografica
        </p>
      </motion.div>
      
      {/* Install App Card */}
      <AnimatePresence>
        {showInstallPrompt && !deviceInfo.isStandalone() && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
          >
            <Card variant="golden">
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-golden-500/20 rounded-full">
                    <Smartphone className="w-6 h-6 text-golden-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-cinema-900 dark:text-white font-semibold">
                      Installa l'App
                    </h3>
                    <p className="text-gray-600 dark:text-cinema-300 text-sm">
                      Accesso rapido e esperienza nativa
                    </p>
                  </div>
                  <Button size="sm" onClick={handleInstallApp}>
                    Installa
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Appearance */}
      <motion.section
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="w-5 h-5 text-golden-500" />
              <span>Aspetto</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Theme toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${isDarkMode ? 'bg-blue-500/20' : 'bg-yellow-500/20'}`}>
                  {isDarkMode ? (
                    <Moon className="w-4 h-4 text-blue-400" />
                  ) : (
                    <Sun className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
                <div>
                  <div className="text-cinema-900 dark:text-white font-medium">Tema scuro</div>
                  <div className="text-gray-600 dark:text-cinema-400 text-sm">
                    {isDarkMode ? 'Attivo' : 'Disattivo'}
                  </div>
                </div>
              </div>
              <motion.button
                onClick={() => {
                  toggleDarkMode()
                  hapticFeedback.light()
                }}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  isDarkMode ? 'bg-golden-500' : 'bg-cinema-700'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md"
                  animate={{ x: isDarkMode ? 26 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </motion.button>
            </div>
            
            {/* Accent color */}
            <div>
              <div className="text-cinema-900 dark:text-white font-medium mb-3">Colore principale</div>
              <div className="grid grid-cols-3 gap-2">
                {accentColors.map((color) => (
                  <motion.button
                    key={color.value}
                    onClick={() => {
                      setAccentColor(color.value)
                      hapticFeedback.light()
                    }}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      accentColor === color.value
                        ? 'border-cinema-900 dark:border-white bg-gray-100 dark:bg-white/10'
                        : 'border-transparent bg-gray-200 dark:bg-cinema-800/50 hover:bg-gray-300 dark:hover:bg-cinema-800'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: color.color }}
                      />
                      <span className="text-cinema-900 dark:text-white text-sm">{color.name}</span>
                      {accentColor === color.value && (
                        <Check className="w-4 h-4 text-golden-500 ml-auto" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.section>
      
      {/* Data & Storage */}
      <motion.section
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-golden-500" />
              <span>Dati e archiviazione</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Export data */}
            <motion.button
              onClick={handleExportData}
              disabled={isExporting}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-cinema-800/50 hover:bg-cinema-800 transition-colors"
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                <Download className="w-4 h-4 text-gray-500 dark:text-cinema-400" />
                <div className="text-left">
                  <div className="text-cinema-900 dark:text-white font-medium">Esporta collezione</div>
                  <div className="text-gray-500 dark:text-cinema-400 text-sm">
                    Salva i tuoi dati in formato JSON
                  </div>
                </div>
              </div>
              {isExporting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500 dark:text-cinema-400" />
              )}
            </motion.button>
            
            {/* Share app */}
            <motion.button
              onClick={handleShareApp}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-cinema-800/50 hover:bg-cinema-800 transition-colors"
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                <Share2 className="w-4 h-4 text-gray-500 dark:text-cinema-400" />
                <div className="text-left">
                  <div className="text-cinema-900 dark:text-white font-medium">Condividi app</div>
                  <div className="text-gray-500 dark:text-cinema-400 text-sm">
                    Invita amici a usare l'app
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-cinema-400" />
            </motion.button>
            
            {/* Clear data */}
            <motion.button
              onClick={() => setShowConfirmClear(true)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                <Trash2 className="w-4 h-4 text-red-400" />
                <div className="text-left">
                  <div className="text-red-400 font-medium">Cancella tutti i dati</div>
                  <div className="text-red-400/70 text-sm">
                    Rimuovi collezione e impostazioni
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-red-400" />
            </motion.button>
          </CardContent>
        </Card>
      </motion.section>
      
      {/* Device Info */}
      <motion.section
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="w-5 h-5 text-golden-500" />
              <span>Informazioni dispositivo</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(deviceStats).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-cinema-300 capitalize">
                  {key === 'platform' ? 'Piattaforma' :
                   key === 'standalone' ? 'App installata' :
                   key === 'online' ? 'Connessione' :
                   key === 'storage' ? 'Archiviazione' : key}
                </span>
                <span className="text-cinema-900 dark:text-white">
                  {typeof value === 'boolean' 
                    ? (value ? 'Sì' : 'No')
                    : value}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.section>
      
      {/* App Info */}
      <motion.section
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardContent className="text-center py-6">
            <div className="text-4xl mb-3">🎬</div>
            <h3 className="text-cinema-900 dark:text-white font-semibold mb-1">Movie Collection</h3>
            <p className="text-gray-500 dark:text-cinema-400 text-sm mb-3">Versione 1.0.0</p>
            <p className="text-gray-500 dark:text-cinema-400 text-xs">
              Creato con ❤️ per gli amanti del cinema
            </p>
          </CardContent>
        </Card>
      </motion.section>
      
      {/* Confirm Clear Data Modal */}
      <AnimatePresence>
        {showConfirmClear && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowConfirmClear(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm"
            >
              <Card variant="solid">
                <CardHeader>
                  <CardTitle className="text-center text-red-400">
                    Conferma cancellazione
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-4xl mb-4">⚠️</div>
                  <p className="text-gray-600 dark:text-cinema-300 mb-4">
                    Questa azione cancellerà tutti i tuoi dati inclusa la collezione di film e le impostazioni.
                  </p>
                  <p className="text-red-400 text-sm font-medium">
                    Questa operazione non può essere annullata.
                  </p>
                </CardContent>
                <CardFooter className="flex space-x-3">
                  <Button
                    variant="ghost"
                    fullWidth
                    onClick={() => setShowConfirmClear(false)}
                    leftIcon={<X size={16} />}
                  >
                    Annulla
                  </Button>
                  <Button
                    variant="danger"
                    fullWidth
                    onClick={handleClearData}
                    leftIcon={<Trash2 size={16} />}
                  >
                    Cancella tutto
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Bottom spacing */}
      <div className="h-20" />
    </motion.div>
  )
}

export default SettingsScreen
