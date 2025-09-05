import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Star, 
  Calendar, 
  Clock, 
  Play,
  Disc,
  Disc3,
  Edit3,
  Trash2,
  Check,
  Plus,
  Share2,
  Heart
} from 'lucide-react'

// Components
import Button from '../ui/Button'
import Card, { CardContent } from '../ui/Card'
import LoadingSpinner from '../ui/LoadingSpinner'

// Store & Services
import { useMovieStore } from '../../store/movieStore'
import { imageUtils } from '../../services/api'
import { hapticFeedback } from '../../utils/appInit'

const MovieDetailModal = ({ movie, onClose }) => {
  const {
    addMovieToCollection,
    updateMovieFormats,
    removeMovieFromCollection,
    isLoading
  } = useMovieStore()
  
  const [selectedFormats, setSelectedFormats] = useState({
    dvd: movie.formats?.dvd || movie.ownedFormats?.dvd || false,
    bluray: movie.formats?.bluray || movie.ownedFormats?.bluray || true
  })
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])
  
  const formatRuntime = (minutes) => {
    if (!minutes) return null
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }
  
  const formatReleaseDate = (dateString) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  const handleFormatToggle = (format) => {
    setSelectedFormats(prev => ({
      ...prev,
      [format]: !prev[format]
    }))
    hapticFeedback.light()
  }
  
  const handleAddToCollection = async () => {
    if (!selectedFormats.dvd && !selectedFormats.bluray) {
      hapticFeedback.error()
      return
    }
    
    try {
      await addMovieToCollection(movie.tmdbId, selectedFormats)
      hapticFeedback.success()
      onClose()
    } catch (error) {
      console.error('Add movie error:', error)
      hapticFeedback.error()
    }
  }
  
  const handleUpdateFormats = async () => {
    if (!selectedFormats.dvd && !selectedFormats.bluray) {
      hapticFeedback.error()
      return
    }
    
    setIsUpdating(true)
    
    try {
      await updateMovieFormats(movie._id || movie.collectionId, selectedFormats)
      hapticFeedback.success()
      onClose()
    } catch (error) {
      console.error('Update movie error:', error)
      hapticFeedback.error()
    } finally {
      setIsUpdating(false)
    }
  }
  
  const handleRemoveFromCollection = async () => {
    try {
      await removeMovieFromCollection(movie._id || movie.collectionId)
      hapticFeedback.success()
      setShowConfirmDelete(false)
      onClose()
    } catch (error) {
      console.error('Remove movie error:', error)
      hapticFeedback.error()
    }
  }
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: movie.title,
          text: `Guarda "${movie.title}" (${movie.year}) - ${movie.overview?.substring(0, 100)}...`,
          url: `https://www.themoviedb.org/movie/${movie.tmdbId}`
        })
        hapticFeedback.success()
      } catch (error) {
        console.log('Share cancelled or failed')
      }
    }
  }
  
  const posterUrl = imageUtils.getPosterUrl(movie.posterUrl, 'w780')
  const backdropUrl = imageUtils.getBackdropUrl(movie.backdropPath, 'w1280')
  const isInCollection = movie.inCollection || movie._id
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="absolute inset-x-0 bottom-0 max-h-[90vh] bg-cinema-950 rounded-t-3xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with backdrop */}
          <div className="relative h-64 overflow-hidden">
            {/* Backdrop image */}
            {backdropUrl ? (
              <img
                src={backdropUrl}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-cinema-800 to-cinema-900" />
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-cinema-950 via-cinema-950/50 to-transparent" />
            
            {/* Close button */}
            <motion.button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              <X size={20} />
            </motion.button>
            
            {/* Movie info overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex space-x-4">
                {/* Poster */}
                <div className="w-20 h-28 bg-cinema-800 rounded-lg overflow-hidden flex-shrink-0 shadow-lg">
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-cinema-500">
                      <Play size={24} />
                    </div>
                  )}
                </div>
                
                {/* Title and basic info */}
                <div className="flex-1 space-y-1">
                  <h1 className="text-xl font-bold text-white leading-tight">
                    {movie.title}
                  </h1>
                  
                  {movie.originalTitle !== movie.title && (
                    <p className="text-cinema-300 text-sm">
                      {movie.originalTitle}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-3 text-sm text-cinema-300">
                    {movie.year && (
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{movie.year}</span>
                      </div>
                    )}
                    
                    {movie.runtime && (
                      <div className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>{formatRuntime(movie.runtime)}</span>
                      </div>
                    )}
                    
                    {movie.voteAverage && (
                      <div className="flex items-center space-x-1">
                        <Star size={14} className="text-golden-500 fill-current" />
                        <span>{movie.voteAverage.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6">
            {/* Overview */}
            {movie.overview && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Trama
                </h3>
                <p className="text-cinema-300 text-sm leading-relaxed">
                  {movie.overview}
                </p>
              </div>
            )}
            
            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Generi
                </h3>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-cinema-700/50 text-cinema-300 text-sm rounded-full"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Release date */}
            {movie.releaseDate && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Data di uscita
                </h3>
                <p className="text-cinema-300 text-sm">
                  {formatReleaseDate(movie.releaseDate)}
                </p>
              </div>
            )}
            
            {/* Format selection */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                {isInCollection ? 'Formati posseduti' : 'Seleziona formati'}
              </h3>
              
              <div className="flex space-x-3">
                <motion.button
                  onClick={() => handleFormatToggle('dvd')}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    selectedFormats.dvd
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-cinema-700 bg-cinema-800/50 hover:bg-cinema-800'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Disc className={`w-6 h-6 ${selectedFormats.dvd ? 'text-blue-400' : 'text-cinema-400'}`} />
                    <div className="text-left">
                      <div className={`font-medium ${selectedFormats.dvd ? 'text-blue-400' : 'text-white'}`}>
                        DVD
                      </div>
                      <div className="text-xs text-cinema-400">
                        Definizione standard
                      </div>
                    </div>
                    {selectedFormats.dvd && (
                      <Check className="w-5 h-5 text-blue-400" />
                    )}
                  </div>
                </motion.button>
                
                <motion.button
                  onClick={() => handleFormatToggle('bluray')}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    selectedFormats.bluray
                      ? 'border-cyan-500 bg-cyan-500/20'
                      : 'border-cinema-700 bg-cinema-800/50 hover:bg-cinema-800'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Disc3 className={`w-6 h-6 ${selectedFormats.bluray ? 'text-cyan-400' : 'text-cinema-400'}`} />
                    <div className="text-left">
                      <div className={`font-medium ${selectedFormats.bluray ? 'text-cyan-400' : 'text-white'}`}>
                        Blu-ray
                      </div>
                      <div className="text-xs text-cinema-400">
                        Alta definizione
                      </div>
                    </div>
                    {selectedFormats.bluray && (
                      <Check className="w-5 h-5 text-cyan-400" />
                    )}
                  </div>
                </motion.button>
              </div>
            </div>
            
            {/* Actions */}
            <div className="space-y-3">
              {isInCollection ? (
                <>
                  {/* Update formats */}
                  <Button
                    fullWidth
                    onClick={handleUpdateFormats}
                    loading={isUpdating}
                    disabled={!selectedFormats.dvd && !selectedFormats.bluray}
                    leftIcon={!isUpdating && <Edit3 size={18} />}
                  >
                    {isUpdating ? 'Aggiornamento...' : 'Aggiorna formati'}
                  </Button>
                  
                  {/* Secondary actions */}
                  <div className="flex space-x-3">
                    <Button
                      variant="secondary"
                      fullWidth
                      onClick={handleShare}
                      leftIcon={<Share2 size={16} />}
                    >
                      Condividi
                    </Button>
                    
                    <Button
                      variant="danger"
                      fullWidth
                      onClick={() => setShowConfirmDelete(true)}
                      leftIcon={<Trash2 size={16} />}
                    >
                      Rimuovi
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Add to collection */}
                  <Button
                    fullWidth
                    onClick={handleAddToCollection}
                    loading={isLoading}
                    disabled={!selectedFormats.dvd && !selectedFormats.bluray}
                    leftIcon={!isLoading && <Plus size={18} />}
                  >
                    {isLoading ? 'Aggiunta...' : 'Aggiungi alla collezione'}
                  </Button>
                  
                  {/* Share */}
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={handleShare}
                    leftIcon={<Share2 size={16} />}
                  >
                    Condividi film
                  </Button>
                </>
              )}
            </div>
          </div>
        </motion.div>
        
        {/* Confirm delete modal */}
        <AnimatePresence>
          {showConfirmDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setShowConfirmDelete(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm"
              >
                <Card variant="solid">
                  <CardContent className="text-center py-6">
                    <div className="text-4xl mb-4">🗑️</div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Rimuovi dalla collezione
                    </h3>
                    <p className="text-cinema-300 text-sm mb-6">
                      Sei sicuro di voler rimuovere "{movie.title}" dalla tua collezione?
                    </p>
                    
                    <div className="flex space-x-3">
                      <Button
                        variant="ghost"
                        fullWidth
                        onClick={() => setShowConfirmDelete(false)}
                      >
                        Annulla
                      </Button>
                      <Button
                        variant="danger"
                        fullWidth
                        onClick={handleRemoveFromCollection}
                        loading={isLoading}
                      >
                        Rimuovi
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}

export default MovieDetailModal
