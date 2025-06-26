import resourceData from '../mockData/resources.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class ResourceService {
  async getAll() {
    await delay(300);
    return [...resourceData];
  }

  async getById(id) {
    await delay(200);
    const resource = resourceData.find(r => r.Id === parseInt(id, 10));
    if (!resource) {
      throw new Error('Resource not found');
    }
    return { ...resource };
  }

  async getByCategory(category) {
    await delay(250);
    return resourceData.filter(r => r.category === category).map(r => ({ ...r }));
  }

  async create(resourceData) {
    await delay(400);
    const maxId = Math.max(...resourceData.map(r => r.Id), 0);
    const newResource = {
      Id: maxId + 1,
      ...resourceData,
      createdAt: new Date().toISOString()
    };
    return { ...newResource };
  }

  async update(id, updateData) {
    await delay(350);
    const resourceIndex = resourceData.findIndex(r => r.Id === parseInt(id, 10));
    if (resourceIndex === -1) {
      throw new Error('Resource not found');
    }
    
    const updatedResource = {
      ...resourceData[resourceIndex],
      ...updateData,
      Id: parseInt(id, 10),
      updatedAt: new Date().toISOString()
    };
    
    return { ...updatedResource };
  }

  async delete(id) {
    await delay(250);
    const resourceIndex = resourceData.findIndex(r => r.Id === parseInt(id, 10));
    if (resourceIndex === -1) {
      throw new Error('Resource not found');
    }
    return true;
  }
}

export default new ResourceService();