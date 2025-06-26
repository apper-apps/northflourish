import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { format, startOfWeek, addDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import SessionCard from '@/components/molecules/SessionCard';
import SkeletonLoader from '@/components/organisms/SkeletonLoader';
import ErrorState from '@/components/organisms/ErrorState';
import EmptyState from '@/components/organisms/EmptyState';

import sessionService from '@/services/api/sessionService';

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const loadSessions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await sessionService.getAll();
        setSessions(result || []);
      } catch (err) {
        setError(err.message || 'Failed to load sessions');
        toast.error('Failed to load sessions');
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
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

const handleScheduleNew = () => {
    toast.info('Opening session scheduling form with meeting platform selection');
  };

  const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <SkeletonLoader count={5} type="card" />
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

  // Filter sessions by status
  const upcomingSessions = sessions.filter(session => 
    session.status === 'scheduled' && new Date(session.dateTime) > new Date()
  );
  const pastSessions = sessions.filter(session => 
    session.status === 'completed' || new Date(session.dateTime) < new Date()
  );
  const todaySessions = sessions.filter(session => 
    isSameDay(new Date(session.dateTime), new Date())
  );

  // Calendar view helpers
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const getSessionsForDate = (date) => {
    return sessions.filter(session => 
      isSameDay(new Date(session.dateTime), date)
    );
  };

  const CalendarView = () => (
    <div className="bg-white rounded-xl border border-surface-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-heading font-semibold text-gray-900">
          {format(selectedDate, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="small"
            icon="ChevronLeft"
            onClick={() => setSelectedDate(addDays(selectedDate, -30))}
          />
          <Button
            variant="ghost"
            size="small"
            onClick={() => setSelectedDate(new Date())}
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="small"
            icon="ChevronRight"
            onClick={() => setSelectedDate(addDays(selectedDate, 30))}
          />
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {monthDays.map(day => {
          const daySessions = getSessionsForDate(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <motion.div
              key={day.toISOString()}
              whileHover={{ scale: 1.02 }}
              className={`min-h-[100px] p-2 border border-surface-100 rounded-lg ${
                isToday ? 'bg-primary/5 border-primary/20' : 'hover:bg-surface-50'
              }`}
            >
              <div className={`text-sm font-medium mb-1 ${
                isToday ? 'text-primary' : 'text-gray-900'
              }`}>
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {daySessions.slice(0, 2).map(session => (
                  <div
                    key={session.Id}
                    className="text-xs p-1 bg-primary/10 text-primary rounded truncate cursor-pointer"
                    onClick={() => handleJoinSession(session)}
                  >
                    {format(new Date(session.dateTime), 'HH:mm')} {session.title}
                  </div>
                ))}
                {daySessions.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{daySessions.length - 2} more
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  const ListView = () => (
    <div className="space-y-6">
      {/* Today's Sessions */}
      {todaySessions.length > 0 && (
        <div>
          <h2 className="text-xl font-heading font-semibold text-gray-900 mb-4">Today's Sessions</h2>
          <div className="space-y-4">
            {todaySessions.map(session => (
              <SessionCard
                key={session.Id}
                session={session}
                onJoin={handleJoinSession}
                onReschedule={handleRescheduleSession}
                onCancel={handleCancelSession}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Sessions */}
      <div>
        <h2 className="text-xl font-heading font-semibold text-gray-900 mb-4">Upcoming Sessions</h2>
        {upcomingSessions.length === 0 ? (
          <EmptyState
            title="No upcoming sessions"
            description="Schedule sessions with your clients to start their wellness journey"
            actionLabel="Schedule Session"
            icon="Calendar"
            onAction={handleScheduleNew}
          />
        ) : (
          <div className="space-y-4">
            {upcomingSessions.map(session => (
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

      {/* Past Sessions */}
      {pastSessions.length > 0 && (
        <div>
          <h2 className="text-xl font-heading font-semibold text-gray-900 mb-4">Past Sessions</h2>
          <div className="space-y-4">
            {pastSessions.slice(0, 5).map(session => (
              <SessionCard
                key={session.Id}
                session={session}
                onJoin={handleJoinSession}
                onReschedule={handleRescheduleSession}
                onCancel={handleCancelSession}
              />
            ))}
          </div>
          {pastSessions.length > 5 && (
            <Button variant="ghost" className="w-full mt-4">
              Load More Past Sessions
            </Button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <motion.div
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
      transition={{ duration: 0.3 }}
      className="p-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Sessions</h1>
          <p className="text-gray-600">Manage your coaching sessions and appointments</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <div className="flex items-center bg-surface-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="small"
              icon="List"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'primary' : 'ghost'}
              size="small"
              icon="Calendar"
              onClick={() => setViewMode('calendar')}
            >
              Calendar
            </Button>
          </div>
          <Button icon="Plus" onClick={handleScheduleNew}>
            Schedule Session
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-surface-200 p-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ApperIcon name="Calendar" className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Today</p>
              <p className="text-lg font-semibold text-gray-900">{todaySessions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-surface-200 p-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <ApperIcon name="Clock" className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-lg font-semibold text-gray-900">{upcomingSessions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-surface-200 p-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-success/10 rounded-lg">
              <ApperIcon name="CheckCircle" className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-lg font-semibold text-gray-900">{pastSessions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-surface-200 p-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-warning/10 rounded-lg">
              <ApperIcon name="Users" className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-lg font-semibold text-gray-900">{sessions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {viewMode === 'calendar' ? <CalendarView /> : <ListView />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default Sessions;