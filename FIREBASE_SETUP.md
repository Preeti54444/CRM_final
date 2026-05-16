# Firebase Integration Setup Guide

This document provides instructions for setting up Firebase database and backend for the CRM application.

## Prerequisites

- Node.js installed
- A Firebase project created at [console.firebase.google.com](https://console.firebase.google.com)

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" and follow the setup wizard
3. Enable Authentication:
   - Go to Authentication → Sign-in method
   - Enable Email/Password authentication
   - Optionally enable Google/Facebook sign-in
4. Enable Firestore Database:
   - Go to Firestore Database → Create database
   - Choose production mode or test mode (for development)
5. Set up Firestore Security Rules:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

## Step 2: Get Firebase Configuration

1. In Firebase Console, go to Project Settings
2. Scroll down to "Your apps" section
3. Click the web icon (</>) to add a web app
4. Copy the configuration object that looks like:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```

## Step 3: Update Configuration Files

Replace the placeholder values in the following files with your actual Firebase credentials:

### firebase-config.js
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### firebase-init.js
Update the same configuration object in this file.

### backend-server.js
Update the firebaseConfig object in the backend server file.

## Step 4: Enable Firebase in Login

To enable Firebase authentication in the login page:

1. Open `files (6)/login.html`
2. Set `useFirebase = true;` in the script section (around line 105)
3. The login will now use Firebase authentication with fallback to local auth

## Step 5: Run the Backend Server

1. Install dependencies (already done):
   ```bash
   npm install
   ```

2. Start the backend server:
   ```bash
   node backend-server.js
   ```

   The server will run on port 3000 by default.

3. Available API endpoints:
   - `POST /api/auth/register` - Register new user
   - `POST /api/auth/login` - Login user
   - `POST /api/auth/logout` - Logout user
   - `GET /api/contacts` - Get all contacts
   - `POST /api/contacts` - Create contact
   - `PUT /api/contacts/:id` - Update contact
   - `DELETE /api/contacts/:id` - Delete contact
   - `GET /api/leads` - Get all leads
   - `POST /api/leads` - Create lead
   - `PUT /api/leads/:id` - Update lead
   - `DELETE /api/leads/:id` - Delete lead
   - `GET /api/deals` - Get all deals
   - `POST /api/deals` - Create deal
   - `PUT /api/deals/:id` - Update deal
   - `GET /api/dashboard/stats` - Get dashboard statistics

## Step 6: Use Firebase Data Store

To use the Firebase-integrated data store instead of localStorage:

1. In your CRM HTML files, replace:
   ```javascript
   <script src="crm-data-store.js"></script>
   ```
   
   With:
   ```javascript
   <script type="module">
     import FirebaseDataStore from '../crm-data-store-firebase.js';
     window.DataStore = FirebaseDataStore;
   </script>
   ```

2. The Firebase data store provides the same API as the local data store but stores data in Firestore.

## Firebase Collections

The following collections will be created in Firestore:

- `users` - User profiles and settings
- `contacts` - Contact information
- `leads` - Lead tracking data
- `deals` - Deal/opportunity tracking
- `tasks` - Task management
- `activities` - Activity logs
- `meetings` - Meeting schedules
- `calls` - Call records

## Security Notes

- Never commit Firebase credentials to version control
- Use environment variables for sensitive data in production
- Implement proper Firestore security rules
- Enable Firebase App Check for additional security

## Testing

1. Test authentication by registering a new user via the API or login page
2. Verify data is being stored in Firestore Console
3. Test CRUD operations for contacts, leads, and deals
4. Verify real-time sync if using the subscription features

## Troubleshooting

- **Authentication errors**: Verify Firebase Auth is enabled and email/password is configured
- **Firestore errors**: Check that Firestore database is created and rules allow access
- **CORS errors**: Ensure the backend server has CORS enabled (already configured)
- **Module errors**: Ensure you're using a bundler or the files are served with proper MIME types

## Migration from LocalStorage

To migrate existing data from localStorage to Firebase:

1. Export your current localStorage data
2. Use the Firebase data store's `add()` methods to import data
3. The data will be automatically tagged with the user's ID for proper access control
