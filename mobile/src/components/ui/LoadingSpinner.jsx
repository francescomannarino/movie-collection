import { motion } from 'framer-motion'
import { Film, Loader2 } from 'lucide-react'

const LoadingSpinner = ({ 
  size = 'md', 
  variant = 'default',
  text,
  fullScreen = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }
  
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }
  
  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-cinema-950/80 backdrop-blur-sm'
    : 'flex items-center justify-center'
  
  const spinnerVariants = {
    default: (
      <motion.div
        className={`${sizeClasses[size]} ${className}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <Loader2 className="w-full h-full text-golden-500" />
      </motion.div>
    ),
    cinema: (
      <motion.div
        className={`${sizeClasses[size]} ${className}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <Film className="w-full h-full text-golden-500" />
      </motion.div>
    ),
    dots: (
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-golden-500 rounded-full"
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.1
            }}
          />
        ))}
      </div>
    ),
    pulse: (
      <motion.div
        className={`${sizeClasses[size]} bg-golden-500 rounded-full ${className}`}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
    ),
    bars: (
      <div className="flex space-x-1 items-end">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="w-1 bg-golden-500 rounded-full"
            style={{ height: size === 'sm' ? 16 : size === 'lg' ? 32 : 24 }}
            animate={{ scaleY: [1, 0.5, 1] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.1
            }}
          />
        ))}
      </div>
    )
  }
  
  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-3">
        {/* Spinner */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {spinnerVariants[variant]}
        </motion.div>
        
        {/* Loading text */}
        {text && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className={`text-cinema-300 ${textSizeClasses[size]} text-center`}
          >
            {text}
          </motion.p>
        )}
      </div>
    </div>
  )
}

// Loading skeleton component
export const LoadingSkeleton = ({ 
  className = '',
  width = 'w-full',
  height = 'h-4',
  rounded = 'rounded',
  animate = true
}) => (
  <motion.div
    className={`skeleton ${width} ${height} ${rounded} ${className}`}
    animate={animate ? { opacity: [0.5, 1, 0.5] } : {}}
    transition={animate ? { duration: 1.5, repeat: Infinity } : {}}
  />
)

// Loading card skeleton
export const LoadingCard = ({ className = '' }) => (
  <div className={`card-native ${className}`}>
    <div className="space-y-3">
      <LoadingSkeleton height="h-48" rounded="rounded-xl" />
      <LoadingSkeleton height="h-6" width="w-3/4" />
      <LoadingSkeleton height="h-4" width="w-1/2" />
      <div className="flex space-x-2">
        <LoadingSkeleton height="h-8" width="w-16" rounded="rounded-full" />
        <LoadingSkeleton height="h-8" width="w-20" rounded="rounded-full" />
      </div>
    </div>
  </div>
)

// Loading list item skeleton
export const LoadingListItem = ({ className = '' }) => (
  <div className={`flex items-center space-x-3 p-4 ${className}`}>
    <LoadingSkeleton width="w-16" height="h-16" rounded="rounded-lg" />
    <div className="flex-1 space-y-2">
      <LoadingSkeleton height="h-5" width="w-3/4" />
      <LoadingSkeleton height="h-4" width="w-1/2" />
    </div>
    <LoadingSkeleton width="w-8" height="h-8" rounded="rounded-full" />
  </div>
)

export default LoadingSpinner
