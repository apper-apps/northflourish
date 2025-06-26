import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { format, isToday, isYesterday } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Avatar from "@/components/atoms/Avatar";
import Input from "@/components/atoms/Input";
import MessageThread from "@/components/molecules/MessageThread";
import SkeletonLoader from "@/components/organisms/SkeletonLoader";
import ErrorState from "@/components/organisms/ErrorState";
import EmptyState from "@/components/organisms/EmptyState";
import messageService from "@/services/api/messageService";
import clientService from "@/services/api/clientService";


const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [clients, setClients] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const currentUserId = 'sarah-johnson';

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [messagesData, clientsData] = await Promise.all([
          messageService.getAll(),
          clientService.getAll()
        ]);
        
        setMessages(messagesData || []);
        setClients(clientsData || []);
        
        // Group messages into conversations
        const conversationMap = {};
        (messagesData || []).forEach(message => {
          const otherUserId = message.senderId === currentUserId ? message.receiverId : message.senderId;
          if (!conversationMap[otherUserId]) {
            conversationMap[otherUserId] = {
              userId: otherUserId,
              userName: message.senderId === currentUserId ? 
                message.receiverId : message.senderName,
              messages: [],
              lastMessage: null,
              unreadCount: 0
            };
          }
          conversationMap[otherUserId].messages.push(message);
          
          // Track unread messages
          if (!message.read && message.receiverId === currentUserId) {
            conversationMap[otherUserId].unreadCount++;
          }
        });

        // Set last message for each conversation and sort
        const conversationList = Object.values(conversationMap).map(conv => {
          conv.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          conv.lastMessage = conv.messages[conv.messages.length - 1];
          return conv;
        }).sort((a, b) => 
          new Date(b.lastMessage?.timestamp || 0) - new Date(a.lastMessage?.timestamp || 0)
        );

        setConversations(conversationList);
        
        // Auto-select first conversation if exists
        if (conversationList.length > 0 && !selectedConversation) {
          setSelectedConversation(conversationList[0]);
        }
      } catch (err) {
        setError(err.message || 'Failed to load messages');
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const messageData = {
        senderId: currentUserId,
        receiverId: selectedConversation.userId,
        content: newMessage.trim()
      };

      await messageService.create(messageData);
      setNewMessage('');
      toast.success('Message sent successfully');
      
      // Refresh messages (in a real app, you'd update state directly)
      window.location.reload();
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getTimeLabel = (timestamp) => {
    const date = new Date(timestamp);
    if (isToday(date)) return format(date, 'h:mm a');
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM dd');
  };

  const filteredConversations = conversations.filter(conv =>
    conv.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          <SkeletonLoader count={5} type="list" />
          <div className="lg:col-span-2">
            <SkeletonLoader count={3} type="card" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <ErrorState 
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
      transition={{ duration: 0.3 }}
      className="p-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Stay connected with your clients</p>
        </div>
        <Button icon="MessageSquare" onClick={() => toast.info('Start new conversation')}>
          New Message
        </Button>
      </div>

      {/* Messages Interface */}
      <div className="bg-white rounded-xl border border-surface-200 overflow-hidden" style={{ height: '600px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
          {/* Conversations List */}
          <div className="border-r border-surface-200 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-surface-200">
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon="Search"
                className="text-sm"
              />
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <EmptyState
                  title="No conversations"
                  description="Start messaging your clients to provide support and guidance"
                  actionLabel="New Message"
                  icon="MessageCircle"
                  onAction={() => toast.info('Start new conversation')}
                  className="py-8"
                />
              ) : (
                <div className="space-y-1 p-2">
                  {filteredConversations.map(conversation => (
                    <motion.div
                      key={conversation.userId}
                      whileHover={{ backgroundColor: '#f8fafc' }}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedConversation?.userId === conversation.userId 
                          ? 'bg-primary/5 border border-primary/20' 
                          : 'hover:bg-surface-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar
                          name={conversation.userName}
                          size="medium"
                          online={Math.random() > 0.5} // Random online status for demo
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900 truncate">
                              {conversation.userName}
                            </h3>
                            <div className="flex items-center space-x-1">
                              {conversation.lastMessage && (
                                <span className="text-xs text-gray-500">
                                  {getTimeLabel(conversation.lastMessage.timestamp)}
                                </span>
                              )}
                              {conversation.unreadCount > 0 && (
                                <span className="w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                          {conversation.lastMessage && (
                            <p className="text-sm text-gray-600 truncate">
                              {conversation.lastMessage.senderId === currentUserId ? 'You: ' : ''}
                              {conversation.lastMessage.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-surface-200 bg-surface-50">
                  <div className="flex items-center space-x-3">
                    <Avatar
                      name={selectedConversation.userName}
                      size="medium"
                      online={Math.random() > 0.5}
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">{selectedConversation.userName}</h3>
                      <p className="text-sm text-gray-600">Online</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto">
                  <MessageThread
                    messages={selectedConversation.messages}
                    currentUserId={currentUserId}
                  />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-surface-200 bg-surface-50">
                  <div className="flex items-end space-x-3">
                    <div className="flex-1">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="w-full px-4 py-2 border border-surface-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        rows="1"
                        style={{ minHeight: '40px', maxHeight: '120px' }}
                      />
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      icon="Send"
                      className="px-4 py-2"
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <EmptyState
                  title="Select a conversation"
                  description="Choose a conversation from the left to start messaging"
                  icon="MessageCircle"
                  className="py-12"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white rounded-lg border border-surface-200 p-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ApperIcon name="MessageCircle" className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Messages</p>
              <p className="text-lg font-semibold text-gray-900">{messages.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-surface-200 p-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <ApperIcon name="Users" className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Conversations</p>
              <p className="text-lg font-semibold text-gray-900">{conversations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-surface-200 p-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-warning/10 rounded-lg">
              <ApperIcon name="Bell" className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Unread</p>
              <p className="text-lg font-semibold text-gray-900">
                {conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-surface-200 p-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-success/10 rounded-lg">
              <ApperIcon name="Clock" className="w-5 h-5 text-success" />
</div>
            <div>
              <p className="text-sm text-gray-600">Response Time</p>
              <p className="text-lg font-semibold text-gray-900">&lt; 1h</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Messages;