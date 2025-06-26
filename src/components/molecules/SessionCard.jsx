import { motion } from 'framer-motion';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';

const SessionCard = ({ 
  session,
  onJoin,
  onReschedule,
  onCancel,
  className = '',
  ...props 
}) => {
  const sessionDate = new Date(session.dateTime);
  const isUpcoming = !isPast(sessionDate);
  
  const getDateLabel = () => {
    if (isToday(sessionDate)) return 'Today';
    if (isTomorrow(sessionDate)) return 'Tomorrow';
    return format(sessionDate, 'MMM dd');
  };

  const getStatusColor = () => {
    switch (session.status) {
      case 'completed': return 'success';
      case 'scheduled': return isUpcoming ? 'primary' : 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const typeIcons = {
    video: 'Video',
    phone: 'Phone',
    'in-person': 'MapPin'
  };

  const cardClasses = `
    p-6 bg-white rounded-xl border border-surface-200 hover:shadow-lg transition-all duration-300
    ${className}
  `.trim();

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cardClasses}
      {...props}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-gray-900 truncate">{session.title}</h3>
            <Badge variant={getStatusColor()} size="small">
              {session.status}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <ApperIcon name="Calendar" className="w-4 h-4 mr-1" />
              {getDateLabel()}
            </div>
            <div className="flex items-center">
              <ApperIcon name="Clock" className="w-4 h-4 mr-1" />
              {format(sessionDate, 'h:mm a')}
            </div>
            <div className="flex items-center">
              <ApperIcon name={typeIcons[session.type]} className="w-4 h-4 mr-1" />
              {session.duration}min
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center text-sm text-gray-600">
            <ApperIcon name="User" className="w-4 h-4 mr-1" />
            {session.clientName}
          </div>
          <Badge variant="default" size="small">
            {session.sessionType}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          {session.status === 'scheduled' && isUpcoming && (
            <>
              {isToday(sessionDate) && (
                <Button
                  size="small"
                  variant="primary"
                  icon="Video"
                  onClick={() => onJoin?.(session)}
                >
                  Join
                </Button>
              )}
              <Button
                size="small"
                variant="ghost"
                icon="Calendar"
                onClick={() => onReschedule?.(session)}
              />
              <Button
                size="small"
                variant="ghost"
                icon="X"
                onClick={() => onCancel?.(session)}
              />
            </>
          )}
          
          {session.status === 'completed' && (
            <Button
              size="small"
              variant="ghost"
              icon="FileText"
              onClick={() => console.log('View notes')}
            >
              Notes
            </Button>
          )}
        </div>
      </div>

      {session.notes && (
        <div className="mt-4 pt-4 border-t border-surface-200">
          <p className="text-sm text-gray-600">{session.notes}</p>
        </div>
      )}
    </motion.div>
  );
};

export default SessionCard;