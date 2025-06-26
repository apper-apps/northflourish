import { useState, forwardRef } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const Input = forwardRef(({ 
  label,
  type = 'text',
  error,
  icon,
  iconPosition = 'left',
  className = '',
  ...props 
}, ref) => {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(props.value || props.defaultValue || false);

  const handleFocus = () => setFocused(true);
  const handleBlur = (e) => {
    setFocused(false);
    setHasValue(e.target.value !== '');
  };

  const inputClasses = `
    w-full px-4 py-3 border-2 rounded-xl transition-all duration-200
    ${error 
      ? 'border-error focus:border-error focus:ring-error/20' 
      : 'border-surface-200 focus:border-primary focus:ring-primary/20'
    }
    ${icon && iconPosition === 'left' ? 'pl-11' : ''}
    ${icon && iconPosition === 'right' ? 'pr-11' : ''}
    focus:outline-none focus:ring-4 bg-white
    ${className}
  `.trim();

  const labelClasses = `
    absolute left-4 transition-all duration-200 pointer-events-none
    ${focused || hasValue 
      ? 'top-2 text-xs text-primary font-medium' 
      : 'top-1/2 -translate-y-1/2 text-gray-500'
    }
    ${icon && iconPosition === 'left' ? 'left-11' : ''}
  `.trim();

  return (
    <div className="relative">
      {icon && iconPosition === 'left' && (
        <ApperIcon 
          name={icon} 
          className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
            focused ? 'text-primary' : 'text-gray-400'
          }`}
        />
      )}
      
      <input
        ref={ref}
        type={type}
        className={inputClasses}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={(e) => setHasValue(e.target.value !== '')}
        {...props}
      />
      
      {label && (
        <motion.label
          className={labelClasses}
          animate={{
            top: focused || hasValue ? '0.5rem' : '50%',
            fontSize: focused || hasValue ? '0.75rem' : '1rem',
            y: focused || hasValue ? 0 : '-50%'
          }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.label>
      )}
      
      {icon && iconPosition === 'right' && (
        <ApperIcon 
          name={icon} 
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
            focused ? 'text-primary' : 'text-gray-400'
          }`}
        />
      )}
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-error flex items-center"
        >
          <ApperIcon name="AlertCircle" className="w-4 h-4 mr-1" />
          {error}
        </motion.p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;