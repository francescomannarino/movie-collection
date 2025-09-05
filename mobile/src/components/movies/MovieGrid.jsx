import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import MovieCard from './MovieCard'
import { LoadingCard } from '../ui/LoadingSpinner'
import { useMovieStore } from '../../store/movieStore'

const MovieGrid = ({ 
  movies = [],
  onMoviePress,
  loading = false,
  hasMore = false,
  onLoadMore,
  viewMode = 'grid',
  emptyMessage = "Nessun film trovato",
  emptyIcon = "🎬"
}) => {
  const [columns, setColumns] = useState(2)
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '200px'
  })
  
  // Responsive columns based on screen width and view mode
  useEffect(() => {
    const updateColumns = () => {
      if (viewMode === 'list') {
        setColumns(1) // Lista: una colonna
      } else {
        // Griglia: responsive
        const width = window.innerWidth
        if (width >= 768) {
          setColumns(4) // Tablet landscape
        } else if (width >= 640) {
          setColumns(3) // Large mobile
        } else {
          setColumns(2) // Mobile
        }
      }
    }
    
    updateColumns()
    window.addEventListener('resize', updateColumns)
    return () => window.removeEventListener('resize', updateColumns)
  }, [viewMode])
  
  // Load more when scrolled near bottom
  useEffect(() => {
    if (inView && hasMore && !loading && onLoadMore) {
      onLoadMore()
    }
  }, [inView, hasMore, loading, onLoadMore])
  
  // Create loading skeletons
  const loadingSkeletons = Array.from({ length: 6 }, (_, i) => (
    <LoadingCard key={`skeleton-${i}`} />
  ))
  
  if (!loading && movies.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            delay: 0.2,
            type: "spring",
            stiffness: 200
          }}
          className="text-6xl mb-4"
        >
          {emptyIcon}
        </motion.div>
        <h3 className="text-xl font-semibold text-white mb-2">
          {emptyMessage}
        </h3>
        <p className="text-cinema-400 text-sm max-w-xs">
          Inizia aggiungendo alcuni film alla tua collezione
        </p>
      </motion.div>
    )
  }
  
  return (
    <div className="space-y-4">
      {/* Movie Grid */}
      <motion.div
        className={`grid gap-4 ${
          columns === 1 ? 'grid-cols-1' :
          columns === 2 ? 'grid-cols-2' :
          columns === 3 ? 'grid-cols-3' :
          'grid-cols-4'
        }`}
        layout
      >
        <AnimatePresence>
          {movies.map((movie, index) => (
            <MovieCard
              key={movie._id || movie.tmdbId}
              movie={movie}
              onPress={onMoviePress}
              index={index}
              viewMode={viewMode}
            />
          ))}
          
          {/* Loading skeletons */}
          {loading && loadingSkeletons}
        </AnimatePresence>
      </motion.div>
      
      {/* Load more trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-2 text-cinema-400"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-golden-500 border-t-transparent rounded-full"
              />
              <span>Caricamento...</span>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-cinema-400 text-sm"
            >
              Scorri per caricare altri film
            </motion.div>
          )}
        </div>
      )}
      
      {/* End of list indicator */}
      {!hasMore && movies.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-cinema-400 text-sm"
        >
          <div className="flex items-center justify-center space-x-2">
            <div className="w-8 h-px bg-cinema-700"></div>
            <span>Fine della collezione</span>
            <div className="w-8 h-px bg-cinema-700"></div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default MovieGrid
