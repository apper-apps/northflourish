class SessionService {
  constructor() {
    this.apperClient = null;
    this.tableName = 'session';
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
          { field: { Name: "practitioner_id" } },
          { field: { Name: "client_name" } },
          { field: { Name: "title" } },
          { field: { Name: "date_time" } },
          { field: { Name: "duration" } },
          { field: { Name: "type" } },
          { field: { Name: "status" } },
          { field: { Name: "notes" } },
          { field: { Name: "session_type" } },
          { field: { name: "client_id" }, referenceField: { field: { Name: "Name" } } }
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      // Transform data to match existing UI expectations
      const transformedData = (response.data || []).map(session => ({
        ...session,
        dateTime: session.date_time,
        clientName: session.client_name,
        sessionType: session.session_type,
        practitionerId: session.practitioner_id,
        clientId: session.client_id?.Id || session.client_id
      }));
      
      return transformedData;
    } catch (error) {
      console.error("Error fetching sessions:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "practitioner_id" } },
          { field: { Name: "client_name" } },
          { field: { Name: "title" } },
          { field: { Name: "date_time" } },
          { field: { Name: "duration" } },
          { field: { Name: "type" } },
          { field: { Name: "status" } },
          { field: { Name: "notes" } },
          { field: { Name: "session_type" } },
          { field: { name: "client_id" }, referenceField: { field: { Name: "Name" } } }
        ]
      };
      
      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id, 10), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      // Transform data to match existing UI expectations
      const session = response.data;
      return {
        ...session,
        dateTime: session.date_time,
        clientName: session.client_name,
        sessionType: session.session_type,
        practitionerId: session.practitioner_id,
        clientId: session.client_id?.Id || session.client_id
      };
    } catch (error) {
      console.error(`Error fetching session with ID ${id}:`, error);
      throw error;
    }
  }

  async getByClientId(clientId) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "practitioner_id" } },
          { field: { Name: "client_name" } },
          { field: { Name: "title" } },
          { field: { Name: "date_time" } },
          { field: { Name: "duration" } },
          { field: { Name: "type" } },
          { field: { Name: "status" } },
          { field: { Name: "notes" } },
          { field: { Name: "session_type" } },
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
      const transformedData = (response.data || []).map(session => ({
        ...session,
        dateTime: session.date_time,
        clientName: session.client_name,
        sessionType: session.session_type,
        practitionerId: session.practitioner_id,
        clientId: session.client_id?.Id || session.client_id
      }));
      
      return transformedData;
    } catch (error) {
      console.error(`Error fetching sessions for client ${clientId}:`, error);
      throw error;
    }
  }

  async create(sessionData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      // Only include Updateable fields
      const params = {
        records: [{
          Name: sessionData.title || sessionData.Name,
          practitioner_id: sessionData.practitionerId || sessionData.practitioner_id,
          client_name: sessionData.clientName || sessionData.client_name,
          title: sessionData.title,
          date_time: sessionData.dateTime || sessionData.date_time,
          duration: sessionData.duration,
          type: sessionData.type,
          status: sessionData.status || 'scheduled',
          notes: sessionData.notes || '',
          session_type: sessionData.sessionType || sessionData.session_type,
          client_id: parseInt(sessionData.clientId || sessionData.client_id, 10)
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
          throw new Error(failedRecords[0].message || 'Failed to create session');
        }
        return response.results[0].data;
      }
      
      return response.data;
    } catch (error) {
      console.error("Error creating session:", error);
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
          ...(updateData.practitionerId && { practitioner_id: updateData.practitionerId }),
          ...(updateData.practitioner_id && { practitioner_id: updateData.practitioner_id }),
          ...(updateData.clientName && { client_name: updateData.clientName }),
          ...(updateData.client_name && { client_name: updateData.client_name }),
          ...(updateData.dateTime && { date_time: updateData.dateTime }),
          ...(updateData.date_time && { date_time: updateData.date_time }),
          ...(updateData.duration !== undefined && { duration: updateData.duration }),
          ...(updateData.type && { type: updateData.type }),
          ...(updateData.status && { status: updateData.status }),
          ...(updateData.notes !== undefined && { notes: updateData.notes }),
          ...(updateData.sessionType && { session_type: updateData.sessionType }),
          ...(updateData.session_type && { session_type: updateData.session_type }),
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
          throw new Error(failedRecords[0].message || 'Failed to update session');
        }
        return response.results[0].data;
      }
      
      return response.data;
    } catch (error) {
      console.error("Error updating session:", error);
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
          throw new Error(failedRecords[0].message || 'Failed to delete session');
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error deleting session:", error);
      throw error;
    }
  }
}

export default new SessionService();