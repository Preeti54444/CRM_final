# Lead Management Module - Deployment & Integration Guide
**Version:** 1.0.0

---

## Table of Contents
1. [Quick Start](#quick-start)
2. [Integration with Existing CRM](#integration-with-existing-crm)
3. [Database Setup](#database-setup)
4. [Webhook Configuration](#webhook-configuration)
5. [Testing](#testing)
6. [Deployment Checklist](#deployment-checklist)
7. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Quick Start

### Step 1: Add Files to Project

```bash
# Copy files to your CRM project
cp files/crm-lead-manager.js ./files/
cp files/crm-lead-manager-ui.js ./files/
cp files/crm-lead-manager.css ./files/
cp files/test-lead-manager.js ./files/ (optional)
```

### Step 2: Update HTML

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Existing styles -->
  <link rel="stylesheet" href="files/crm.css">
  
  <!-- Lead Manager CSS -->
  <link rel="stylesheet" href="files/crm-lead-manager.css">
</head>
<body>
  <!-- Your existing CRM HTML -->
  
  <!-- Lead Manager Container -->
  <div id="leadManagerContainer"></div>

  <!-- Firebase -->
  <script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js"></script>
  <script src="firebase-config.js"></script>
  <script src="firebase-init.js"></script>

  <!-- Existing CRM scripts -->
  <script src="files/crm-init.js"></script>
  
  <!-- Lead Manager Scripts -->
  <script src="files/crm-lead-manager.js"></script>
  <script src="files/crm-lead-manager-ui.js"></script>

  <!-- Initialize Lead Manager -->
  <script>
    // Initialize after Firebase is ready
    firebase.firestore().waitForPendingWrites().then(() => {
      const leadManager = new LeadManager({ db: firebase.firestore() });
      const leadManagerUI = new LeadManagerUI(leadManager);
      window.leadManagerUI = leadManagerUI;
      window.leadManager = leadManager;
      
      leadManagerUI.initializeUI('leadManagerContainer');
      leadManagerUI.loadLeads();
    });
  </script>
</body>
</html>
```

### Step 3: Update Firestore Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Lead collection rules
    match /leads/{leadId} {
      // Read: Users can read leads assigned to them or with appropriate role
      allow read: if request.auth != null && 
        (request.resource.data.assignedEmployee == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager']);
      
      // Create: Users with 'lead_creator' role or higher
      allow create: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager', 'lead_creator'];
      
      // Update: Lead owner or manager
      allow update: if request.auth != null &&
        (resource.data.assignedEmployee == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager']);
      
      // Delete: Admin only
      allow delete: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Lead activities
    match /lead_activities/{activityId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager'];
    }
  }
}
```

---

## Integration with Existing CRM

### 1. Add to Navigation

Update `crm-navigation.js`:

```javascript
const navigationItems = [
  // ... existing items
  {
    name: 'Leads',
    id: 'nav-leads',
    icon: '📋',
    component: 'leadManagerContainer',
    action: () => {
      document.getElementById('leadManagerContainer').style.display = 'block';
      window.leadManagerUI?.loadLeads();
    }
  }
];
```

### 2. Integrate with Dashboard

Update `crm-dashboard.js`:

```javascript
async function loadLeadMetrics() {
  const stats = await window.leadManager.getStatistics({});
  
  if (stats.success) {
    document.getElementById('dashboardLeadCount').textContent = stats.statistics.totalLeads;
    document.getElementById('dashboardAvgScore').textContent = stats.statistics.averageScore;
    
    // Update charts
    updateLeadStatusChart(stats.statistics.byStatus);
    updateLeadSourceChart(stats.statistics.bySource);
  }
}

// Call on dashboard load
loadLeadMetrics();
setInterval(loadLeadMetrics, 300000); // Refresh every 5 minutes
```

### 3. Add to User Profile

Sync assigned leads with user permissions:

```javascript
// In firebase-roles.js or user management
const userRoles = {
  'telecaller': {
    permissions: ['view_assigned_leads', 'update_lead_status'],
    features: ['fresh_lead_assignment', 'activity_logging']
  },
  'manager': {
    permissions: ['view_all_leads', 'bulk_operations', 'reports'],
    features: ['assign_leads', 'create_bulk', 'export_data']
  },
  'admin': {
    permissions: ['*'],
    features: ['*']
  }
};
```

---

## Database Setup

### 1. Firestore Collections Initialize

Run this script once to create initial structure:

```javascript
async function initializeLeadDatabase() {
  const db = firebase.firestore();
  
  // Create indices for common queries
  console.log('Setting up lead collections...');
  
  // Sample lead for structure
  const sampleLead = {
    leadId: 'SAMPLE-001',
    fullName: 'Sample Lead',
    mobile: '9999999999',
    status: 'Fresh Lead',
    leadScore: 50,
    loanType: 'Business Loan',
    loanAmount: 2500000,
    leadSource: 'Website Form',
    dateCreated: new Date().toISOString(),
    createdBy: 'system',
    documents: [],
    activities: []
  };
  
  try {
    // Create sample (will be overwritten or deleted)
    await db.collection('leads').add(sampleLead);
    console.log('✓ Lead collection initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Run once
initializeLeadDatabase();
```

### 2. Create Firestore Indexes

Go to Firebase Console → Firestore → Indexes and create:

```
Collection: leads
Field: city (Ascending)
Field: status (Ascending)

Collection: leads
Field: status (Ascending)
Field: dateCreated (Descending)

Collection: leads
Field: leadScore (Descending)
Field: dateCreated (Descending)

Collection: leads
Field: assignedEmployee (Ascending)
Field: status (Ascending)

Collection: lead_activities
Field: leadId (Ascending)
Field: timestamp (Descending)
```

### 3. Data Migration (if migrating from existing system)

```javascript
async function migrateExistingLeads(oldLeadsArray) {
  const db = firebase.firestore();
  const leadManager = new LeadManager({ db });
  
  let successful = 0;
  let failed = 0;
  
  for (const oldLead of oldLeadsArray) {
    try {
      // Map old fields to new format
      const newLead = {
        leadId: oldLead.leadId || leadManager.generateLeadId(),
        fullName: oldLead.name,
        mobile: oldLead.phone,
        email: oldLead.email,
        city: oldLead.city,
        loanType: oldLead.productType,
        loanAmount: parseInt(oldLead.amount),
        status: oldLead.status || 'Fresh Lead',
        leadSource: oldLead.source || 'Manual Entry',
        dateCreated: oldLead.createdDate || new Date().toISOString()
      };
      
      await leadManager.createLead(newLead, 'migration');
      successful++;
    } catch (error) {
      console.error(`Failed to migrate lead:`, oldLead, error);
      failed++;
    }
  }
  
  console.log(`Migration complete: ${successful} successful, ${failed} failed`);
}

// Usage
migrateExistingLeads(legacyLeadsData);
```

---

## Webhook Configuration

### 1. Website Form Webhook

```javascript
// In your form handler
app.post('/webhooks/website-form', async (req, res) => {
  const { name, email, phone, loanAmount, loanType, city } = req.body;
  
  const leadManager = new LeadManager({ db: admin.firestore() });
  
  const result = await leadManager.createLead({
    fullName: name,
    mobile: phone,
    email: email,
    city: city,
    loanType: loanType,
    loanAmount: parseInt(loanAmount),
    leadSource: 'Website Form',
    sourceCampaignId: req.body.campaignId // from UTM params
  }, 'webhook-service');
  
  if (result.success) {
    res.json({ success: true, leadId: result.lead.leadId });
  } else if (result.isDuplicate) {
    res.json({ isDuplicate: true, duplicates: result.duplicates });
  } else {
    res.status(400).json({ success: false, error: result.error });
  }
});
```

### 2. Google Ads Webhook

```javascript
app.post('/webhooks/google-ads', async (req, res) => {
  const { customer_name, customer_email, phone_number, lead_id } = req.body;
  
  // Verify Google signature
  if (!verifyGoogleSignature(req)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  const leadManager = new LeadManager({ db: admin.firestore() });
  
  const result = await leadManager.createLead({
    fullName: customer_name,
    mobile: phone_number,
    email: customer_email,
    leadSource: 'Google Ads',
    sourceCampaignId: lead_id
  }, 'google-ads-webhook');
  
  res.json({ success: result.success });
});
```

### 3. WhatsApp Integration

```javascript
app.post('/webhooks/whatsapp', async (req, res) => {
  const message = req.body.entry[0].changes[0].value.messages?.[0];
  
  if (!message) return res.sendStatus(200);
  
  const senderPhone = req.body.entry[0].changes[0].value.messages[0].from;
  const senderName = req.body.entry[0].changes[0].value.contacts?.[0].profile.name;
  
  const leadManager = new LeadManager({ db: admin.firestore() });
  
  // Check if lead exists
  const duplicateCheck = await leadManager.checkDuplicates({ mobile: senderPhone });
  
  let leadId;
  if (duplicateCheck.isDuplicate) {
    leadId = duplicateCheck.duplicates[0].leads[0].leadId;
  } else {
    const result = await leadManager.createLead({
      fullName: senderName || 'WhatsApp Lead',
      mobile: senderPhone,
      leadSource: 'WhatsApp Incoming'
    }, 'whatsapp-api');
    leadId = result.lead.leadId;
  }
  
  // Log activity
  await leadManager.logActivity(
    leadId,
    'WHATSAPP_MESSAGE',
    message.text.body,
    'whatsapp-api'
  );
  
  res.sendStatus(200);
});
```

---

## Testing

### 1. Unit Tests

```javascript
// Run in browser console
const leadManager = new LeadManager({ db: firebase.firestore() });
const tests = new LeadManagerTests(leadManager);

// Run all tests
const results = await tests.runAllTests();
console.log(results.getDetailedReport());
```

### 2. Integration Tests

```javascript
const leadManager = new LeadManager({ db: firebase.firestore() });
const integrationTests = new LeadManagerIntegrationTests(leadManager, firebase.firestore());

await integrationTests.runIntegrationTests();
```

### 3. Manual Testing Checklist

- [ ] Create a lead with minimum fields
- [ ] Create a lead with all fields
- [ ] Verify duplicate detection works
- [ ] Verify lead score calculation
- [ ] Update lead status through valid transitions
- [ ] Try invalid status transition
- [ ] Search leads with multiple filters
- [ ] Test NL search with various queries
- [ ] Test pagination
- [ ] Verify activity logging
- [ ] Test UI modal interactions
- [ ] Export leads to CSV
- [ ] Bulk upload CSV
- [ ] Verify responsive design on mobile

---

## Deployment Checklist

- [ ] All files copied to project
- [ ] CSS and JS linked in HTML
- [ ] Firebase configured and initialized
- [ ] Firestore rules updated
- [ ] Firestore indexes created
- [ ] Database collections initialized
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Manual testing completed
- [ ] Navigation integrated
- [ ] Dashboard metrics added
- [ ] Error handling configured
- [ ] Monitoring set up
- [ ] Documentation reviewed
- [ ] Team trained on usage
- [ ] Backup of existing lead data created (if migrating)

---

## Monitoring & Maintenance

### 1. Key Metrics to Monitor

```javascript
async function monitorLeadHealth() {
  const stats = await window.leadManager.getStatistics({});
  
  const metrics = {
    totalLeads: stats.statistics.totalLeads,
    avgScore: stats.statistics.averageScore,
    freshLeads: stats.statistics.byStatus['Fresh Lead'] || 0,
    contactedRate: ((stats.statistics.byStatus['Contacted'] || 0) / stats.statistics.totalLeads * 100).toFixed(1),
    conversionRate: ((stats.statistics.byStatus['Sanctioned'] || 0) / stats.statistics.totalLeads * 100).toFixed(1)
  };
  
  // Send to analytics
  sendMetricsToAnalytics(metrics);
  
  return metrics;
}

// Run every hour
setInterval(monitorLeadHealth, 3600000);
```

### 2. Error Logging

```javascript
window.addEventListener('error', (event) => {
  if (event.message.includes('LeadManager')) {
    logErrorToBackend({
      message: event.message,
      stack: event.error?.stack,
      timestamp: new Date().toISOString(),
      user: getCurrentUserId()
    });
  }
});

// Log unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.includes?.('LeadManager')) {
    logErrorToBackend({
      type: 'unhandledRejection',
      reason: event.reason,
      timestamp: new Date().toISOString()
    });
  }
});
```

### 3. Performance Optimization

```javascript
// Monitor query performance
const leadManager = new LeadManager({ db: firebase.firestore() });

// Add timing
const originalSearch = leadManager.searchLeads.bind(leadManager);
leadManager.searchLeads = async function(filters, options) {
  const start = performance.now();
  const result = await originalSearch(filters, options);
  const duration = performance.now() - start;
  
  if (duration > 1000) {
    console.warn(`Slow query detected: ${duration}ms`, filters);
  }
  
  return result;
};
```

### 4. Regular Maintenance Tasks

**Weekly:**
- Review duplicate leads
- Check for leads in "Future Follow-up" status
- Monitor error logs

**Monthly:**
- Archive old leads
- Analyze conversion metrics
- Review scoring accuracy
- Optimize slow queries

**Quarterly:**
- Database cleanup
- Performance review
- User feedback collection
- Feature requests review

---

## Rollback Plan

If issues occur after deployment:

```javascript
// Disable Lead Manager
function disableLeadManager() {
  document.getElementById('leadManagerContainer').style.display = 'none';
  window.leadManagerUI = null;
  window.leadManager = null;
  console.log('Lead Manager disabled');
}

// Restore from backup
async function restoreLeadDatabase() {
  // This should use a backup system you have in place
  console.log('Restoring from backup...');
  // Implementation depends on your backup strategy
}
```

---

## Support & Troubleshooting

### Common Issues

**Issue:** "Firebase not initialized"
- Solution: Ensure firebase-config.js is loaded before lead manager scripts

**Issue:** "Permission denied" errors
- Solution: Check Firestore rules and user roles

**Issue:** Duplicate detection not working
- Solution: Verify mobile number format consistency

**Issue:** Slow performance
- Solution: Check Firestore query limits and add appropriate indexes

---

For additional support, contact the development team.

*Last Updated: May 2026*
