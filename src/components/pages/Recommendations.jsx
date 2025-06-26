import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Input from '@/components/atoms/Input';
import SkeletonLoader from '@/components/organisms/SkeletonLoader';
import ErrorState from '@/components/organisms/ErrorState';
import EmptyState from '@/components/organisms/EmptyState';

import recommendationService from '@/services/api/recommendationService';
import clientService from '@/services/api/clientService';
import resourceService from '@/services/api/resourceService';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [clients, setClients] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [recommendationsData, clientsData, resourcesData] = await Promise.all([
        recommendationService.getAll(),
        clientService.getAll(),
        resourceService.getAll()
      ]);
      
      setRecommendations(recommendationsData || []);
      setClients(clientsData || []);
      setResources(resourcesData || []);
    } catch (err) {
      setError(err.message || 'Failed to load recommendations data');
      toast.error('Failed to load recommendations data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRecommendations = async (clientId = null) => {
    setIsGenerating(true);
    
    try {
      if (clientId) {
        // Generate for specific client
        await recommendationService.generateRecommendations(clientId);
        toast.success(`Generated recommendations for client`);
      } else {
        // Generate for all clients
        for (const client of clients) {
          try {
            await recommendationService.generateRecommendations(client.Id, { limit: 5 });
          } catch (error) {
            console.error(`Failed to generate recommendations for client ${client.Id}:`, error);
          }
        }
        toast.success('Generated recommendations for all clients');
      }
      
      await loadData(); // Reload recommendations
    } catch (error) {
      toast.error('Failed to generate recommendations');
      console.error('Error generating recommendations:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptRecommendation = async (recommendation) => {
    try {
      await recommendationService.accept(recommendation.Id);
      toast.success('Recommendation accepted');
      await loadData();
    } catch (error) {
      toast.error('Failed to accept recommendation');
      console.error('Error accepting recommendation:', error);
    }
  };

  const handleDeclineRecommendation = async (recommendation) => {
    try {
      await recommendationService.decline(recommendation.Id);
      toast.success('Recommendation declined');
      await loadData();
    } catch (error) {
      toast.error('Failed to decline recommendation');
      console.error('Error declining recommendation:', error);
    }
  };

  const handleDeleteRecommendation = async (recommendation) => {
    if (!confirm('Are you sure you want to delete this recommendation?')) return;
    
    try {
      await recommendationService.delete(recommendation.Id);
      toast.success('Recommendation deleted');
      await loadData();
    } catch (error) {
      toast.error('Failed to delete recommendation');
      console.error('Error deleting recommendation:', error);
    }
  };

  const handleBulkAccept = async () => {
    const pendingRecommendations = filteredRecommendations.filter(r => r.accepted === null);
    
    if (pendingRecommendations.length === 0) {
      toast.info('No pending recommendations to accept');
      return;
    }

    try {
      for (const recommendation of pendingRecommendations) {
        await recommendationService.accept(recommendation.Id);
      }
      toast.success(`Accepted ${pendingRecommendations.length} recommendations`);
      await loadData();
    } catch (error) {
      toast.error('Failed to accept recommendations');
      console.error('Error accepting recommendations:', error);
    }
  };

  const handleBulkDecline = async () => {
    const pendingRecommendations = filteredRecommendations.filter(r => r.accepted === null);
    
    if (pendingRecommendations.length === 0) {
      toast.info('No pending recommendations to decline');
      return;
    }

    if (!confirm(`Are you sure you want to decline ${pendingRecommendations.length} recommendations?`)) return;

    try {
      for (const recommendation of pendingRecommendations) {
        await recommendationService.decline(recommendation.Id);
      }
      toast.success(`Declined ${pendingRecommendations.length} recommendations`);
      await loadData();
    } catch (error) {
      toast.error('Failed to decline recommendations');
      console.error('Error declining recommendations:', error);
    }
  };

  // Filter and sort recommendations
  const filteredRecommendations = recommendations.filter(recommendation => {
    const matchesClient = selectedClient === 'all' || recommendation.clientId === parseInt(selectedClient);
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'pending' && recommendation.accepted === null) ||
      (selectedStatus === 'accepted' && recommendation.accepted === true) ||
      (selectedStatus === 'declined' && recommendation.accepted === false);
    const matchesSearch = !searchTerm || 
      recommendation.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recommendation.resourceName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesClient && matchesStatus && matchesSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return b.score - a.score;
      case 'client':
        return a.clientName?.localeCompare(b.clientName);
      case 'resource':
        return a.resourceName?.localeCompare(b.resourceName);
      case 'date':
      default:
        return new Date(b.recommendationDate) - new Date(a.recommendationDate);
    }
  });

  const getStatusBadgeVariant = (accepted) => {
    if (accepted === null) return 'warning';
    if (accepted === true) return 'success';
    return 'error';
  };

  const getStatusText = (accepted) => {
    if (accepted === null) return 'Pending';
    if (accepted === true) return 'Accepted';
    return 'Declined';
  };

  const getResourceById = (resourceId) => {
    return resources.find(r => r.Id === resourceId);
  };

  const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
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

  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <SkeletonLoader count={1} type="header" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SkeletonLoader count={4} type="filter" />
        </div>
        <SkeletonLoader count={6} type="card" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <ErrorState 
          message={error}
          onRetry={loadData}
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
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">Recommendations</h1>
          <p className="text-gray-600 mt-1">
            AI-powered content suggestions based on client progress and goals
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            icon="Lightbulb"
            onClick={() => handleGenerateRecommendations()}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate All'}
          </Button>
          <Button
            variant="primary"
            icon="CheckCircle"
            onClick={handleBulkAccept}
          >
            Accept Pending
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-surface-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Clients</option>
              {clients.map((client) => (
                <option key={client.Id} value={client.Id}>
                  {client.Name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="date">Date</option>
              <option value="score">Score</option>
              <option value="client">Client</option>
              <option value="resource">Resource</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <Input
              type="text"
              placeholder="Search recommendations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon="Search"
            />
          </div>
        </div>
        
        {filteredRecommendations.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-surface-200">
            <Button
              variant="ghost"
              size="small"
              icon="CheckCircle"
              onClick={handleBulkAccept}
            >
              Accept All Visible
            </Button>
            <Button
              variant="ghost"
              size="small"
              icon="X"
              onClick={handleBulkDecline}
            >
              Decline All Visible
            </Button>
            <div className="text-sm text-gray-500 flex items-center ml-auto">
              {filteredRecommendations.length} recommendation{filteredRecommendations.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>

      {/* Recommendations List */}
      {filteredRecommendations.length === 0 ? (
        <EmptyState
          title="No recommendations found"
          description="Generate AI-powered recommendations based on client progress and goals"
          actionLabel="Generate Recommendations"
          icon="Lightbulb"
          onAction={() => handleGenerateRecommendations()}
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {filteredRecommendations.map((recommendation) => {
            const resource = getResourceById(recommendation.resourceId);
            
            return (
              <motion.div
                key={recommendation.Id}
                variants={staggerItem}
                className="bg-white rounded-xl border border-surface-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
                          <ApperIcon 
                            name={resource?.type === 'video' ? 'Play' : 
                                  resource?.type === 'article' ? 'FileText' : 
                                  resource?.type === 'audio' ? 'Headphones' : 'BookOpen'} 
                            className="w-6 h-6 text-primary" 
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {recommendation.resourceName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            For {recommendation.clientName}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={getStatusBadgeVariant(recommendation.accepted)}
                          size="small"
                        >
                          {getStatusText(recommendation.accepted)}
                        </Badge>
                        <Badge variant="primary" size="small">
                          Score: {recommendation.score}
                        </Badge>
                      </div>
                    </div>
                    
                    {resource && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {resource.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="default" size="small">
                            {resource.category}
                          </Badge>
                          <Badge variant="secondary" size="small">
                            {resource.type}
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
                      </div>
                    )}
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <ApperIcon name="Calendar" className="w-3 h-3 mr-1" />
                      {format(new Date(recommendation.recommendationDate), 'MMM d, yyyy')}
                      {recommendation.goalName && (
                        <>
                          <span className="mx-2">•</span>
                          <ApperIcon name="Target" className="w-3 h-3 mr-1" />
                          {recommendation.goalName}
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {recommendation.accepted === null && (
                      <>
                        <Button
                          variant="success"
                          size="small"
                          icon="Check"
                          onClick={() => handleAcceptRecommendation(recommendation)}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="error"
                          size="small"
                          icon="X"
                          onClick={() => handleDeclineRecommendation(recommendation)}
                        >
                          Decline
                        </Button>
                      </>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="small"
                      icon="Trash2"
                      onClick={() => handleDeleteRecommendation(recommendation)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Recommendations;