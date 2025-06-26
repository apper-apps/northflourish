import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const Avatar = ({ 
  src, 
  alt, 
  size = 'medium', 
  name,
  online = false,
  className = '',
  ...props 
}) => {
  const sizes = {
    small: 'w-8 h-8 text-xs',
    medium: 'w-10 h-10 text-sm',
    large: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };

  const getInitials = (fullName) => {
    if (!fullName) return '';
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarClasses = `
    relative inline-flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white font-medium overflow-hidden
    ${sizes[size]}
    ${className}
  `.trim();

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={avatarClasses}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt || name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      ) : name ? (
        getInitials(name)
      ) : (
        <ApperIcon name="User" className="w-1/2 h-1/2" />
      )}
      
      {online && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-secondary border-2 border-white rounded-full"
        />
      )}
    </motion.div>
  );
};

export default Avatar;