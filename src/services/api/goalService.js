class GoalService {
  constructor() {
    this.apperClient = null;
    this.tableName = 'goal';
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
          { field: { Name: "title" } },
          { field: { Name: "description" } },
          { field: { Name: "category" } },
          { field: { Name: "target_date" } },
          { field: { Name: "progress" } },
          { field: { Name: "status" } },
          { field: { Name: "milestones" } },
          { field: { name: "client_id" }, referenceField: { field: { Name: "Name" } } }
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      // Transform data to match existing UI expectations
      const transformedData = (response.data || []).map(goal => ({
        ...goal,
        targetDate: goal.target_date,
        clientId: goal.client_id?.Id || goal.client_id
      }));
      
      return transformedData;
    } catch (error) {
      console.error("Error fetching goals:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "title" } },
          { field: { Name: "description" } },
          { field: { Name: "category" } },
          { field: { Name: "target_date" } },
          { field: { Name: "progress" } },
          { field: { Name: "status" } },
          { field: { Name: "milestones" } },
          { field: { name: "client_id" }, referenceField: { field: { Name: "Name" } } }
        ]
      };
      
      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id, 10), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      // Transform data to match existing UI expectations
      const goal = response.data;
      return {
        ...goal,
        targetDate: goal.target_date,
        clientId: goal.client_id?.Id || goal.client_id
      };
    } catch (error) {
      console.error(`Error fetching goal with ID ${id}:`, error);
      throw error;
    }
  }

  async getByClientId(clientId) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "title" } },
          { field: { Name: "description" } },
          { field: { Name: "category" } },
          { field: { Name: "target_date" } },
          { field: { Name: "progress" } },
          { field: { Name: "status" } },
          { field: { Name: "milestones" } },
          { field: { name: "client_id" }, referenceField: { field: { Name: "Name" } } }
        ],
        where: [
          {
            FieldName: "client_id",
            Operator: "EqualTo",
            Values: [parseInt(clientId, 10)]
          }
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      // Transform data to match existing UI expectations
      const transformedData = (response.data || []).map(goal => ({
        ...goal,
        targetDate: goal.target_date,
        clientId: goal.client_id?.Id || goal.client_id
      }));
      
      return transformedData;
    } catch (error) {
      console.error(`Error fetching goals for client ${clientId}:`, error);
      throw error;
    }
  }

  async create(goalData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      // Only include Updateable fields
      const params = {
        records: [{
          Name: goalData.title || goalData.Name,
          title: goalData.title,
          description: goalData.description,
          category: goalData.category,
          target_date: goalData.targetDate || goalData.target_date,
          progress: goalData.progress || 0,
          status: goalData.status || 'in-progress',
          milestones: goalData.milestones || '',
          client_id: parseInt(goalData.clientId || goalData.client_id, 10)
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
          throw new Error(failedRecords[0].message || 'Failed to create goal');
        }
        return response.results[0].data;
      }
      
      return response.data;
    } catch (error) {
      console.error("Error creating goal:", error);
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
          ...(updateData.title && { Name: updateData.title, title: updateData.title }),
          ...(updateData.description && { description: updateData.description }),
          ...(updateData.category && { category: updateData.category }),
          ...(updateData.targetDate && { target_date: updateData.targetDate }),
          ...(updateData.target_date && { target_date: updateData.target_date }),
          ...(updateData.progress !== undefined && { progress: updateData.progress }),
          ...(updateData.status && { status: updateData.status }),
          ...(updateData.milestones && { milestones: updateData.milestones }),
          ...(updateData.clientId && { client_id: parseInt(updateData.clientId, 10) }),
          ...(updateData.client_id && { client_id: parseInt(updateData.client_id, 10) })
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
          throw new Error(failedRecords[0].message || 'Failed to update goal');
        }
        return response.results[0].data;
      }
      
      return response.data;
    } catch (error) {
      console.error("Error updating goal:", error);
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
          throw new Error(failedRecords[0].message || 'Failed to delete goal');
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error deleting goal:", error);
      throw error;
    }
  }
}

export default new GoalService();