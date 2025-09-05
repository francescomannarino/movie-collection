import { forwardRef } from 'react'
import { motion } from 'framer-motion'

const Card = forwardRef(({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  spotlight = false,
  className = '',
  onClick,
  ...props
}, ref) => {
  const baseClasses = 'card-native transition-all duration-300'
  
  const variantClasses = {
    default: 'glass',
    dark: 'glass-dark',
    golden: 'glass-golden',
    solid: 'bg-white dark:bg-cinema-800 border-gray-200 dark:border-cinema-700',
    transparent: 'bg-transparent border-transparent'
  }
  
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  }
  
  const hoverClasses = hover ? 'hover:scale-[1.02] hover:shadow-strong cursor-pointer' : ''
  const spotlightClasses = spotlight ? 'spotlight' : ''
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClasses} ${spotlightClasses} ${className}`
  
  const CardComponent = onClick ? motion.button : motion.div
  
  return (
    <CardComponent
      ref={ref}
      className={classes}
      onClick={onClick}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </CardComponent>
  )
})

Card.displayName = 'Card'

// Card Header component
export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`mb-4 ${className}`} {...props}>
    {children}
  </div>
)

// Card Title component
export const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`text-lg font-semibold text-cinema-900 dark:text-white ${className}`} {...props}>
    {children}
  </h3>
)

// Card Description component
export const CardDescription = ({ children, className = '', ...props }) => (
  <p className={`text-gray-600 dark:text-cinema-300 text-sm ${className}`} {...props}>
    {children}
  </p>
)

// Card Content component
export const CardContent = ({ children, className = '', ...props }) => (
  <div className={`${className}`} {...props}>
    {children}
  </div>
)

// Card Footer component
export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`mt-4 pt-4 border-t border-gray-200/50 dark:border-white/10 ${className}`} {...props}>
    {children}
  </div>
)

export default Card
