import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { hapticFeedback } from '../../utils/appInit'

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  haptic = 'medium',
  fullWidth = false,
  leftIcon,
  rightIcon,
  onClick,
  className = '',
  ...props
}, ref) => {
  const baseClasses = 'btn-native inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden-500/20 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'btn-primary shadow-glow-golden hover:shadow-glow-golden',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-red-500/30',
    success: 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-green-500/30'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm rounded-lg',
    md: 'px-4 py-3 text-base rounded-xl',
    lg: 'px-6 py-4 text-lg rounded-2xl',
    xl: 'px-8 py-5 text-xl rounded-2xl'
  }
  
  const widthClasses = fullWidth ? 'w-full' : ''
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClasses} ${className}`
  
  const handleClick = (e) => {
    if (disabled || loading) return
    
    // Haptic feedback
    if (haptic && hapticFeedback[haptic]) {
      hapticFeedback[haptic]()
    }
    
    // Call onClick handler
    if (onClick) {
      onClick(e)
    }
  }
  
  return (
    <motion.button
      ref={ref}
      className={classes}
      onClick={handleClick}
      disabled={disabled || loading}
      whileTap={{ scale: disabled || loading ? 1 : 0.95 }}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      transition={{ duration: 0.1 }}
      {...props}
    >
      {/* Loading state */}
      {loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mr-2"
        >
          <Loader2 size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} className="animate-spin" />
        </motion.div>
      )}
      
      {/* Left icon */}
      {leftIcon && !loading && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mr-2"
        >
          {leftIcon}
        </motion.div>
      )}
      
      {/* Button content */}
      <motion.span
        animate={{ opacity: loading ? 0.7 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.span>
      
      {/* Right icon */}
      {rightIcon && !loading && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="ml-2"
        >
          {rightIcon}
        </motion.div>
      )}
      
      {/* Ripple effect */}
      <motion.div
        className="absolute inset-0 rounded-inherit bg-white/10 opacity-0"
        whileTap={{ opacity: 0.3, scale: 1.1 }}
        transition={{ duration: 0.1 }}
        style={{ pointerEvents: 'none' }}
      />
    </motion.button>
  )
})

Button.displayName = 'Button'

export default Button
