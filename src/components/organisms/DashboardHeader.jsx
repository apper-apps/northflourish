import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Avatar from '@/components/atoms/Avatar';

const DashboardHeader = ({ 
  userName = "Sarah",
  notifications = 3,
  className = '',
  ...props 
}) => {
  const currentTime = new Date();
  const hour = currentTime.getHours();
  
  const getGreeting = () => {
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const headerAnimation = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={headerAnimation}
      className={`bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6 border border-primary/10 ${className}`}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar
            name="Sarah Johnson"
            src="https://images.unsplash.com/photo-1494790108755-2616b612b715?w=100&h=100&fit=crop&crop=face"
            size="xl"
            online
          />
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-heading font-bold text-gray-900"
            >
              {getGreeting()}, {userName}!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-600"
            >
              Ready to make a positive impact today?
            </motion.p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
          >
            <ApperIcon name="Bell" className="w-6 h-6 text-gray-600" />
            {notifications > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-xs rounded-full flex items-center justify-center"
              >
                {notifications}
              </motion.span>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
          >
            <ApperIcon name="Settings" className="w-6 h-6 text-gray-600" />
          </motion.button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/70 backdrop-blur-sm rounded-lg p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ApperIcon name="Calendar" className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Today's Sessions</p>
              <p className="text-lg font-semibold text-gray-900">4</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/70 backdrop-blur-sm rounded-lg p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <ApperIcon name="MessageCircle" className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-gray-600">New Messages</p>
              <p className="text-lg font-semibold text-gray-900">7</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/70 backdrop-blur-sm rounded-lg p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <ApperIcon name="Target" className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Goals</p>
              <p className="text-lg font-semibold text-gray-900">12</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardHeader;