// Migration script to add existing users to Firebase with their roles
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from './firebase-init.js';
import { ROLES } from './firebase-roles.js';

// Users to migrate from localStorage to Firebase
const usersToMigrate = [
  {
    email: 'vaibhav.borge@fundingsathi.in',
    password: 'Vaibhav123',
    displayName: 'Vaibhav Borge',
    role: ROLES.SALES_EXECUTIVE
  },
  {
    email: 'saleem.k@fundingsathi.in',
    password: 'Saleem123',
    displayName: 'Saleem Khan',
    role: ROLES.LOAN_PROCESSING_EXECUTIVE
  },
  {
    email: 'roshan.chavan@fundingsathi.in',
    password: 'Roshan123',
    displayName: 'Roshan Chawan',
    role: ROLES.SALES_EXECUTIVE
  }
];

// Admin user for seeding
const adminUser = {
  email: 'shree.rathod@fundingsathi.in',
  password: 'admin123'
};

/**
 * Create user in Firebase Auth and Firestore
 */
async function createUserInFirebase(email, password, displayName, role) {
  try {
    console.log(`Creating user: ${displayName} (${email})...`);
    
    // Check if user already exists
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const existingUser = await getDocs(q);
    
    if (!existingUser.empty) {
      console.log(`  ⚠️  User already exists: ${email}`);
      return { success: false, message: 'User already exists' };
    }
    
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;
    
    console.log(`  ✓ Auth user created with UID: ${userId}`);
    
    // Store user document in Firestore with role
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      uid: userId,
      email,
      displayName,
      role,
      createdAt: new Date().toISOString(),
      active: true,
      permissions: getPermissionsForRole(role)
    });
    
    console.log(`  ✓ User document created in Firestore with role: ${role}`);
    return { success: true, userId, message: `User ${displayName} created successfully` };
  } catch (error) {
    console.error(`  ✗ Error creating user: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Get permissions for a role
 */
function getPermissionsForRole(role) {
  const rolePermissions = {
    [ROLES.ADMIN]: ['full_crm_access', 'manage_employees', 'manage_lenders', 'assign_leads', 'view_reports', 'export_data', 'system_settings'],
    [ROLES.BRANCH_MANAGER]: ['view_assigned_leads', 'manage_team', 'update_lead_status', 'view_reports', 'assign_leads_to_team'],
    [ROLES.SALES_EXECUTIVE]: ['view_assigned_leads', 'call_customers', 'update_lead_status', 'add_notes', 'upload_documents', 'schedule_followups', 'whatsapp_integration', 'lead_reminders'],
    [ROLES.TELECALLER]: ['call_customers', 'update_lead_status', 'add_notes', 'schedule_followups'],
    [ROLES.LOAN_PROCESSING_EXECUTIVE]: ['view_assigned_leads', 'update_lead_status', 'add_notes', 'upload_documents', 'view_reports'],
    [ROLES.SUB_DSA_CONNECTOR]: ['add_leads', 'view_own_leads', 'update_lead_status'],
    [ROLES.FINANCE_ACCOUNTS]: ['view_all_leads', 'generate_reports', 'export_data']
  };
  
  return rolePermissions[role] || [];
}

/**
 * Main migration function
 */
async function migrateUsers() {
  console.log('\n🔄 Starting user migration to Firebase...\n');
  
  try {
    // Sign in as admin first to ensure permissions
    console.log('Authenticating as admin...');
    const adminCredential = await createUserWithEmailAndPassword(auth, adminUser.email, adminUser.password);
    const adminUserId = adminCredential.user.uid;
    
    // Create admin user document
    const adminRef = doc(db, 'users', adminUserId);
    await setDoc(adminRef, {
      uid: adminUserId,
      email: adminUser.email,
      displayName: 'Shree Rathod',
      role: ROLES.ADMIN,
      createdAt: new Date().toISOString(),
      active: true,
      permissions: getPermissionsForRole(ROLES.ADMIN)
    });
    
    console.log('✓ Admin user created\n');
    
    // Sign out and migrate other users
    await signOut(auth);
    
    // Migrate each user
    const results = [];
    for (const user of usersToMigrate) {
      const result = await createUserInFirebase(user.email, user.password, user.displayName, user.role);
      results.push(result);
    }
    
    console.log('\n📊 Migration Summary:');
    console.log('='.repeat(50));
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    console.log(`✓ Successful: ${successful}/${results.length}`);
    console.log(`✗ Failed: ${failed}/${results.length}`);
    console.log('='.repeat(50));
    
    console.log('\n✅ User migration completed!');
    console.log('\nYou can now log in with:');
    console.log('Admin: shree.rathod@fundingsathi.in / admin123');
    console.log('Sales Executive 1: vaibhav.borge@fundingsathi.in / Vaibhav123');
    console.log('Sales Executive 2: roshan.chavan@fundingsathi.in / Roshan123');
    console.log('Loan Processing: saleem.k@fundingsathi.in / Saleem123');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
  }
}

// Run migration
migrateUsers().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
