class ResourceService {
  constructor() {
    this.apperClient = null;
    this.tableName = 'resource';
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
          { field: { Name: "type" } },
          { field: { Name: "category" } },
          { field: { Name: "description" } },
          { field: { Name: "content" } },
          { field: { Name: "media_url" } },
          { field: { Name: "duration" } },
          { field: { Name: "read_time" } },
          { field: { Name: "downloadable" } },
          { field: { Name: "created_by" } },
          { field: { Name: "difficulty" } }
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      // Transform data to match existing UI expectations
      const transformedData = (response.data || []).map(resource => ({
        ...resource,
        mediaUrl: resource.media_url,
        readTime: resource.read_time,
        createdBy: resource.created_by
      }));
      
      return transformedData;
    } catch (error) {
      console.error("Error fetching resources:", error);
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
          { field: { Name: "type" } },
          { field: { Name: "category" } },
          { field: { Name: "description" } },
          { field: { Name: "content" } },
          { field: { Name: "media_url" } },
          { field: { Name: "duration" } },
          { field: { Name: "read_time" } },
          { field: { Name: "downloadable" } },
          { field: { Name: "created_by" } },
          { field: { Name: "difficulty" } }
        ]
      };
      
      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id, 10), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      // Transform data to match existing UI expectations
      const resource = response.data;
      return {
        ...resource,
        mediaUrl: resource.media_url,
        readTime: resource.read_time,
        createdBy: resource.created_by
      };
    } catch (error) {
      console.error(`Error fetching resource with ID ${id}:`, error);
      throw error;
    }
  }

  async getByCategory(category) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "title" } },
          { field: { Name: "type" } },
          { field: { Name: "category" } },
          { field: { Name: "description" } },
          { field: { Name: "content" } },
          { field: { Name: "media_url" } },
          { field: { Name: "duration" } },
          { field: { Name: "read_time" } },
          { field: { Name: "downloadable" } },
          { field: { Name: "created_by" } },
          { field: { Name: "difficulty" } }
        ],
        where: [
          {
            FieldName: "category",
            Operator: "EqualTo",
            Values: [category]
          }
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      // Transform data to match existing UI expectations
      const transformedData = (response.data || []).map(resource => ({
        ...resource,
        mediaUrl: resource.media_url,
        readTime: resource.read_time,
        createdBy: resource.created_by
      }));
      
      return transformedData;
    } catch (error) {
      console.error(`Error fetching resources for category ${category}:`, error);
      throw error;
    }
  }

  async create(resourceData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      // Only include Updateable fields
      const params = {
        records: [{
          Name: resourceData.title || resourceData.Name,
          title: resourceData.title,
          type: resourceData.type,
          category: resourceData.category,
          description: resourceData.description,
          content: resourceData.content,
          media_url: resourceData.mediaUrl || resourceData.media_url,
          duration: resourceData.duration,
          read_time: resourceData.readTime || resourceData.read_time,
          downloadable: resourceData.downloadable || false,
          created_by: resourceData.createdBy || resourceData.created_by,
          difficulty: resourceData.difficulty
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
          throw new Error(failedRecords[0].message || 'Failed to create resource');
        }
        return response.results[0].data;
      }
      
      return response.data;
    } catch (error) {
      console.error("Error creating resource:", error);
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
          ...(updateData.type && { type: updateData.type }),
          ...(updateData.category && { category: updateData.category }),
          ...(updateData.description && { description: updateData.description }),
          ...(updateData.content && { content: updateData.content }),
          ...(updateData.mediaUrl && { media_url: updateData.mediaUrl }),
          ...(updateData.media_url && { media_url: updateData.media_url }),
          ...(updateData.duration && { duration: updateData.duration }),
          ...(updateData.readTime && { read_time: updateData.readTime }),
          ...(updateData.read_time && { read_time: updateData.read_time }),
          ...(updateData.downloadable !== undefined && { downloadable: updateData.downloadable }),
          ...(updateData.createdBy && { created_by: updateData.createdBy }),
          ...(updateData.created_by && { created_by: updateData.created_by }),
          ...(updateData.difficulty && { difficulty: updateData.difficulty })
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
          throw new Error(failedRecords[0].message || 'Failed to update resource');
        }
        return response.results[0].data;
      }
      
      return response.data;
    } catch (error) {
      console.error("Error updating resource:", error);
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
          throw new Error(failedRecords[0].message || 'Failed to delete resource');
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error deleting resource:", error);
      throw error;
    }
  }
}

export default new ResourceService();