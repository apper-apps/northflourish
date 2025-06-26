import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Avatar from '@/components/atoms/Avatar';
import Input from '@/components/atoms/Input';
import ProgressCard from '@/components/molecules/ProgressCard';
import SkeletonLoader from '@/components/organisms/SkeletonLoader';
import ErrorState from '@/components/organisms/ErrorState';
import EmptyState from '@/components/organisms/EmptyState';

import goalService from '@/services/api/goalService';
import sessionService from '@/services/api/sessionService';
import clientService from '@/services/api/clientService';

const Profile = () => {
  const [goals, setGoals] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');

  // Mock user profile data
  const userProfile = {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@flourishhub.com',
    title: 'Certified Wellness Coach',
    bio: 'Passionate about helping individuals discover their inner strength and create lasting positive change in their lives.',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b715?w=200&h=200&fit=crop&crop=face',
    joinDate: '2023-08-15',
    certifications: [
      'Certified Life Coach (ICF)',
      'Mindfulness-Based Stress Reduction',
      'Energy Healing Practitioner'
    ],
    specialties: [
      'Stress Management',
      'Career Transition',
      'Mindfulness',
      'Energy Healing'
    ]
  };

  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [goalsData, sessionsData, clientsData] = await Promise.all([
          goalService.getAll(),
          sessionService.getAll(),
          clientService.getAll()
        ]);
        
        setGoals(goalsData || []);
        setSessions(sessionsData || []);
        setClients(clientsData || []);
      } catch (err) {
        setError(err.message || 'Failed to load profile data');
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, []);

  const handleCreateGoal = async () => {
    if (!newGoalTitle.trim()) return;

    try {
      const goalData = {
        title: newGoalTitle,
        description: newGoalDescription,
        category: 'Personal',
        targetDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        progress: 0,
        status: 'in-progress',
        clientId: '1', // Demo client ID
        milestones: []
      };

      await goalService.create(goalData);
      setNewGoalTitle('');
      setNewGoalDescription('');
      toast.success('Goal created successfully');
      
      // Refresh goals
      const updatedGoals = await goalService.getAll();
      setGoals(updatedGoals || []);
    } catch (err) {
      toast.error('Failed to create goal');
    }
  };

  const handleUpdateGoalProgress = async (goalId, newProgress) => {
    try {
      await goalService.update(goalId, { progress: newProgress });
      toast.success('Goal progress updated');
      
      // Update local state
      setGoals(goals.map(goal => 
        goal.Id === goalId ? { ...goal, progress: newProgress } : goal
      ));
    } catch (err) {
      toast.error('Failed to update goal progress');
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      await goalService.delete(goalId);
      toast.success('Goal deleted successfully');
      setGoals(goals.filter(goal => goal.Id !== goalId));
    } catch (err) {
      toast.error('Failed to delete goal');
    }
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

  // Calculate stats
  const completedSessions = sessions.filter(s => s.status === 'completed').length;
  const activeGoals = goals.filter(g => g.status === 'in-progress').length;
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
      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6 border border-primary/10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-6">
            <Avatar
              src={userProfile.avatar}
              name={userProfile.name}
              size="xl"
              online
            />
            <div>
              <h1 className="text-2xl font-heading font-bold text-gray-900">{userProfile.name}</h1>
              <p className="text-primary font-medium">{userProfile.title}</p>
              <p className="text-gray-600 mt-1">{userProfile.bio}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <ApperIcon name="Calendar" className="w-4 h-4 mr-1" />
                  Joined {format(new Date(userProfile.joinDate), 'MMM yyyy')}
                </div>
                <div className="flex items-center">
                  <ApperIcon name="Users" className="w-4 h-4 mr-1" />
                  {clients.length} Clients
                </div>
              </div>
            </div>
          </div>
          <Button icon="Settings" variant="outline" className="mt-4 md:mt-0">
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-surface-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <ApperIcon name="CheckCircle" className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{completedSessions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-secondary/10 rounded-lg">
              <ApperIcon name="Target" className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Goals</p>
              <p className="text-2xl font-bold text-gray-900">{activeGoals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-success/10 rounded-lg">
              <ApperIcon name="TrendingUp" className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg. Progress</p>
              <p className="text-2xl font-bold text-gray-900">{averageProgress}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-warning/10 rounded-lg">
              <ApperIcon name="Users" className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Goals & Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Goal Management */}
          <div className="bg-white rounded-xl border border-surface-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-heading font-semibold text-gray-900">My Goals</h2>
              <Button icon="Plus" size="small" onClick={() => setEditingGoal('new')}>
                Add Goal
              </Button>
            </div>

            {/* New Goal Form */}
            {editingGoal === 'new' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 bg-surface-50 rounded-lg"
              >
                <div className="space-y-4">
                  <Input
                    label="Goal Title"
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                    placeholder="Enter your goal title..."
                  />
                  <div className="relative">
                    <textarea
                      value={newGoalDescription}
                      onChange={(e) => setNewGoalDescription(e.target.value)}
                      placeholder="Describe your goal..."
                      className="w-full px-4 py-3 border-2 border-surface-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary resize-none"
                      rows="3"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <Button onClick={handleCreateGoal} disabled={!newGoalTitle.trim()}>
                      Create Goal
                    </Button>
                    <Button variant="ghost" onClick={() => setEditingGoal(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Goals List */}
            {goals.length === 0 ? (
              <EmptyState
                title="No goals yet"
                description="Set your first goal to start tracking your progress"
                actionLabel="Add Goal"
                icon="Target"
                onAction={() => setEditingGoal('new')}
              />
            ) : (
              <div className="space-y-4">
                {goals.map(goal => (
                  <motion.div
                    key={goal.Id}
                    whileHover={{ y: -2 }}
                    className="p-4 border border-surface-200 rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="default" size="small">{goal.category}</Badge>
                          <Badge 
                            variant={goal.status === 'completed' ? 'success' : 'primary'} 
                            size="small"
                          >
                            {goal.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="small"
                          icon="Trash2"
                          onClick={() => handleDeleteGoal(goal.Id)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-surface-200 rounded-full h-2">
                        <div
                          className="h-2 bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={() => handleUpdateGoalProgress(goal.Id, Math.min(100, goal.progress + 10))}
                          disabled={goal.progress >= 100}
                        >
                          +10%
                        </Button>
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={() => handleUpdateGoalProgress(goal.Id, Math.max(0, goal.progress - 10))}
                          disabled={goal.progress <= 0}
                        >
                          -10%
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Profile Details */}
        <div className="space-y-6">
          {/* Certifications */}
          <div className="bg-white rounded-xl border border-surface-200 p-6">
            <h3 className="font-heading font-semibold text-gray-900 mb-4">Certifications</h3>
            <div className="space-y-3">
              {userProfile.certifications.map((cert, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <ApperIcon name="Award" className="w-4 h-4 text-success" />
                  </div>
                  <span className="text-sm text-gray-700">{cert}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Specialties */}
          <div className="bg-white rounded-xl border border-surface-200 p-6">
            <h3 className="font-heading font-semibold text-gray-900 mb-4">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {userProfile.specialties.map((specialty, index) => (
                <Badge key={index} variant="primary" size="small">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>

          {/* Overall Progress */}
          <ProgressCard
            title="Overall Progress"
            progress={averageProgress}
            icon="TrendingUp"
            color="success"
          />

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-6 border border-primary/10">
            <h3 className="font-heading font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start" icon="Calendar">
                Schedule Session
              </Button>
              <Button variant="outline" className="w-full justify-start" icon="BookOpen">
                Add Resource
              </Button>
              <Button variant="outline" className="w-full justify-start" icon="Target">
                Create Goal
              </Button>
              <Button variant="outline" className="w-full justify-start" icon="BarChart">
                View Analytics
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;