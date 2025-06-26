class InteractionService {
  constructor() {
    this.apperClient = null;
    this.tableName = 'interaction';
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
          { field: { Name: "timestamp" } },
          { field: { Name: "type" } }
        ],
        orderBy: [
          {
            fieldName: "timestamp",
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
      const transformedData = (response.data || []).map(interaction => ({
        ...interaction,
        clientId: interaction.client_id?.Id || interaction.client_id,
        clientName: interaction.client_id?.Name || 'Unknown Client',
        resourceId: interaction.resource_id?.Id || interaction.resource_id,
        resourceName: interaction.resource_id?.Name || 'Unknown Resource'
      }));
      
      return transformedData;
    } catch (error) {
      console.error("Error fetching interactions:", error);
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
          { field: { Name: "timestamp" } },
          { field: { Name: "type" } }
        ]
      };
      
      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id, 10), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      // Transform data to match existing UI expectations
      const interaction = response.data;
      return {
        ...interaction,
        clientId: interaction.client_id?.Id || interaction.client_id,
        clientName: interaction.client_id?.Name || 'Unknown Client',
        resourceId: interaction.resource_id?.Id || interaction.resource_id,
        resourceName: interaction.resource_id?.Name || 'Unknown Resource'
      };
    } catch (error) {
      console.error(`Error fetching interaction with ID ${id}:`, error);
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
          { field: { Name: "timestamp" } },
          { field: { Name: "type" } }
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
            fieldName: "timestamp",
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
      const transformedData = (response.data || []).map(interaction => ({
        ...interaction,
        clientId: interaction.client_id?.Id || interaction.client_id,
        clientName: interaction.client_id?.Name || 'Unknown Client',
        resourceId: interaction.resource_id?.Id || interaction.resource_id,
        resourceName: interaction.resource_id?.Name || 'Unknown Resource'
      }));
      
      return transformedData;
    } catch (error) {
      console.error(`Error fetching interactions for client ${clientId}:`, error);
      throw error;
    }
  }

  async getByResourceId(resourceId) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { name: "client_id" }, referenceField: { field: { Name: "Name" } } },
          { field: { name: "resource_id" }, referenceField: { field: { Name: "Name" } } },
          { field: { Name: "timestamp" } },
          { field: { Name: "type" } }
        ],
        where: [
          {
            FieldName: "resource_id",
            Operator: "EqualTo",
            Values: [parseInt(resourceId, 10)]
          }
        ],
        orderBy: [
          {
            fieldName: "timestamp",
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
      const transformedData = (response.data || []).map(interaction => ({
        ...interaction,
        clientId: interaction.client_id?.Id || interaction.client_id,
        clientName: interaction.client_id?.Name || 'Unknown Client',
        resourceId: interaction.resource_id?.Id || interaction.resource_id,
        resourceName: interaction.resource_id?.Name || 'Unknown Resource'
      }));
      
      return transformedData;
    } catch (error) {
      console.error(`Error fetching interactions for resource ${resourceId}:`, error);
      throw error;
    }
  }

  async create(interactionData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      // Only include Updateable fields
      const params = {
        records: [{
          Name: `${interactionData.type || 'view'} interaction`,
          client_id: parseInt(interactionData.clientId || interactionData.client_id, 10),
          resource_id: parseInt(interactionData.resourceId || interactionData.resource_id, 10),
          timestamp: interactionData.timestamp || new Date().toISOString(),
          type: interactionData.type || 'view'
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
          throw new Error(failedRecords[0].message || 'Failed to create interaction');
        }
        return response.results[0].data;
      }
      
      return response.data;
    } catch (error) {
      console.error("Error creating interaction:", error);
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
          ...(updateData.timestamp && { timestamp: updateData.timestamp }),
          ...(updateData.type && { type: updateData.type })
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
          throw new Error(failedRecords[0].message || 'Failed to update interaction');
        }
        return response.results[0].data;
      }
      
      return response.data;
    } catch (error) {
      console.error("Error updating interaction:", error);
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
          throw new Error(failedRecords[0].message || 'Failed to delete interaction');
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error deleting interaction:", error);
      throw error;
    }
  }
}

export default new InteractionService();