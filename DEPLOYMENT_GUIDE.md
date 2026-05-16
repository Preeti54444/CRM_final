# Firebase Deployment Guide - Step-by-Step Instructions

## Step 1: Deploy Firestore Security Rules

### 1.1 Go to Firebase Console
1. Open [https://console.firebase.google.com](https://console.firebase.google.com)
2. Select your project: `fscrm-2b076`
3. Click on "Firestore Database" in the left sidebar

### 1.2 Navigate to Rules Tab
1. Click on the "Rules" tab at the top
2. You'll see the current rules editor

### 1.3 Update Rules
1. Copy the contents from `firestore.rules` file in your project
2. Paste the rules into the Firebase Console rules editor
3. Click "Publish" to deploy the rules

**The rules should look like this:**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions for role-based access
    function isAuthenticated() {
      return request.auth != null;
    }
    // ... (rest of the rules)
  }
}
```

### 1.4 Verify Rules
- After publishing, you should see "Rules published successfully"
- The rules will be active immediately

---

## Step 2: Enable Authentication

### 2.1 Enable Email/Password Authentication
1. In Firebase Console, click "Authentication" in the left sidebar
2. Click "Get Started" if not already enabled
3. Click on the "Sign-in method" tab
4. Find "Email/Password" and click it
5. Enable the toggle
6. Click "Save"

### 2.2 (Optional) Enable Google Sign-In
1. In the same "Sign-in method" tab
2. Find "Google" and click it
3. Enable the toggle
4. Add a project support email
5. Click "Save"

---

## Step 3: Create Initial Admin User

### 3.1 Create User in Firebase Authentication
1. Go to "Authentication" → "Users" tab
2. Click "Add user"
3. Enter admin credentials:
   - **Email:** `admin@fundingsathi.com` (or your preferred admin email)
   - **Password:** Choose a strong password
4. Click "Add user"

### 3.2 Assign Admin Role in Firestore
Since Firebase Authentication doesn't store custom claims by default, you need to create a user document in Firestore with the admin role.

**Option A: Using Firebase Console (Manual)**
1. Go to "Firestore Database"
2. Click "Start collection"
3. Collection name: `users`
4. Document ID: Enter the user's UID (get from Authentication → Users → click on the user)
5. Add the following fields:
   ```
   email: "admin@fundingsathi.com"
   displayName: "Admin User"
   role: "admin"
   permissions: ["full_crm_access", "manage_employees", "assign_leads", "view_reports", "manage_settings", "view_all_customers", "track_revenue", "access_analytics", "manage_permissions", "create_teams"]
   createdAt: [current timestamp]
   updatedAt: [current timestamp]
   ```
6. Click "Save"

**Option B: Using a Script (Automated)**
Create a temporary script file `create-admin.js`:

```javascript
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCimbhjhdMHXZKbbVclwUFWF2O1eyW6c0U",
  authDomain: "fscrm-2b076.firebaseapp.com",
  projectId: "fscrm-2b076",
  storageBucket: "fscrm-2b076.firebasestorage.app",
  messagingSenderId: "40976570212",
  appId: "1:40976570212:web:ab25edb9c4b7ac42b84c71",
  measurementId: "G-BCREVZ0PNL"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createAdminUser() {
  const adminUid = "YOUR_ADMIN_UID_FROM_AUTH"; // Get from Firebase Console
  await setDoc(doc(db, 'users', adminUid), {
    email: "admin@fundingsathi.com",
    displayName: "Admin User",
    role: "admin",
    permissions: [
      "full_crm_access",
      "manage_employees",
      "assign_leads",
      "view_reports",
      "manage_settings",
      "view_all_customers",
      "track_revenue",
      "access_analytics",
      "manage_permissions",
      "create_teams"
    ],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  console.log("Admin user created successfully");
}

createAdminUser().catch(console.error);
```

Run it with: `node create-admin.js`

---

## Step 4: Create Manager Accounts

### 4.1 Create Manager Users in Authentication
1. Go to "Authentication" → "Users"
2. Click "Add user" for each manager:
   - **Email:** `manager1@fundingsathi.com`
   - **Password:** Choose a strong password
3. Repeat for additional managers

### 4.2 Assign Manager Role in Firestore
For each manager, create a user document:

**Using Firebase Console:**
1. Go to Firestore Database → `users` collection
2. Click "Add document"
3. Document ID: Manager's UID from Authentication
4. Add fields:
   ```
   email: "manager1@fundingsathi.com"
   displayName: "Branch Manager 1"
   role: "manager"
   permissions: ["view_team_leads", "track_employee_performance", "reassign_leads", "view_reports", "approve_updates", "monitor_productivity"]
   teamMembers: []  // Empty array initially
   createdAt: [timestamp]
   updatedAt: [timestamp]
   ```
5. Click "Save"

---

## Step 5: Create Sales Executive Accounts

### 5.1 Create Sales Executive Users in Authentication
1. Go to "Authentication" → "Users"
2. Click "Add user" for each sales executive:
   - **Email:** `sales1@fundingsathi.com`
   - **Password:** Choose a strong password
3. Repeat for additional sales executives

### 5.2 Assign Sales Executive Role in Firestore
For each sales executive, create a user document:

**Using Firebase Console:**
1. Go to Firestore Database → `users` collection
2. Click "Add document"
3. Document ID: Sales executive's UID from Authentication
4. Add fields:
   ```
   email: "sales1@fundingsathi.com"
   displayName: "Sales Executive 1"
   role: "sales_executive"
   permissions: ["view_assigned_leads", "call_customers", "update_lead_status", "add_notes", "upload_documents", "schedule_followups", "whatsapp_integration", "lead_reminders"]
   createdAt: [timestamp]
   updatedAt: [timestamp]
   ```
5. Click "Save"

---

## Step 6: Assign Team Members to Managers

### 6.1 Get User IDs
1. Go to "Authentication" → "Users"
2. Click on each user to copy their UID
3. Note down:
   - Manager's UID
   - Sales executives' UIDs you want to assign

### 6.2 Update Manager Document
**Using Firebase Console:**
1. Go to Firestore Database → `users` collection
2. Click on the manager's document
3. Find the `teamMembers` field
4. Add the sales executive UIDs as an array:
   ```
   teamMembers: ["sales_executive_uid_1", "sales_executive_uid_2"]
   ```
5. Click "Save"

**Using Script:**
Create `assign-team.js`:

```javascript
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, arrayUnion } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCimbhjhdMHXZKbbVclwUFWF2O1eyW6c0U",
  authDomain: "fscrm-2b076.firebaseapp.com",
  projectId: "fscrm-2b076",
  storageBucket: "fscrm-2b076.firebasestorage.app",
  messagingSenderId: "40976570212",
  appId: "1:40976570212:web:ab25edb9c4b7ac42b84c71",
  measurementId: "G-BCREVZ0PNL"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function assignTeamMember(managerUid, salesExecutiveUid) {
  await updateDoc(doc(db, 'users', managerUid), {
    teamMembers: arrayUnion(salesExecutiveUid)
  });
  console.log(`Assigned sales executive to manager`);
}

// Usage
assignTeamMember("MANAGER_UID", "SALES_EXECUTIVE_UID")
  .then(() => console.log("Assignment successful"))
  .catch(console.error);
```

---

## Step 7: Test Role-Based Access

### 7.1 Test Admin Access
1. Open `files (6)/login.html` in a browser
2. Login with admin credentials
3. Verify:
   - Login succeeds
   - User is redirected to CRM dashboard
   - Can access all data (leads, contacts, deals, etc.)
   - No permission errors in console

### 7.2 Test Manager Access
1. Logout or open in incognito window
2. Login with manager credentials
3. Verify:
   - Login succeeds
   - Can only see team's data (not all data)
   - Can reassign leads within team
   - Cannot access other teams' data

### 7.3 Test Sales Executive Access
1. Logout or open in incognito window
2. Login with sales executive credentials
3. Verify:
   - Login succeeds
   - Can only see assigned leads
   - Can update lead status and add notes
   - Cannot access other users' data
   - Cannot manage users or settings

### 7.4 Test Fallback to Local Auth
1. Set `useFirebase = false` in `login.html`
2. Login with local credentials (shree.rathod@fundingsathi.in)
3. Verify local authentication still works

---

## Step 8: Verify Firestore Security Rules

### 8.1 Check Rules are Active
1. Go to Firebase Console → Firestore Database → Rules
2. Verify the rules match your `firestore.rules` file
3. Check the "Rules published" timestamp

### 8.2 Test Rule Violations
1. Try to access data as a sales executive that belongs to another user
2. Verify you get "Permission denied" error
3. This confirms rules are working correctly

---

## Step 9: Update Existing Users (Migration)

If you have existing users in the local system, you can migrate them:

### 9.1 Create Firebase Auth Users
For each existing user in `USERS` object in `login.html`:
1. Create user in Firebase Authentication with same email/password
2. Create corresponding user document in Firestore with appropriate role

### 9.2 Migration Script
Create `migrate-users.js`:

```javascript
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
  apiKey: "AIzaSyCimbhjhdMHXZKbbVclwUFWF2O1eyW6c0U",
  authDomain: "fscrm-2b076.firebaseapp.com",
  projectId: "fscrm-2b076",
  storageBucket: "fscrm-2b076.firebasestorage.app",
  messagingSenderId: "40976570212",
  appId: "1:40976570212:web:ab25edb9c4b7ac42b84c71",
  measurementId: "G-BCREVZ0PNL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const existingUsers = {
  'shree.rathod@fundingsathi.in': {password:'admin123',role:'admin',name:'Shree Rathod'},
  'vaibhav.borge@fundingsathi.in': {password:'emp123',role:'employee',name:'Vaibhav Borge'},
  'saleem.k@fundingsathi.in': {password:'emp456',role:'manager',name:'Saleem Khan'},
  'roshan.chavan@fundingsathi.in': {password:'emp789',role:'employee',name:'Roshan Chawan'},
};

async function migrateUser(email, userData) {
  try {
    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, userData.password);
    
    // Create Firestore user document
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: email,
      displayName: userData.name,
      role: userData.role === 'admin' ? 'admin' : 'sales_executive',
      permissions: userData.role === 'admin' 
        ? ["full_crm_access", "manage_employees", "assign_leads", "view_reports", "manage_settings", "view_all_customers", "track_revenue", "access_analytics", "manage_permissions", "create_teams"]
        : ["view_assigned_leads", "call_customers", "update_lead_status", "add_notes", "upload_documents", "schedule_followups", "whatsapp_integration", "lead_reminders"],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log(`Migrated: ${email}`);
  } catch (error) {
    console.error(`Failed to migrate ${email}:`, error.message);
  }
}

async function migrateAll() {
  for (const [email, userData] of Object.entries(existingUsers)) {
    await migrateUser(email, userData);
  }
  console.log("Migration complete");
}

migrateAll().catch(console.error);
```

Run with: `node migrate-users.js`

---

## Step 10: Start Backend Server (Optional)

If you want to use the REST API backend:

1. Install dependencies (already done):
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   node backend-server.js
   ```

3. Server will run on `http://localhost:3000`

4. Test API endpoints:
   ```bash
   # Login
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@fundingsathi.com","password":"yourpassword"}'
   
   # Get contacts (requires token from login)
   curl -X GET http://localhost:3000/api/contacts \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

---

## Troubleshooting

### Issue: "Permission denied" errors
**Solution:**
- Verify Firestore rules are published
- Check user role is set correctly in Firestore
- Ensure userId matches in documents

### Issue: User cannot login
**Solution:**
- Verify Email/Password auth is enabled
- Check user exists in Authentication
- Verify password is correct
- Check browser console for errors

### Issue: Manager cannot see team data
**Solution:**
- Verify teamMembers array is populated in manager document
- Check sales executive UIDs are correct
- Ensure security rules allow team access

### Issue: Rules not publishing
**Solution:**
- Check for syntax errors in rules
- Ensure you have project owner/editor permissions
- Try clearing browser cache and retry

---

## Summary Checklist

- [ ] Firestore security rules deployed
- [ ] Email/Password authentication enabled
- [ ] Admin user created with role in Firestore
- [ ] Manager accounts created with role in Firestore
- [ ] Sales executive accounts created with role in Firestore
- [ ] Team members assigned to managers
- [ ] Admin login tested successfully
- [ ] Manager login tested successfully
- [ ] Sales executive login tested successfully
- [ ] Role-based data access verified
- [ ] Fallback to local auth tested
- [ ] Existing users migrated (if applicable)

Once all steps are completed, your CRM system will have full role-based access control with Firebase!
