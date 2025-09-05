import { useThemeStore } from '../store/themeStore'
import { networkUtils } from '../services/api'

// Initialize app on startup
export const initializeApp = () => {
  console.log('🚀 Inizializzazione Movie Collection Mobile App')
  
  // Initialize theme
  useThemeStore.getState().initializeTheme()
  
  // Setup network monitoring
  setupNetworkMonitoring()
  
  // Setup viewport handlers
  setupViewportHandlers()
  
  // Setup gesture handlers
  setupGestureHandlers()
  
  // Setup performance monitoring
  setupPerformanceMonitoring()
  
  // Setup PWA install prompt
  setupPWAPrompt()
  
  console.log('✅ App inizializzata con successo')
}

// Network monitoring
const setupNetworkMonitoring = () => {
  const handleOnline = () => {
    console.log('🌐 Connessione ripristinata')
    document.body.classList.remove('offline')
    
    // Show online notification
    showNotification('Connessione ripristinata', 'success')
  }
  
  const handleOffline = () => {
    console.log('📴 Connessione persa')
    document.body.classList.add('offline')
    
    // Show offline notification
    showNotification('Modalità offline', 'warning')
  }
  
  // Initial check
  if (!networkUtils.isOnline()) {
    handleOffline()
  }
  
  // Setup listeners
  networkUtils.setupNetworkListeners(handleOnline, handleOffline)
}

// Viewport handlers for mobile
const setupViewportHandlers = () => {
  // Handle viewport height changes (keyboard)
  const updateVH = () => {
    const vh = window.innerHeight * 0.01
    document.documentElement.style.setProperty('--vh', `${vh}px`)
  }
  
  // Handle orientation changes
  const handleOrientationChange = () => {
    // Delay to ensure viewport is updated
    setTimeout(() => {
      updateVH()
      
      // Dispatch custom event for components
      window.dispatchEvent(new CustomEvent('viewport-change', {
        detail: {
          width: window.innerWidth,
          height: window.innerHeight,
          orientation: screen.orientation?.angle || 0
        }
      }))
    }, 100)
  }
  
  // Initial setup
  updateVH()
  
  // Event listeners
  window.addEventListener('resize', updateVH)
  window.addEventListener('orientationchange', handleOrientationChange)
  
  // Visual viewport API support
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updateVH)
  }
}

// Gesture handlers
const setupGestureHandlers = () => {
  // Prevent zoom on double tap
  let lastTouchEnd = 0
  document.addEventListener('touchend', (event) => {
    const now = Date.now()
    if (now - lastTouchEnd <= 300) {
      event.preventDefault()
    }
    lastTouchEnd = now
  }, false)
  
  // Prevent context menu on long press
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault()
  })
  
  // Handle pull-to-refresh gesture
  let startY = 0
  let isAtTop = false
  
  document.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY
    isAtTop = window.scrollY === 0
  }, { passive: true })
  
  document.addEventListener('touchmove', (e) => {
    if (!isAtTop) return
    
    const currentY = e.touches[0].clientY
    const diff = currentY - startY
    
    if (diff > 0 && diff < 100) {
      // Show pull indicator
      document.body.style.setProperty('--pull-distance', `${diff}px`)
      document.body.classList.add('pulling')
    }
  }, { passive: true })
  
  document.addEventListener('touchend', (e) => {
    if (document.body.classList.contains('pulling')) {
      const pullDistance = parseFloat(
        document.body.style.getPropertyValue('--pull-distance') || '0'
      )
      
      if (pullDistance > 60) {
        // Trigger refresh
        window.dispatchEvent(new CustomEvent('pull-to-refresh'))
      }
      
      // Reset
      document.body.classList.remove('pulling')
      document.body.style.removeProperty('--pull-distance')
    }
  })
}

// Performance monitoring
const setupPerformanceMonitoring = () => {
  // Monitor FPS
  let fps = 0
  let lastTime = performance.now()
  let frameCount = 0
  
  const measureFPS = (currentTime) => {
    frameCount++
    
    if (currentTime >= lastTime + 1000) {
      fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
      frameCount = 0
      lastTime = currentTime
      
      // Log low FPS warnings
      if (fps < 30) {
        console.warn(`⚠️ Low FPS detected: ${fps}`)
      }
    }
    
    requestAnimationFrame(measureFPS)
  }
  
  requestAnimationFrame(measureFPS)
  
  // Monitor memory usage (if available)
  if ('memory' in performance) {
    setInterval(() => {
      const memory = performance.memory
      const used = Math.round(memory.usedJSHeapSize / 1048576)
      const limit = Math.round(memory.jsHeapSizeLimit / 1048576)
      
      if (used > limit * 0.8) {
        console.warn(`⚠️ High memory usage: ${used}MB / ${limit}MB`)
      }
    }, 30000) // Check every 30 seconds
  }
  
  // Monitor long tasks
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          console.warn(`⚠️ Long task detected: ${entry.duration.toFixed(2)}ms`)
        }
      }
    })
    
    observer.observe({ entryTypes: ['longtask'] })
  }
}

// PWA install prompt
const setupPWAPrompt = () => {
  let deferredPrompt = null
  
  // Listen for install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    
    // Show custom install button
    window.dispatchEvent(new CustomEvent('show-install-prompt', {
      detail: { prompt: deferredPrompt }
    }))
  })
  
  // Listen for app installed
  window.addEventListener('appinstalled', () => {
    console.log('🎉 App installata con successo')
    deferredPrompt = null
    
    // Hide install button
    window.dispatchEvent(new CustomEvent('hide-install-prompt'))
    
    // Show success message
    showNotification('App installata con successo!', 'success')
  })
  
  // Expose install function globally
  window.installPWA = async () => {
    if (!deferredPrompt) return false
    
    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('👍 Utente ha accettato l\'installazione')
      } else {
        console.log('👎 Utente ha rifiutato l\'installazione')
      }
      
      deferredPrompt = null
      return outcome === 'accepted'
    } catch (error) {
      console.error('❌ Errore nell\'installazione:', error)
      return false
    }
  }
}

// Notification utility
const showNotification = (message, type = 'info', duration = 3000) => {
  // Dispatch custom event for notification component
  window.dispatchEvent(new CustomEvent('show-notification', {
    detail: { message, type, duration }
  }))
}

// Haptic feedback simulation
export const hapticFeedback = {
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }
  },
  
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(20)
    }
  },
  
  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 10, 30])
    }
  },
  
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 10, 10])
    }
  },
  
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100])
    }
  }
}

// Device info utilities
export const deviceInfo = {
  // Check if iOS
  isIOS: () => /iPad|iPhone|iPod/.test(navigator.userAgent),
  
  // Check if Android
  isAndroid: () => /Android/.test(navigator.userAgent),
  
  // Check if mobile
  isMobile: () => /Mobi|Android/i.test(navigator.userAgent),
  
  // Check if tablet
  isTablet: () => {
    const userAgent = navigator.userAgent.toLowerCase()
    return /ipad|tablet|playbook|silk/.test(userAgent) || 
           (/android/.test(userAgent) && !/mobile/.test(userAgent))
  },
  
  // Check if standalone PWA
  isStandalone: () => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true
  },
  
  // Get safe area insets
  getSafeAreaInsets: () => {
    const style = getComputedStyle(document.documentElement)
    return {
      top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
      bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
      left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0'),
      right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0')
    }
  }
}

// Export utilities
export {
  showNotification
}
