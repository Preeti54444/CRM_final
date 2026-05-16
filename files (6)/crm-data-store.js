// ═══════════════════════════════════════════════════════════════
// CRM DATA STORE - Complete Data Management Module
// ═══════════════════════════════════════════════════════════════

const DataStore = {
  // Initialize with sample data if empty
  init() {
    if (!localStorage.getItem('crm_data')) {
      const initialData = {
        leads: [
          { id: 1, name: 'Christopher Maclead', company: 'Rangoni Of Florence', email: 'christopher.maclead@example.in', phone: '+91 98765 43210', status: 'hot', source: 'referral', dealValue: 850000, assignedTo: 'me', createdAt: '2024-01-15', lastActivity: '2024-01-20' },
          { id: 2, name: 'Carissa Kidman', company: 'Oh My Goodknits Inc', email: 'carissa.kidman@example.in', phone: '+91 98765 43211', status: 'warm', source: 'web', dealValue: 620000, assignedTo: 'me', createdAt: '2024-01-16', lastActivity: '2024-01-19' },
          { id: 3, name: 'James Merced', company: 'Kwik Kopy Printing', email: 'james.merced@example.in', phone: '+91 98765 43212', status: 'cold', source: 'linkedin', dealValue: 480000, assignedTo: 'me', createdAt: '2024-01-17', lastActivity: '2024-01-18' },
          { id: 4, name: 'Tresa Sweely', company: 'Morlong Associates', email: 'tresa.sweely@example.in', phone: '+91 98765 43213', status: 'hot', source: 'campaign', dealValue: 1200000, assignedTo: 'me', createdAt: '2024-01-18', lastActivity: '2024-01-20' },
          { id: 5, name: 'Felix Hirpara', company: 'Chapman', email: 'felix.hirpara@example.in', phone: '+91 98765 43214', status: 'warm', source: 'cold-email', dealValue: 750000, assignedTo: 'me', createdAt: '2024-01-19', lastActivity: '2024-01-20' },
          { id: 6, name: 'Chau Kitzman', company: 'TechStart Solutions', email: 'chau.kitzman@techstart.com', phone: '+91 98765 43215', status: 'hot', source: 'web', dealValue: 2100000, assignedTo: 'me', createdAt: '2024-01-20', lastActivity: '2024-01-20' },
          { id: 7, name: 'ABC Corp', company: 'ABC Corporation', email: 'contact@abccorp.com', phone: '+91 98765 43216', status: 'warm', source: 'referral', dealValue: 1500000, assignedTo: 'me', createdAt: '2024-01-21', lastActivity: '2024-01-21' },
          { id: 8, name: 'TechStart Inc', company: 'TechStart India', email: 'info@techstart.in', phone: '+91 98765 43217', status: 'cold', source: 'linkedin', dealValue: 950000, assignedTo: 'me', createdAt: '2024-01-22', lastActivity: '2024-01-22' },
          { id: 9, name: 'Rajesh Kumar', company: 'Kumar Enterprises', email: 'rajesh@kumar.com', phone: '+91 98765 43218', status: 'hot', source: 'campaign', dealValue: 2800000, assignedTo: 'me', createdAt: '2024-01-23', lastActivity: '2024-01-23' },
          { id: 10, name: 'Priya Sharma', company: 'Sharma Exports', email: 'priya@sharma.com', phone: '+91 98765 43219', status: 'warm', source: 'web', dealValue: 1100000, assignedTo: 'me', createdAt: '2024-01-24', lastActivity: '2024-01-24' }
        ],
        contacts: [
          { id: 1, name: 'John Smith', company: 'ABC Corp', email: 'john@abccorp.com', phone: '+91 98765 43220', type: 'customer', createdAt: '2024-01-10' },
          { id: 2, name: 'Jane Doe', company: 'XYZ Ltd', email: 'jane@xyz.com', phone: '+91 98765 43221', type: 'prospect', createdAt: '2024-01-11' },
          { id: 3, name: 'Mike Johnson', company: 'Tech Solutions', email: 'mike@techsol.com', phone: '+91 98765 43222', type: 'partner', createdAt: '2024-01-12' },
          { id: 4, name: 'Sarah Williams', company: 'Global Industries', email: 'sarah@global.com', phone: '+91 98765 43223', type: 'customer', createdAt: '2024-01-13' },
          { id: 5, name: 'David Chen', company: 'Asian Markets', email: 'david@asian.com', phone: '+91 98765 43224', type: 'prospect', createdAt: '2024-01-14' },
          { id: 6, name: 'Lisa Anderson', company: 'Euro Trade', email: 'lisa@euro.com', phone: '+91 98765 43225', type: 'partner', createdAt: '2024-01-15' }
        ],
        accounts: [
          { id: 1, name: 'ABC Corp', industry: 'Technology', phone: '+91 22 1234 5678', type: 'Customer', revenue: 12500000 },
          { id: 2, name: 'XYZ Ltd', industry: 'Manufacturing', phone: '+91 44 8765 4321', type: 'Prospect', revenue: 8500000 },
          { id: 3, name: 'Tech Solutions', industry: 'IT Services', phone: '+91 80 2345 6789', type: 'Partner', revenue: 15000000 },
          { id: 4, name: 'Global Industries', industry: 'Retail', phone: '+91 33 3456 7890', type: 'Customer', revenue: 22000000 },
          { id: 5, name: 'Asian Markets', industry: 'Trading', phone: '+91 11 4567 8901', type: 'Prospect', revenue: 6500000 }
        ],
        campaigns: [
          { id: 1, name: 'Q1 Email Campaign', type: 'Email', status: 'Active', leadsGenerated: 45, startDate: '2024-01-01', endDate: '2024-03-31' },
          { id: 2, name: 'LinkedIn Prospecting', type: 'Social', status: 'Active', leadsGenerated: 32, startDate: '2024-02-01', endDate: '2024-02-29' },
          { id: 3, name: 'Funding Workshop', type: 'Webinar', status: 'Completed', leadsGenerated: 78, startDate: '2024-01-15', endDate: '2024-01-15' },
          { id: 4, name: 'Cold Email Sequence', type: 'Email', status: 'Draft', leadsGenerated: 0, startDate: '2024-03-01', endDate: '2024-03-31' }
        ],
        documents: [
          { id: 1, name: 'ABC Corporation Contract.pdf', type: 'Contract', relatedTo: 'ABC Corporation', fileSize: '2.4 MB', uploadedAt: '2024-01-10' },
          { id: 2, name: 'TechStart India Proposal.pdf', type: 'Proposal', relatedTo: 'TechStart India', fileSize: '1.8 MB', uploadedAt: '2024-01-12' },
          { id: 3, name: 'Kumar Enterprises Financials.xlsx', type: 'Financials', relatedTo: 'Kumar Enterprises', fileSize: '1.2 MB', uploadedAt: '2024-01-15' },
          { id: 4, name: 'HDFC Sanction Letter.pdf', type: 'Sanction Letter', relatedTo: 'ABC Corporation', fileSize: '420 KB', uploadedAt: '2024-03-09' },
          { id: 5, name: 'Kotak Query Pack.pdf', type: 'Query Document', relatedTo: 'TechStart India', fileSize: '1.1 MB', uploadedAt: '2024-03-14' }
        ],
        loanApplications: [
          { id: 1, applicationId: 'FS-2026-WC-00001', leadId: 7, leadCompany: 'ABC Corporation', lenderName: 'HDFC Bank', productType: 'BL', appliedAmount: 1500000, status: 'Documentation', bankLoginDate: '2024-03-05', bankReferenceNumber: 'HDFC-001', sanctionedAmount: 1400000, sanctionDate: '2024-03-08', interestRate: 13.5, tenureMonths: 12, emiAmount: 133222.50, disbursalAmount: 0, disbursalDate: '', rejectionReason: '', expectedPayoutPercent: 1.50, expectedPayoutAmount: 21000, actualPayoutReceived: 0, payoutDate: '', tatTracker: { stageEntryDate: '2024-03-05', slaDeadline: '2024-03-07', breach: false }, assignedExecutive: 'Vaibhav Borge', submissionDate: '2024-03-05', lastUpdate: '2024-03-08', lenderCaseId: 'HDFC-001', remarks: 'Awaiting lender query' },
          { id: 2, applicationId: 'FS-2026-SCF-00002', leadId: 8, leadCompany: 'TechStart India', lenderName: 'Kotak Mahindra Bank', productType: 'MSME', appliedAmount: 2100000, status: 'Documentation', bankLoginDate: '2024-03-10', bankReferenceNumber: 'KOTAK-004', sanctionedAmount: 0, sanctionDate: '', interestRate: 0, tenureMonths: 0, emiAmount: 0, disbursalAmount: 0, disbursalDate: '', rejectionReason: '', expectedPayoutPercent: 1.25, expectedPayoutAmount: 0, actualPayoutReceived: 0, payoutDate: '', tatTracker: { stageEntryDate: '2024-03-10', slaDeadline: '2024-03-12', breach: false }, assignedExecutive: 'Saleem Khan', submissionDate: '2024-03-10', lastUpdate: '2024-03-14', lenderCaseId: 'KOTAK-004', remarks: 'Document pack sent' },
          { id: 3, applicationId: 'FS-2026-TL-00003', leadId: 9, leadCompany: 'Kumar Enterprises', lenderName: 'ICICI Bank', productType: 'BL', appliedAmount: 2800000, status: 'Negotiation', bankLoginDate: '2024-03-12', bankReferenceNumber: 'ICICI-009', sanctionedAmount: 0, sanctionDate: '', interestRate: 0, tenureMonths: 0, emiAmount: 0, disbursalAmount: 0, disbursalDate: '', rejectionReason: '', expectedPayoutPercent: 1.75, expectedPayoutAmount: 0, actualPayoutReceived: 0, payoutDate: '', tatTracker: { stageEntryDate: '2024-03-12', slaDeadline: '2024-03-19', breach: false }, assignedExecutive: 'Roshan Chawan', submissionDate: '2024-03-12', lastUpdate: '2024-03-15', lenderCaseId: 'ICICI-009', remarks: 'Terms under review' },
          { id: 4, applicationId: 'FS-2026-ID-00004', leadId: 4, leadCompany: 'Morlong Associates', lenderName: 'Axis Bank', productType: 'LAP', appliedAmount: 1200000, status: 'Disbursed', bankLoginDate: '2024-03-20', bankReferenceNumber: 'AXIS-077', sanctionedAmount: 1200000, sanctionDate: '2024-03-22', interestRate: 12.25, tenureMonths: 9, emiAmount: 170456.17, disbursalAmount: 500000, disbursalDate: '2024-03-23', rejectionReason: '', expectedPayoutPercent: 1.60, expectedPayoutAmount: 8000, actualPayoutReceived: 0, payoutDate: '', tatTracker: { stageEntryDate: '2024-03-22', slaDeadline: '2024-04-05', breach: false }, assignedExecutive: 'Vaibhav Borge', submissionDate: '2024-03-20', lastUpdate: '2024-03-22', lenderCaseId: 'AXIS-077', remarks: 'First tranche disbursed' },
          { id: 5, applicationId: 'FS-2026-EL-00005', leadId: 3, leadCompany: 'Kwik Kopy Printing', lenderName: 'State Bank of India', productType: 'EL', appliedAmount: 480000, status: 'Sanctioned', bankLoginDate: '2024-03-18', bankReferenceNumber: 'SBI-212', sanctionedAmount: 430000, sanctionDate: '2024-03-20', interestRate: 11.75, tenureMonths: 36, emiAmount: 15745.61, disbursalAmount: 0, disbursalDate: '', rejectionReason: '', expectedPayoutPercent: 1.75, expectedPayoutAmount: 7525, actualPayoutReceived: 0, payoutDate: '', tatTracker: { stageEntryDate: '2024-03-20', slaDeadline: '2024-03-27', breach: false }, assignedExecutive: 'Saleem Khan', submissionDate: '2024-03-18', lastUpdate: '2024-03-20', lenderCaseId: 'SBI-212', remarks: 'Sanction letter issued' }
        ],
        lenderQueries: [
          { id: 1, queryId: 'Q-2026-0001', applicationId: 1, leadId: 7, description: 'Need updated balance sheet and GST returns for the last 12 months', requiredDocs: ['GST Returns', 'Balance Sheet'], priority: 'Urgent', assignedHandler: 'Vaibhav Borge', status: 'Open', dateRaised: '2024-03-06T09:30:00', slaDeadline: '2024-03-07T09:30:00', escalationLevel: 0, createdAt: '2024-03-06T09:30:00' },
          { id: 2, queryId: 'Q-2026-0002', applicationId: 2, leadId: 8, description: 'Please confirm supplier list, invoice aging and receivable movement', requiredDocs: ['Supplier List', 'Aging Report'], priority: 'Normal', assignedHandler: 'Saleem Khan', status: 'Open', dateRaised: '2024-03-11T11:00:00', slaDeadline: '2024-03-13T11:00:00', escalationLevel: 0, createdAt: '2024-03-11T11:00:00' },
          { id: 3, queryId: 'Q-2026-0003', applicationId: 4, leadId: 4, description: 'Submit latest export orders, stock statement and buyer confirmations', requiredDocs: ['Export Orders', 'Stock Statement'], priority: 'Normal', assignedHandler: 'Roshan Chawan', status: 'Open', dateRaised: '2024-03-21T10:00:00', slaDeadline: '2024-03-23T10:00:00', escalationLevel: 0, createdAt: '2024-03-21T10:00:00' }
        ],
        deals: [
          { id: 1, name: 'ABC Corp Deal', company: 'ABC Corp', value: 1500000, stage: 'negotiation', probability: 75, closeDate: '2024-03-15', assignedTo: 'me' },
          { id: 2, name: 'TechStart Project', company: 'TechStart Inc', value: 2100000, stage: 'proposal', probability: 50, closeDate: '2024-04-01', assignedTo: 'me' },
          { id: 3, name: 'Kumar Enterprise', company: 'Kumar Enterprises', value: 2800000, stage: 'qualified', probability: 30, closeDate: '2024-05-01', assignedTo: 'me' },
          { id: 4, name: 'Global Industries Q1', company: 'Global Industries', value: 3500000, stage: 'prospecting', probability: 20, closeDate: '2024-06-01', assignedTo: 'me' },
          { id: 5, name: 'Asian Markets Deal', company: 'Asian Markets', value: 1200000, stage: 'closed-won', probability: 100, closeDate: '2024-02-01', assignedTo: 'me' },
          { id: 6, name: 'Euro Trade Partnership', company: 'Euro Trade', value: 4500000, stage: 'proposal', probability: 60, closeDate: '2024-04-15', assignedTo: 'me' }
        ],
        tasks: [
          { id: 1, title: 'Send proposal to ABC Corp', relatedTo: 'ABC Corp', type: 'task', dueDate: '2024-01-20', priority: 'high', status: 'pending', completed: false, assignedTo: 'me', assignedBy: 'admin', assignedAt: '2024-01-15' },
          { id: 2, title: 'Schedule demo with TechStart', relatedTo: 'TechStart Inc', type: 'task', dueDate: '2024-01-21', priority: 'urgent', status: 'pending', completed: false, assignedTo: 'me', assignedBy: 'admin', assignedAt: '2024-01-15' },
          { id: 3, title: 'Follow up with Chau Kitzman', relatedTo: 'Chau Kitzman', type: 'call', dueDate: '2024-01-20', priority: 'high', status: 'pending', completed: false, assignedTo: 'me', assignedBy: 'admin', assignedAt: '2024-01-16' },
          { id: 4, title: 'Prepare presentation for Kumar', relatedTo: 'Kumar Enterprises', type: 'task', dueDate: '2024-01-22', priority: 'medium', status: 'pending', completed: false, assignedTo: 'me', assignedBy: 'admin', assignedAt: '2024-01-17' },
          { id: 5, title: 'Email campaign for cold leads', relatedTo: 'Multiple', type: 'task', dueDate: '2024-01-23', priority: 'low', status: 'pending', completed: false, assignedTo: 'me', assignedBy: 'admin', assignedAt: '2024-01-18' },
          { id: 6, title: 'Review quarterly sales report', relatedTo: 'Internal', type: 'task', dueDate: '2024-01-25', priority: 'medium', status: 'pending', completed: false, assignedTo: 'me', assignedBy: 'admin', assignedAt: '2024-01-19' }
        ],
        employees: [
          { id: 1, name: 'Vaibhav Borge', email: 'vaibhav@fundingsathi.com', territory: 'Thane', role: 'employee', initials: 'VB' },
          { id: 2, name: 'Saleem Khan', email: 'saleem@fundingsathi.com', territory: 'Thane', role: 'employee', initials: 'SK' },
          { id: 3, name: 'Roshan Jadhav', email: 'roshan@fundingsathi.com', territory: 'Mumbai', role: 'employee', initials: 'RJ' }
        ],
        meetings: [
          { id: 1, title: 'Quarterly Review', relatedTo: 'ABC Corp', date: '2024-01-25', time: '10:00 AM', duration: 60, status: 'scheduled' }
        ],
        calls: [
          { id: 1, subject: 'Follow up with Lead', relatedTo: 'Chau Kitzman', relatedType: 'lead', startTime: '2024-01-20T11:46:00', duration: 15, status: 'completed', notes: 'Discussed requirements' }
        ],
        activities: [
          { id: 1, type: 'call', description: 'Called Chau Kitzman', relatedTo: 'Chau Kitzman', timestamp: '2024-01-20T11:46:00', user: 'me' },
          { id: 2, type: 'email', description: 'Sent proposal to ABC Corp', relatedTo: 'ABC Corp', timestamp: '2024-01-19T14:30:00', user: 'me' },
          { id: 3, type: 'meeting', description: 'Meeting with TechStart', relatedTo: 'TechStart Inc', timestamp: '2024-01-18T10:00:00', user: 'me' },
          { id: 4, type: 'task', description: 'Completed task: Update CRM', relatedTo: 'Internal', timestamp: '2024-01-17T16:00:00', user: 'me' },
          { id: 5, type: 'call', description: 'Called Rajesh Kumar', relatedTo: 'Rajesh Kumar', timestamp: '2024-01-16T11:00:00', user: 'me' }
        ],
        sodReports: [],
        eodReports: [],
        wodReports: [],
        settings: { theme: 'light', notifications: true }
      }
      localStorage.setItem('crm_data', JSON.stringify(initialData))
    } else {
      const existingData = JSON.parse(localStorage.getItem('crm_data') || '{}')
      let updated = false

      if (!Array.isArray(existingData.loanApplications) || existingData.loanApplications.length === 0) {
        existingData.loanApplications = [
          { id: 1, applicationId: 'LA-101', leadId: 7, leadCompany: 'ABC Corporation', lenderName: 'HDFC Bank', productType: 'Working Capital', loanAmount: 1500000, appliedAmount: 1500000, sanctionedAmount: 1400000, disbursalAmount: 0, tenor: '12 months', applicationStatus: 'Proposal Shared', assignedExecutive: 'Vaibhav Borge', submissionDate: '2024-03-05', lenderCaseId: 'HDFC-001', lastUpdate: '2024-03-08', remarks: 'Awaiting lender query' },
          { id: 2, applicationId: 'LA-102', leadId: 8, leadCompany: 'TechStart India', lenderName: 'Kotak Mahindra Bank', productType: 'Supply Chain Finance', loanAmount: 2100000, appliedAmount: 2100000, sanctionedAmount: 0, disbursalAmount: 0, tenor: '18 months', applicationStatus: 'Documentation', assignedExecutive: 'Saleem Khan', submissionDate: '2024-03-10', lenderCaseId: 'KOTAK-004', lastUpdate: '2024-03-14', remarks: 'Document pack sent' },
          { id: 3, applicationId: 'LA-103', leadId: 9, leadCompany: 'Kumar Enterprises', lenderName: 'ICICI Bank', productType: 'Term Loan', loanAmount: 2800000, appliedAmount: 2800000, sanctionedAmount: 0, disbursalAmount: 0, tenor: '24 months', applicationStatus: 'Negotiation', assignedExecutive: 'Roshan Chawan', submissionDate: '2024-03-12', lenderCaseId: 'ICICI-009', lastUpdate: '2024-03-15', remarks: 'Terms under review' },
          { id: 4, applicationId: 'LA-104', leadId: 4, leadCompany: 'Morlong Associates', lenderName: 'Axis Bank', productType: 'Invoice Discounting', loanAmount: 1200000, appliedAmount: 1200000, sanctionedAmount: 1200000, disbursalAmount: 500000, tenor: '9 months', applicationStatus: 'Disbursed', assignedExecutive: 'Vaibhav Borge', submissionDate: '2024-03-20', lenderCaseId: 'AXIS-077', lastUpdate: '2024-03-22', remarks: 'First tranche disbursed' },
          { id: 5, applicationId: 'LA-105', leadId: 3, leadCompany: 'Kwik Kopy Printing', lenderName: 'State Bank of India', productType: 'Equipment Loan', loanAmount: 480000, appliedAmount: 480000, sanctionedAmount: 430000, disbursalAmount: 0, tenor: '36 months', applicationStatus: 'Sanctioned', assignedExecutive: 'Saleem Khan', submissionDate: '2024-03-18', lenderCaseId: 'SBI-212', lastUpdate: '2024-03-20', remarks: 'Sanction letter issued' }
        ]
        updated = true
      }

      if (!Array.isArray(existingData.lenderQueries) || existingData.lenderQueries.length === 0) {
        existingData.lenderQueries = [
          { id: 1, applicationId: 1, leadId: 7, description: 'Need updated balance sheet and GST returns for the last 12 months', status: 'Open', raisedBy: 'HDFC Team', createdAt: '2024-03-06' },
          { id: 2, applicationId: 2, leadId: 8, description: 'Please confirm supplier list, invoice aging and receivable movement', status: 'Open', raisedBy: 'Kotak Team', createdAt: '2024-03-11' },
          { id: 3, applicationId: 4, leadId: 4, description: 'Submit latest export orders, stock statement and buyer confirmations', status: 'Open', raisedBy: 'Axis Team', createdAt: '2024-03-21' }
        ]
        updated = true
      }

      if (!Array.isArray(existingData.documents)) {
        existingData.documents = [
          { id: 1, name: 'ABC Corporation Contract.pdf', type: 'Contract', relatedTo: 'ABC Corporation', fileSize: '2.4 MB', uploadedAt: '2024-01-10' },
          { id: 2, name: 'TechStart India Proposal.pdf', type: 'Proposal', relatedTo: 'TechStart India', fileSize: '1.8 MB', uploadedAt: '2024-01-12' },
          { id: 3, name: 'Kumar Enterprises Financials.xlsx', type: 'Financials', relatedTo: 'Kumar Enterprises', fileSize: '1.2 MB', uploadedAt: '2024-01-15' },
          { id: 4, name: 'HDFC Sanction Letter.pdf', type: 'Sanction Letter', relatedTo: 'ABC Corporation', fileSize: '420 KB', uploadedAt: '2024-03-09' },
          { id: 5, name: 'Kotak Query Pack.pdf', type: 'Query Document', relatedTo: 'TechStart India', fileSize: '1.1 MB', uploadedAt: '2024-03-14' }
        ]
        updated = true
      }

      if (updated) {
        localStorage.setItem('crm_data', JSON.stringify(existingData))
      }
    }
  },

  // Get all data
  getAll() {
    return JSON.parse(localStorage.getItem('crm_data') || '{}')
  },

  // Save all data
  saveAll(data) {
    localStorage.setItem('crm_data', JSON.stringify(data))
  },

  // Generic CRUD operations
  get(collection) {
    const data = this.getAll()
    return data[collection] || []
  },

  getById(collection, id) {
    return this.get(collection).find(item => String(item.id) === String(id))
  },

  getLoanApplications(leadId) {
    return this.get('loanApplications').filter(item => String(item.leadId) === String(leadId))
  },

  getLenderQueries(applicationId) {
    return this.get('lenderQueries').filter(item => String(item.applicationId) === String(applicationId))
  },

  add(collection, item) {
    const data = this.getAll()
    if (!data[collection]) data[collection] = []
    item.id = item.id || Date.now()
    item.createdAt = item.createdAt || new Date().toISOString()
    data[collection].push(item)
    this.saveAll(data)
    return item
  },

  update(collection, id, updates) {
    const data = this.getAll()
    const index = data[collection].findIndex(item => item.id === id)
    if (index !== -1) {
      data[collection][index] = { ...data[collection][index], ...updates, updatedAt: new Date().toISOString() }
      this.saveAll(data)
      return data[collection][index]
    }
    return null
  },

  delete(collection, id) {
    const data = this.getAll()
    data[collection] = data[collection].filter(item => item.id !== id)
    this.saveAll(data)
    return true
  },

  // Search functionality
  search(collection, query, fields) {
    const items = this.get(collection)
    const lowerQuery = query.toLowerCase()
    return items.filter(item => 
      fields.some(field => 
        String(item[field] || '').toLowerCase().includes(lowerQuery)
      )
    )
  },

  // Filter functionality
  filter(collection, filters) {
    let items = this.get(collection)
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        items = items.filter(item => item[key] === filters[key])
      }
    })
    return items
  },

  // Get counts
  count(collection, filters = {}) {
    return this.filter(collection, filters).length
  },

  // Get dashboard stats
  getDashboardStats() {
    const leads = this.get('leads')
    const deals = this.get('deals')
    const tasks = this.get('tasks')
    const calls = this.get('calls')
    const contacts = this.get('contacts')

    const totalLeads = leads.length
    const hotLeads = leads.filter(l => l.status === 'hot').length
    const warmLeads = leads.filter(l => l.status === 'warm').length
    const coldLeads = leads.filter(l => l.status === 'cold').length

    const totalDeals = deals.length
    const openDeals = deals.filter(d => !['closed-won', 'closed-lost'].includes(d.stage)).length
    const wonDeals = deals.filter(d => d.stage === 'closed-won').length
    const lostDeals = deals.filter(d => d.stage === 'closed-lost').length

    const totalDealValue = deals.reduce((sum, d) => sum + (d.value || 0), 0)
    const wonValue = deals.filter(d => d.stage === 'closed-won').reduce((sum, d) => sum + (d.value || 0), 0)

    const conversionRate = totalLeads > 0 ? Math.round((wonDeals / totalLeads) * 100) : 0

    const pendingTasks = tasks.filter(t => !t.completed).length
    const completedTasks = tasks.filter(t => t.completed).length

    // Calculate forecast based on pipeline deals
    const pipelineValue = deals.filter(d => !['closed-won', 'closed-lost'].includes(d.stage))
      .reduce((sum, d) => sum + (d.value || 0) * 0.3, 0)
    const forecastProbability = openDeals > 0 ? Math.min(85, 30 + openDeals * 5) : 0

    // Current month revenue
    const now = new Date()
    const currentMonthDeals = deals.filter(d => {
      const dealDate = new Date(d.updatedAt || d.createdAt)
      return d.stage === 'closed-won' && dealDate.getMonth() === now.getMonth() && dealDate.getFullYear() === now.getFullYear()
    })
    const currentMonthRevenue = currentMonthDeals.reduce((sum, d) => sum + (d.value || 0), 0)

    // Compare with last month
    const lastMonthDeals = deals.filter(d => {
      const dealDate = new Date(d.updatedAt || d.createdAt)
      const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1
      const lastYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
      return d.stage === 'closed-won' && dealDate.getMonth() === lastMonth && dealDate.getFullYear() === lastYear
    })
    const lastMonthRevenue = lastMonthDeals.reduce((sum, d) => sum + (d.value || 0), 0)

    return {
      leads: { total: totalLeads, new: leads.filter(l => l.status === 'new').length, contacted: leads.filter(l => l.status === 'contacted').length, qualified: leads.filter(l => l.status === 'qualified').length, hot: hotLeads, warm: warmLeads, cold: coldLeads },
      deals: { total: totalDeals, open: openDeals, won: wonDeals, lost: lostDeals, totalValue: totalDealValue, wonValue: wonValue },
      tasks: { pending: pendingTasks, completed: completedTasks, total: tasks.length },
      calls: calls.length,
      contacts: contacts.length,
      conversionRate,
      forecast: { amount: Math.round(pipelineValue), probability: forecastProbability },
      revenue: { currentMonth: currentMonthRevenue, lastMonth: lastMonthRevenue, trend: currentMonthRevenue >= lastMonthRevenue ? 'up' : 'down' }
    }
  },

  // Pipeline stages
  getPipelineData() {
    const deals = this.get('deals')
    const stages = ['prospecting', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost']
    const stageLabels = {
      'prospecting': 'Prospecting',
      'qualified': 'Qualified',
      'proposal': 'Proposal',
      'negotiation': 'Negotiation',
      'closed-won': 'Closed Won',
      'closed-lost': 'Closed Lost'
    }
    
    return stages.map(stage => {
      const stageDeals = deals.filter(d => d.stage === stage)
      return {
        stage,
        label: stageLabels[stage],
        count: stageDeals.length,
        value: stageDeals.reduce((sum, d) => sum + (d.value || 0), 0)
      }
    })
  },

  // Revenue by source
  getRevenueBySource() {
    const leads = this.get('leads')
    const sources = ['referral', 'web', 'linkedin', 'campaign', 'cold-email']
    
    return sources.map(source => {
      const sourceLeads = leads.filter(l => l.source === source)
      return {
        source,
        count: sourceLeads.length,
        value: sourceLeads.reduce((sum, l) => sum + (l.dealValue || 0), 0)
      }
    }).sort((a, b) => b.value - a.value)
  },

  // Toggle task completion
  toggleTask(taskId) {
    const task = this.getById('tasks', taskId)
    if (task) {
      return this.update('tasks', taskId, { 
        completed: !task.completed, 
        status: !task.completed ? 'completed' : 'pending',
        completedAt: !task.completed ? new Date().toISOString() : null
      })
    }
    return null
  },

  // Add activity
  addActivity(type, description, relatedTo) {
    const user = typeof S !== 'undefined' ? S?.name : 'me'
    return this.add('activities', {
      type,
      description,
      relatedTo,
      timestamp: new Date().toISOString(),
      user: user || 'me'
    })
  }
}

// Auto-initialize when loaded
DataStore.init()

// Export for module systems if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataStore
}
