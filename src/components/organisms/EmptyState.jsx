import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const EmptyState = ({ 
  title = "No items found",
  description = "Get started by creating your first item",
  actionLabel = "Create Item",
  onAction,
  icon = "Package",
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
    animate: { y: [0, -10, 0] },
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
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
        className="mb-6 p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full border border-primary/10"
      >
        <ApperIcon name={icon} className="w-16 h-16 text-gray-300" />
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
        {description}
      </motion.p>
      
      {onAction && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={onAction}
            icon="Plus"
            className="px-6 py-2"
          >
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmptyState;