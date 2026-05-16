// Firebase Role-Based Access Control Module
import { doc, getDoc, setDoc, updateDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { db } from './firebase-init.js';

// User roles
export const ROLES = {
  ADMIN: 'admin',
  BRANCH_MANAGER: 'branch_manager',
  SALES_EXECUTIVE: 'sales_executive',
  LOAN_PROCESSING_EXECUTIVE: 'loan_processing_executive',
  SUB_DSA_CONNECTOR: 'sub_dsa_connector',
  FINANCE_ACCOUNTS: 'finance_accounts'
};

// Role permissions
export const PERMISSIONS = {
  [ROLES.ADMIN]: [
    'full_crm_access',
    'manage_employees',
    'assign_leads',
    'view_reports',
    'manage_settings',
    'view_all_customers',
    'track_revenue',
    'access_analytics',
    'manage_permissions',
    'create_teams',
    'configure_lender_panels',
    'manage_sub_dsa_accounts',
    'access_compliance_logs',
    'configure_system_settings',
    'manage_integrations'
  ],
  [ROLES.BRANCH_MANAGER]: [
    'view_team_leads',
    'manage_team_leads',
    'track_employee_performance',
    'reassign_leads_within_team',
    'approve_status_changes',
    'view_team_reports',
    'manage_office_operations',
    'submit_mis_reports',
    'monitor_productivity'
  ],
  [ROLES.SALES_EXECUTIVE]: [
    'view_assigned_leads',
    'call_customers',
    'send_whatsapp_messages',
    'update_lead_status',
    'add_notes',
    'schedule_followups',
    'upload_documents',
    'view_own_performance'
  ],
  [ROLES.LOAN_PROCESSING_EXECUTIVE]: [
    'verify_documents',
    'submit_to_lenders',
    'manage_lender_queries',
    'update_loan_status',
    'track_tat_sla',
    'coordinate_with_lenders'
  ],
  [ROLES.SUB_DSA_CONNECTOR]: [
    'submit_leads',
    'track_own_leads',
    'view_payout_statements',
    'upload_customer_documents'
  ],
  [ROLES.FINANCE_ACCOUNTS]: [
    'view_commission_reports',
    'reconcile_payouts',
    'generate_gst_invoices',
    'track_payout_status',
    'export_financial_reports'
  ]
};

// Create user with role
export const createUserWithRole = async (userId, userData) => {
  try {
    const userDoc = {
      ...userData,
      role: userData.role || ROLES.SALES_EXECUTIVE,
      permissions: PERMISSIONS[userData.role || ROLES.SALES_EXECUTIVE],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await setDoc(doc(db, 'users', userId), userDoc);
    return { success: true, user: userDoc };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get user role
export const getUserRole = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { success: true, role: userDoc.data().role, permissions: userDoc.data().permissions };
    }
    return { success: false, error: 'User not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Check if user has permission
export const hasPermission = async (userId, permission) => {
  try {
    const result = await getUserRole(userId);
    if (result.success) {
      return result.permissions.includes(permission);
    }
    return false;
  } catch (error) {
    return false;
  }
};

// Check if user has any of the specified permissions
export const hasAnyPermission = async (userId, permissions) => {
  try {
    const result = await getUserRole(userId);
    if (result.success) {
      return permissions.some(perm => result.permissions.includes(perm));
    }
    return false;
  } catch (error) {
    return false;
  }
};

// Update user role
export const updateUserRole = async (userId, newRole) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      role: newRole,
      permissions: PERMISSIONS[newRole],
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get all users by role (for managers/admins)
export const getUsersByRole = async (role) => {
  try {
    const q = query(collection(db, 'users'), where('role', '==', role));
    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, data: users };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get team members (for managers)
export const getTeamMembers = async (managerId) => {
  try {
    const managerDoc = await getDoc(doc(db, 'users', managerId));
    if (!managerDoc.exists()) {
      return { success: false, error: 'Manager not found' };
    }
    
    const managerData = managerDoc.data();
    const teamIds = managerData.teamMembers || [];
    
    const users = [];
    for (const userId of teamIds) {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        users.push({ id: userDoc.id, ...userDoc.data() });
      }
    }
    
    return { success: true, data: users };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Assign team member to manager
export const assignTeamMember = async (managerId, memberId) => {
  try {
    const managerDoc = await getDoc(doc(db, 'users', managerId));
    if (!managerDoc.exists()) {
      return { success: false, error: 'Manager not found' };
    }
    
    const managerData = managerDoc.data();
    const currentTeam = managerData.teamMembers || [];
    
    if (!currentTeam.includes(memberId)) {
      await updateDoc(doc(db, 'users', managerId), {
        teamMembers: [...currentTeam, memberId],
        updatedAt: new Date().toISOString()
      });
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Remove team member from manager
export const removeTeamMember = async (managerId, memberId) => {
  try {
    const managerDoc = await getDoc(doc(db, 'users', managerId));
    if (!managerDoc.exists()) {
      return { success: false, error: 'Manager not found' };
    }
    
    const managerData = managerDoc.data();
    const currentTeam = managerData.teamMembers || [];
    
    const updatedTeam = currentTeam.filter(id => id !== memberId);
    
    await updateDoc(doc(db, 'users', managerId), {
      teamMembers: updatedTeam,
      updatedAt: new Date().toISOString()
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get accessible data based on role
export const getAccessibleData = async (userId, collection) => {
  try {
    const roleResult = await getUserRole(userId);
    if (!roleResult.success) {
      return { success: false, error: 'Could not determine user role' };
    }
    
    const role = roleResult.role;
    
    // Admin can see all data
    if (role === ROLES.ADMIN) {
      const q = query(collection(db, collection));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { success: true, data };
    }
    
    // Branch Manager can see team data
    if (role === ROLES.BRANCH_MANAGER) {
      const teamResult = await getTeamMembers(userId);
      if (teamResult.success) {
        const teamIds = teamResult.data.map(u => u.id);
        const q = query(collection(db, collection), where('userId', 'in', teamIds));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return { success: true, data };
      }
    }
    
    // Finance/Accounts can see financial data (assuming collection is 'payouts' or similar)
    if (role === ROLES.FINANCE_ACCOUNTS && collection === 'payouts') {
      const q = query(collection(db, collection));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { success: true, data };
    }
    
    // Sub-DSA/Connector can only see their own leads
    if (role === ROLES.SUB_DSA_CONNECTOR && collection === 'leads') {
      const q = query(collection(db, collection), where('submittedBy', '==', userId));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { success: true, data };
    }
    
    // Sales Executive, Loan Processing Executive, and others can only see their own data
    const q = query(collection(db, collection), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, data };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Export for CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ROLES,
    PERMISSIONS,
    createUserWithRole,
    getUserRole,
    hasPermission,
    hasAnyPermission,
    updateUserRole,
    getUsersByRole,
    getTeamMembers,
    assignTeamMember,
    removeTeamMember,
    getAccessibleData
  };
}
