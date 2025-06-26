import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Input from '@/components/atoms/Input';
import SkeletonLoader from '@/components/organisms/SkeletonLoader';
import ErrorState from '@/components/organisms/ErrorState';
import EmptyState from '@/components/organisms/EmptyState';

import meetingConnectionService from '@/services/api/meetingConnectionService';

const MeetingConnections = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [testingConnection, setTestingConnection] = useState(null);
  const [connectionForm, setConnectionForm] = useState({});

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await meetingConnectionService.getAllConnections();
      setConnections(result || []);
    } catch (err) {
      setError(err.message || 'Failed to load meeting connections');
      toast.error('Failed to load meeting connections');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (platform) => {
    setSelectedPlatform(platform);
    setConnectionForm({});
    setShowConnectionModal(true);
  };

  const handleDisconnect = async (platform, connectionId) => {
    try {
      await meetingConnectionService.disconnectPlatform(platform, connectionId);
      toast.success(`Disconnected from ${meetingConnectionService.getPlatformConfig(platform)?.name}`);
      loadConnections();
    } catch (error) {
      toast.error(`Failed to disconnect from ${platform}`);
    }
  };

  const handleSubmitConnection = async () => {
    try {
      setLoading(true);
      await meetingConnectionService.connectPlatform(selectedPlatform, connectionForm);
      toast.success(`Successfully connected to ${meetingConnectionService.getPlatformConfig(selectedPlatform)?.name}`);
      setShowConnectionModal(false);
      setSelectedPlatform(null);
      setConnectionForm({});
      loadConnections();
    } catch (error) {
      toast.error(`Failed to connect to ${selectedPlatform}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (platform) => {
    setTestingConnection(platform);
    try {
      const result = await meetingConnectionService.testConnection(platform);
      if (result.success) {
        toast.success(`${meetingConnectionService.getPlatformConfig(platform)?.name} connection test successful`);
      } else {
        toast.error(`${meetingConnectionService.getPlatformConfig(platform)?.name} connection test failed`);
      }
    } catch (error) {
      toast.error(`Failed to test ${platform} connection`);
    } finally {
      setTestingConnection(null);
    }
  };

  const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  if (loading && connections.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <SkeletonLoader count={4} type="card" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <ErrorState 
          message={error}
          onRetry={loadConnections}
        />
      </div>
    );
  }

  const availablePlatforms = meetingConnectionService.getAvailablePlatforms();

  const ConnectionCard = ({ connection }) => {
    const isConnected = connection.status === 'connected';
    
    return (
      <motion.div
        layout
        whileHover={{ y: -2 }}
        className="bg-white rounded-xl border border-surface-200 p-6 hover:shadow-lg transition-all duration-300"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${
              connection.color === 'blue' ? 'bg-blue-100 text-blue-600' :
              connection.color === 'green' ? 'bg-green-100 text-green-600' :
              connection.color === 'purple' ? 'bg-purple-100 text-purple-600' :
              'bg-orange-100 text-orange-600'
            }`}>
              <ApperIcon name={connection.icon} className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{connection.name}</h3>
              <p className="text-sm text-gray-600">{connection.Name || 'Not configured'}</p>
            </div>
          </div>
          
          <Badge 
            variant={isConnected ? 'success' : 'warning'}
            size="small"
          >
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>

        {connection.features && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Features:</p>
            <div className="flex flex-wrap gap-2">
              {connection.features.map((feature, index) => (
                <Badge key={index} variant="default" size="small">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center space-x-3">
          {!isConnected ? (
            <Button
              variant="primary"
              size="small"
              icon="Plus"
              onClick={() => handleConnect(connection.platform)}
            >
              Connect
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="small"
                icon="TestTube"
                onClick={() => handleTestConnection(connection.platform)}
                disabled={testingConnection === connection.platform}
              >
                {testingConnection === connection.platform ? 'Testing...' : 'Test'}
              </Button>
              <Button
                variant="ghost"
                size="small"
                icon="Unlink"
                onClick={() => handleDisconnect(connection.platform, connection.Id)}
                className="text-red-600 hover:bg-red-50"
              >
                Disconnect
              </Button>
            </>
          )}
        </div>
      </motion.div>
    );
  };

  const ConnectionModal = () => {
    if (!selectedPlatform) return null;
    
    const platformConfig = meetingConnectionService.getPlatformConfig(selectedPlatform);
    
    return (
      <AnimatePresence>
        {showConnectionModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowConnectionModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className={`p-2 rounded-lg ${
                    platformConfig?.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                    platformConfig?.color === 'green' ? 'bg-green-100 text-green-600' :
                    platformConfig?.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    <ApperIcon name={platformConfig?.icon} className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-semibold">Connect to {platformConfig?.name}</h2>
                </div>

                <div className="space-y-4">
                  {selectedPlatform === 'zoom' ? (
                    <>
                      <Input
                        label="Account ID"
                        value={connectionForm.accountId || ''}
                        onChange={(e) => setConnectionForm({...connectionForm, accountId: e.target.value})}
                        placeholder="Enter your Zoom Account ID"
                      />
                      <Input
                        label="API Key"
                        value={connectionForm.apiKey || ''}
                        onChange={(e) => setConnectionForm({...connectionForm, apiKey: e.target.value})}
                        placeholder="Enter your Zoom API Key"
                      />
                      <Input
                        label="API Secret"
                        type="password"
                        value={connectionForm.apiSecret || ''}
                        onChange={(e) => setConnectionForm({...connectionForm, apiSecret: e.target.value})}
                        placeholder="Enter your Zoom API Secret"
                      />
                    </>
                  ) : (
                    <>
                      <Input
                        label="Email"
                        type="email"
                        value={connectionForm.email || ''}
                        onChange={(e) => setConnectionForm({...connectionForm, email: e.target.value})}
                        placeholder={`Enter your ${platformConfig?.name} email`}
                      />
                      <Input
                        label="Access Token"
                        type="password"
                        value={connectionForm.accessToken || ''}
                        onChange={(e) => setConnectionForm({...connectionForm, accessToken: e.target.value})}
                        placeholder={`Enter your ${platformConfig?.name} access token`}
                      />
                    </>
                  )}
                </div>

                <div className="flex items-center space-x-3 mt-6">
                  <Button
                    variant="primary"
                    onClick={handleSubmitConnection}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? 'Connecting...' : 'Connect'}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowConnectionModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  };

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
          <h1 className="text-2xl font-heading font-bold text-gray-900">Meeting Connections</h1>
          <p className="text-gray-600">Connect your video conferencing platforms for seamless session management</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-surface-200 p-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-success/10 rounded-lg">
              <ApperIcon name="CheckCircle" className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Connected</p>
              <p className="text-lg font-semibold text-gray-900">
                {connections.filter(c => c.status === 'connected').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-surface-200 p-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-warning/10 rounded-lg">
              <ApperIcon name="AlertCircle" className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-lg font-semibold text-gray-900">{availablePlatforms.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-surface-200 p-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ApperIcon name="Video" className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Platforms</p>
              <p className="text-lg font-semibold text-gray-900">4</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-surface-200 p-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <ApperIcon name="Activity" className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-lg font-semibold text-gray-900">
                {connections.filter(c => c.status === 'connected').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Connections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {connections.map((connection) => (
          <ConnectionCard key={connection.Id} connection={connection} />
        ))}
      </div>

      {/* Connection Modal */}
      <ConnectionModal />
    </motion.div>
  );
};

export default MeetingConnections;