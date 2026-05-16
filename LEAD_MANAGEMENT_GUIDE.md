# Lead Management Module - API Reference Guide
**Version:** 1.0.0  
**Last Updated:** May 2026

---

## Table of Contents
1. [Overview](#overview)
2. [Installation](#installation)
3. [Core Classes](#core-classes)
4. [Lead Sources](#lead-sources)
5. [Lead Data Fields](#lead-data-fields)
6. [Status Pipeline](#status-pipeline)
7. [Deduplication Logic](#deduplication-logic)
8. [Lead Scoring](#lead-scoring)
9. [API Methods](#api-methods)
10. [Advanced Search & Filtering](#advanced-search--filtering)
11. [Examples](#examples)
12. [Error Handling](#error-handling)

---

## Overview

The Lead Management Module provides a comprehensive system for managing leads across multiple channels in the CRM. It supports:

- **12 Lead Sources** with automatic assignment rules
- **3-tier Deduplication** (Mobile/PAN/Fuzzy matching)
- **AI-Powered Scoring** (0-100 scale with 8 weighted factors)
- **21-Status Pipeline** with state validation
- **15+ Advanced Filters** and natural language search
- **Activity Tracking** and audit trails
- **Bulk Operations** (CSV import, merge, mass updates)

---

## Installation

### 1. Include the module files in your HTML

```html
<!-- Core Module -->
<script src="files/crm-lead-manager.js"></script>

<!-- UI Components -->
<script src="files/crm-lead-manager-ui.js"></script>

<!-- Styling -->
<link rel="stylesheet" href="files/crm-lead-manager.css">

<!-- Tests (Optional) -->
<script src="files/test-lead-manager.js"></script>
```

### 2. Initialize the Lead Manager

```javascript
// Initialize with Firebase
const leadManager = new LeadManager({
  db: firebase.firestore()
});

// Initialize the UI
const leadManagerUI = new LeadManagerUI(leadManager);
leadManagerUI.initializeUI('containerElementId');

// Save reference for global access
window.leadManagerUI = leadManagerUI;
```

### 3. Load initial leads

```javascript
leadManagerUI.loadLeads();
```

---

## Core Classes

### LeadManager

Main class handling lead business logic, deduplication, scoring, and database operations.

```javascript
const leadManager = new LeadManager(firebaseConfig);
```

### LeadManagerUI

Handles UI rendering, modal management, form submissions, and user interactions.

```javascript
const ui = new LeadManagerUI(leadManager);
ui.initializeUI('leadManagerContainer');
```

### LeadManagerTests

Comprehensive test suite for unit and integration testing.

```javascript
const tests = new LeadManagerTests(leadManager);
const results = await tests.runAllTests();
```

---

## Lead Sources

### Supported Lead Sources (Section 5.1)

| Source | Method | Auto-Assignment | Priority |
|--------|--------|-----------------|----------|
| Website Form | Webhook/API | Round-robin | 1 |
| Facebook Ads | Lead Ads API | By geography/product | 2 |
| Google Ads | Webhook | By geography/product | 2 |
| WhatsApp Incoming | WhatsApp API | Dedicated handler | 1 |
| Referral (Walk-in) | Manual entry | To assigned SE | 3 |
| Sub-DSA/Connector | Portal/Bot | Processing team | 2 |
| PaisaBazaar/BankBazaar | API/Webhook | Product + geography | 2 |
| IndiaLends/MyLoanCare | API/Webhook | Product + geography | 2 |
| Bulk CSV Upload | Admin interface | Manual by manager | 3 |
| IVR/Missed Call | Telephony API | Telecaller pool | 1 |

### Accessing Lead Sources

```javascript
// Get all lead sources
const sources = leadManager.leadSources;

// Access specific source
const websiteSource = leadManager.leadSources.WEBSITE_FORM;
console.log(websiteSource.name); // "Website Form"
console.log(websiteSource.autoAssignment); // "round-robin"
```

---

## Lead Data Fields

### Complete Field Structure (Section 5.3)

#### Identity Information
```javascript
{
  leadId: 'LEAD-1234567890-abc123',     // Auto-generated
  fullName: 'John Doe',                  // Required
  mobile: '9876543210',                  // Primary, Required
  mobileAlternate: '9876543211',         // Optional
  email: 'john@example.com',             // Optional
  panNumber: 'ABCDE1234F',              // Optional
  aadhaarNumber: '1234 5678 9012'       // Optional
}
```

#### Demographics
```javascript
{
  dateOfBirth: '1990-05-15',             // Optional
  age: 34,                               // Calculated
  gender: 'Male',                        // Optional
  city: 'Mumbai',                        // Optional
  pinCode: '400001',                     // Optional
  fullAddress: '123 Main St...',         // Optional
  state: 'Maharashtra'                   // Optional
}
```

#### Employment Details
```javascript
{
  occupationType: 'Salaried',            // Salaried/Self-Employed/Professional
  companyName: 'Acme Corp',              // Optional
  designation: 'Senior Manager',         // Optional
  monthlyIncome: 150000,                 // Optional
  yearsInCurrentJob: 5.5                 // Optional
}
```

#### Business Details (Self-Employed)
```javascript
{
  businessName: 'ABC Trading',           // Optional
  businessType: 'Retail',                // Optional
  industry: 'Trading',                   // Optional
  gstNumber: '18AABCT1234A1Z0',        // Optional
  udyamRegistration: 'UDYAM-XX-123...',  // Optional
  businessVintage: 8,                    // Years, affects scoring
  annualTurnover: 5000000,               // Optional
  monthlyBankCredits: 400000             // Optional
}
```

#### Loan Requirement
```javascript
{
  loanType: 'Business Loan',             // Required
  loanAmount: 2500000,                   // Required
  loanPurpose: 'Business Expansion',     // Optional
  tenurePreference: 60,                  // Months, Optional
  existingEmis: 25000,                   // Optional
  foir: 0.35                             // Optional
}
```

#### Source & Assignment
```javascript
{
  leadSource: 'Website Form',            // Required
  sourceCampaignId: 'CAMP-2024-001',     // Optional
  assignedEmployee: 'emp-12345',         // Optional
  assignedTeam: 'Mumbai Sales',          // Optional
  dateCreated: '2026-05-15T10:30:00Z',   // Auto
  createdBy: 'user-789'                  // Auto
}
```

#### Property Details (LAP/HL Only)
```javascript
{
  propertyType: 'Residential',           // Optional
  propertyLocation: '123 Main St, Mumbai', // Optional
  estimatedMarketValue: 5000000,         // Optional
  ownershipStatus: 'Sole',               // Optional
  builderName: 'XYZ Builders',           // Optional
  reraNumber: 'P12345678901234567890'    // Optional
}
```

#### Bureau & Credit Information
```javascript
{
  cibilScore: 750,                       // Optional
  cibilDate: '2026-05-15T00:00:00Z',     // Optional
  bureauReportLink: 'https://...',       // Optional
  dpdStatus: 'No Default',               // Optional
  activeLoansCount: 3,                   // Optional
  totalOutstanding: 500000               // Optional
}
```

---

## Status Pipeline

### Complete Status Flow (Section 5.4)

```
Fresh Lead (1)
├─→ Contacted (2)
│   ├─→ Interested (3)
│   │   ├─→ Documents Pending (6)
│   │   ├─→ Not Eligible (5)
│   │   └─→ Future Follow-up (20)
│   ├─→ Not Interested (4)
│   └─→ Future Follow-up (20)
├─→ Not Eligible (5)
└─→ DND (21)

Interested (3)
├─→ Documents Pending (6)
├─→ Not Eligible (5)
└─→ Future Follow-up (20)

Documents Pending (6)
├─→ Documents Received (7)
└─→ Not Interested (4)

Documents Received (7)
├─→ Bureau Pull Done (8)
└─→ Verification

Bureau Pull Done (8)
├─→ Lender Selected (9)
└─→ Not Eligible (5)

Lender Selected (9)
└─→ Bank Login Done (10)

Bank Login Done (10)
└─→ Under Process (11)

Under Process (11)
├─→ Query (12)
├─→ Sanctioned (14)
└─→ Rejected (19)

Query (12)
└─→ Query Resolved (13)

Query Resolved (13)
└─→ Under Process (11)

Sanctioned (14)
├─→ Agreement Signed (15)
└─→ Rejected (19)

Agreement Signed (15)
└─→ Disbursed (16)

Disbursed (16)
└─→ Payout Pending (17)

Payout Pending (17)
└─→ Payout Received (18)

Payout Received (18)
└─→ Closed

Rejected (19)
├─→ Re-routed to Another Lender
└─→ Future Follow-up (20)

Future Follow-up (20)
└─→ Fresh Lead (1)

DND (21) - Terminal State
```

### Accessing Status Pipeline

```javascript
// Get all statuses
const allStatuses = leadManager.statusPipeline;

// Get specific status
const statusObj = leadManager.statusPipeline.find(s => s.status === 'Contacted');
console.log(statusObj.nextStates); // ['Interested', 'Not Interested', 'Future Follow-up']

// Validate transition
const currentStatus = 'Contacted';
const nextStatus = 'Interested';
const statusObj = leadManager.statusPipeline.find(s => s.status === currentStatus);
const canTransition = statusObj.nextStates.includes(nextStatus); // true
```

---

## Deduplication Logic

### Three-Tier Matching (Section 5.2)

The system checks for duplicates in the following order:

```
Priority 1: Mobile Number (Exact Match)
   ↓ (if no match)
Priority 2: PAN Number (Exact Match)
   ↓ (if no match)
Priority 3: Name + City + Loan Type (Fuzzy Match >85%)
```

### Using Deduplication

```javascript
const leadData = {
  fullName: 'John Doe',
  mobile: '9876543210',
  city: 'Mumbai',
  loanType: 'Business Loan'
};

const dupCheck = await leadManager.checkDuplicates(leadData);

if (dupCheck.isDuplicate) {
  console.log('Duplicates found:');
  dupCheck.duplicates.forEach(dup => {
    console.log(`Type: ${dup.type}, Priority: ${dup.priority}`);
    dup.leads.forEach(lead => {
      console.log(`  - ${lead.fullName} (${lead.mobile})`);
    });
  });
}
```

### String Similarity Calculation

```javascript
// Calculates Levenshtein distance-based similarity (0 to 1)
const similarity = leadManager.calculateStringSimilarity('John Doe', 'Jon Doe');
console.log(similarity); // ~0.89 (89% match)
```

---

## Lead Scoring

### Scoring Weights (Section 5.5)

| Factor | Weight | Logic |
|--------|--------|-------|
| CIBIL Score | 25% | >750: 100%, 700-750: 80%, 650-700: 50%, <650: 20% |
| Loan-to-Income Ratio | 15% | Lower ratio = higher score |
| Lead Source Quality | 15% | Referral > Website > Ads > Aggregator > Cold |
| Document Readiness | 10% | More docs = higher score |
| Response Time | 10% | Faster response = higher score |
| Geography Match | 10% | Serviceable area = higher score |
| Business Vintage | 10% | >5y: 100%, 3-5y: 70%, 1-3y: 40%, <1y: 10% |
| Product-Lender Fit | 5% | How many lenders match the profile |

### Score Calculation

```javascript
const lead = {
  cibilScore: 750,
  loanAmount: 2500000,
  monthlyIncome: 150000,
  leadSource: 'Website Form',
  documents: [/* ... */],
  businessVintage: 8,
  pinCode: '400001'
};

const score = leadManager.calculateLeadScore(lead);
console.log(score); // 0-100 (e.g., 78)
```

### Score Ranges

- **Excellent (80-100):** Highly qualified, prioritize
- **Good (60-79):** Qualified, standard processing
- **Fair (40-59):** Moderate qualification, additional docs needed
- **Poor (0-39):** Low qualification, may not be eligible

---

## API Methods

### Lead Creation

```javascript
// Create a new lead
const result = await leadManager.createLead(leadData, userId);

if (result.success) {
  console.log('Lead created:', result.lead.leadId);
} else if (result.isDuplicate) {
  console.log('Duplicates found:', result.duplicates);
} else {
  console.error('Error:', result.error);
}
```

### Get Lead

```javascript
// Retrieve a lead with all related data
const result = await leadManager.getLead(leadId);

if (result.success) {
  const lead = result.lead;
  console.log('Name:', lead.fullName);
  console.log('Score:', lead.leadScore);
  console.log('Activities:', lead.activityHistory);
}
```

### Update Lead Status

```javascript
const result = await leadManager.updateLeadStatus(
  leadId,
  'Interested',
  'Customer confirmed interest',
  userId
);

if (result.success) {
  console.log('Status updated to:', result.newStatus);
} else {
  console.error('Error:', result.error);
  console.log('Allowed transitions:', result.allowedTransitions);
}
```

### Log Activity

```javascript
const result = await leadManager.logActivity(
  leadId,
  'CALL_COMPLETED',
  'Called customer - explained benefits',
  userId
);
```

### Search Leads

```javascript
const filters = {
  status: 'Interested',
  loanType: 'Business Loan',
  scoreMin: 70,
  scoreMax: 100,
  city: 'Mumbai'
};

const options = {
  limit: 20,
  offset: 0,
  orderBy: 'leadScore',
  orderDirection: 'desc'
};

const result = await leadManager.searchLeads(filters, options);

console.log(`Found ${result.total} leads`);
result.leads.forEach(lead => {
  console.log(`${lead.fullName} (${lead.leadScore})`);
});
```

### Get Statistics

```javascript
const filters = { city: 'Mumbai' };

const result = await leadManager.getStatistics(filters);

if (result.success) {
  const stats = result.statistics;
  console.log('Total Leads:', stats.totalLeads);
  console.log('By Status:', stats.byStatus);
  console.log('By Source:', stats.bySource);
  console.log('Avg Score:', stats.averageScore);
  console.log('Avg CIBIL:', stats.averageCibil);
}
```

### Get Pipeline Summary

```javascript
const result = await leadManager.getPipelineSummary();

if (result.success) {
  result.pipeline.forEach((stage, status) => {
    console.log(`${status}: ${stage.count} leads (${stage.percentage}%)`);
  });
}
```

### Merge Leads

```javascript
const result = await leadManager.mergeLeads(
  primaryLeadId,
  secondaryLeadId,
  userId
);

if (result.success) {
  console.log('Leads merged into:', result.mergedLeadId);
}
```

### Bulk CSV Upload

```javascript
const csvData = `name,mobile,email,city,loanType,loanAmount,source
John Doe,9876543210,john@example.com,Mumbai,Business Loan,2500000,Website Form
Jane Smith,9876543211,jane@example.com,Bangalore,Home Loan,5000000,Google Ads`;

const result = await leadManager.bulkUploadCSV(csvData, userId);

console.log(`Processed: ${result.results.total}`);
console.log(`Successful: ${result.results.successful}`);
console.log(`Duplicates: ${result.results.duplicates}`);
console.log(`Failed: ${result.results.failed}`);
```

---

## Advanced Search & Filtering

### Filter Combinations

```javascript
// Complex multi-filter search
const result = await leadManager.searchLeads({
  status: ['Interested', 'Documents Pending'],  // Multi-select
  leadSource: 'Google Ads',
  loanType: 'Business Loan',
  scoreMin: 65,
  scoreMax: 100,
  cibilMin: 700,
  loanAmountMin: 1500000,
  loanAmountMax: 5000000,
  city: 'Mumbai',
  pinCode: '400001',
  dateFrom: '2026-04-01',
  dateTo: '2026-05-15',
  lastActivityFrom: '2026-05-10'
});
```

### Natural Language Search

```javascript
// Examples of NL queries
const queries = [
  'show all Thane BL leads above 20L',
  'Mumbai home loan leads above 50L with GST',
  'PL leads from Google Ads in Bangalore',
  'Interested Pune leads with CIBIL > 700'
];

queries.forEach(async query => {
  const result = await leadManager.naturalLanguageSearch(query);
  console.log(`Query: "${query}"`);
  console.log(`Found: ${result.leads.length} leads`);
});
```

### Pagination

```javascript
const pageSize = 20;
const pageNumber = 2;

const result = await leadManager.searchLeads(filters, {
  limit: pageSize,
  offset: (pageNumber - 1) * pageSize
});

const totalPages = Math.ceil(result.total / pageSize);
console.log(`Page ${pageNumber} of ${totalPages}`);
```

---

## Examples

### Example 1: Complete Lead Creation Workflow

```javascript
async function createLeadWorkflow() {
  const leadData = {
    fullName: 'Rajesh Kumar',
    mobile: '9876543210',
    email: 'rajesh@example.com',
    city: 'Mumbai',
    state: 'Maharashtra',
    panNumber: 'ABCDE1234F',
    occupationType: 'Self-Employed',
    businessName: 'Tech Solutions Ltd',
    businessVintage: 7,
    gstNumber: '18AABCT1234A1Z0',
    monthlyIncome: 200000,
    monthlyBankCredits: 180000,
    loanType: 'Business Loan',
    loanAmount: 3500000,
    loanPurpose: 'Equipment Purchase'
  };

  const result = await leadManager.createLead(leadData, 'current-user-id');

  if (result.success) {
    console.log('✓ Lead created successfully');
    console.log(`Lead ID: ${result.lead.leadId}`);
    console.log(`Initial Score: ${result.lead.leadScore}`);
    
    // Update status
    await leadManager.updateLeadStatus(
      result.lead.leadId,
      'Contacted',
      'Customer called and expressed interest',
      'current-user-id'
    );
  } else if (result.isDuplicate) {
    console.log('⚠ Duplicate lead(s) detected');
    // Handle merge or duplicate options
  }
}

createLeadWorkflow();
```

### Example 2: Dashboard Statistics

```javascript
async function displayDashboard() {
  // Get stats for all leads
  const allStats = await leadManager.getStatistics({});
  
  // Get pipeline summary
  const pipeline = await leadManager.getPipelineSummary({});
  
  // Display dashboard
  console.log('=== LEAD DASHBOARD ===');
  console.log(`Total Leads: ${allStats.statistics.totalLeads}`);
  console.log(`Avg Score: ${allStats.statistics.averageScore}`);
  console.log(`Avg CIBIL: ${allStats.statistics.averageCibil}`);
  console.log('\nBy Status:');
  Object.entries(allStats.statistics.byStatus).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });
  
  console.log('\nPipeline Conversion:');
  pipeline.pipeline.forEach((stage) => {
    console.log(`  ${stage.status}: ${stage.count} (${stage.percentage}%)`);
  });
}

displayDashboard();
```

### Example 3: Lead Scoring Analysis

```javascript
async function analyzeLead(leadId) {
  const result = await leadManager.getLead(leadId);
  
  if (result.success) {
    const lead = result.lead;
    
    console.log(`Lead: ${lead.fullName}`);
    console.log(`Overall Score: ${lead.leadScore}`);
    
    // Break down score factors
    const cibilScore = leadManager.calculateCibilScore(lead.cibilScore);
    const ltiScore = leadManager.calculateLoanToIncomeScore(
      lead.loanAmount,
      lead.monthlyIncome
    );
    const sourceScore = leadManager.calculateSourceQualityScore(lead.leadSource);
    const vintageScore = leadManager.calculateBusinessVintageScore(lead.businessVintage);
    
    console.log('\nScore Breakdown:');
    console.log(`  CIBIL (25%): ${cibilScore} → ${(cibilScore * 0.25).toFixed(1)}`);
    console.log(`  L-to-I (15%): ${ltiScore} → ${(ltiScore * 0.15).toFixed(1)}`);
    console.log(`  Source (15%): ${sourceScore} → ${(sourceScore * 0.15).toFixed(1)}`);
    console.log(`  Vintage (10%): ${vintageScore} → ${(vintageScore * 0.10).toFixed(1)}`);
  }
}

analyzeLead('LEAD-123456-abc');
```

---

## Error Handling

### Common Error Scenarios

```javascript
// Error 1: Lead not found
try {
  const result = await leadManager.getLead('invalid-id');
  if (!result.success) {
    console.error('Lead not found:', result.error);
  }
} catch (error) {
  console.error('Database error:', error);
}

// Error 2: Invalid status transition
const result = await leadManager.updateLeadStatus(
  leadId,
  'Invalid Status'
);
if (!result.success) {
  console.error('Invalid transition:', result.error);
  console.log('Allowed transitions:', result.allowedTransitions);
}

// Error 3: Missing required fields
const incomplete = {
  fullName: 'John Doe'
  // Missing mobile, leadSource, loanType, loanAmount
};

try {
  const result = await leadManager.createLead(incomplete, userId);
  if (!result.success) {
    console.error('Validation failed:', result.error);
  }
} catch (error) {
  console.error('Error:', error.message);
}

// Error 4: Database configuration
if (!leadManager.db) {
  console.warn('Firebase not configured - offline mode');
  // Local operations only
}
```

---

## Performance Considerations

### Optimization Tips

1. **Pagination:** Always paginate large result sets
   ```javascript
   searchLeads(filters, { limit: 50, offset: 0 })
   ```

2. **Limit Query Results:**
   ```javascript
   searchLeads(filters, { limit: 1000 })  // Cap at 1000
   ```

3. **Use Specific Filters:**
   ```javascript
   // Avoid searching without filters for large datasets
   searchLeads({ status: 'Fresh Lead', city: 'Mumbai' })
   ```

4. **Cache Statistics:** Refresh periodically, not on every action

5. **Batch Operations:** Use bulk CSV upload for multiple leads

---

## Database Schema

### Firestore Collections

```
firestore
├── leads/
│   └── {docId}
│       ├── leadId
│       ├── fullName
│       ├── mobile
│       ├── email
│       ├── loanType
│       ├── loanAmount
│       ├── status
│       ├── leadScore
│       ├── dateCreated
│       ├── lastActivity
│       ├── assignedEmployee
│       └── [other fields...]
│
└── lead_activities/
    └── {docId}
        ├── leadId
        ├── type
        ├── description
        ├── createdBy
        └── timestamp
```

---

## Troubleshooting

### Issue: Duplicates not being detected

**Check:**
- Mobile number format matches (no spaces/dashes)
- PAN number is stored correctly
- String similarity threshold (currently 85%)

### Issue: Scoring seems incorrect

**Check:**
- CIBIL score is a number (not string)
- Monthly income is in actual amounts (not thousands)
- Loan amount is in actual amounts
- All required fields are present

### Issue: Status transition not allowed

**Check:**
- Verify current status name is correct
- Check allowed transitions in `statusPipeline`
- Ensure status exists in pipeline

---

## License & Support

Lead Management Module v1.0.0  
Part of CRM_FINAL System  
Support: Internal Development Team

---

*For updates and feature requests, contact the CRM development team.*
