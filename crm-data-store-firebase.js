// ═══════════════════════════════════════════════════════════════
// CRM DATA STORE - Firebase Integration Module
// ═══════════════════════════════════════════════════════════════

import { 
  createDocument, 
  getDocument, 
  updateDocument, 
  deleteDocument, 
  getCollection,
  listenToCollection,
  getContactsByUser,
  createActivity,
  getActivitiesByContact,
  createDeal,
  getDealsByUser,
  createLender,
  getLender,
  updateLender,
  deleteLender,
  getAllLenders,
  getActiveLenders,
  getLendersByType
} from './firebase-database.js';
import { getCurrentUser, adminCreateUser } from './firebase-auth.js';
import { getAccessibleData, getUserRole, ROLES, updateUserRole, getUsersByRole } from './firebase-roles.js';

export const FirebaseDataStore = {
  // Initialize Firebase data store
  async init() {
    const user = getCurrentUser();
    if (!user) {
      console.warn('No authenticated user found');
      return;
    }
    console.log('Firebase Data Store initialized for user:', user.uid);
  },

  // Get current user ID
  getUserId() {
    const user = getCurrentUser();
    return user ? user.uid : null;
  },

  // Get current user role
  async getUserRole() {
    const userId = this.getUserId();
    if (!userId) return null;
    
    const result = await getUserRole(userId);
    return result.success ? result.role : null;
  },

  // Generic CRUD operations with Firebase (role-based)
  async get(collection) {
    const userId = this.getUserId();
    if (!userId) return [];
    
    // Use role-based data access
    const result = await getAccessibleData(userId, collection);
    return result.success ? result.data : [];
  },

  async getById(collection, id) {
    const result = await getDocument(collection, id);
    return result.success ? result.data : null;
  },

  async add(collection, item) {
    const userId = this.getUserId();
    if (!userId) {
      return { success: false, error: 'No authenticated user' };
    }
    
    const itemWithUser = {
      ...item,
      userId,
      createdAt: item.createdAt || new Date().toISOString()
    };
    
    return await createDocument(collection, itemWithUser);
  },

  async update(collection, id, updates) {
    const updatesWithTimestamp = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return await updateDocument(collection, id, updatesWithTimestamp);
  },

  async delete(collection, id) {
    return await deleteDocument(collection, id);
  },

  // Search functionality (client-side for now)
  async search(collection, query, fields) {
    const items = await this.get(collection);
    const lowerQuery = query.toLowerCase();
    return items.filter(item => 
      fields.some(field => 
        String(item[field] || '').toLowerCase().includes(lowerQuery)
      )
    );
  },

  // Filter functionality
  async filter(collection, filters) {
    let items = await this.get(collection);
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        items = items.filter(item => item[key] === filters[key]);
      }
    });
    return items;
  },

  // Get counts
  async count(collection, filters = {}) {
    const items = await this.filter(collection, filters);
    return items.length;
  },

  // Get dashboard stats
  async getDashboardStats() {
    const leads = await this.get('leads');
    const deals = await this.get('deals');
    const tasks = await this.get('tasks');
    const calls = await this.get('calls');
    const contacts = await this.get('contacts');

    const totalLeads = leads.length;
    const hotLeads = leads.filter(l => l.status === 'hot').length;
    const warmLeads = leads.filter(l => l.status === 'warm').length;
    const coldLeads = leads.filter(l => l.status === 'cold').length;

    const totalDeals = deals.length;
    const openDeals = deals.filter(d => !['closed-won', 'closed-lost'].includes(d.stage)).length;
    const wonDeals = deals.filter(d => d.stage === 'closed-won').length;
    const lostDeals = deals.filter(d => d.stage === 'closed-lost').length;

    const totalDealValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);
    const wonValue = deals.filter(d => d.stage === 'closed-won').reduce((sum, d) => sum + (d.value || 0), 0);

    const conversionRate = totalLeads > 0 ? Math.round((wonDeals / totalLeads) * 100) : 0;

    const pendingTasks = tasks.filter(t => !t.completed).length;
    const completedTasks = tasks.filter(t => t.completed).length;

    // Calculate forecast based on pipeline deals
    const pipelineValue = deals.filter(d => !['closed-won', 'closed-lost'].includes(d.stage))
      .reduce((sum, d) => sum + (d.value || 0) * 0.3, 0);
    const forecastProbability = openDeals > 0 ? Math.min(85, 30 + openDeals * 5) : 0;

    // Current month revenue
    const now = new Date();
    const currentMonthDeals = deals.filter(d => {
      const dealDate = new Date(d.updatedAt || d.createdAt);
      return d.stage === 'closed-won' && dealDate.getMonth() === now.getMonth() && dealDate.getFullYear() === now.getFullYear();
    });
    const currentMonthRevenue = currentMonthDeals.reduce((sum, d) => sum + (d.value || 0), 0);

    // Compare with last month
    const lastMonthDeals = deals.filter(d => {
      const dealDate = new Date(d.updatedAt || d.createdAt);
      const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const lastYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      return d.stage === 'closed-won' && dealDate.getMonth() === lastMonth && dealDate.getFullYear() === lastYear;
    });
    const lastMonthRevenue = lastMonthDeals.reduce((sum, d) => sum + (d.value || 0), 0);

    return {
      leads: { total: totalLeads, new: leads.filter(l => l.status === 'new').length, contacted: leads.filter(l => l.status === 'contacted').length, qualified: leads.filter(l => l.status === 'qualified').length, hot: hotLeads, warm: warmLeads, cold: coldLeads },
      deals: { total: totalDeals, open: openDeals, won: wonDeals, lost: lostDeals, totalValue: totalDealValue, wonValue: wonValue },
      tasks: { pending: pendingTasks, completed: completedTasks, total: tasks.length },
      calls: calls.length,
      contacts: contacts.length,
      conversionRate,
      forecast: { amount: Math.round(pipelineValue), probability: forecastProbability },
      revenue: { currentMonth: currentMonthRevenue, lastMonth: lastMonthRevenue, trend: currentMonthRevenue >= lastMonthRevenue ? 'up' : 'down' }
    };
  },

  // Pipeline stages
  async getPipelineData() {
    const deals = await this.get('deals');
    const stages = ['prospecting', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'];
    const stageLabels = {
      'prospecting': 'Prospecting',
      'qualified': 'Qualified',
      'proposal': 'Proposal',
      'negotiation': 'Negotiation',
      'closed-won': 'Closed Won',
      'closed-lost': 'Closed Lost'
    };
    
    return stages.map(stage => {
      const stageDeals = deals.filter(d => d.stage === stage);
      return {
        stage,
        label: stageLabels[stage],
        count: stageDeals.length,
        value: stageDeals.reduce((sum, d) => sum + (d.value || 0), 0)
      };
    });
  },

  // Revenue by source
  async getRevenueBySource() {
    const leads = await this.get('leads');
    const sources = ['referral', 'web', 'linkedin', 'campaign', 'cold-email'];
    
    return sources.map(source => {
      const sourceLeads = leads.filter(l => l.source === source);
      return {
        source,
        count: sourceLeads.length,
        value: sourceLeads.reduce((sum, l) => sum + (l.dealValue || 0), 0)
      };
    }).sort((a, b) => b.value - a.value);
  },

  // Toggle task completion
  async toggleTask(taskId) {
    const task = await this.getById('tasks', taskId);
    if (task) {
      return await this.update('tasks', taskId, { 
        completed: !task.completed, 
        status: !task.completed ? 'completed' : 'pending',
        completedAt: !task.completed ? new Date().toISOString() : null
      });
    }
    return { success: false, error: 'Task not found' };
  },

  // Add activity
  async addActivity(type, description, relatedTo) {
    const user = getCurrentUser();
    const userId = user ? user.uid : 'anonymous';
    const userName = user ? user.displayName || user.email : 'Anonymous';
    
    return await createActivity({
      type,
      description,
      relatedTo,
      userId,
      userName,
      timestamp: new Date().toISOString()
    });
  },

  // Lender management (Admin only)
  async getLenders() {
    const role = await this.getUserRole();
    if (role !== ROLES.ADMIN) {
      return { success: false, error: 'Access denied: Admin only' };
    }
    return await getAllLenders();
  },

  async getActiveLenders() {
    const role = await this.getUserRole();
    if (![ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.SALES_EXECUTIVE, ROLES.LOAN_PROCESSING_EXECUTIVE].includes(role)) {
      return { success: false, error: 'Access denied' };
    }
    return await getActiveLenders();
  },

  async createLender(lenderData) {
    const role = await this.getUserRole();
    if (role !== ROLES.ADMIN) {
      return { success: false, error: 'Access denied: Admin only' };
    }
    return await createLender(lenderData);
  },

  async updateLender(lenderId, lenderData) {
    const role = await this.getUserRole();
    if (role !== ROLES.ADMIN) {
      return { success: false, error: 'Access denied: Admin only' };
    }
    return await updateLender(lenderId, lenderData);
  },

  async deleteLender(lenderId) {
    const role = await this.getUserRole();
    if (role !== ROLES.ADMIN) {
      return { success: false, error: 'Access denied: Admin only' };
    }
    return await deleteLender(lenderId);
  },

  async getLenderById(lenderId) {
    const role = await this.getUserRole();
    if (![ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.SALES_EXECUTIVE, ROLES.LOAN_PROCESSING_EXECUTIVE].includes(role)) {
      return { success: false, error: 'Access denied' };
    }
    return await getLender(lenderId);
  },

  // User management (Admin only)
  async createUser(email, password, displayName, role = ROLES.SALES_EXECUTIVE) {
    const currentRole = await this.getUserRole();
    if (currentRole !== ROLES.ADMIN) {
      return { success: false, error: 'Access denied: Admin only' };
    }
    return await adminCreateUser(email, password, displayName, role);
  },

  async getAllUsers() {
    const role = await this.getUserRole();
    if (role !== ROLES.ADMIN) {
      return { success: false, error: 'Access denied: Admin only' };
    }
    // Get all users from Firestore users collection
    const constraints = [orderBy('createdAt', 'desc')];
    return await getCollection('users', constraints);
  },

  async getUsersByRole(role) {
    const currentRole = await this.getUserRole();
    if (currentRole !== ROLES.ADMIN) {
      return { success: false, error: 'Access denied: Admin only' };
    }
    return await getUsersByRole(role);
  },

  async updateUserRole(userId, newRole) {
    const currentRole = await this.getUserRole();
    if (currentRole !== ROLES.ADMIN) {
      return { success: false, error: 'Access denied: Admin only' };
    }
    return await updateUserRole(userId, newRole);
  },

  async getUserById(userId) {
    const currentRole = await this.getUserRole();
    if (currentRole !== ROLES.ADMIN) {
      return { success: false, error: 'Access denied: Admin only' };
    }
    return await getDocument('users', userId);
  },

  // Real-time sync for collections
  subscribeToCollection(collection, callback) {
    const userId = this.getUserId();
    if (!userId) {
      console.warn('No authenticated user for subscription');
      return () => {};
    }
    
    return listenToCollection(collection, [where('userId', '==', userId)], callback);
  }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FirebaseDataStore;
}
