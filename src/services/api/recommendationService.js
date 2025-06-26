class RecommendationService {
  constructor() {
    this.apperClient = null;
    this.tableName = 'recommendation';
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

  async getAll() {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { name: "client_id" }, referenceField: { field: { Name: "Name" } } },
          { field: { name: "resource_id" }, referenceField: { field: { Name: "Name" } } },
          { field: { name: "goal_id" }, referenceField: { field: { Name: "Name" } } },
          { field: { Name: "recommendation_date" } },
          { field: { Name: "score" } },
          { field: { Name: "accepted" } }
        ],
        orderBy: [
          {
            fieldName: "recommendation_date",
            sorttype: "DESC"
          }
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      // Transform data to match existing UI expectations
      const transformedData = (response.data || []).map(recommendation => ({
        ...recommendation,
        clientId: recommendation.client_id?.Id || recommendation.client_id,
        clientName: recommendation.client_id?.Name || 'Unknown Client',
        resourceId: recommendation.resource_id?.Id || recommendation.resource_id,
        resourceName: recommendation.resource_id?.Name || 'Unknown Resource',
        goalId: recommendation.goal_id?.Id || recommendation.goal_id,
        goalName: recommendation.goal_id?.Name || null,
        recommendationDate: recommendation.recommendation_date
      }));
      
      return transformedData;
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { name: "client_id" }, referenceField: { field: { Name: "Name" } } },
          { field: { name: "resource_id" }, referenceField: { field: { Name: "Name" } } },
          { field: { name: "goal_id" }, referenceField: { field: { Name: "Name" } } },
          { field: { Name: "recommendation_date" } },
          { field: { Name: "score" } },
          { field: { Name: "accepted" } }
        ]
      };
      
      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id, 10), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      // Transform data to match existing UI expectations
      const recommendation = response.data;
      return {
        ...recommendation,
        clientId: recommendation.client_id?.Id || recommendation.client_id,
        clientName: recommendation.client_id?.Name || 'Unknown Client',
        resourceId: recommendation.resource_id?.Id || recommendation.resource_id,
        resourceName: recommendation.resource_id?.Name || 'Unknown Resource',
        goalId: recommendation.goal_id?.Id || recommendation.goal_id,
        goalName: recommendation.goal_id?.Name || null,
        recommendationDate: recommendation.recommendation_date
      };
    } catch (error) {
      console.error(`Error fetching recommendation with ID ${id}:`, error);
      throw error;
    }
  }

  async getByClientId(clientId) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { name: "client_id" }, referenceField: { field: { Name: "Name" } } },
          { field: { name: "resource_id" }, referenceField: { field: { Name: "Name" } } },
          { field: { name: "goal_id" }, referenceField: { field: { Name: "Name" } } },
          { field: { Name: "recommendation_date" } },
          { field: { Name: "score" } },
          { field: { Name: "accepted" } }
        ],
        where: [
          {
            FieldName: "client_id",
            Operator: "EqualTo",
            Values: [parseInt(clientId, 10)]
          }
        ],
        orderBy: [
          {
            fieldName: "recommendation_date",
            sorttype: "DESC"
          }
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      // Transform data to match existing UI expectations
      const transformedData = (response.data || []).map(recommendation => ({
        ...recommendation,
        clientId: recommendation.client_id?.Id || recommendation.client_id,
        clientName: recommendation.client_id?.Name || 'Unknown Client',
        resourceId: recommendation.resource_id?.Id || recommendation.resource_id,
        resourceName: recommendation.resource_id?.Name || 'Unknown Resource',
        goalId: recommendation.goal_id?.Id || recommendation.goal_id,
        goalName: recommendation.goal_id?.Name || null,
        recommendationDate: recommendation.recommendation_date
      }));
      
      return transformedData;
    } catch (error) {
      console.error(`Error fetching recommendations for client ${clientId}:`, error);
      throw error;
    }
  }

  async getPendingRecommendations() {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { name: "client_id" }, referenceField: { field: { Name: "Name" } } },
          { field: { name: "resource_id" }, referenceField: { field: { Name: "Name" } } },
          { field: { name: "goal_id" }, referenceField: { field: { Name: "Name" } } },
          { field: { Name: "recommendation_date" } },
          { field: { Name: "score" } },
          { field: { Name: "accepted" } }
        ],
        where: [
          {
            FieldName: "accepted",
            Operator: "EqualTo",
            Values: [null]
          }
        ],
        orderBy: [
          {
            fieldName: "score",
            sorttype: "DESC"
          }
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      // Transform data to match existing UI expectations
      const transformedData = (response.data || []).map(recommendation => ({
        ...recommendation,
        clientId: recommendation.client_id?.Id || recommendation.client_id,
        clientName: recommendation.client_id?.Name || 'Unknown Client',
        resourceId: recommendation.resource_id?.Id || recommendation.resource_id,
        resourceName: recommendation.resource_id?.Name || 'Unknown Resource',
        goalId: recommendation.goal_id?.Id || recommendation.goal_id,
        goalName: recommendation.goal_id?.Name || null,
        recommendationDate: recommendation.recommendation_date
      }));
      
      return transformedData;
    } catch (error) {
      console.error("Error fetching pending recommendations:", error);
      throw error;
    }
  }

  async create(recommendationData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      // Only include Updateable fields
      const params = {
        records: [{
          Name: `Recommendation for ${recommendationData.clientName || 'Client'}`,
          client_id: parseInt(recommendationData.clientId || recommendationData.client_id, 10),
          resource_id: parseInt(recommendationData.resourceId || recommendationData.resource_id, 10),
          goal_id: recommendationData.goalId ? parseInt(recommendationData.goalId, 10) : null,
          recommendation_date: recommendationData.recommendationDate || recommendationData.recommendation_date || new Date().toISOString(),
          score: recommendationData.score || 0,
          accepted: recommendationData.accepted || null
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
          throw new Error(failedRecords[0].message || 'Failed to create recommendation');
        }
        return response.results[0].data;
      }
      
      return response.data;
    } catch (error) {
      console.error("Error creating recommendation:", error);
      throw error;
    }
  }

  async accept(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        records: [{
          Id: parseInt(id, 10),
          accepted: true
        }]
      };
      
      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to accept ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to accept recommendation');
        }
        return response.results[0].data;
      }
      
      return response.data;
    } catch (error) {
      console.error("Error accepting recommendation:", error);
      throw error;
    }
  }

  async decline(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        records: [{
          Id: parseInt(id, 10),
          accepted: false
        }]
      };
      
      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to decline ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to decline recommendation');
        }
        return response.results[0].data;
      }
      
      return response.data;
    } catch (error) {
      console.error("Error declining recommendation:", error);
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      // Only include Updateable fields
      const params = {
        records: [{
          Id: parseInt(id, 10),
          ...(updateData.clientId && { client_id: parseInt(updateData.clientId, 10) }),
          ...(updateData.client_id && { client_id: parseInt(updateData.client_id, 10) }),
          ...(updateData.resourceId && { resource_id: parseInt(updateData.resourceId, 10) }),
          ...(updateData.resource_id && { resource_id: parseInt(updateData.resource_id, 10) }),
          ...(updateData.goalId && { goal_id: parseInt(updateData.goalId, 10) }),
          ...(updateData.goal_id && { goal_id: parseInt(updateData.goal_id, 10) }),
          ...(updateData.recommendationDate && { recommendation_date: updateData.recommendationDate }),
          ...(updateData.recommendation_date && { recommendation_date: updateData.recommendation_date }),
          ...(updateData.score !== undefined && { score: updateData.score }),
          ...(updateData.accepted !== undefined && { accepted: updateData.accepted })
        }]
      };
      
      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to update ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to update recommendation');
        }
        return response.results[0].data;
      }
      
      return response.data;
    } catch (error) {
      console.error("Error updating recommendation:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        RecordIds: [parseInt(id, 10)]
      };
      
      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to delete ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to delete recommendation');
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error deleting recommendation:", error);
      throw error;
    }
  }

  // Generate recommendations based on client data, goals, and interactions
  async generateRecommendations(clientId, options = {}) {
    try {
      // Import other services for data analysis
      const { default: clientService } = await import('./clientService.js');
      const { default: goalService } = await import('./goalService.js');
      const { default: resourceService } = await import('./resourceService.js');
      const { default: interactionService } = await import('./interactionService.js');

      // Get client data
      const client = await clientService.getById(clientId);
      const goals = await goalService.getByClientId(clientId);
      const interactions = await interactionService.getByClientId(clientId);
      const allResources = await resourceService.getAll();

      // Algorithm to score resources based on client data
      const recommendations = [];

      for (const resource of allResources) {
        let score = 0;

        // Base score
        score += 10;

        // Goal alignment scoring
        for (const goal of goals) {
          if (goal.status === 'in-progress') {
            // Match resource category with goal category
            if (resource.category === goal.category) {
              score += 25;
            }
            
            // Progress-based difficulty matching
            if (goal.progress < 30 && resource.difficulty === 'Beginner') {
              score += 15;
            } else if (goal.progress >= 30 && goal.progress < 70 && resource.difficulty === 'Intermediate') {
              score += 15;
            } else if (goal.progress >= 70 && resource.difficulty === 'Advanced') {
              score += 15;
            }
          }
        }

        // Interaction history scoring
        const resourceInteractions = interactions.filter(i => i.resourceId === resource.Id);
        if (resourceInteractions.length === 0) {
          // Boost new content
          score += 5;
        } else {
          // Reduce score for already viewed content
          score -= resourceInteractions.length * 2;
        }

        // Content type preference (could be enhanced with client preferences)
        if (resource.type === 'video') {
          score += 3;
        } else if (resource.type === 'article') {
          score += 2;
        }

        // Only recommend if score is meaningful
        if (score > 15) {
          recommendations.push({
            clientId: parseInt(clientId, 10),
            resourceId: resource.Id,
            goalId: goals.length > 0 ? goals[0].Id : null,
            score: Math.min(score, 100), // Cap at 100
            recommendationDate: new Date().toISOString(),
            accepted: null
          });
        }
      }

      // Sort by score and limit results
      const sortedRecommendations = recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, options.limit || 10);

      // Create recommendation records
      const createdRecommendations = [];
      for (const rec of sortedRecommendations) {
        try {
          const created = await this.create(rec);
          createdRecommendations.push(created);
        } catch (error) {
          console.error('Failed to create recommendation:', error);
        }
      }

      return createdRecommendations;
    } catch (error) {
      console.error("Error generating recommendations:", error);
      throw error;
    }
  }
}

export default new RecommendationService();