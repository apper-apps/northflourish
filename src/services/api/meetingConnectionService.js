class MeetingConnectionService {
  constructor() {
    this.apperClient = null;
    this.tableName = 'zoomconnection'; // Using existing ZoomConnection table
    this.initializeClient();
  }

  initializeClient() {
    if (typeof window !== 'undefined' && window.ApperSDK) {
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    }
  }

  // Platform configurations
  getPlatformConfig(platform) {
    const configs = {
      zoom: {
        name: 'Zoom',
        icon: 'Video',
        color: 'blue',
        joinUrlPattern: 'https://zoom.us/j/{meetingId}',
        features: ['Screen Share', 'Recording', 'Breakout Rooms', 'Chat']
      },
      googlemeet: {
        name: 'Google Meet',
        icon: 'Monitor',
        color: 'green',
        joinUrlPattern: 'https://meet.google.com/{meetingId}',
        features: ['Screen Share', 'Recording', 'Live Captions', 'Chat']
      },
      teams: {
        name: 'Microsoft Teams',
        icon: 'Users',
        color: 'purple',
        joinUrlPattern: 'https://teams.microsoft.com/l/meetup-join/{meetingId}',
        features: ['Screen Share', 'Recording', 'Whiteboard', 'Chat']
      },
      gobrunch: {
        name: 'GoBrunch',
        icon: 'Coffee',
        color: 'orange',
        joinUrlPattern: 'https://gobrunch.com/events/{meetingId}',
        features: ['Virtual Rooms', 'Networking', 'Presentations', 'Chat']
      }
    };
    return configs[platform] || null;
  }

  // Get all connections
  async getAllConnections() {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "account_id" } },
          { field: { Name: "api_key" } },
          { field: { Name: "api_secret" } },
          { field: { Name: "oauth_token" } },
          { field: { Name: "user_id" } },
          { field: { name: "client_id" }, referenceField: { field: { Name: "Name" } } },
          { field: { name: "session_id" }, referenceField: { field: { Name: "Name" } } }
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      const zoomConnections = response.data || [];
      
      // Add mock connections for other platforms
      const allConnections = [
        ...zoomConnections.map(conn => ({
          ...conn,
          platform: 'zoom',
          status: conn.oauth_token ? 'connected' : 'disconnected',
          ...this.getPlatformConfig('zoom')
        })),
        {
          Id: 'googlemeet-1',
          platform: 'googlemeet',
          status: 'disconnected',
          Name: 'Google Meet Connection',
          ...this.getPlatformConfig('googlemeet')
        },
        {
          Id: 'teams-1',
          platform: 'teams',
          status: 'disconnected',
          Name: 'Microsoft Teams Connection',
          ...this.getPlatformConfig('teams')
        },
        {
          Id: 'gobrunch-1',
          platform: 'gobrunch',
          status: 'disconnected',
          Name: 'GoBrunch Connection',
          ...this.getPlatformConfig('gobrunch')
        }
      ];
      
      return allConnections;
    } catch (error) {
      console.error("Error fetching meeting connections:", error);
      throw error;
    }
  }

  // Get connection by platform
  async getConnectionByPlatform(platform) {
    try {
      const connections = await this.getAllConnections();
      return connections.find(conn => conn.platform === platform);
    } catch (error) {
      console.error(`Error fetching ${platform} connection:`, error);
      throw error;
    }
  }

  // Create or update Zoom connection
  async createZoomConnection(connectionData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        records: [{
          Name: connectionData.name || 'Zoom Connection',
          account_id: connectionData.accountId,
          api_key: connectionData.apiKey,
          api_secret: connectionData.apiSecret,
          oauth_token: connectionData.oauthToken,
          user_id: connectionData.userId,
          client_id: connectionData.clientId ? parseInt(connectionData.clientId, 10) : null,
          session_id: connectionData.sessionId ? parseInt(connectionData.sessionId, 10) : null
        }]
      };
      
      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to create Zoom connection');
        }
        return response.results[0].data;
      }
      
      return response.data;
    } catch (error) {
      console.error("Error creating Zoom connection:", error);
      throw error;
    }
  }

  // Mock connection methods for other platforms
  async connectPlatform(platform, credentials) {
    try {
      if (platform === 'zoom') {
        return await this.createZoomConnection(credentials);
      }
      
      // Mock implementation for other platforms
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        Id: `${platform}-${Date.now()}`,
        platform,
        status: 'connected',
        Name: `${this.getPlatformConfig(platform)?.name} Connection`,
        connectedAt: new Date().toISOString(),
        ...credentials
      };
    } catch (error) {
      console.error(`Error connecting to ${platform}:`, error);
      throw error;
    }
  }

  async disconnectPlatform(platform, connectionId) {
    try {
      if (platform === 'zoom' && this.apperClient) {
        const params = {
          RecordIds: [parseInt(connectionId, 10)]
        };
        
        const response = await this.apperClient.deleteRecord(this.tableName, params);
        
        if (!response.success) {
          console.error(response.message);
          throw new Error(response.message);
        }
        
        return true;
      }
      
      // Mock implementation for other platforms
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    } catch (error) {
      console.error(`Error disconnecting from ${platform}:`, error);
      throw error;
    }
  }

  // Meeting creation methods
  async createMeeting(platform, meetingData) {
    try {
      const config = this.getPlatformConfig(platform);
      if (!config) {
        throw new Error(`Unsupported platform: ${platform}`);
      }

      // Mock meeting creation for all platforms
      await new Promise(resolve => setTimeout(resolve, 1000));

      const meetingId = this.generateMeetingId(platform);
      const joinUrl = config.joinUrlPattern.replace('{meetingId}', meetingId);

      return {
        meetingId,
        joinUrl,
        platform,
        title: meetingData.title || 'Wellness Session',
        startTime: meetingData.startTime,
        duration: meetingData.duration || 60,
        password: this.generateMeetingPassword(),
        hostUrl: `${joinUrl}?role=host`,
        created: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error creating ${platform} meeting:`, error);
      throw error;
    }
  }

  async updateMeeting(platform, meetingId, updateData) {
    try {
      // Mock implementation for all platforms
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        meetingId,
        platform,
        ...updateData,
        updated: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error updating ${platform} meeting:`, error);
      throw error;
    }
  }

  async deleteMeeting(platform, meetingId) {
    try {
      // Mock implementation for all platforms
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    } catch (error) {
      console.error(`Error deleting ${platform} meeting:`, error);
      throw error;
    }
  }

  // Test connection
  async testConnection(platform) {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock test results
      const testResults = {
        zoom: { success: true, latency: 45, features: ['Video', 'Audio', 'Screen Share'] },
        googlemeet: { success: true, latency: 38, features: ['Video', 'Audio', 'Screen Share'] },
        teams: { success: true, latency: 52, features: ['Video', 'Audio', 'Screen Share'] },
        gobrunch: { success: true, latency: 41, features: ['Video', 'Audio', 'Virtual Rooms'] }
      };
      
      return testResults[platform] || { success: false, error: 'Platform not supported' };
    } catch (error) {
      console.error(`Error testing ${platform} connection:`, error);
      throw error;
    }
  }

  // Utility methods
  generateMeetingId(platform) {
    const prefixes = {
      zoom: '1234567890',
      googlemeet: 'abc-defg-hij',
      teams: '19:meeting_12345',
      gobrunch: 'event-12345'
    };
    
    const prefix = prefixes[platform] || '12345';
    const suffix = Math.random().toString(36).substring(2, 8);
    return `${prefix}${suffix}`;
  }

  generateMeetingPassword() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // Get available platforms
  getAvailablePlatforms() {
    return ['zoom', 'googlemeet', 'teams', 'gobrunch'].map(platform => ({
      id: platform,
      ...this.getPlatformConfig(platform)
    }));
  }

  // Get platform-specific join button properties
  getJoinButtonProps(platform) {
    const configs = {
      zoom: { variant: 'primary', className: 'bg-blue-600 hover:bg-blue-700 text-white' },
      googlemeet: { variant: 'primary', className: 'bg-green-600 hover:bg-green-700 text-white' },
      teams: { variant: 'primary', className: 'bg-purple-600 hover:bg-purple-700 text-white' },
      gobrunch: { variant: 'primary', className: 'bg-orange-600 hover:bg-orange-700 text-white' }
    };
    
    return configs[platform] || { variant: 'primary', className: '' };
  }
}

export default new MeetingConnectionService();