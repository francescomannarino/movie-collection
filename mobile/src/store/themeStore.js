import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

const useThemeStore = create(
  devtools(
    persist(
      (set, get) => ({
        // State
        isDarkMode: true,
        accentColor: 'golden',
        reducedMotion: false,
        
        // Actions
        toggleDarkMode: () => set((state) => ({
          isDarkMode: !state.isDarkMode
        })),
        
        setDarkMode: (isDark) => set(() => ({
          isDarkMode: isDark
        })),
        
        setAccentColor: (color) => set(() => ({
          accentColor: color
        })),
        
        setReducedMotion: (reduced) => set(() => ({
          reducedMotion: reduced
        })),
        
        // Initialize theme from system preferences
        initializeTheme: () => {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
          
          set((state) => ({
            isDarkMode: state.isDarkMode ?? prefersDark,
            reducedMotion: state.reducedMotion ?? prefersReducedMotion
          }))
          
          // Listen for system changes
          window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (get().isDarkMode === undefined) {
              set({ isDarkMode: e.matches })
            }
          })
          
          window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
            set({ reducedMotion: e.matches })
          })
        }
      }),
      {
        name: 'theme-store'
      }
    ),
    {
      name: 'ThemeStore'
    }
  )
)

export { useThemeStore }
