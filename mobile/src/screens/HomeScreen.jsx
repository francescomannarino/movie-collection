import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  TrendingUp, 
  Calendar, 
  Star, 
  Film, 
  Disc, 
  Disc3,
  ChevronRight,
  Sparkles
} from 'lucide-react'

// Components
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import MovieCard from '../components/movies/MovieCard'
import LoadingSpinner, { LoadingSkeleton } from '../components/ui/LoadingSpinner'

// Store & Services
import { useMovieStore } from '../store/movieStore'

const HomeScreen = () => {
  const navigate = useNavigate()
  const { 
    movies, 
    stats, 
    isLoading, 
    fetchMovies, 
    fetchStats, 
    selectMovie,
    getRecentMovies 
  } = useMovieStore()
  
  const [greeting, setGreeting] = useState('')
  
  useEffect(() => {
    // Set greeting based on time
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Buongiorno')
    else if (hour < 18) setGreeting('Buon pomeriggio')
    else setGreeting('Buonasera')
    
    // Fetch data if not already loaded
    if (movies.length === 0) {
      fetchMovies()
    }
    // Forza il caricamento delle statistiche sempre per assicurarsi che siano aggiornate
    fetchStats()
  }, [movies.length, fetchMovies, fetchStats])
  
  const recentMovies = getRecentMovies(6)
  
  const handleMoviePress = (movie) => {
    selectMovie(movie)
  }
  
  const handleViewAll = (section) => {
    switch (section) {
      case 'collection':
        navigate('/collection')
        break
      case 'search':
        navigate('/search')
        break
      default:
        navigate('/collection')
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-cinema-950 px-4 py-6 space-y-6"
    >
      {/* Header Section */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        {/* Greeting */}
        <div className="flex items-center justify-between">
          <div>
            <motion.h1
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              className="text-2xl font-bold text-white"
            >
              {greeting} 🎬
            </motion.h1>
            <motion.p
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-cinema-400 text-sm"
            >
              Bentornato nella tua collezione cinematografica
            </motion.p>
          </div>
          
          {/* Quick actions */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="flex space-x-2"
          >
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleViewAll('search')}
              leftIcon={<Sparkles size={16} />}
            >
              Scopri
            </Button>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Stats Cards */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-4"
      >
        {/* Total Movies */}
        <Card variant="golden" className="text-center">
          <CardContent padding="md">
            {stats ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className="text-2xl font-bold text-golden-500 mb-1"
                >
                  {stats.totalMovies || 0}
                </motion.div>
                <div className="text-sm text-cinema-300 flex items-center justify-center space-x-1">
                  <Film size={14} />
                  <span>Film totali</span>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <LoadingSkeleton height="h-8" width="w-16" className="mx-auto" />
                <LoadingSkeleton height="h-4" width="w-20" className="mx-auto" />
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Formats */}
        <Card className="text-center">
          <CardContent padding="md">
            {stats ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="flex justify-center space-x-2 mb-2"
                >
                  <div className="flex items-center space-x-1">
                    <Disc size={16} className="text-blue-400" />
                    <span className="text-sm font-medium text-white">
                      {stats.formats.dvd}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Disc3 size={16} className="text-cyan-400" />
                    <span className="text-sm font-medium text-white">
                      {stats.formats.bluray}
                    </span>
                  </div>
                </motion.div>
                <div className="text-sm text-cinema-300">
                  Formati posseduti
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <LoadingSkeleton height="h-6" width="w-24" className="mx-auto" />
                <LoadingSkeleton height="h-4" width="w-20" className="mx-auto" />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Recent Additions */}
      <motion.section
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Calendar size={20} className="text-golden-500" />
            <span>Aggiunti di recente</span>
          </h2>
          
          {recentMovies.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleViewAll('collection')}
              rightIcon={<ChevronRight size={16} />}
            >
              Vedi tutti
            </Button>
          )}
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="card-native">
                <LoadingSkeleton height="h-48" className="mb-3" />
                <LoadingSkeleton height="h-4" width="w-3/4" className="mb-2" />
                <LoadingSkeleton height="h-3" width="w-1/2" />
              </div>
            ))}
          </div>
        ) : recentMovies.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            <AnimatePresence>
              {recentMovies.map((movie, index) => (
                <MovieCard
                  key={movie._id}
                  movie={movie}
                  onPress={handleMoviePress}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-4xl mb-4"
              >
                📱
              </motion.div>
              <h3 className="text-lg font-medium text-white mb-2">
                La tua collezione è vuota
              </h3>
              <p className="text-cinema-400 text-sm mb-4">
                Inizia aggiungendo i tuoi film preferiti
              </p>
              <Button
                onClick={() => handleViewAll('search')}
                leftIcon={<Sparkles size={16} />}
              >
                Inizia ora
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.section>
      
      {/* Top Genres */}
      {stats?.topGenres && stats.topGenres.length > 0 && (
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
            <TrendingUp size={20} className="text-golden-500" />
            <span>Generi preferiti</span>
          </h2>
          
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {stats.topGenres.slice(0, 6).map((genre, index) => (
                <motion.div
                  key={genre._id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="glass-golden rounded-full px-4 py-2 flex items-center space-x-2"
                >
                  <span className="text-golden-500 text-sm font-medium">
                    {genre._id}
                  </span>
                  <span className="text-xs text-cinema-300 bg-cinema-800/50 rounded-full px-2 py-0.5">
                    {genre.count}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.section>
      )}
      
      {/* Quick Actions */}
      <motion.section
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-semibold text-white">
          Azioni rapide
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          <Card hover onClick={() => handleViewAll('collection')}>
            <CardContent className="text-center py-6">
              <div className="text-2xl mb-2">📚</div>
              <div className="text-white font-medium">Collezione</div>
              <div className="text-cinema-400 text-sm">Sfoglia i tuoi film</div>
            </CardContent>
          </Card>
          
          <Card hover onClick={() => handleViewAll('search')}>
            <CardContent className="text-center py-6">
              <div className="text-2xl mb-2">🔍</div>
              <div className="text-white font-medium">Cerca</div>
              <div className="text-cinema-400 text-sm">Trova nuovi film</div>
            </CardContent>
          </Card>
        </div>
      </motion.section>
      
      {/* Bottom spacing for navigation */}
      <div className="h-8" />
    </motion.div>
  )
}

export default HomeScreen
