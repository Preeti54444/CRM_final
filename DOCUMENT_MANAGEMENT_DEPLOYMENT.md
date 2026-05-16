# Document Management Module - Deployment & Integration Guide
**Version:** 1.0.0  
**Created:** May 2026  
**Status:** Production Ready

---

## Table of Contents
1. [Quick Start](#quick-start)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [System Requirements](#system-requirements)
4. [Installation Steps](#installation-steps)
5. [Firestore Configuration](#firestore-configuration)
6. [Firebase Storage Setup](#firebase-storage-setup)
7. [Integration with Lead Manager](#integration-with-lead-manager)
8. [Database Migration](#database-migration)
9. [Testing & Validation](#testing--validation)
10. [Performance Tuning](#performance-tuning)
11. [Monitoring & Logging](#monitoring--logging)
12. [Troubleshooting](#troubleshooting)
13. [Rollback Plan](#rollback-plan)

---

## Quick Start

For experienced developers, here's the minimal setup:

### 1. Copy Files
```bash
cp crm-document-manager.js files/
cp crm-document-manager-ui.js files/
cp crm-document-manager.css files/
cp test-document-manager.js files/
```

### 2. Update HTML
```html
<!-- In crm.html, add in <head> -->
<link rel="stylesheet" href="files/crm-document-manager.css">

<!-- Before closing </body> -->
<script src="files/crm-document-manager.js"></script>
<script src="files/crm-document-manager-ui.js"></script>
<script src="files/test-document-manager.js"></script>
```

### 3. Initialize
```javascript
// In crm-init.js or similar
const documentManager = new DocumentManager({
  db: firebase.firestore(),
  storage: firebase.storage()
});

const documentManagerUI = new DocumentManagerUI(documentManager);
documentManagerUI.initializeUI('document-container');
window.documentManagerUI = documentManagerUI;
```

### 4. Deploy Firestore Rules
See [Firestore Configuration](#firestore-configuration) below.

---

## Pre-Deployment Checklist

- [ ] All files copied to correct locations
- [ ] Firestore database initialized
- [ ] Storage bucket created and configured
- [ ] Firestore rules deployed
- [ ] Firebase authentication enabled
- [ ] HTML and CSS files linked
- [ ] JavaScript files loaded in correct order
- [ ] Console has no initialization errors
- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] Database indexes created
- [ ] Role-based access rules configured
- [ ] Error monitoring configured
- [ ] Backup strategy planned

---

## System Requirements

### Software
- **Node.js:** 14.0 or higher (for development)
- **Firebase CLI:** Latest version
- **Browser:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Firebase Services
- **Firestore:** Database enabled
- **Storage:** Cloud Storage enabled
- **Authentication:** Email/Phone or SSO configured
- **Functions:** Optional (for advanced features)

### Disk Space
- **Code files:** ~5 MB
- **Initial database:** 100 MB
- **Storage:** Depends on document volume

### Network
- Upload speed: 1 Mbps minimum recommended
- Download speed: 2 Mbps minimum recommended

---

## Installation Steps

### Step 1: Prepare Environment

```bash
# Clone or download project
cd CRM_FINAL

# Verify file structure
ls -la files/crm-document-*
ls -la *.md
```

### Step 2: Update HTML Integration

Edit `files/crm.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Existing head content -->
  
  <!-- Add Document Manager CSS -->
  <link rel="stylesheet" href="crm-document-manager.css">
</head>
<body>
  <!-- Existing body content -->
  
  <!-- Document Manager Container -->
  <div id="document-container" style="display: none;">
    <!-- Container for document manager UI -->
  </div>
  
  <!-- Existing scripts -->
  <script src="crm.js"></script>
  <script src="crm-lead-manager.js"></script>
  
  <!-- Add Document Manager Scripts -->
  <script src="crm-document-manager.js"></script>
  <script src="crm-document-manager-ui.js"></script>
  
  <!-- Initialize (at the end) -->
  <script>
    // This will be in crm-init.js
  </script>
</body>
</html>
```

### Step 3: Update Initialization Script

Create or update `files/crm-init.js`:

```javascript
/**
 * CRM Initialization with Document Manager
 */

// Wait for Firebase to be ready
firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    // Initialize Lead Manager (existing)
    const leadManager = new LeadManager({
      db: firebase.firestore(),
      storage: firebase.storage()
    });
    window.leadManager = leadManager;

    const leadManagerUI = new LeadManagerUI(leadManager);
    window.leadManagerUI = leadManagerUI;

    // Initialize Document Manager (new)
    const documentManager = new DocumentManager({
      db: firebase.firestore(),
      storage: firebase.storage()
    });
    window.documentManager = documentManager;

    const documentManagerUI = new DocumentManagerUI(documentManager);
    documentManagerUI.initializeUI('document-container');
    window.documentManagerUI = documentManagerUI;

    // Show document container
    document.getElementById('document-container').style.display = 'block';

    console.log('✅ Document Manager initialized');
  } else {
    console.log('User not authenticated');
  }
});
```

### Step 4: Deploy Firestore Rules

See next section [Firestore Configuration](#firestore-configuration).

### Step 5: Set Up Storage

See section [Firebase Storage Setup](#firebase-storage-setup).

---

## Firestore Configuration

### Firestore Database Structure

First, enable Firestore in Firebase Console:

1. Go to Firebase Console → Project
2. Click "Firestore Database"
3. Click "Create Database"
4. Choose "Start in Production Mode"
5. Select region (us-central1 recommended)
6. Click "Create"

### Create Collections

The following collections will be created automatically when documents are uploaded:

```
Firestore Database:
├── documents (main collection)
│   └── documentId: {
│       leadId, category, documentType, status, 
│       fileName, fileSize, uploadDate, ...
│     }
└── document_logs (activity log)
    └── activityId: {
        leadId, type, description, 
        createdBy, timestamp
      }
```

### Deploy Firestore Rules

1. In Firebase Console, go to **Firestore Database** → **Rules**
2. Replace with the following rules:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Get user role
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }

    // Admin can do anything
    function isAdmin() {
      return getUserRole() == 'Admin';
    }

    // Manager can view and approve documents
    function isManager() {
      return getUserRole() == 'Manager';
    }

    // Telecaller can upload documents
    function isTelecaller() {
      return getUserRole() == 'Telecaller' || getUserRole() == 'Sales';
    }

    // Viewer can only view
    function isViewer() {
      return getUserRole() == 'Viewer';
    }

    // Documents collection rules
    match /documents/{document=**} {
      // Anyone authenticated can read their own lead's documents
      allow read: if request.auth != null && 
        resource.data.leadId in get(/databases/$(database)/documents/leads/$(resource.data.leadId)).data.assignedEmployees;
      
      // Admin can read all
      allow read: if isAdmin();
      
      // Manager can read all
      allow read: if isManager();
      
      // Telecaller can upload new documents
      allow create: if isTelecaller() && 
        request.resource.data.uploadedBy == request.auth.uid &&
        request.resource.data.status == 'pending';
      
      // Admin/Manager can approve/reject
      allow update: if (isAdmin() || isManager()) && 
        request.resource.data.approvedBy != null ||
        request.resource.data.rejectedBy != null;
      
      // Owners can re-upload
      allow update: if request.auth.uid == resource.data.uploadedBy &&
        request.resource.data.ocrStatus == 'pending';
    }

    // Document logs collection (audit trail)
    match /document_logs/{log=**} {
      // Anyone can read their own lead's logs
      allow read: if request.auth != null;
      
      // System can write logs
      allow write: if request.auth != null;
    }
  }
}
```

**Apply Rules:**

```bash
# Using Firebase CLI
firebase deploy --only firestore:rules
```

Or manually:
1. Copy the rules above
2. Paste in Firebase Console → Firestore Rules
3. Click "Publish"

### Create Indexes

For optimal performance, create the following indexes:

**Index 1: Documents by Lead and Status**
- Collection: `documents`
- Fields:
  - `leadId` (Ascending)
  - `status` (Ascending)
  - `uploadDate` (Descending)

**Index 2: Documents by Category**
- Collection: `documents`
- Fields:
  - `category` (Ascending)
  - `uploadDate` (Descending)

**Index 3: Documents by Lead and Category**
- Collection: `documents`
- Fields:
  - `leadId` (Ascending)
  - `category` (Ascending)
  - `status` (Ascending)

Create indexes:

```bash
# Through Firebase CLI
firebase deploy --only firestore:indexes
```

Or manually in Firebase Console:
1. Go to **Firestore** → **Indexes**
2. Click "Create Index"
3. Select collection and fields
4. Click "Create"

---

## Firebase Storage Setup

### Enable Cloud Storage

1. In Firebase Console, go to **Storage**
2. Click "Get Started"
3. Choose your region
4. Accept default rules (will customize below)
5. Click "Done"

### Configure Storage Permissions

Edit Storage Rules in Firebase Console → **Storage** → **Rules**:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Documents folder - restricted access
    match /documents/{leadId}/{documentId}/{allPaths=**} {
      
      // Admin can read all
      allow read: if request.auth != null && 
        request.auth.token.role == 'Admin';
      
      // Manager can read all
      allow read: if request.auth != null && 
        request.auth.token.role == 'Manager';
      
      // User can read own document
      allow read: if request.auth != null &&
        request.auth.uid == resource.metadata.custom.uploadedBy;
      
      // Only authenticated users can upload
      allow write: if request.auth != null &&
        request.resource.size <= 5242880 && // 5MB max
        request.resource.contentType.matches('application/pdf|image/.*');
      
      // Only uploader can delete
      allow delete: if request.auth != null &&
        request.auth.uid == resource.metadata.custom.uploadedBy;
    }
  }
}
```

**Apply Rules:**

```bash
firebase deploy --only storage
```

### Create Storage Bucket Structure

The following structure is created automatically:

```
gs://your-bucket/
├── documents/
│   └── {leadId}/
│       └── {documentId}/
│           ├── {fileName}
│           └── v{version}/{fileName}
```

---

## Integration with Lead Manager

### Link Documents to Leads

In `crm.html`, when viewing a lead, show documents:

```html
<!-- In Lead Details Modal -->
<div class="lead-details">
  <div class="lead-info">
    <!-- Existing lead info -->
  </div>
  
  <!-- Add Documents Tab -->
  <div class="lead-documents-section">
    <h3>Documents</h3>
    <div id="lead-documents-container"></div>
  </div>
</div>
```

In your lead manager UI, add:

```javascript
// When showing lead details
async function showLeadWithDocuments(leadId) {
  // Show lead info (existing)
  const lead = await leadManager.getLead(leadId);
  
  // Show lead documents (new)
  documentManagerUI.currentLeadId = leadId;
  await documentManagerUI.loadDocuments(leadId);
  
  // Show in modal
  showLeadModal(lead);
}
```

### Disable Document Section Based on Role

```javascript
function isDocumentEditingEnabled(userRole) {
  return ['Admin', 'Manager', 'Telecaller'].includes(userRole);
}

// In UI initialization
if (isDocumentEditingEnabled(currentUserRole)) {
  document.getElementById('document-upload-section').style.display = 'block';
} else {
  document.getElementById('document-upload-section').style.display = 'none';
}
```

---

## Database Migration

### Migrate from Previous System

If migrating from an older document system:

```javascript
/**
 * Migrate existing documents to new system
 */
async function migrateDocuments(oldDocumentsArray) {
  console.log(`Migrating ${oldDocumentsArray.length} documents...`);
  
  const successCount = 0;
  const errorCount = 0;
  
  for (const oldDoc of oldDocumentsArray) {
    try {
      // Map old structure to new
      const newDoc = {
        documentId: `DOC-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        leadId: oldDoc.leadId,
        category: mapOldCategoryToNew(oldDoc.category),
        documentType: oldDoc.documentType,
        documentCode: oldDoc.code,
        fileName: oldDoc.fileName,
        fileSize: oldDoc.fileSize,
        fileType: oldDoc.mimeType,
        uploadedBy: oldDoc.uploadedBy || 'system-migration',
        uploadDate: oldDoc.createdDate || new Date().toISOString(),
        status: oldDoc.status || 'validated',
        ocrStatus: oldDoc.ocrStatus || 'pending',
        fileUrl: oldDoc.fileUrl,
        versions: [{
          version: 1,
          uploadDate: oldDoc.createdDate || new Date().toISOString(),
          uploadedBy: oldDoc.uploadedBy || 'system-migration',
          fileUrl: oldDoc.fileUrl
        }]
      };
      
      // Save to Firestore
      await firebase.firestore()
        .collection('documents')
        .add(newDoc);
      
      successCount++;
      
    } catch (error) {
      errorCount++;
      console.error(`Failed to migrate ${oldDoc.fileName}:`, error);
    }
  }
  
  console.log(`✅ Migration complete: ${successCount} succeeded, ${errorCount} failed`);
  return { successCount, errorCount };
}
```

---

## Testing & Validation

### Run Unit Tests

```javascript
// In browser console
const tests = new DocumentManagerTests(documentManager);
await tests.runAllTests();
```

Expected output:
```
✅ PASS: Upload valid PDF file
✅ PASS: Reject file exceeding max size
✅ PASS: Reject unsupported file type
... (50+ total tests)

📊 TEST SUMMARY
Total Tests: 50
✅ Passed: 50
❌ Failed: 0
📈 Success Rate: 100%
```

### Run Integration Tests

```javascript
// In browser console
const integrationTests = new DocumentManagerIntegrationTests(documentManager);

await integrationTests.testCompleteUploadWorkflow();
await integrationTests.testBulkOperations();
await integrationTests.testDocumentSearch();
```

### Manual Testing Checklist

- [ ] Upload PDF document - verify stored in Firestore
- [ ] Upload image document - verify displayed correctly
- [ ] Reject oversized file - verify error message
- [ ] Reject wrong file type - verify error message
- [ ] Re-upload document - verify version incremented
- [ ] Approve document - verify status updated
- [ ] Reject document - verify reason stored
- [ ] Delete document - verify soft-deleted (not hard deleted)
- [ ] Check completeness - verify percentage calculated
- [ ] Bulk download - verify ZIP created
- [ ] Search documents - verify filters work
- [ ] Test on mobile - verify responsive design
- [ ] Test with slow network - verify progress indication

---

## Performance Tuning

### Database Optimization

1. **Create Indexes** (covered above)

2. **Enable Caching**:
```javascript
// Enable offline persistence
firebase.firestore().enablePersistence()
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      // Multiple tabs open
    } else if (err.code == 'unimplemented') {
      // Browser doesn't support
    }
  });
```

3. **Batch Operations**:
```javascript
// Upload multiple documents in parallel
const uploads = files.map(file =>
  documentManager.uploadDocument(leadId, file, docType, userId)
);
await Promise.allSettled(uploads); // Don't fail on single error
```

### Storage Optimization

1. **Compress Images**:
```javascript
// Before uploading, compress
async function compressImage(file) {
  // Use library like pica or canvas
  const compressedBlob = await compressImageBlob(file);
  return new File([compressedBlob], file.name, { type: 'image/jpeg' });
}
```

2. **Set Lifecycle Rules**:
Navigate to Cloud Storage → Lifecycle in GCP Console:
```json
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "SetStorageClass", "storageClass": "NEARLINE"},
        "condition": {"age": 90}
      },
      {
        "action": {"type": "Delete"},
        "condition": {"age": 730, "isLive": false}
      }
    ]
  }
}
```

### Query Optimization

```javascript
// Bad: Gets all documents
const allDocs = await documentManager.getLeadDocuments(leadId);

// Good: Get only what you need with filters
const approvedDocs = await documentManager.getLeadDocuments(leadId, {
  status: 'approved'
});
```

---

## Monitoring & Logging

### Enable Firebase Logging

```javascript
// Set logging level
firebase.firestore.setLogLevel("debug"); // During development

// In production
firebase.firestore.setLogLevel("error");
```

### Set Up Error Tracking

```javascript
// Track errors to Firebase (or other service)
window.addEventListener('error', (error) => {
  firebase.firestore().collection('error_logs').add({
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  });
});
```

### Monitor Storage Usage

```bash
# Check storage usage via Firebase CLI
firebase functions:log

# Or via Google Cloud Console
# Storage → Metrics
```

### Set Up Alerts

In Google Cloud Console:
1. Go to **Monitoring** → **Alerting**
2. Create alerts for:
   - Firestore reads/writes exceeding quota
   - Storage usage exceeding threshold
   - Document upload errors increasing

---

## Troubleshooting

### Firestore Rules Blocking Access

**Problem:** 403 Forbidden errors when accessing documents

**Solution:**
```javascript
// Check rule conditions
console.log('User UID:', firebase.auth().currentUser.uid);
console.log('User Claims:', firebase.auth().currentUser.getIdTokenResult());

// Verify user has role claim
firebase.auth().currentUser.getIdTokenResult().then(idTokenResult => {
  console.log('Role:', idTokenResult.claims.role);
});
```

### Storage Upload Fails

**Problem:** Upload fails silently or with 401 error

**Solution:**
```javascript
// Verify Storage is initialized
if (!documentManager.storage) {
  console.error('Storage not initialized');
  return;
}

// Check Storage rules
firebase.storage().ref().listAll()
  .catch(error => console.error('Storage error:', error));
```

### Slow Document Loading

**Problem:** Document list takes >2 seconds to load

**Solution:**
```javascript
// 1. Verify indexes are created
// 2. Limit query results
const docs = await firebase.firestore()
  .collection('documents')
  .limit(20)
  .get();

// 3. Add pagination
// 4. Enable offline persistence
```

### Storage Quota Exceeded

**Problem:** Upload fails with quota error

**Solution:**
1. Upgrade Firebase plan
2. Archive old documents
3. Implement storage quotas per user
4. Set lifecycle policies to delete old versions

---

## Rollback Plan

### If Issues Occur in Production

#### Step 1: Immediate Actions
```bash
# Disable document uploads temporarily
documentManager.uploadDocument = async () => {
  throw new Error('Document uploads temporarily disabled for maintenance');
};

# Show message to users
alert('Document uploads are temporarily unavailable. Please try again later.');
```

#### Step 2: Backup Current Data
```bash
# Export Firestore data
firebase firestore:export /path/to/backup

# Download Storage files
gsutil -m cp -r gs://your-bucket/documents /local/backup
```

#### Step 3: Restore Previous Version
```bash
# Revert to previous code
git checkout previous-version

# Restore Firestore (if needed)
firebase firestore:import /path/to/backup
```

#### Step 4: Investigate Issues
```javascript
// Check error logs
db.collection('error_logs').where('timestamp', '>', pastHour).get()

// Review Firestore audit logs
// In Google Cloud Console → Cloud Audit Logs
```

#### Step 5: Deploy Fix
```bash
# Deploy fixed version
firebase deploy
```

---

## Support

For issues or questions:
1. Check DOCUMENT_MANAGEMENT_GUIDE.md for API reference
2. Review test-document-manager.js for usage examples
3. Check browser console for error messages
4. Review Firestore audit logs for permission issues

---

*Last Updated: May 2026*  
*Version: 1.0.0*
