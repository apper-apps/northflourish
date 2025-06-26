import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const ProgressCard = ({ 
  title, 
  progress, 
  target, 
  icon,
  color = 'primary',
  className = '',
  ...props 
}) => {
  const percentage = target ? Math.round((progress / target) * 100) : progress;
  
  const colorClasses = {
    primary: 'text-primary bg-primary/10 border-primary/20',
    secondary: 'text-secondary bg-secondary/10 border-secondary/20',
    success: 'text-success bg-success/10 border-success/20',
    warning: 'text-warning bg-warning/10 border-warning/20'
  };

  const progressColors = {
    primary: 'stroke-primary',
    secondary: 'stroke-secondary',
    success: 'stroke-success',
    warning: 'stroke-warning'
  };

  const cardClasses = `
    p-6 bg-white rounded-xl border border-surface-200 hover:shadow-lg transition-all duration-300
    ${className}
  `.trim();

  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cardClasses}
      {...props}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {icon && (
          <div className={`p-2 rounded-lg border ${colorClasses[color]}`}>
            <ApperIcon name={icon} className="w-5 h-5" />
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-surface-200"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeLinecap="round"
              className={progressColors[color]}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{
                strokeDasharray,
                strokeDashoffset
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-900">{percentage}%</span>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{progress}{target ? ` / ${target}` : ''}</span>
          </div>
          <div className="w-full bg-surface-200 rounded-full h-2">
            <motion.div
              className={`h-2 rounded-full ${color === 'primary' ? 'bg-primary' : 
                color === 'secondary' ? 'bg-secondary' : 
                color === 'success' ? 'bg-success' : 'bg-warning'}`}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProgressCard;