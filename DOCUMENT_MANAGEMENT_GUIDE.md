# Document Management Module - Complete API Reference Guide
**Version:** 1.0.0  
**Created:** May 2026  
**Status:** Production Ready

---

## Table of Contents
1. [Overview](#overview)
2. [Installation](#installation)
3. [Document Categories](#document-categories)
4. [API Reference](#api-reference)
5. [UI Components](#ui-components)
6. [Code Examples](#code-examples)
7. [Error Handling](#error-handling)
8. [Best Practices](#best-practices)
9. [Performance Tips](#performance-tips)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The Document Management Module provides comprehensive functionality for:
- **Document Upload & Validation** - File type, size, and format validation
- **AI-Powered Auto-Tagging** - Automatic document type detection
- **OCR Field Extraction** - Extract key information from documents
- **Validity Checking** - Track document expiration dates
- **Version Control** - Maintain document versions and re-uploads
- **Completeness Tracking** - Monitor missing documents per loan product
- **Bulk Operations** - Download multiple documents as ZIP
- **Access Control** - Role-based document visibility

### Key Statistics
- **8 Document Categories** with 30+ document types
- **9+ OCR Field Templates** for automated extraction
- **Validity Rules** for 40+ document types
- **Multi-version Support** for document tracking
- **Firestore Integration** for scalable storage

---

## Installation

### 1. Include Scripts

```html
<!-- Core Document Manager -->
<script src="crm-document-manager.js"></script>

<!-- UI Components -->
<script src="crm-document-manager-ui.js"></script>

<!-- Styling -->
<link rel="stylesheet" href="crm-document-manager.css">
```

### 2. Initialize Document Manager

```javascript
// Initialize with Firebase config
const documentManager = new DocumentManager({
  db: firebase.firestore(),
  storage: firebase.storage()
});

// Initialize UI
const documentManagerUI = new DocumentManagerUI(documentManager);

// Create container and render
documentManagerUI.initializeUI('document-container');

// Load documents for a lead
documentManagerUI.loadDocuments('LEAD-001');

// Make globally accessible for UI actions
window.documentManagerUI = documentManagerUI;
```

### 3. HTML Container

```html
<div id="document-container"></div>
```

### 4. Configure Firestore Rules

See DOCUMENT_MANAGEMENT_DEPLOYMENT.md for complete Firestore rules setup.

---

## Document Categories

### 1. KYC (Know Your Customer) - Mandatory
```javascript
Documents:
- Aadhaar Card (lifetime validity)
- PAN Card (lifetime validity)
- Voter ID (lifetime validity)
- Passport (lifetime validity)
- Driving License (lifetime validity)

Requirements:
- Mandatory for all loans
- Requires address verification for Aadhaar
```

**Example:**
```javascript
const kycDocs = documentManager.getDocumentCategories().KYC;
console.log(kycDocs.name); // "Know Your Customer"
console.log(kycDocs.mandatory); // true
```

### 2. INCOME_SALARIED - Conditional
```javascript
Documents:
- Salary Slip (Last 3 Months) - 3 months validity
- Form 16 - 1 year validity
- Bank Statement (6 Months) - 3 months validity

Requirements:
- For salaried individuals
- Minimum 2 required
```

**Example:**
```javascript
const salariedRequired = documentManager.getRequiredDocuments(
  'Business Loan',
  'Salaried'
);
// Returns: ['AADHAAR', 'PAN', 'SALARY_SLIP', 'FORM_16', ...]
```

### 3. INCOME_SELF_EMPLOYED - Conditional
```javascript
Documents:
- ITR (Last 2-3 Years) - 1 year validity
- GST Returns - 1 quarter validity
- Bank Statement (12 Months) - 3 months validity
- P&L Statement - 1 year validity
- Balance Sheet - 1 year validity

Requirements:
- For self-employed individuals
- Minimum 3 required
```

### 4. BUSINESS_PROOF - Optional
```javascript
Documents:
- GST Certificate
- Udyam Registration (API verified)
- Shop Act License
- MOA/AOA
- Partnership Deed

Requirements:
- For business loans
- API verification available for Udyam
```

### 5. PROPERTY - Loan-Specific
```javascript
Documents:
- Property Documents
- Title Deed
- Valuation Report (6 months validity)
- Approved Plan
- Property Tax Receipts (1 year validity)
- RERA Certificate

Applicable For:
- Home Loan
- Loan Against Property
```

### 6. LOAN_SPECIFIC - Conditional
```javascript
Documents:
- Proforma Invoice (Business Loan, 3 months validity)
- Admission Letter (Education Loan, 1 year validity)
- Gold Valuation (Gold Loan, 1 month validity)

Requirements:
- Depend on loan type
```

### 7. PHOTOGRAPHS - Mandatory
```javascript
Documents:
- Applicant Photo (lifetime validity, image only)
- Business Premises Photo (lifetime validity)
- Property Photo (lifetime validity)

Requirements:
- Mandatory for all loans
- Image files only (JPG, PNG, WEBP)
```

### 8. LENDER_GENERATED - System Generated
```javascript
Documents:
- Sanction Letter (system generated)
- Loan Agreement (system generated)
- KFS Document (system generated)
- Repayment Schedule (system generated)

Requirements:
- Cannot be manually uploaded
- Generated by system after approval
```

---

## API Reference

### DocumentManager Class

#### Constructor
```javascript
new DocumentManager(firebaseConfig)
```

**Parameters:**
- `firebaseConfig` (Object): Firebase configuration
  - `db` (Firestore): Firestore instance
  - `storage` (Storage): Firebase Storage instance

**Example:**
```javascript
const dm = new DocumentManager({
  db: firebase.firestore(),
  storage: firebase.storage()
});
```

---

### Document Upload & Management

#### uploadDocument()
Upload a document with validation and OCR processing.

```javascript
async uploadDocument(leadId, file, documentType, userId, metadata = {})
```

**Parameters:**
- `leadId` (String): Lead ID to associate document with
- `file` (File): File object from input
- `documentType` (String): Document type (e.g., "Aadhaar Card")
- `userId` (String): ID of uploading user
- `metadata` (Object): Additional metadata (optional)

**Returns:**
```javascript
{
  success: true/false,
  documentId: "DOC-...",
  docId: "firestore-doc-id",
  document: { ...documentData },
  error: "error message if failed"
}
```

**Example:**
```javascript
const file = document.getElementById('fileInput').files[0];
const result = await documentManager.uploadDocument(
  'LEAD-001',
  file,
  'Aadhaar Card',
  'user-123',
  { notes: 'Verified by KYC team' }
);

if (result.success) {
  console.log('Document uploaded:', result.documentId);
}
```

#### validateFile()
Validate file before upload.

```javascript
validateFile(file)
```

**Returns:**
```javascript
{
  valid: true/false,
  error: "error message"
}
```

**Validation Rules:**
- Max size: 5MB
- Allowed types: PDF, JPG, PNG, WEBP
- Allowed extensions: .pdf, .jpg, .jpeg, .png, .webp

**Example:**
```javascript
const file = document.getElementById('fileInput').files[0];
const validation = documentManager.validateFile(file);

if (!validation.valid) {
  alert('File validation failed: ' + validation.error);
}
```

#### getDocument()
Retrieve a specific document by ID.

```javascript
async getDocument(documentId)
```

**Returns:**
```javascript
{
  success: true/false,
  document: { documentId, category, documentType, ... },
  error: "error message"
}
```

**Example:**
```javascript
const result = await documentManager.getDocument('DOC-123456789-abc');
if (result.success) {
  console.log('Document:', result.document);
}
```

#### getLeadDocuments()
Get all documents for a lead with optional filtering.

```javascript
async getLeadDocuments(leadId, filters = {})
```

**Parameters:**
- `leadId` (String): Lead ID
- `filters` (Object): Optional filters
  - `category` (String): Filter by category
  - `status` (String): Filter by status (pending/validated/approved/rejected)

**Returns:**
```javascript
{
  success: true/false,
  documents: [ ...documentArray ],
  count: number,
  error: "error message"
}
```

**Example:**
```javascript
const result = await documentManager.getLeadDocuments('LEAD-001', {
  status: 'approved'
});

console.log(`Found ${result.count} approved documents`);
```

---

### Document Validity & Completeness

#### checkDocumentValidity()
Check if document is valid and hasn't expired.

```javascript
checkDocumentValidity(documentCode, extractedFields)
```

**Parameters:**
- `documentCode` (String): Document code (e.g., 'AADHAAR')
- `extractedFields` (Object): OCR extracted fields

**Returns:**
```javascript
{
  isValid: true/false,
  expiresOn: Date,
  daysUntilExpiry: number,
  warnings: [...]
}
```

**Example:**
```javascript
const validity = documentManager.checkDocumentValidity('SALARY_SLIP', {
  month: '12/2023',
  grossSalary: 50000
});

if (validity.daysUntilExpiry < 30) {
  console.warn('Document expiring soon:', validity.daysUntilExpiry, 'days');
}
```

#### getDocumentCompletenessStatus()
Check document completeness for a lead against loan requirements.

```javascript
async getDocumentCompletenessStatus(leadId, loanType)
```

**Parameters:**
- `leadId` (String): Lead ID
- `loanType` (String): Loan type (e.g., "Business Loan", "Home Loan")

**Returns:**
```javascript
{
  success: true/false,
  status: {
    totalRequired: number,
    uploaded: number,
    pending: [...documentTypes],
    expired: [...documentTypes],
    completionPercentage: number,
    canProceedToLender: true/false
  },
  error: "error message"
}
```

**Example:**
```javascript
const result = await documentManager.getDocumentCompletenessStatus(
  'LEAD-001',
  'Business Loan'
);

console.log(`${result.status.completionPercentage}% complete`);
console.log('Pending documents:', result.status.pending);

if (result.status.canProceedToLender) {
  console.log('Ready to send to lender!');
}
```

#### getRequiredDocuments()
Get list of required documents for a loan type.

```javascript
getRequiredDocuments(loanType, occupationType = null)
```

**Parameters:**
- `loanType` (String): Type of loan
- `occupationType` (String): Occupation type (Salaried/Self-Employed)

**Returns:**
- Array of document codes

**Example:**
```javascript
const required = documentManager.getRequiredDocuments(
  'Home Loan',
  'Salaried'
);

console.log('Required documents:', required);
// Output: ['AADHAAR', 'PAN', 'APPLICANT_PHOTO', 'SALARY_SLIP', 'FORM_16', 
//          'TITLE_DEED', 'PROPERTY_DOCS', 'VALUATION_REPORT']
```

---

### Document Operations

#### approveDocument()
Approve a document.

```javascript
async approveDocument(documentId, userId)
```

**Parameters:**
- `documentId` (String): Document ID to approve
- `userId` (String): ID of approving user

**Returns:**
```javascript
{ success: true/false, error: "error message" }
```

**Example:**
```javascript
const result = await documentManager.approveDocument('DOC-123456789-abc', 'user-123');
if (result.success) {
  console.log('Document approved');
}
```

#### rejectDocument()
Reject a document with reason.

```javascript
async rejectDocument(documentId, reason, userId)
```

**Parameters:**
- `documentId` (String): Document ID to reject
- `reason` (String): Rejection reason
- `userId` (String): ID of rejecting user

**Returns:**
```javascript
{ success: true/false, error: "error message" }
```

**Example:**
```javascript
const result = await documentManager.rejectDocument(
  'DOC-123456789-abc',
  'Image quality too low, please resubmit',
  'user-123'
);
```

#### reuploadDocument()
Upload a new version of an existing document.

```javascript
async reuploadDocument(documentId, file, userId)
```

**Parameters:**
- `documentId` (String): Document ID to re-upload
- `file` (File): New file to upload
- `userId` (String): ID of uploading user

**Returns:**
```javascript
{
  success: true/false,
  version: number,
  error: "error message"
}
```

**Example:**
```javascript
const newFile = document.getElementById('fileInput').files[0];
const result = await documentManager.reuploadDocument(
  'DOC-123456789-abc',
  newFile,
  'user-123'
);

console.log('Re-uploaded as version:', result.version);
```

#### deleteDocument()
Soft delete a document (marks as deleted).

```javascript
async deleteDocument(documentId, userId)
```

**Parameters:**
- `documentId` (String): Document ID to delete
- `userId` (String): ID of deleting user

**Returns:**
```javascript
{ success: true/false, error: "error message" }
```

#### bulkDownloadDocuments()
Prepare documents for bulk download as ZIP.

```javascript
async bulkDownloadDocuments(leadId)
```

**Parameters:**
- `leadId` (String): Lead ID

**Returns:**
```javascript
{
  success: true/false,
  documents: [ { documentId, name, type, size, url } ],
  totalSize: number,
  zipFileName: string,
  error: "error message"
}
```

**Example:**
```javascript
const result = await documentManager.bulkDownloadDocuments('LEAD-001');

console.log(`Downloading ${result.documents.length} documents`);
console.log('File name:', result.zipFileName);
console.log('Total size:', result.totalSize / (1024*1024), 'MB');
```

---

### Search & Filtering

#### searchDocuments()
Search documents with multiple filters.

```javascript
async searchDocuments(filters = {})
```

**Parameters:**
- `filters` (Object): Search filters
  - `leadId` (String): Filter by lead
  - `status` (String): Filter by status
  - `category` (String): Filter by category
  - `documentCode` (String): Filter by document code

**Returns:**
```javascript
{
  success: true/false,
  documents: [...documentArray],
  error: "error message"
}
```

**Example:**
```javascript
const result = await documentManager.searchDocuments({
  category: 'KYC',
  status: 'approved'
});

console.log('Found approved KYC documents:', result.documents.length);
```

#### getDocumentStatistics()
Get statistics for a lead's documents.

```javascript
async getDocumentStatistics(leadId)
```

**Returns:**
```javascript
{
  success: true/false,
  statistics: {
    total: number,
    byStatus: { pending: number, approved: number, ... },
    byCategory: { KYC: number, ... },
    totalSize: bytes,
    uploadedDate: ISO string,
    lastUploadDate: ISO string
  },
  error: "error message"
}
```

---

### Utility Methods

#### getDocumentInfo()
Get information about a document type.

```javascript
getDocumentInfo(documentType)
```

**Parameters:**
- `documentType` (String): Document type or code

**Returns:**
```javascript
{
  category: string,
  categoryName: string,
  type: string,
  code: string,
  validity: string,
  userUploadDisabled: boolean,
  ...
}
```

#### getDocumentCategories()
Get all document categories and their documents.

```javascript
getDocumentCategories()
```

**Returns:** Complete category structure with all documents.

#### generateDocumentId()
Generate a unique document ID.

```javascript
generateDocumentId()
```

**Returns:** String ID in format "DOC-timestamp-random"

---

## UI Components

### DocumentManagerUI Class

#### Constructor
```javascript
new DocumentManagerUI(documentManager)
```

#### initializeUI()
Initialize and render all UI components.

```javascript
initializeUI(containerId)
```

**Example:**
```javascript
const ui = new DocumentManagerUI(documentManager);
ui.initializeUI('document-container');
window.documentManagerUI = ui;
```

#### loadDocuments()
Load documents for a lead and refresh display.

```javascript
async loadDocuments(leadId = null)
```

#### updateCompletenessStatus()
Update completeness progress indicator.

```javascript
async updateCompletenessStatus(loanType = 'Business Loan')
```

---

## Code Examples

### Example 1: Complete Upload Workflow

```javascript
// 1. Get file from input
const file = document.getElementById('fileInput').files[0];

// 2. Validate file
const validation = documentManager.validateFile(file);
if (!validation.valid) {
  alert('Invalid file: ' + validation.error);
  return;
}

// 3. Upload document
const result = await documentManager.uploadDocument(
  'LEAD-001',
  file,
  'Aadhaar Card',
  'user-123',
  { source: 'manual', verifiedBy: 'employee-456' }
);

if (result.success) {
  console.log('Document uploaded:', result.documentId);
  
  // 4. Refresh UI
  await documentManagerUI.loadDocuments('LEAD-001');
  
  // 5. Show success message
  alert('Document uploaded successfully!');
} else {
  alert('Upload failed: ' + result.error);
}
```

### Example 2: Check Completeness & Send to Lender

```javascript
async function sendToLender(leadId, loanType) {
  // 1. Check completeness
  const completenessResult = await documentManager.getDocumentCompletenessStatus(
    leadId,
    loanType
  );
  
  if (!completenessResult.success) {
    console.error('Cannot check completeness:', completenessResult.error);
    return false;
  }
  
  const { status } = completenessResult;
  
  // 2. Verify all required documents present
  if (!status.canProceedToLender) {
    console.error('Missing documents:');
    console.error('  Pending:', status.pending);
    console.error('  Expired:', status.expired);
    return false;
  }
  
  // 3. Get all approved documents
  const docsResult = await documentManager.getLeadDocuments(leadId, {
    status: 'approved'
  });
  
  if (!docsResult.success) {
    console.error('Cannot retrieve documents');
    return false;
  }
  
  // 4. Prepare package for lender
  const lenderPackage = {
    leadId: leadId,
    loanType: loanType,
    documentCount: docsResult.documents.length,
    documents: docsResult.documents,
    completionPercentage: status.completionPercentage,
    timestamp: new Date().toISOString()
  };
  
  // 5. Send to lender API (your implementation)
  console.log('Sending to lender:', lenderPackage);
  return true;
}

// Usage
await sendToLender('LEAD-001', 'Business Loan');
```

### Example 3: Bulk Download for Submission

```javascript
async function prepareDocumentPackage(leadId) {
  // Get all documents ready for download
  const result = await documentManager.bulkDownloadDocuments(leadId);
  
  if (!result.success) {
    alert('Error: ' + result.error);
    return;
  }
  
  // Display download info
  console.log('Documents ready:');
  result.documents.forEach(doc => {
    console.log(`  - ${doc.name} (${doc.type})`);
  });
  
  console.log(`\nTotal: ${result.documents.length} files`);
  console.log(`Size: ${(result.totalSize / (1024*1024)).toFixed(2)} MB`);
  console.log(`File: ${result.zipFileName}`);
  
  // In production, trigger actual ZIP download
  // window.location.href = result.zipUrl;
}

await prepareDocumentPackage('LEAD-001');
```

### Example 4: Handling Document Rejection & Re-upload

```javascript
async function handleRejectedDocument(documentId) {
  // 1. Reject with reason
  const rejection = await documentManager.rejectDocument(
    documentId,
    'Image quality too low. Please provide clearer image.',
    'user-123'
  );
  
  if (!rejection.success) {
    console.error('Rejection failed');
    return;
  }
  
  console.log('Document rejected');
  
  // 2. Notify user
  const doc = await documentManager.getDocument(documentId);
  const leadId = doc.document.leadId;
  
  // Send notification (your implementation)
  sendNotification(doc.document.leadId, 
    'Document rejected: ' + rejection.rejectionReason);
}

async function handleDocumentReupload(documentId, newFile) {
  // Validate new file
  const validation = documentManager.validateFile(newFile);
  if (!validation.valid) {
    alert('File validation failed: ' + validation.error);
    return;
  }
  
  // Re-upload with new version
  const result = await documentManager.reuploadDocument(
    documentId,
    newFile,
    'user-123'
  );
  
  if (result.success) {
    console.log(`Document re-uploaded as version ${result.version}`);
  } else {
    alert('Re-upload failed: ' + result.error);
  }
}
```

---

## Error Handling

### Common Error Scenarios

#### 1. File Upload Errors

```javascript
const file = document.getElementById('fileInput').files[0];

try {
  const result = await documentManager.uploadDocument(
    leadId, file, docType, userId
  );
  
  if (!result.success) {
    switch(result.error) {
      case 'File size exceeds 5MB limit':
        alert('Please select a smaller file');
        break;
      case 'File type not allowed':
        alert('Only PDF, JPG, PNG are allowed');
        break;
      case 'No file provided':
        alert('Please select a file');
        break;
      default:
        alert('Upload failed: ' + result.error);
    }
  }
} catch (error) {
  console.error('Upload exception:', error.message);
  alert('An error occurred during upload');
}
```

#### 2. Validation Errors

```javascript
const validation = documentManager.validateFile(file);

if (!validation.valid) {
  console.error('Validation failed:', validation.error);
  // Show error to user
  document.getElementById('errorMessage').textContent = validation.error;
  document.getElementById('errorMessage').style.display = 'block';
}
```

#### 3. Database Errors

```javascript
try {
  const result = await documentManager.getLeadDocuments(leadId);
  
  if (!result.success) {
    console.error('Database error:', result.error);
    alert('Failed to load documents. Please try again.');
  }
} catch (error) {
  console.error('Connection error:', error);
  alert('Network error. Please check your connection.');
}
```

---

## Best Practices

### 1. Always Validate Files Before Upload
```javascript
const validation = documentManager.validateFile(file);
if (!validation.valid) {
  // Handle error before uploading
  return;
}
```

### 2. Handle Rejected Documents Gracefully
```javascript
// When a document is rejected, allow users to re-upload
const rejection = await documentManager.rejectDocument(
  docId, 'Reason', userId
);

if (rejection.success) {
  // Show UI for re-upload
  showReuploadForm(docId);
}
```

### 3. Check Completeness Before Submission
```javascript
const completeness = await documentManager.getDocumentCompletenessStatus(
  leadId, loanType
);

if (!completeness.status.canProceedToLender) {
  // Show missing documents
  console.log('Please upload:', completeness.status.pending);
  return;
}
```

### 4. Monitor Document Expiration
```javascript
// Periodically check for expiring documents
const stats = await documentManager.getDocumentStatistics(leadId);

Object.entries(stats.byStatus).forEach(([status, count]) => {
  if (status === 'pending' && count > 0) {
    console.warn(`${count} documents awaiting approval`);
  }
});
```

### 5. Log Document Activities
```javascript
// All document operations are automatically logged
// Review logs for audit trail
const activities = await documentManager.logDocumentActivity(
  leadId,
  'DOCUMENT_APPROVED',
  'KYC documents approved by manager',
  userId
);
```

---

## Performance Tips

### 1. Batch Document Operations
```javascript
// Instead of uploading one-by-one, batch them
const uploads = files.map(file =>
  documentManager.uploadDocument(leadId, file, 'KYC', userId)
);
const results = await Promise.all(uploads);
```

### 2. Use Pagination for Large Document Sets
```javascript
// Load documents in chunks
const page1 = await documentManager.getLeadDocuments(leadId);
// Process page 1...
const page2 = await documentManager.getLeadDocuments(leadId);
// Process page 2...
```

### 3. Cache Completeness Status
```javascript
// Don't recalculate frequently
let cachedStatus = null;
let cacheTime = 0;

async function getCompletenessStatus(leadId) {
  const now = Date.now();
  if (cachedStatus && (now - cacheTime) < 60000) {
    return cachedStatus; // Use cached (60 sec)
  }
  
  cachedStatus = await documentManager.getDocumentCompletenessStatus(leadId);
  cacheTime = now;
  return cachedStatus;
}
```

### 4. Optimize Image Uploads
```javascript
// Compress images before upload
function compressImage(file, maxSize = 500) {
  // Use image compression library
  // Then upload compressed version
}
```

---

## Troubleshooting

### Document Upload Fails

**Problem:** File upload returns error despite being valid

**Solutions:**
1. Check Firestore Storage rules are configured
2. Verify Firebase Storage is initialized
3. Check file size isn't exactly at limit
4. Try with different file format

```javascript
// Debug: Check initialization
if (!documentManager.storage) {
  console.error('Firebase Storage not initialized');
}

if (!documentManager.db) {
  console.error('Firestore not initialized');
}
```

### OCR Not Processing

**Problem:** Document shows `ocrStatus: 'pending'` indefinitely

**Solutions:**
1. Check OCR processing isn't failing silently
2. Verify document format is supported
3. Check browser console for errors
4. Restart OCR manually if needed

```javascript
// Manually trigger OCR reprocessing
const doc = await documentManager.getDocument(docId);
if (doc.success) {
  await documentManager.processDocumentOCR(
    doc.document.documentId,
    doc.document,
    originalFile
  );
}
```

### Completeness Shows Incorrect Status

**Problem:** Completeness percentage doesn't update

**Solutions:**
1. Refresh the documents list
2. Check loan type matches actual loan
3. Verify document statuses are correct

```javascript
// Force refresh
await documentManagerUI.loadDocuments(leadId);
await documentManagerUI.updateCompletenessStatus('Business Loan');
```

### File Size Validation Too Strict

**Problem:** Large valid documents rejected

**Solutions:**
1. Increase max file size in configuration
2. Compress documents before upload
3. Split large documents into multiple files

```javascript
// Adjust file size limit (before initialization)
documentManager.fileValidationRules.maxSize = 10 * 1024 * 1024; // 10MB
```

---

## Support & Resources

- **Deployment Guide:** DOCUMENT_MANAGEMENT_DEPLOYMENT.md
- **Implementation Summary:** DOCUMENT_MANAGEMENT_SUMMARY.md
- **Tests:** test-document-manager.js
- **Source Code:** crm-document-manager.js

---

*Last Updated: May 2026*  
*Version: 1.0.0*
