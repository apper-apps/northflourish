import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const ErrorState = ({ 
  title = "Something went wrong",
  message = "We're having trouble loading this content. Please try again.",
  onRetry,
  showRetry = true,
  icon = "AlertTriangle",
  className = '',
  ...props 
}) => {
  const containerAnimation = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    }
  };

  const iconAnimation = {
    animate: {
      rotate: [0, -10, 10, -10, 0],
      scale: [1, 1.1, 1]
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatDelay: 3
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerAnimation}
      className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}
      {...props}
    >
      <motion.div
        animate={iconAnimation.animate}
        transition={iconAnimation.transition}
        className="mb-6 p-4 bg-error/10 rounded-full"
      >
        <ApperIcon name={icon} className="w-12 h-12 text-error" />
      </motion.div>
      
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-semibold text-gray-900 mb-2"
      >
        {title}
      </motion.h3>
      
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-gray-600 mb-6 max-w-md"
      >
        {message}
      </motion.p>
      
      {showRetry && onRetry && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={onRetry}
            icon="RefreshCw"
            className="px-6 py-2"
          >
            Try Again
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ErrorState;