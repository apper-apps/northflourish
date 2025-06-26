import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { format, isToday, addDays } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import StatCard from '@/components/molecules/StatCard';
import ProgressCard from '@/components/molecules/ProgressCard';
import SessionCard from '@/components/molecules/SessionCard';
import ResourceCard from '@/components/molecules/ResourceCard';
import DashboardHeader from '@/components/organisms/DashboardHeader';
import SkeletonLoader from '@/components/organisms/SkeletonLoader';
import ErrorState from '@/components/organisms/ErrorState';
import EmptyState from '@/components/organisms/EmptyState';

import sessionService from '@/services/api/sessionService';
import resourceService from '@/services/api/resourceService';
import goalService from '@/services/api/goalService';
import messageService from '@/services/api/messageService';

const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [resources, setResources] = useState([]);
  const [goals, setGoals] = useState([]);  
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [sessionsData, resourcesData, goalsData, messagesData] = await Promise.all([
          sessionService.getAll(),
          resourceService.getAll(),
          goalService.getAll(),
          messageService.getAll()
        ]);
        
        setSessions(sessionsData || []);
        setResources(resourcesData || []);
        setGoals(goalsData || []);
        setMessages(messagesData || []);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleJoinSession = (session) => {
    toast.success(`Joining session: ${session.title}`);
  };

  const handleRescheduleSession = (session) => {
    toast.info(`Rescheduling session: ${session.title}`);
  };

  const handleCancelSession = (session) => {
    toast.warning(`Session cancelled: ${session.title}`);
  };

  const handleViewResource = (resource) => {
    toast.info(`Opening resource: ${resource.title}`);
  };

  const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <SkeletonLoader count={1} type="card" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SkeletonLoader count={4} type="card" />
        </div>
        <SkeletonLoader count={3} type="card" />
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

  // Filter today's sessions
  const todaySessions = sessions.filter(session => {
    const sessionDate = new Date(session.dateTime);
    return isToday(sessionDate) && session.status === 'scheduled';
  });

  // Get upcoming sessions (next 7 days)
  const upcomingSessions = sessions.filter(session => {
    const sessionDate = new Date(session.dateTime);
    const nextWeek = addDays(new Date(), 7);
    return sessionDate > new Date() && sessionDate <= nextWeek;
  }).slice(0, 3);

  // Get recent resources
  const recentResources = resources.slice(0, 3);

  // Calculate stats
  const activeGoals = goals.filter(goal => goal.status === 'in-progress').length;
  const completedSessions = sessions.filter(session => session.status === 'completed').length;
  const unreadMessages = messages.filter(message => !message.read).length;
  const averageProgress = goals.length > 0 
    ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length)
    : 0;

  return (
    <motion.div
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
      transition={{ duration: 0.3 }}
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      {/* Header */}
      <DashboardHeader userName="Sarah" notifications={unreadMessages} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Sessions"
          value={todaySessions.length}
          icon="Calendar"
          color="primary"
          trend="neutral"
        />
        <StatCard
          title="Active Goals"
          value={activeGoals}
          icon="Target"
          color="secondary"
          trend="up"
          change="+2"
        />
        <StatCard
          title="Completed Sessions"
          value={completedSessions}
          icon="CheckCircle"
          color="success"
          trend="up"
          change="+5"
        />
        <StatCard
          title="New Messages"
          value={unreadMessages}
          icon="MessageCircle"
          color="warning"
          trend="neutral"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Sessions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Sessions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-heading font-semibold text-gray-900">Today's Sessions</h2>
              <Button variant="ghost" size="small" icon="Calendar">
                View All
              </Button>
            </div>
            
            {todaySessions.length === 0 ? (
              <EmptyState
                title="No sessions today"
                description="Enjoy your free time or schedule new sessions with clients"
                actionLabel="Schedule Session"
                icon="Calendar"
                onAction={() => toast.info('Navigate to Sessions page')}
              />
            ) : (
              <div className="space-y-4">
                {todaySessions.map((session) => (
                  <SessionCard
                    key={session.Id}
                    session={session}
                    onJoin={handleJoinSession}
                    onReschedule={handleRescheduleSession}
                    onCancel={handleCancelSession}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Sessions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-heading font-semibold text-gray-900">Upcoming Sessions</h2>
              <Button variant="ghost" size="small" icon="ChevronRight">
                View All
              </Button>
            </div>
            
            {upcomingSessions.length === 0 ? (
              <EmptyState
                title="No upcoming sessions"
                description="Your schedule is clear for the next week"
                actionLabel="Schedule Session"
                icon="Calendar"
                onAction={() => toast.info('Navigate to Sessions page')}
              />
            ) : (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <SessionCard
                    key={session.Id}
                    session={session}
                    onJoin={handleJoinSession}
                    onReschedule={handleRescheduleSession}
                    onCancel={handleCancelSession}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Progress & Resources */}
        <div className="space-y-6">
          {/* Progress Overview */}
          <div>
            <h2 className="text-xl font-heading font-semibold text-gray-900 mb-4">Progress Overview</h2>
            <ProgressCard
              title="Overall Client Progress"
              progress={averageProgress}
              icon="TrendingUp"
              color="success"
            />
          </div>

          {/* Recent Resources */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-heading font-semibold text-gray-900">Recent Resources</h2>
              <Button variant="ghost" size="small" icon="BookOpen">
                View All
              </Button>
            </div>
            
            {recentResources.length === 0 ? (
              <EmptyState
                title="No resources yet"
                description="Add resources to help your clients on their journey"
                actionLabel="Add Resource"
                icon="BookOpen"
                onAction={() => toast.info('Navigate to Resources page')}
              />
            ) : (
              <div className="space-y-4">
                {recentResources.map((resource) => (
                  <div key={resource.Id} className="bg-white rounded-lg border border-surface-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                       onClick={() => handleViewResource(resource)}>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
                          <ApperIcon 
                            name={resource.type === 'video' ? 'Play' : 
                                  resource.type === 'article' ? 'FileText' : 
                                  resource.type === 'audio' ? 'Headphones' : 'Download'} 
                            className="w-6 h-6 text-primary" 
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{resource.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{resource.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="default" size="small">{resource.category}</Badge>
                          <Badge variant="primary" size="small">{resource.type}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-6 border border-primary/10">
            <h3 className="font-heading font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start" icon="Plus">
                Schedule Session
              </Button>
              <Button variant="outline" className="w-full justify-start" icon="Upload">
                Add Resource
              </Button>
              <Button variant="outline" className="w-full justify-start" icon="MessageCircle">
                Send Message
              </Button>
              <Button variant="outline" className="w-full justify-start" icon="Target">
                Create Goal
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;