import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';

const ResourceCard = ({ 
  resource,
  onClick,
  className = '',
  ...props 
}) => {
  const typeIcons = {
    video: 'Play',
    article: 'FileText',
    audio: 'Headphones',
    worksheet: 'Download'
  };

  const typeColors = {
    video: 'primary',
    article: 'secondary',
    audio: 'warning',
    worksheet: 'info'
  };

  const cardClasses = `
    group cursor-pointer bg-white rounded-xl border border-surface-200 overflow-hidden hover:shadow-xl transition-all duration-300
    ${className}
  `.trim();

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cardClasses}
      onClick={onClick}
      {...props}
    >
<div className="relative overflow-hidden">
        <img
          src={resource.mediaUrl || resource.media_url || '/api/placeholder/400/300'}
          alt={resource.title}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.src = '/api/placeholder/400/300';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute top-3 left-3">
          <Badge variant={typeColors[resource.type]} size="small">
            <ApperIcon name={typeIcons[resource.type]} className="w-3 h-3 mr-1" />
            {resource.type}
          </Badge>
        </div>
        {resource.duration && (
          <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 text-white text-xs rounded-full">
            {resource.duration}
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
            {resource.title}
          </h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {resource.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="default" size="small">
              {resource.category}
            </Badge>
            {resource.difficulty && (
              <Badge 
                variant={resource.difficulty === 'Beginner' ? 'success' : 
                        resource.difficulty === 'Intermediate' ? 'warning' : 'error'} 
                size="small"
              >
                {resource.difficulty}
              </Badge>
            )}
          </div>
<div className="flex items-center text-xs text-gray-500">
            <ApperIcon name="User" className="w-3 h-3 mr-1" />
            {resource.createdBy || resource.created_by || 'Unknown'}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResourceCard;