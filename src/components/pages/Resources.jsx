import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Input from '@/components/atoms/Input';
import ResourceCard from '@/components/molecules/ResourceCard';
import SkeletonLoader from '@/components/organisms/SkeletonLoader';
import ErrorState from '@/components/organisms/ErrorState';
import EmptyState from '@/components/organisms/EmptyState';

import resourceService from '@/services/api/resourceService';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    const loadResources = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await resourceService.getAll();
        setResources(result || []);
        setFilteredResources(result || []);
      } catch (err) {
        setError(err.message || 'Failed to load resources');
        toast.error('Failed to load resources');
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, []);

  useEffect(() => {
    let filtered = resources;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(resource => resource.category === selectedCategory);
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(resource => resource.type === selectedType);
    }

    setFilteredResources(filtered);
  }, [resources, searchTerm, selectedCategory, selectedType]);

  const handleResourceClick = (resource) => {
    toast.success(`Opening resource: ${resource.title}`);
  };

  const handleAddResource = () => {
    toast.info('Opening resource creation form');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedType('all');
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
      <div className="p-6 max-w-7xl mx-auto">
        <SkeletonLoader count={6} type="resource" />
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

  // Get unique categories and types
  const categories = ['all', ...new Set(resources.map(r => r.category))];
  const types = ['all', ...new Set(resources.map(r => r.type))];

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
          <h1 className="text-2xl font-heading font-bold text-gray-900">Resource Library</h1>
          <p className="text-gray-600">Curated content to support your clients' wellness journey</p>
        </div>
        <Button icon="Plus" onClick={handleAddResource} className="mt-4 sm:mt-0">
          Add Resource
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-surface-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon="Search"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center space-x-4">
            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Type:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {types.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            {(searchTerm || selectedCategory !== 'all' || selectedType !== 'all') && (
              <Button
                variant="ghost"
                size="small"
                icon="X"
                onClick={clearFilters}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchTerm || selectedCategory !== 'all' || selectedType !== 'all') && (
          <div className="flex flex-wrap items-center space-x-2 mt-4 pt-4 border-t border-surface-200">
            <span className="text-sm text-gray-600">Active filters:</span>
            {searchTerm && (
              <Badge variant="primary" size="small">
                Search: "{searchTerm}"
              </Badge>
            )}
            {selectedCategory !== 'all' && (
              <Badge variant="secondary" size="small">
                Category: {selectedCategory}
              </Badge>
            )}
            {selectedType !== 'all' && (
              <Badge variant="info" size="small">
                Type: {selectedType}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-surface-200 p-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ApperIcon name="BookOpen" className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Resources</p>
              <p className="text-lg font-semibold text-gray-900">{resources.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-surface-200 p-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <ApperIcon name="Play" className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Videos</p>
              <p className="text-lg font-semibold text-gray-900">
                {resources.filter(r => r.type === 'video').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-surface-200 p-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-warning/10 rounded-lg">
              <ApperIcon name="FileText" className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Articles</p>
              <p className="text-lg font-semibold text-gray-900">
                {resources.filter(r => r.type === 'article').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-surface-200 p-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-info/10 rounded-lg">
              <ApperIcon name="Download" className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Worksheets</p>
              <p className="text-lg font-semibold text-gray-900">
                {resources.filter(r => r.type === 'worksheet').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <EmptyState
          title={searchTerm || selectedCategory !== 'all' || selectedType !== 'all' 
            ? "No resources match your filters" 
            : "No resources yet"}
          description={searchTerm || selectedCategory !== 'all' || selectedType !== 'all'
            ? "Try adjusting your search terms or filters to find what you're looking for"
            : "Create your first resource to help clients on their wellness journey"}
          actionLabel={searchTerm || selectedCategory !== 'all' || selectedType !== 'all' 
            ? "Clear Filters" 
            : "Add Resource"}
          icon="BookOpen"
          onAction={searchTerm || selectedCategory !== 'all' || selectedType !== 'all' 
            ? clearFilters 
            : handleAddResource}
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredResources.map(resource => (
            <motion.div key={resource.Id} variants={staggerItem}>
              <ResourceCard
                resource={resource}
                onClick={() => handleResourceClick(resource)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Show results count */}
      {filteredResources.length > 0 && (
        <div className="mt-8 text-center text-sm text-gray-600">
          Showing {filteredResources.length} of {resources.length} resources
          {(searchTerm || selectedCategory !== 'all' || selectedType !== 'all') && (
            <span> matching your filters</span>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default Resources;