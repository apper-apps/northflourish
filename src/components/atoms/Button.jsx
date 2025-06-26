import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  icon, 
  iconPosition = 'left',
  disabled = false,
  loading = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-primary text-white hover:brightness-110 focus:ring-primary/50 shadow-sm',
    secondary: 'bg-secondary text-white hover:brightness-110 focus:ring-secondary/50 shadow-sm',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary/50',
    ghost: 'text-gray-600 hover:bg-surface-100 hover:text-gray-900 focus:ring-gray/50',
    danger: 'bg-error text-white hover:brightness-110 focus:ring-error/50 shadow-sm'
  };
  
  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  };
  
  const disabledClasses = 'opacity-50 cursor-not-allowed';
  
  const buttonClasses = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${disabled ? disabledClasses : ''}
    ${className}
  `.trim();

  const hoverAnimation = disabled ? {} : { scale: 1.02 };
  const tapAnimation = disabled ? {} : { scale: 0.98 };

  return (
    <motion.button
      whileHover={hoverAnimation}
      whileTap={tapAnimation}
      className={buttonClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <ApperIcon 
          name="Loader2" 
          className={`animate-spin ${size === 'small' ? 'w-4 h-4' : 'w-5 h-5'} ${children ? 'mr-2' : ''}`} 
        />
      )}
      {!loading && icon && iconPosition === 'left' && (
        <ApperIcon 
          name={icon} 
          className={`${size === 'small' ? 'w-4 h-4' : 'w-5 h-5'} ${children ? 'mr-2' : ''}`} 
        />
      )}
      {children}
      {!loading && icon && iconPosition === 'right' && (
        <ApperIcon 
          name={icon} 
          className={`${size === 'small' ? 'w-4 h-4' : 'w-5 h-5'} ${children ? 'ml-2' : ''}`} 
        />
      )}
    </motion.button>
  );
};

export default Button;