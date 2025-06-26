import { motion } from 'framer-motion';

const SkeletonLoader = ({ 
  count = 3, 
  type = 'card',
  className = '',
  ...props 
}) => {
  const shimmerAnimation = {
    animate: {
      x: ['-100%', '100%'],
    },
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'linear'
    }
  };

  const renderSkeletonItem = (index) => {
    switch (type) {
      case 'card':
        return (
          <div key={index} className="bg-white rounded-xl border border-surface-200 p-6">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-surface-200 rounded w-1/3"></div>
                <div className="h-8 w-8 bg-surface-200 rounded-lg"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-surface-200 rounded w-3/4"></div>
                <div className="h-4 bg-surface-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        );
      
      case 'list':
        return (
          <div key={index} className="flex items-center space-x-4 p-4">
            <div className="animate-pulse flex items-center space-x-4 w-full">
              <div className="w-12 h-12 bg-surface-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-surface-200 rounded w-3/4"></div>
                <div className="h-3 bg-surface-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        );
      
      case 'resource':
        return (
          <div key={index} className="bg-white rounded-xl border border-surface-200 overflow-hidden">
            <div className="animate-pulse">
              <div className="h-48 bg-surface-200"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-surface-200 rounded w-3/4"></div>
                <div className="h-3 bg-surface-200 rounded w-full"></div>
                <div className="h-3 bg-surface-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div key={index} className="animate-pulse">
            <div className="h-4 bg-surface-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-surface-200 rounded w-3/4"></div>
          </div>
        );
    }
  };

  const containerClasses = {
    card: 'grid gap-6',
    list: 'space-y-2',
    resource: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    default: 'space-y-4'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`${containerClasses[type]} ${className}`}
      {...props}
    >
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative overflow-hidden"
        >
          {renderSkeletonItem(index)}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
            {...shimmerAnimation}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default SkeletonLoader;