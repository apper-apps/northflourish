import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const StatCard = ({ 
  title, 
  value, 
  change,
  icon,
  trend = 'neutral',
  color = 'primary',
  className = '',
  ...props 
}) => {
  const colorClasses = {
    primary: 'from-primary/5 to-primary/10 border-primary/20',
    secondary: 'from-secondary/5 to-secondary/10 border-secondary/20',
    success: 'from-success/5 to-success/10 border-success/20',
    warning: 'from-warning/5 to-warning/10 border-warning/20'
  };

  const iconColors = {
    primary: 'text-primary bg-primary/10',
    secondary: 'text-secondary bg-secondary/10',
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10'
  };

  const trendColors = {
    up: 'text-success bg-success/10',
    down: 'text-error bg-error/10',
    neutral: 'text-surface-600 bg-surface-100'
  };

  const cardClasses = `
    p-6 bg-gradient-to-br ${colorClasses[color]} border rounded-xl hover:shadow-lg transition-all duration-300
    ${className}
  `.trim();

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      className={cardClasses}
      {...props}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {icon && (
          <div className={`p-2 rounded-lg ${iconColors[color]}`}>
            <ApperIcon name={icon} className="w-5 h-5" />
          </div>
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <motion.p
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-gray-900"
          >
            {value}
          </motion.p>
        </div>
        
        {change && (
          <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${trendColors[trend]}`}>
            <ApperIcon 
              name={trend === 'up' ? 'TrendingUp' : trend === 'down' ? 'TrendingDown' : 'Minus'} 
              className="w-3 h-3 mr-1" 
            />
            {change}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;