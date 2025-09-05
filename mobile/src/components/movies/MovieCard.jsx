import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Calendar, Clock, Disc, Disc3 } from 'lucide-react'
import { imageUtils } from '../../services/api'
import { hapticFeedback } from '../../utils/appInit'

const MovieCard = ({ 
  movie, 
  onPress,
  showFormats = true,
  variant = 'default',
  viewMode = 'grid',
  index = 0 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  
  const handlePress = () => {
    hapticFeedback.light()
    if (onPress) onPress(movie)
  }
  
  const formatRuntime = (minutes) => {
    if (!minutes) return null
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }
  
  const getFormatIcons = () => {
    const formats = []
    if (movie.formats?.dvd) {
      formats.push({ type: 'DVD', icon: Disc, color: 'text-blue-400' })
    }
    if (movie.formats?.bluray) {
      formats.push({ type: 'Blu-ray', icon: Disc3, color: 'text-cyan-400' })
    }
    return formats
  }
  
  const posterUrl = imageUtils.getPosterUrl(movie.posterUrl, 'w500')
  const year = movie.year || new Date(movie.releaseDate).getFullYear()
  
  // Layout per modalità lista
  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ 
          duration: 0.4, 
          delay: index * 0.03,
          type: "spring",
          stiffness: 100
        }}
        whileTap={{ scale: 0.98 }}
        className="touch-manipulation cursor-pointer"
        onClick={handlePress}
      >
        <div className="card-native overflow-hidden spotlight hover:shadow-strong transition-all duration-300 p-4">
          <div className="flex space-x-4">
            {/* Poster piccolo */}
            <div className="relative w-16 h-24 bg-cinema-800 rounded-lg overflow-hidden flex-shrink-0">
              {posterUrl && !imageError ? (
                <motion.img
                  src={posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: imageLoaded ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-cinema-800 text-cinema-400">
                  <div className="text-lg">🎬</div>
                </div>
              )}
              
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border border-golden-500 border-t-transparent rounded-full"
                  />
                </div>
              )}
            </div>
            
            {/* Informazioni film */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-base leading-tight line-clamp-2 mb-2">
                    {movie.title}
                  </h3>
                  
                  {/* Metadati */}
                  <div className="flex items-center space-x-4 text-sm text-cinema-300 mb-2">
                    {year && (
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{year}</span>
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
                  
                  {/* Generi */}
                  {movie.genres && movie.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {movie.genres.slice(0, 3).map((genre, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-cinema-700/50 text-cinema-300 text-xs rounded-full"
                        >
                          {genre}
                        </span>
                      ))}
                      {movie.genres.length > 3 && (
                        <span className="px-2 py-1 bg-cinema-700/50 text-cinema-300 text-xs rounded-full">
                          +{movie.genres.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Formati */}
                  {showFormats && (
                    <div className="flex items-center space-x-2">
                      {getFormatIcons().map((format, idx) => (
                        <div
                          key={format.type}
                          className="flex items-center space-x-1 bg-cinema-700/30 rounded-full px-2 py-1"
                        >
                          <format.icon size={12} className={format.color} />
                          <span className="text-xs text-cinema-300">{format.type}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // Layout per modalità griglia (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.05,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="touch-manipulation cursor-pointer"
      onClick={handlePress}
    >
      <div className="card-native overflow-hidden spotlight hover:shadow-strong transition-all duration-300">
        {/* Poster */}
        <div className="relative aspect-[2/3] bg-cinema-800 rounded-xl overflow-hidden">
          {/* Loading placeholder */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-2 border-golden-500 border-t-transparent rounded-full"
              />
            </div>
          )}
          
          {/* Movie poster */}
          {posterUrl && !imageError ? (
            <motion.img
              src={posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              initial={{ opacity: 0 }}
              animate={{ opacity: imageLoaded ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-cinema-800 text-cinema-400">
              <div className="text-center">
                <div className="text-4xl mb-2">🎬</div>
                <div className="text-xs">Nessuna immagine</div>
              </div>
            </div>
          )}
          
          {/* Overlay with rating */}
          {movie.voteAverage && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1"
            >
              <Star size={12} className="text-golden-500 fill-current" />
              <span className="text-xs font-medium text-white">
                {movie.voteAverage.toFixed(1)}
              </span>
            </motion.div>
          )}
          
          {/* Format badges */}
          {showFormats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-2 left-2 flex space-x-1"
            >
              {getFormatIcons().map((format, idx) => (
                <div
                  key={format.type}
                  className="bg-black/70 backdrop-blur-sm rounded-full p-1.5"
                >
                  <format.icon size={14} className={format.color} />
                </div>
              ))}
            </motion.div>
          )}
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>
        
        {/* Movie info */}
        <div className="p-3 space-y-2">
          {/* Title */}
          <h3 className="font-semibold text-white text-sm leading-tight line-clamp-2">
            {movie.title}
          </h3>
          
          {/* Year and runtime */}
          <div className="flex items-center space-x-3 text-xs text-cinema-300">
            {year && (
              <div className="flex items-center space-x-1">
                <Calendar size={12} />
                <span>{year}</span>
              </div>
            )}
            
            {movie.runtime && (
              <div className="flex items-center space-x-1">
                <Clock size={12} />
                <span>{formatRuntime(movie.runtime)}</span>
              </div>
            )}
          </div>
          
          {/* Genres */}
          {movie.genres && movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {movie.genres.slice(0, 2).map((genre, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-cinema-700/50 text-cinema-300 text-xs rounded-full"
                >
                  {genre}
                </span>
              ))}
              {movie.genres.length > 2 && (
                <span className="px-2 py-1 bg-cinema-700/50 text-cinema-300 text-xs rounded-full">
                  +{movie.genres.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Hover effect */}
        <motion.div
          className="absolute inset-0 bg-golden-500/10 rounded-2xl opacity-0 pointer-events-none"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      </div>
    </motion.div>
  )
}

export default MovieCard
