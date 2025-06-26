import { motion } from 'framer-motion';
import { format, isToday, isYesterday } from 'date-fns';
import Avatar from '@/components/atoms/Avatar';
import ApperIcon from '@/components/ApperIcon';

const MessageThread = ({ 
  messages = [],
  currentUserId = 'sarah-johnson',
  onSendMessage,
  className = '',
  ...props 
}) => {
  const getTimeLabel = (timestamp) => {
    const date = new Date(timestamp);
    if (isToday(date)) return format(date, 'h:mm a');
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM dd');
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const messageItem = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className={`flex flex-col h-full ${className}`} {...props}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {messages.map((message) => {
            const isOwn = message.senderId === currentUserId;
            
            return (
              <motion.div
                key={message.Id}
                variants={messageItem}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
                  <Avatar
                    name={message.senderName}
                    size="small"
                    className="flex-shrink-0"
                  />
                  
                  <div className={`px-4 py-2 rounded-2xl ${
                    isOwn 
                      ? 'bg-primary text-white' 
                      : 'bg-surface-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <div className={`flex items-center justify-between mt-1 ${
                      isOwn ? 'text-primary-200' : 'text-gray-500'
                    }`}>
                      <span className="text-xs">{getTimeLabel(message.timestamp)}</span>
                      {isOwn && (
                        <ApperIcon 
                          name={message.read ? "CheckCheck" : "Check"} 
                          className="w-3 h-3 ml-2" 
                        />
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default MessageThread;