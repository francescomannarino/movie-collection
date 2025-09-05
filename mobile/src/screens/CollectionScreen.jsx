import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Grid3X3, 
  List,
  X,
  Calendar,
  Star,
  Clock
} from 'lucide-react'

// Components
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import MovieGrid from '../components/movies/MovieGrid'
import LoadingSpinner from '../components/ui/LoadingSpinner'

// Store
import { useMovieStore } from '../store/movieStore'
import { hapticFeedback } from '../utils/appInit'

const CollectionScreen = () => {
  const {
    movies,
    isLoading,
    isLoadingMore,
    hasMore,
    filters,
    totalMovies,
    setFilters,
    clearFilters,
    fetchMovies,
    loadMoreMovies,
    selectMovie
  } = useMovieStore()
  
  const [searchTerm, setSearchTerm] = useState(filters.search || '')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  
  useEffect(() => {
    // Load movies on mount if not already loaded
    if (movies.length === 0) {
      fetchMovies()
    }
  }, [movies.length, fetchMovies])
  
  // Search handler with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== filters.search) {
        setFilters({ search: searchTerm })
        fetchMovies()
      }
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [searchTerm, filters.search, setFilters, fetchMovies])
  
  const handleMoviePress = (movie) => {
    selectMovie(movie)
  }
  
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      loadMoreMovies()
    }
  }, [isLoadingMore, hasMore, loadMoreMovies])
  
  const handleFilterChange = (key, value) => {
    setFilters({ [key]: value })
    fetchMovies()
    hapticFeedback.light()
  }
  
  const handleClearFilters = () => {
    clearFilters()
    setSearchTerm('')
    fetchMovies()
    setShowFilters(false)
    hapticFeedback.medium()
  }
  
  const toggleSort = () => {
    const newOrder = filters.sortOrder === 'desc' ? 'asc' : 'desc'
    handleFilterChange('sortOrder', newOrder)
  }
  
  const activeFiltersCount = Object.values({
    format: filters.format,
    genre: filters.genre,
    year: filters.year,
    search: filters.search
  }).filter(Boolean).length
  
  const sortOptions = [
    { value: 'dateAdded', label: 'Data aggiunta', icon: Calendar },
    { value: 'title', label: 'Titolo', icon: SortAsc },
    { value: 'year', label: 'Anno', icon: Clock },
    { value: 'voteAverage', label: 'Voto', icon: Star }
  ]
  
  const formatOptions = [
    { value: null, label: 'Tutti i formati' },
    { value: 'dvd', label: 'Solo DVD' },
    { value: 'bluray', label: 'Solo Blu-ray' }
  ]
  
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
          {/* Title and stats */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">
                La mia collezione
              </h1>
              <p className="text-cinema-400 text-sm">
                {totalMovies} film{totalMovies !== 1 ? '' : ''}
                {activeFiltersCount > 0 && ` • ${activeFiltersCount} filtri attivi`}
              </p>
            </div>
            
            {/* View mode toggle */}
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 size={16} />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                onClick={() => setViewMode('list')}
              >
                <List size={16} />
              </Button>
            </div>
          </div>
          
          {/* Search bar */}
          <Input
            searchMode
            placeholder="Cerca nei tuoi film..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            clearable
            onClear={() => setSearchTerm('')}
          />
          
          {/* Filter controls */}
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant={showFilters ? 'primary' : 'secondary'}
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<Filter size={16} />}
              rightIcon={activeFiltersCount > 0 && (
                <span className="bg-golden-500 text-cinema-950 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            >
              Filtri
            </Button>
            
            <Button
              size="sm"
              variant="secondary"
              onClick={toggleSort}
              leftIcon={filters.sortOrder === 'desc' ? <SortDesc size={16} /> : <SortAsc size={16} />}
            >
              {sortOptions.find(opt => opt.value === filters.sortBy)?.label}
            </Button>
            
            {activeFiltersCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClearFilters}
                leftIcon={<X size={16} />}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </motion.div>
      
      {/* Filters panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-cinema-900/50 backdrop-blur-sm border-b border-white/10"
          >
            <div className="px-4 py-4 space-y-4">
              {/* Sort by */}
              <div>
                <label className="text-sm font-medium text-cinema-300 mb-2 block">
                  Ordina per
                </label>
                <div className="flex flex-wrap gap-2">
                  {sortOptions.map((option) => (
                    <Button
                      key={option.value}
                      size="sm"
                      variant={filters.sortBy === option.value ? 'primary' : 'ghost'}
                      onClick={() => handleFilterChange('sortBy', option.value)}
                      leftIcon={<option.icon size={14} />}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Format filter */}
              <div>
                <label className="text-sm font-medium text-cinema-300 mb-2 block">
                  Formato
                </label>
                <div className="flex flex-wrap gap-2">
                  {formatOptions.map((option) => (
                    <Button
                      key={option.value || 'all'}
                      size="sm"
                      variant={filters.format === option.value ? 'primary' : 'ghost'}
                      onClick={() => handleFilterChange('format', option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Content */}
      <div className="px-4 py-6">
        {isLoading && movies.length === 0 ? (
          <LoadingSpinner
            size="lg"
            variant="cinema"
            text="Caricamento collezione..."
          />
        ) : (
          <MovieGrid
            movies={movies}
            onMoviePress={handleMoviePress}
            loading={isLoadingMore}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            viewMode={viewMode}
            emptyMessage={
              searchTerm || activeFiltersCount > 0
                ? "Nessun film corrisponde ai filtri"
                : "La tua collezione è vuota"
            }
            emptyIcon={
              searchTerm || activeFiltersCount > 0 ? "🔍" : "📱"
            }
          />
        )}
      </div>
      
      {/* Pull to refresh indicator */}
      <motion.div
        className="pull-to-refresh"
        style={{
          transform: `translateY(${Math.max(0, Math.min(60, window.pullDistance || 0))}px)`
        }}
      >
        <div className="text-golden-500">
          ⬇️ Tira per aggiornare
        </div>
      </motion.div>
      
      {/* Bottom spacing */}
      <div className="h-20" />
    </motion.div>
  )
}

export default CollectionScreen
