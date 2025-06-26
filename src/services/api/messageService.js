class MessageService {
  constructor() {
    this.apperClient = null;
    this.tableName = 'message';
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
          { field: { Name: "sender_id" } },
          { field: { Name: "receiver_id" } },
          { field: { Name: "sender_name" } },
          { field: { Name: "content" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "read" } },
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
      const transformedData = (response.data || []).map(message => ({
        ...message,
        senderId: message.sender_id,
        receiverId: message.receiver_id,
        senderName: message.sender_name
      }));
      
      return transformedData;
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "sender_id" } },
          { field: { Name: "receiver_id" } },
          { field: { Name: "sender_name" } },
          { field: { Name: "content" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "read" } },
          { field: { Name: "type" } }
        ]
      };
      
      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id, 10), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      // Transform data to match existing UI expectations
      const message = response.data;
      return {
        ...message,
        senderId: message.sender_id,
        receiverId: message.receiver_id,
        senderName: message.sender_name
      };
    } catch (error) {
      console.error(`Error fetching message with ID ${id}:`, error);
      throw error;
    }
  }

  async getConversation(userId1, userId2) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "sender_id" } },
          { field: { Name: "receiver_id" } },
          { field: { Name: "sender_name" } },
          { field: { Name: "content" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "read" } },
          { field: { Name: "type" } }
        ],
        whereGroups: [{
          operator: "OR",
          subGroups: [
            {
              operator: "AND",
              conditions: [
                {
                  fieldName: "sender_id",
                  operator: "EqualTo",
                  values: [userId1]
                },
                {
                  fieldName: "receiver_id",
                  operator: "EqualTo",
                  values: [userId2]
                }
              ]
            },
            {
              operator: "AND",
              conditions: [
                {
                  fieldName: "sender_id",
                  operator: "EqualTo",
                  values: [userId2]
                },
                {
                  fieldName: "receiver_id",
                  operator: "EqualTo",
                  values: [userId1]
                }
              ]
            }
          ]
        }],
        orderBy: [
          {
            fieldName: "timestamp",
            sorttype: "ASC"
          }
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      // Transform data to match existing UI expectations
      const transformedData = (response.data || []).map(message => ({
        ...message,
        senderId: message.sender_id,
        receiverId: message.receiver_id,
        senderName: message.sender_name
      }));
      
      return transformedData;
    } catch (error) {
      console.error(`Error fetching conversation between ${userId1} and ${userId2}:`, error);
      throw error;
    }
  }

  async create(messageData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      // Only include Updateable fields
      const params = {
        records: [{
          Name: messageData.content?.substring(0, 50) || 'Message',
          sender_id: messageData.senderId || messageData.sender_id,
          receiver_id: messageData.receiverId || messageData.receiver_id,
          sender_name: messageData.senderName || messageData.sender_name,
          content: messageData.content,
          timestamp: messageData.timestamp || new Date().toISOString(),
          read: messageData.read || false,
          type: messageData.type || 'text'
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
          throw new Error(failedRecords[0].message || 'Failed to create message');
        }
        return response.results[0].data;
      }
      
      return response.data;
    } catch (error) {
      console.error("Error creating message:", error);
      throw error;
    }
  }

  async markAsRead(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        records: [{
          Id: parseInt(id, 10),
          read: true
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
          console.error(`Failed to mark as read ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to mark message as read');
        }
        return response.results[0].data;
      }
      
      return response.data;
    } catch (error) {
      console.error("Error marking message as read:", error);
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
          throw new Error(failedRecords[0].message || 'Failed to delete message');
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error deleting message:", error);
      throw error;
    }
  }
}

export default new MessageService();