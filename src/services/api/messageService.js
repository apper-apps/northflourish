import messageData from '../mockData/messages.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class MessageService {
  async getAll() {
    await delay(300);
    return [...messageData];
  }

  async getById(id) {
    await delay(200);
    const message = messageData.find(m => m.Id === parseInt(id, 10));
    if (!message) {
      throw new Error('Message not found');
    }
    return { ...message };
  }

  async getConversation(userId1, userId2) {
    await delay(250);
    return messageData
      .filter(m => 
        (m.senderId === userId1 && m.receiverId === userId2) ||
        (m.senderId === userId2 && m.receiverId === userId1)
      )
      .map(m => ({ ...m }))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  async create(messageData) {
    await delay(400);
    const maxId = Math.max(...messageData.map(m => m.Id), 0);
    const newMessage = {
      Id: maxId + 1,
      ...messageData,
      timestamp: new Date().toISOString(),
      read: false
    };
    return { ...newMessage };
  }

  async markAsRead(id) {
    await delay(200);
    const messageIndex = messageData.findIndex(m => m.Id === parseInt(id, 10));
    if (messageIndex === -1) {
      throw new Error('Message not found');
    }
    
    const updatedMessage = {
      ...messageData[messageIndex],
      read: true
    };
    
    return { ...updatedMessage };
  }

  async delete(id) {
    await delay(250);
    const messageIndex = messageData.findIndex(m => m.Id === parseInt(id, 10));
    if (messageIndex === -1) {
      throw new Error('Message not found');
    }
    return true;
  }
}

export default new MessageService();