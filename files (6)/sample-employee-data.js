/**
 * Sample Employee Data for CRM
 * This file contains sample employee data to populate the Employees section
 */

const sampleEmployeeData = {
  "shree.rathod@funding-sathi.com": {
    displayName: "Shree Rathod",
    email: "shree.rathod@funding-sathi.com",
    phone: "+91-9876543210",
    role: "Admin",
    department: "Management",
    status: "active",
    createdAt: new Date('2024-01-15').getTime(),
    lastActive: "Today"
  },
  "raj.patel@funding-sathi.com": {
    displayName: "Raj Patel",
    email: "raj.patel@funding-sathi.com",
    phone: "+91-9876543211",
    role: "Manager",
    department: "Sales",
    status: "active",
    createdAt: new Date('2024-02-20').getTime(),
    lastActive: "Today"
  },
  "priya.sharma@funding-sathi.com": {
    displayName: "Priya Sharma",
    email: "priya.sharma@funding-sathi.com",
    phone: "+91-9876543212",
    role: "Sales",
    department: "Sales",
    status: "active",
    createdAt: new Date('2024-03-10').getTime(),
    lastActive: "2 hours ago"
  },
  "amit.kumar@funding-sathi.com": {
    displayName: "Amit Kumar",
    email: "amit.kumar@funding-sathi.com",
    phone: "+91-9876543213",
    role: "Telecaller",
    department: "Customer Support",
    status: "active",
    createdAt: new Date('2024-03-15').getTime(),
    lastActive: "5 minutes ago"
  },
  "neha.gupta@funding-sathi.com": {
    displayName: "Neha Gupta",
    email: "neha.gupta@funding-sathi.com",
    phone: "+91-9876543214",
    role: "Manager",
    department: "Sales",
    status: "active",
    createdAt: new Date('2024-04-01').getTime(),
    lastActive: "1 hour ago"
  },
  "vikram.singh@funding-sathi.com": {
    displayName: "Vikram Singh",
    email: "vikram.singh@funding-sathi.com",
    phone: "+91-9876543215",
    role: "Telecaller",
    department: "Customer Support",
    status: "inactive",
    createdAt: new Date('2024-04-10').getTime(),
    lastActive: "3 days ago"
  },
  "sarah.khan@funding-sathi.com": {
    displayName: "Sarah Khan",
    email: "sarah.khan@funding-sathi.com",
    phone: "+91-9876543216",
    role: "Sales",
    department: "Sales",
    status: "active",
    createdAt: new Date('2024-05-01').getTime(),
    lastActive: "Now"
  },
  "arjun.reddy@funding-sathi.com": {
    displayName: "Arjun Reddy",
    email: "arjun.reddy@funding-sathi.com",
    phone: "+91-9876543217",
    role: "Viewer",
    department: "Analytics",
    status: "active",
    createdAt: new Date('2024-05-05').getTime(),
    lastActive: "Yesterday"
  }
};

// Function to initialize sample data
function initializeSampleEmployeeData() {
  try {
    const existingUsers = JSON.parse(localStorage.getItem('crm_users') || '{}');
    const mergedUsers = { ...sampleEmployeeData, ...existingUsers };
    localStorage.setItem('crm_users', JSON.stringify(mergedUsers));
    console.log('Sample employee data initialized');
    
    // Reload employees if function exists
    if (typeof loadEmployees === 'function') {
      loadEmployees();
    }
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { sampleEmployeeData, initializeSampleEmployeeData };
}

// Make available globally
if (typeof window !== 'undefined') {
  window.sampleEmployeeData = sampleEmployeeData;
  window.initializeSampleEmployeeData = initializeSampleEmployeeData;
}