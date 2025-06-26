import clientData from '../mockData/clients.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class ClientService {
  async getAll() {
    await delay(300);
    return [...clientData];
  }

  async getById(id) {
    await delay(200);
    const client = clientData.find(c => c.Id === parseInt(id, 10));
    if (!client) {
      throw new Error('Client not found');
    }
    return { ...client };
  }

  async create(clientData) {
    await delay(400);
    const maxId = Math.max(...clientData.map(c => c.Id), 0);
    const newClient = {
      Id: maxId + 1,
      ...clientData,
      createdAt: new Date().toISOString()
    };
    return { ...newClient };
  }

  async update(id, updateData) {
    await delay(350);
    const clientIndex = clientData.findIndex(c => c.Id === parseInt(id, 10));
    if (clientIndex === -1) {
      throw new Error('Client not found');
    }
    
    const updatedClient = {
      ...clientData[clientIndex],
      ...updateData,
      Id: parseInt(id, 10), // Ensure Id is not modified
      updatedAt: new Date().toISOString()
    };
    
    return { ...updatedClient };
  }

  async delete(id) {
    await delay(250);
    const clientIndex = clientData.findIndex(c => c.Id === parseInt(id, 10));
    if (clientIndex === -1) {
      throw new Error('Client not found');
    }
    return true;
  }
}

export default new ClientService();