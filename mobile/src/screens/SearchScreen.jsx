import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  TrendingUp, 
  Clock, 
  Plus,
  Check,
  Loader2,
  Sparkles,
  Film,
  X
} from 'lucide-react'

// Components
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Card, { CardContent } from '../components/ui/Card'
import LoadingSpinner, { LoadingSkeleton } from '../components/ui/LoadingSpinner'

// Store & Services
import { useMovieStore } from '../store/movieStore'
import { searchAPI, imageUtils } from '../services/api'
import { hapticFeedback } from '../utils/appInit'

const SearchScreen = () => {
  const {
    searchResults,
    isSearching,
    addMovieToCollection,
    selectMovie,
    clearSearchResults,
    searchMovies
  } = useMovieStore()
  
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [recentSearches, setRecentSearches] = useState([])
  const [addingMovies, setAddingMovies] = useState(new Set())
  const [selectedFormats, setSelectedFormats] = useState({})
  
  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])
  
  // Save recent searches
  const saveRecentSearch = useCallback((searchQuery) => {
    setRecentSearches(prev => {
      const updated = [searchQuery, ...prev.filter(s => s !== searchQuery)].slice(0, 5)
      localStorage.setItem('recentSearches', JSON.stringify(updated))
      return updated
    })
  }, [])
  
  // Search handler with debounce
  useEffect(() => {
    if (!query.trim()) {
      clearSearchResults()
      return
    }
    
    const timeoutId = setTimeout(async () => {
      try {
        await searchMovies(query)
        saveRecentSearch(query)
      } catch (error) {
        console.error('Search error:', error)
      }
    }, 300)
    
    return () => clearTimeout(timeoutId)
  }, [query, clearSearchResults, saveRecentSearch, searchMovies])
  
  // Get suggestions
  useEffect(() => {
    if (query.length >= 2 && query.length <= 3) {
      const timeoutId = setTimeout(async () => {
        try {
          const response = await searchAPI.getSuggestions(query)
          if (response.success) {
            setSuggestions(response.data.suggestions)
          }
        } catch (error) {
          console.error('Suggestions error:', error)
        }
      }, 200)
      
      return () => clearTimeout(timeoutId)
    } else {
      setSuggestions([])
    }
  }, [query])
  
  const handleAddMovie = async (movie) => {
    const formats = selectedFormats[movie.tmdbId] || { dvd: false, bluray: true }
    
    if (!formats.dvd && !formats.bluray) {
      hapticFeedback.error()
      return
    }
    
    setAddingMovies(prev => new Set(prev).add(movie.tmdbId))
    
    try {
      await addMovieToCollection(movie.tmdbId, formats)
      hapticFeedback.success()
      
      // Clear format selection
      setSelectedFormats(prev => {
        const updated = { ...prev }
        delete updated[movie.tmdbId]
        return updated
      })
    } catch (error) {
      console.error('Add movie error:', error)
      hapticFeedback.error()
    } finally {
      setAddingMovies(prev => {
        const updated = new Set(prev)
        updated.delete(movie.tmdbId)
        return updated
      })
    }
  }
  
  const handleFormatToggle = (tmdbId, format) => {
    setSelectedFormats(prev => ({
      ...prev,
      [tmdbId]: {
        ...prev[tmdbId],
        [format]: !prev[tmdbId]?.[format]
      }
    }))
    hapticFeedback.light()
  }
  
  const handleMoviePress = async (movie) => {
    try {
      const response = await searchAPI.getMovieDetails(movie.tmdbId)
      if (response.success) {
        selectMovie(response.data)
      }
    } catch (error) {
      console.error('Movie details error:', error)
    }
  }
  
  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
    hapticFeedback.medium()
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-cinema-950"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-30 bg-cinema-950/80 backdrop-blur-xl border-b border-white/10 px-4 py-4"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white flex items-center space-x-2">
                <Sparkles size={24} className="text-golden-500" />
                <span>Scopri film</span>
              </h1>
              <p className="text-cinema-400 text-sm">
                Cerca e aggiungi nuovi film alla collezione
              </p>
            </div>
          </div>
          
          {/* Search input */}
          <Input
            searchMode
            placeholder="Cerca film su TMDB..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            clearable
            onClear={() => setQuery('')}
            rightIcon={isSearching && <Loader2 size={16} className="animate-spin" />}
          />
        </div>
      </motion.div>
      
      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* No query state */}
        {!query && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Welcome message */}
            <Card>
              <CardContent className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl mb-4"
                >
                  🎬
                </motion.div>
                <h3 className="text-lg font-medium text-white mb-2">
                  Esplora il mondo del cinema
                </h3>
                <p className="text-cinema-400 text-sm">
                  Cerca tra milioni di film e aggiungi i tuoi preferiti alla collezione
                </p>
              </CardContent>
            </Card>
            
            {/* Recent searches */}
            {recentSearches.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <Clock size={20} className="text-golden-500" />
                    <span>Ricerche recenti</span>
                  </h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearRecentSearches}
                    leftIcon={<X size={14} />}
                  >
                    Cancella
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <motion.button
                      key={search}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setQuery(search)}
                      className="glass rounded-full px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                    >
                      {search}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Trending suggestions */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <TrendingUp size={20} className="text-golden-500" />
                <span>Suggerimenti</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {[
                  'Oppenheimer', 'Barbie', 'Dune', 'Avatar',
                  'Top Gun', 'Spider-Man', 'Batman', 'Marvel'
                ].map((suggestion, index) => (
                  <motion.button
                    key={suggestion}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    onClick={() => setQuery(suggestion)}
                    className="glass rounded-xl p-4 text-left hover:bg-white/5 transition-colors"
                  >
                    <div className="text-white font-medium">{suggestion}</div>
                    <div className="text-cinema-400 text-sm">Popolare</div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Quick suggestions */}
        {query.length >= 2 && suggestions.length > 0 && searchResults.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-medium text-cinema-300">
              Suggerimenti rapidi
            </h3>
            <div className="space-y-2">
              {suggestions.map((movie, index) => (
                <motion.button
                  key={movie.tmdbId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setQuery(movie.title)}
                  className="w-full flex items-center space-x-3 p-3 glass rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div className="w-12 h-16 bg-cinema-800 rounded-lg overflow-hidden flex-shrink-0">
                    {movie.posterUrl ? (
                      <img
                        src={imageUtils.getPosterUrl(movie.posterUrl, 'w185')}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-cinema-500">
                        <Film size={16} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-white font-medium text-sm">
                      {movie.title}
                    </div>
                    <div className="text-cinema-400 text-xs">
                      {movie.year}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Search results */}
        {query && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {isSearching ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="flex space-x-3 p-4 glass rounded-xl">
                    <LoadingSkeleton width="w-16" height="h-24" />
                    <div className="flex-1 space-y-2">
                      <LoadingSkeleton height="h-5" width="w-3/4" />
                      <LoadingSkeleton height="h-4" width="w-1/2" />
                      <LoadingSkeleton height="h-8" width="w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    Risultati per "{query}"
                  </h3>
                  <span className="text-cinema-400 text-sm">
                    {searchResults.length} risultati
                  </span>
                </div>
                
                <AnimatePresence>
                  {searchResults.map((movie, index) => {
                    const isAdding = addingMovies.has(movie.tmdbId)
                    const formats = selectedFormats[movie.tmdbId] || { dvd: false, bluray: true }
                    
                    return (
                      <motion.div
                        key={movie.tmdbId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="glass rounded-xl overflow-hidden"
                      >
                        <div className="flex space-x-4 p-4">
                          {/* Poster */}
                          <motion.button
                            onClick={() => handleMoviePress(movie)}
                            className="flex-shrink-0 w-20 h-28 bg-cinema-800 rounded-lg overflow-hidden"
                            whileTap={{ scale: 0.95 }}
                          >
                            {movie.posterUrl ? (
                              <img
                                src={imageUtils.getPosterUrl(movie.posterUrl, 'w300')}
                                alt={movie.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-cinema-500">
                                <Film size={24} />
                              </div>
                            )}
                          </motion.button>
                          
                          {/* Info */}
                          <div className="flex-1 space-y-2">
                            <div>
                              <h4 className="text-white font-semibold text-sm leading-tight">
                                {movie.title}
                              </h4>
                              {movie.originalTitle !== movie.title && (
                                <p className="text-cinema-400 text-xs">
                                  {movie.originalTitle}
                                </p>
                              )}
                              <p className="text-cinema-400 text-xs">
                                {movie.year} • ⭐ {movie.voteAverage?.toFixed(1)}
                              </p>
                            </div>
                            
                            {movie.overview && (
                              <p className="text-cinema-300 text-xs line-clamp-2">
                                {movie.overview}
                              </p>
                            )}
                            
                            {/* Action buttons */}
                            {movie.inCollection ? (
                              <div className="flex items-center space-x-2 text-green-500 text-xs">
                                <Check size={14} />
                                <span>Già nella collezione</span>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {/* Format selection */}
                                <div className="flex space-x-2">
                                  <motion.button
                                    onClick={() => handleFormatToggle(movie.tmdbId, 'dvd')}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                      formats.dvd
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-cinema-700 text-cinema-300 hover:bg-cinema-600'
                                    }`}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    DVD
                                  </motion.button>
                                  <motion.button
                                    onClick={() => handleFormatToggle(movie.tmdbId, 'bluray')}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                      formats.bluray
                                        ? 'bg-cyan-500 text-white'
                                        : 'bg-cinema-700 text-cinema-300 hover:bg-cinema-600'
                                    }`}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    Blu-ray
                                  </motion.button>
                                </div>
                                
                                {/* Add button */}
                                <Button
                                  size="sm"
                                  onClick={() => handleAddMovie(movie)}
                                  disabled={isAdding || (!formats.dvd && !formats.bluray)}
                                  loading={isAdding}
                                  leftIcon={!isAdding && <Plus size={14} />}
                                  className="w-full"
                                >
                                  {isAdding ? 'Aggiunta...' : 'Aggiungi alla collezione'}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    Nessun risultato
                  </h3>
                  <p className="text-cinema-400 text-sm">
                    Prova con un altro termine di ricerca
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </div>
      
      {/* Bottom spacing */}
      <div className="h-20" />
    </motion.div>
  )
}

export default SearchScreen
