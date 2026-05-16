# Role-Based Access Control (RBAC) Documentation

## Overview

The CRM system now implements role-based access control (RBAC) with three distinct user roles:

### User Roles

1. **ADMIN**
   - Full CRM access
   - Manage employees
   - Assign leads
   - View reports
   - Manage settings
   - View all customers
   - Track revenue
   - Access analytics
   - Manage permissions
   - Create teams

2. **MANAGER (Branch Manager)**
   - View team leads
   - Track employee performance
   - Reassign leads
   - View reports
   - Approve updates
   - Monitor productivity

3. **SALES EXECUTIVE / TELECALLER**
   - View assigned leads
   - Call customers
   - Update lead status
   - Add notes
   - Upload documents
   - Schedule follow-ups
   - WhatsApp integration
   - Lead reminders

## Firebase Implementation

### Files Created/Modified

1. **firebase-roles.js** - Role management module
   - User role definitions
   - Permission checking functions
   - Team management functions
   - Role-based data access

2. **firestore.rules** - Firestore security rules
   - Role-based read/write permissions
   - Team member access control
   - Admin/Manager/Sales Executive restrictions

3. **firebase-auth.js** - Updated authentication
   - Register users with roles
   - Login returns user role and permissions
   - Role-based session management

4. **crm-data-store-firebase.js** - Updated data store
   - Role-based data filtering
   - Automatic permission checks
   - Team data access for managers

5. **login.html** - Updated login
   - Firebase authentication with role detection
   - Role-based redirects
   - Fallback to local auth

## How to Use

### Creating Users with Roles

```javascript
import { registerUser } from './firebase-auth.js';

// Create admin user
await registerUser('admin@company.com', 'password123', 'Admin Name', 'admin');

// Create manager user
await registerUser('manager@company.com', 'password123', 'Manager Name', 'manager');

// Create sales executive user
await registerUser('sales@company.com', 'password123', 'Sales Name', 'sales_executive');

// Create telecaller user
await registerUser('telecaller@company.com', 'password123', 'Telecaller Name', 'telecaller');
```

### Checking User Permissions

```javascript
import { hasPermission, getUserRole } from './firebase-roles.js';

// Check if user has specific permission
const canManageEmployees = await hasPermission(userId, 'manage_employees');

// Get user role
const roleResult = await getUserRole(userId);
console.log(roleResult.role); // 'admin', 'manager', or 'sales_executive'
```

### Team Management (Managers)

```javascript
import { assignTeamMember, getTeamMembers } from './firebase-roles.js';

// Assign a sales executive to a manager
await assignTeamMember(managerId, salesExecutiveId);

// Get all team members for a manager
const team = await getTeamMembers(managerId);
```

### Role-Based Data Access

Data is automatically filtered based on user role:

- **Admin**: Can access all data in the system
- **Manager**: Can access their team's data
- **Sales Executive/Telecaller**: Can only access their own data

## Firestore Security Rules

The security rules enforce:

1. **Admin Access**
   - Read/write all collections
   - Manage all users
   - Full system access

2. **Manager Access**
   - Read/write team data
   - View team member information
   - Reassign leads within team

3. **Sales Executive/Telecaller Access**
   - Read/write only their own data
   - Cannot access other users' data
   - Limited to assigned leads

## Setting Up Initial Users

### Step 1: Create Admin User

1. Go to Firebase Console → Authentication
2. Create a user with email/password
3. Use the Firebase SDK or API to assign admin role:

```javascript
import { createUserWithRole } from './firebase-roles.js';

await createUserWithRole(userId, {
  email: 'admin@fundingsathi.com',
  displayName: 'Admin User',
  role: 'admin'
});
```

### Step 2: Create Manager Users

```javascript
await createUserWithRole(userId, {
  email: 'manager@fundingsathi.com',
  displayName: 'Branch Manager',
  role: 'manager',
  teamMembers: [] // Array of team member IDs
});
```

### Step 3: Create Sales Executive Users

```javascript
await createUserWithRole(userId, {
  email: 'sales@fundingsathi.com',
  displayName: 'Sales Executive',
  role: 'sales_executive'
});
```

### Step 4: Assign Team Members

```javascript
import { assignTeamMember } from './firebase-roles.js';

// Assign sales executives to manager
await assignTeamMember(managerId, salesExecutiveId1);
await assignTeamMember(managerId, salesExecutiveId2);
```

## Backend API Endpoints

The backend server (`backend-server.js`) includes role-based authentication:

- All endpoints require Firebase token verification
- Data is automatically filtered based on user role
- Managers can only access their team's data
- Sales executives can only access their own data

### Example API Usage

```bash
# Login to get token
POST /api/auth/login
{
  "email": "user@company.com",
  "password": "password123"
}

# Access protected endpoint with token
GET /api/contacts
Headers: Authorization: Bearer <token>
```

## Testing Role-Based Access

### Test Admin Access
1. Login as admin user
2. Verify you can see all leads, contacts, deals
3. Verify you can manage users and settings

### Test Manager Access
1. Login as manager user
2. Verify you can only see your team's data
3. Verify you can reassign leads within your team
4. Verify you cannot access other teams' data

### Test Sales Executive Access
1. Login as sales executive user
2. Verify you can only see your assigned leads
3. Verify you can update lead status and add notes
4. Verify you cannot access other users' data

## Migration from Local Auth

The system maintains backward compatibility with local authentication:

1. Firebase auth is tried first
2. Falls back to local auth if Firebase fails
3. Local users can be migrated to Firebase gradually

To migrate existing users:

```javascript
// For each local user
const localUser = USERS[email];
const result = await registerUser(email, localUser.password, localUser.name, localUser.role);
```

## Security Best Practices

1. **Never expose admin credentials** in client-side code
2. **Use environment variables** for sensitive configuration
3. **Regularly audit user roles** and permissions
4. **Monitor Firestore security rules** for any violations
5. **Implement rate limiting** on API endpoints
6. **Use Firebase App Check** for additional security

## Troubleshooting

### User cannot access data
- Verify user role is set correctly in Firestore
- Check Firestore security rules are deployed
- Ensure userId matches in all documents

### Manager cannot see team data
- Verify team members are assigned to manager
- Check teamMembers array in user document
- Ensure security rules allow team access

### Permission denied errors
- Check user has required permission
- Verify Firestore rules are correctly deployed
- Ensure user is authenticated

## Next Steps

1. Deploy updated Firestore security rules
2. Create initial admin user
3. Set up manager accounts
4. Assign team members
5. Test role-based access
6. Migrate existing users to Firebase
7. Update frontend to show role-specific UI elements
