import sessionData from '../mockData/sessions.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class SessionService {
  async getAll() {
    await delay(300);
    return [...sessionData];
  }

  async getById(id) {
    await delay(200);
    const session = sessionData.find(s => s.Id === parseInt(id, 10));
    if (!session) {
      throw new Error('Session not found');
    }
    return { ...session };
  }

  async getByClientId(clientId) {
    await delay(250);
    return sessionData.filter(s => s.clientId === clientId).map(s => ({ ...s }));
  }

  async create(sessionData) {
    await delay(400);
    const maxId = Math.max(...sessionData.map(s => s.Id), 0);
    const newSession = {
      Id: maxId + 1,
      ...sessionData,
      createdAt: new Date().toISOString()
    };
    return { ...newSession };
  }

  async update(id, updateData) {
    await delay(350);
    const sessionIndex = sessionData.findIndex(s => s.Id === parseInt(id, 10));
    if (sessionIndex === -1) {
      throw new Error('Session not found');
    }
    
    const updatedSession = {
      ...sessionData[sessionIndex],
      ...updateData,
      Id: parseInt(id, 10),
      updatedAt: new Date().toISOString()
    };
    
    return { ...updatedSession };
  }

  async delete(id) {
    await delay(250);
    const sessionIndex = sessionData.findIndex(s => s.Id === parseInt(id, 10));
    if (sessionIndex === -1) {
      throw new Error('Session not found');
    }
    return true;
  }
}

export default new SessionService();