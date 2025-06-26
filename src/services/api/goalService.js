import goalData from '../mockData/goals.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class GoalService {
  async getAll() {
    await delay(300);
    return [...goalData];
  }

  async getById(id) {
    await delay(200);
    const goal = goalData.find(g => g.Id === parseInt(id, 10));
    if (!goal) {
      throw new Error('Goal not found');
    }
    return { ...goal };
  }

  async getByClientId(clientId) {
    await delay(250);
    return goalData.filter(g => g.clientId === clientId).map(g => ({ ...g }));
  }

  async create(goalData) {
    await delay(400);
    const maxId = Math.max(...goalData.map(g => g.Id), 0);
    const newGoal = {
      Id: maxId + 1,
      ...goalData,
      createdAt: new Date().toISOString()
    };
    return { ...newGoal };
  }

  async update(id, updateData) {
    await delay(350);
    const goalIndex = goalData.findIndex(g => g.Id === parseInt(id, 10));
    if (goalIndex === -1) {
      throw new Error('Goal not found');
    }
    
    const updatedGoal = {
      ...goalData[goalIndex],
      ...updateData,
      Id: parseInt(id, 10),
      updatedAt: new Date().toISOString()
    };
    
    return { ...updatedGoal };
  }

  async delete(id) {
    await delay(250);
    const goalIndex = goalData.findIndex(g => g.Id === parseInt(id, 10));
    if (goalIndex === -1) {
      throw new Error('Goal not found');
    }
    return true;
  }
}

export default new GoalService();