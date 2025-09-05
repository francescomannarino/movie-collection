import { forwardRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, X, Search } from 'lucide-react'

const Input = forwardRef(({
  type = 'text',
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  onClear,
  leftIcon,
  rightIcon,
  clearable = false,
  searchMode = false,
  error,
  disabled = false,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const handleFocus = (e) => {
    setIsFocused(true)
    if (onFocus) onFocus(e)
  }
  
  const handleBlur = (e) => {
    setIsFocused(false)
    if (onBlur) onBlur(e)
  }
  
  const handleClear = () => {
    if (onChange) {
      onChange({ target: { value: '' } })
    }
    if (onClear) onClear()
  }
  
  const togglePassword = () => {
    setShowPassword(!showPassword)
  }
  
  const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type
  const hasValue = value && value.length > 0
  
  return (
    <div className={`relative ${containerClassName}`}>
      <motion.div
        className={`relative flex items-center ${
          searchMode ? 'search-input-container' : ''
        }`}
        animate={{
          scale: isFocused ? 1.02 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Left icon */}
        {(leftIcon || searchMode) && (
          <div className="absolute left-3 z-10">
            <motion.div
              animate={{
                color: isFocused ? '#fbbf24' : '#94a3b8',
                scale: isFocused ? 1.1 : 1
              }}
              transition={{ duration: 0.2 }}
            >
              {leftIcon || <Search size={20} />}
            </motion.div>
          </div>
        )}
        
        {/* Input field */}
        <motion.input
          ref={ref}
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            input-native
            ${leftIcon || searchMode ? 'pl-12' : 'pl-4'}
            ${(rightIcon || clearable || type === 'password') ? 'pr-12' : 'pr-4'}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${className}
          `}
          {...props}
        />
        
        {/* Right icons */}
        <div className="absolute right-3 flex items-center space-x-2">
          {/* Clear button */}
          <AnimatePresence>
            {clearable && hasValue && !disabled && (
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                onClick={handleClear}
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
                type="button"
              >
                <X size={16} className="text-cinema-400 hover:text-white" />
              </motion.button>
            )}
          </AnimatePresence>
          
          {/* Password toggle */}
          {type === 'password' && (
            <motion.button
              onClick={togglePassword}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
              type="button"
              whileTap={{ scale: 0.9 }}
            >
              {showPassword ? (
                <EyeOff size={16} className="text-cinema-400 hover:text-white" />
              ) : (
                <Eye size={16} className="text-cinema-400 hover:text-white" />
              )}
            </motion.button>
          )}
          
          {/* Custom right icon */}
          {rightIcon && (
            <div className="text-cinema-400">
              {rightIcon}
            </div>
          )}
        </div>
        
        {/* Focus indicator */}
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-golden-500 pointer-events-none"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{
            opacity: isFocused ? 0.3 : 0,
            scale: isFocused ? 1 : 0.95
          }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>
      
      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-red-400 flex items-center space-x-1"
          >
            <span>⚠️</span>
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

Input.displayName = 'Input'

export default Input
