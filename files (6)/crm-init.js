// ═══════════════════════════════════════════════════════════════
// CRM INITIALIZATION - Session, Data Seeding & Setup
// ═══════════════════════════════════════════════════════════════

function titleCase(text) {
  return String(text || '').trim().replace(/\w\S*/g, word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
}

function inferFullName(name, email) {
  const trimmed = String(name || '').trim()
  if (trimmed && trimmed.split(/\s+/).length > 1) return titleCase(trimmed)
  if (trimmed) return titleCase(trimmed)
  if (!email) return ''

  const userPart = email.split('@')[0].replace(/[_]/g, '.').trim()
  const pieces = userPart.split('.').filter(Boolean)
  return pieces.length ? pieces.map(titleCase).join(' ') : titleCase(userPart)
}

function getUserDisplayName(user) {
  if (!user) return ''
  const rawName = user.displayName || user.name || ''
  return inferFullName(rawName, user.email)
}

// Firebase sync helpers for cross-device persistence
let firebaseSyncEnabled = false
let firebaseSyncModules = null

async function loadFirebaseSyncModules() {
  if (firebaseSyncModules) return firebaseSyncModules
  try {
    const authModule = await import('../firebase-auth.js')
    const dbModule = await import('../firebase-database.js')
    firebaseSyncModules = { auth: authModule, db: dbModule }
    return firebaseSyncModules
  } catch (error) {
    console.warn('Firebase sync modules could not be loaded', error)
    return null
  }
}

async function getFirebaseUser() {
  const modules = await loadFirebaseSyncModules()
  if (!modules) return null
  let user = modules.auth.getCurrentUser()
  if (user) return user

  return new Promise(resolve => {
    const unsubscribe = modules.auth.onAuthStateChange((nextUser) => {
      if (nextUser) {
        unsubscribe()
        resolve(nextUser)
      }
    })
    setTimeout(() => {
      unsubscribe()
      resolve(null)
    }, 5000)
  })
}

async function initFirebaseSync() {
  if (!S) return false
  const modules = await loadFirebaseSyncModules()
  if (!modules) return false

  const currentUser = await getFirebaseUser()
  if (!currentUser) {
    console.warn('Firebase session missing or not yet available, skipping sync')
    return false
  }

  if (!S.uid) {
    S.uid = currentUser.uid
    if (!S.displayName && currentUser.displayName) {
      S.displayName = currentUser.displayName
    }
    localStorage.setItem('crm_session', JSON.stringify(S))
  }

  if (currentUser.uid !== S.uid) {
    console.warn('Firebase session uid mismatch. Expected:', S.uid, 'Got:', currentUser.uid)
    return false
  }

  firebaseSyncEnabled = true
  return true
}

function mergeFirebaseEntries(existing = [], incoming = []) {
  const merged = new Map()
  existing.forEach(item => merged.set(String(item.id), item))
  incoming.forEach(item => {
    const id = String(item.id || '')
    if (!id) return
    const existingItem = merged.get(id)
    merged.set(id, existingItem ? { ...existingItem, ...item } : item)
  })
  return Array.from(merged.values())
}

async function fetchFirebaseCollection(collectionName) {
  const modules = await loadFirebaseSyncModules()
  if (!modules) return []
  const result = await modules.db.getCollection(collectionName)
  if (!result.success) {
    console.warn(`Unable to fetch ${collectionName} from Firebase`, result.error)
    return []
  }
  return Array.isArray(result.data) ? result.data : []
}

async function saveFirebaseEntry(collectionName, entry) {
  if (!firebaseSyncEnabled || !entry || !entry.id) return
  const modules = await loadFirebaseSyncModules()
  if (!modules) return
  try {
    await modules.db.createDocument(collectionName, entry, String(entry.id))
  } catch (error) {
    console.warn(`Failed to persist ${collectionName} entry to Firebase`, error)
  }
}

async function deleteFirebaseEntry(collectionName, entryId) {
  if (!firebaseSyncEnabled || !entryId) return
  const modules = await loadFirebaseSyncModules()
  if (!modules) return
  try {
    await modules.db.deleteDocument(collectionName, String(entryId))
  } catch (error) {
    console.warn(`Failed to delete ${collectionName} entry from Firebase`, error)
  }
}

let firebaseListeners = []

function stopFirebaseListeners() {
  firebaseListeners.forEach(unsubscribe => {
    if (typeof unsubscribe === 'function') {
      try { unsubscribe() } catch (err) { console.warn('Error stopping Firebase listener', err) }
    }
  })
  firebaseListeners = []
}

async function startFirebaseListeners() {
  if (!firebaseSyncEnabled) return
  const modules = await loadFirebaseSyncModules()
  if (!modules || !modules.db || typeof modules.db.listenToCollection !== 'function') return

  stopFirebaseListeners()

  const subscribe = (collectionName, callback) => {
    try {
      const unsubscribe = modules.db.listenToCollection(collectionName, [], callback)
      if (typeof unsubscribe === 'function') firebaseListeners.push(unsubscribe)
    } catch (err) {
      console.warn(`Firebase listener error for ${collectionName}`, err)
    }
  }

  subscribe('leadJourneys', (documents) => {
    if (!Array.isArray(documents)) return
    saveLeadsJourney(mergeFirebaseEntries(getLeadsJourney(), documents))
    if (typeof renderLeads === 'function') renderLeads()
    if (typeof renderAll === 'function') renderAll()
  })

  subscribe('leads', (documents) => {
    if (!Array.isArray(documents)) return
    const store = DataStore.getAll()
    store.leads = mergeFirebaseEntries(store.leads || [], documents)
    DataStore.saveAll(store)
    if (typeof renderLeads === 'function') renderLeads()
    if (typeof renderAll === 'function') renderAll()
  })

  subscribe('sodReports', (documents) => {
    if (!Array.isArray(documents)) return
    saveSOD(mergeFirebaseEntries(getSOD(), documents))
    if (typeof renderAll === 'function') renderAll()
  })

  subscribe('eodReports', (documents) => {
    if (!Array.isArray(documents)) return
    saveEOD(mergeFirebaseEntries(getEOD(), documents))
    if (typeof renderAll === 'function') renderAll()
  })

  subscribe('wodReports', (documents) => {
    if (!Array.isArray(documents)) return
    saveWOD(mergeFirebaseEntries(getWOD(), documents))
    if (typeof renderAll === 'function') renderAll()
  })
}

async function syncFirebaseData() {
  if (!firebaseSyncEnabled) return

  const [sodEntries, eodEntries, wodEntries, leadJourneyEntries, leadEntries] = await Promise.all([
    fetchFirebaseCollection('sodReports'),
    fetchFirebaseCollection('eodReports'),
    fetchFirebaseCollection('wodReports'),
    fetchFirebaseCollection('leadJourneys'),
    fetchFirebaseCollection('leads')
  ])

  if (sodEntries.length) saveSOD(mergeFirebaseEntries(getSOD(), sodEntries))
  if (eodEntries.length) saveEOD(mergeFirebaseEntries(getEOD(), eodEntries))
  if (wodEntries.length) saveWOD(mergeFirebaseEntries(getWOD(), wodEntries))
  if (leadJourneyEntries.length) saveLeadsJourney(mergeFirebaseEntries(getLeadsJourney(), leadJourneyEntries))

  if (leadEntries.length) {
    const store = DataStore.getAll()
    store.leads = mergeFirebaseEntries(store.leads || [], leadEntries)
    DataStore.saveAll(store)
  }
}

// Initialize session
async function initSession() {
  const raw = localStorage.getItem('crm_session')
  if (!raw) { window.location.href = 'login.html'; return }
  S = JSON.parse(raw)
  S.name = inferFullName(S.name || S.displayName || '', S.email)
  if (!S.initials) {
    S.initials = String(S.name || '')
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }
  localStorage.setItem('crm_session', JSON.stringify(S))
  if (S.role === 'admin') document.body.classList.add('admin')

  // Update UI with user info
  const sbAvatar = document.getElementById('sbAvatar')
  const sbName = document.getElementById('sbName')
  const sbTitle = document.getElementById('sbTitle')
  const topName = document.getElementById('topName')
  const topRole = document.getElementById('topRole')

  if (sbAvatar) sbAvatar.textContent = S.initials || ini(S.name)
  if (sbName) sbName.textContent = S.name
  if (sbTitle) sbTitle.textContent = S.title
  if (topName) topName.textContent = S.name
  if (topRole) {
    const roleLabels = {
      admin: 'Admin',
      sales_executive: 'Sales Executive',
      branch_manager: 'Branch Manager',
      loan_processing_executive: 'Loan Processing Executive',
      sub_dsa_connector: 'Sub-DSA Connector',
      finance_accounts: 'Finance Accounts',
      employee: 'Employee'
    }
    const roleText = roleLabels[S.role] || S.role?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Employee'
    topRole.textContent = roleText
    topRole.className = 'role-pill ' + (S.role === 'admin' ? 'admin' : 'employee')
  }

  // Display lender permissions for current user
  displayLenderPermissions(S.role);

  // Seed data once per version
  if (localStorage.getItem('crm_seeded') !== 'v3') {
    try {
      const existingSOD = JSON.parse(localStorage.getItem('crm_leads') || '[]').filter(l => !l.isHistorical)
      localStorage.setItem('crm_leads', JSON.stringify([...HISTORICAL_LEADS, ...existingSOD]))
      const existingEOD = JSON.parse(localStorage.getItem('crm_eod') || '[]').filter(l => !l.isHistorical)
      localStorage.setItem('crm_eod', JSON.stringify([...HISTORICAL_EOD, ...existingEOD]))
      const existingWOD = JSON.parse(localStorage.getItem('crm_wod') || '[]').filter(l => !l.isHistorical)
      localStorage.setItem('crm_wod', JSON.stringify([...HISTORICAL_WOD, ...existingWOD]))
      const existingLeads = JSON.parse(localStorage.getItem('crm_leads_journey') || '[]').filter(l => !l.isHistorical)
      localStorage.setItem('crm_leads_journey', JSON.stringify([...HISTORICAL_LEADS_JOURNEY, ...existingLeads]))
      localStorage.setItem('crm_seeded', 'v3')
    } catch (e) { console.warn('Seed error', e) }
  }

  // Initialize employees data if missing (for task assignment feature)
  const crmData = JSON.parse(localStorage.getItem('crm_data') || '{}')
  if (!crmData.employees || crmData.employees.length === 0) {
    crmData.employees = [
      { id: 1, name: 'Vaibhav Borge', email: 'vaibhav@fundingsathi.com', territory: 'Thane', role: 'employee', initials: 'VB' },
      { id: 2, name: 'Saleem Khan', email: 'saleem@fundingsathi.com', territory: 'Thane', role: 'employee', initials: 'SK' },
      { id: 3, name: 'Roshan Jadhav', email: 'roshan@fundingsathi.com', territory: 'Mumbai', role: 'employee', initials: 'RJ' }
    ]
    localStorage.setItem('crm_data', JSON.stringify(crmData))
  }

  // Initialize meetings if empty
  if (!localStorage.getItem('crm_meetings')) {
    localStorage.setItem('crm_meetings', JSON.stringify([
      { id: 'MTG-001', title: 'ABC Steel Corp – Product Demo', date: '25/04/2026', time: '10:00', type: 'Product Demo', attendee: 'Rajesh Kumar', attendeeEmail: '', company: 'ABC Steel Corp', status: 'scheduled', notes: 'Bring updated pricing sheet', createdBy: 'vaibhav@fundingsathi.com', createdByName: 'Vaibhav Borge', sendReminder: true },
      { id: 'MTG-002', title: 'Cipla Follow-up Call', date: '24/04/2026', time: '15:00', type: 'Follow-up', attendee: 'Dr Priya Nair', attendeeEmail: '', company: 'Cipla', status: 'scheduled', notes: 'Prepare documentation checklist', createdBy: 'saleem@fundingsathi.com', createdByName: 'Saleem Khan', sendReminder: true }
    ]))
  }

  // Sample calls data
  if (!localStorage.getItem('crm_calls')) {
    localStorage.setItem('crm_calls', JSON.stringify([
      {
        id: 'CALL-001', timestamp: '2026-04-23T05:30:00.000Z',
        customerName: 'Rajesh Kumar', phone: '+91 98765 43210', email: 'rajesh@abcsteel.com', company: 'ABC Steel Corp',
        date: '23/04/2026', time: '10:30', duration: 12, direction: 'Outbound',
        outcome: 'Follow-up Required', priority: 'High',
        nextAction: 'Send vendor finance proposal', followupDate: '25/04/2026',
        summary: 'Customer interested in vendor finance solution for their suppliers. Need to share detailed proposal and pricing.',
        sentiment: 'Positive', products: 'Vendor Finance',
        agentName: 'Vaibhav Borge', agentEmail: 'vaibhav@fundingsathi.com',
        alert: false, hasRecording: false, recordingDuration: null
      },
      {
        id: 'CALL-002', timestamp: '2026-04-23T06:15:00.000Z',
        customerName: 'Priya Sharma', phone: '+91 87654 32109', email: 'priya@techsolutions.in', company: 'TechSolutions India',
        date: '23/04/2026', time: '11:45', duration: 8, direction: 'Inbound',
        outcome: 'Resolved', priority: 'Medium',
        nextAction: null, followupDate: null,
        summary: 'Answered questions about export factoring process. Customer satisfied with information.',
        sentiment: 'Positive', products: 'Export Factoring',
        agentName: 'Saleem Khan', agentEmail: 'saleem@fundingsathi.com',
        alert: false, hasRecording: false, recordingDuration: null
      }
    ]))
  }

  // Check for today's meetings
  checkTodaysMeetings()

  // Initialize EmailJS
  emailjs.init('YOUR_PUBLIC_KEY')

  // Admin vs Employee UI adjustments
  if (S.role === 'admin') {
    const histExecF = document.getElementById('histExecF')
    const eodExecF = document.getElementById('eodExecF')
    const wodExecF = document.getElementById('wodExecF')
    const leadExecF = document.getElementById('leadExecF')
    
    if (histExecF) histExecF.style.display = 'block'
    if (eodExecF) eodExecF.style.display = 'block'
    if (wodExecF) wodExecF.style.display = 'block'
    if (leadExecF) leadExecF.style.display = 'block'

    updateElementText('leadsTitle', 'All Lead Journeys')
    updateElementText('leadsSub', 'Complete database from all executives')
    updateElementText('sodHistTitle', 'All SOD Reports')
    updateElementText('sodHistSub', 'Every SOD from all team members')
    updateElementText('eodHistSub', 'Every EOD from all team members')
    updateElementText('wodHistSub', 'All weekly reports')
  } else {
    updateElementText('leadsTitle', 'My Leads')
    updateElementText('leadsSub', 'Your personal lead entries')
    updateElementText('sodHistSub', 'Your submitted SOD reports')
    updateElementText('eodHistSub', 'Your submitted EOD reports')
    updateElementText('wodHistSub', 'Your weekly reports')
  }

  // Show Meet Tools only for admin and member roles
  const role = S?.role?.toLowerCase()
  if (role === 'admin' || role === 'member') {
    const meetToolsNav = document.getElementById('nav-meet-tools')
    if (meetToolsNav) meetToolsNav.style.display = 'flex'
  }

  // Show Task Assign only for admin and member roles (hide for employees)
  if (role === 'admin' || role === 'member') {
    const taskAssignNav = document.getElementById('nav-task-assign')
    if (taskAssignNav) taskAssignNav.style.display = 'flex'
  }

  if (S.uid) {
    try {
      await initFirebaseSync()
      await syncFirebaseData()
      await startFirebaseListeners()
    } catch (e) {
      console.warn('Firebase sync failed', e)
    }
  }
  buildMonthFilter()
  prefillForms()
  renderAll()
}

// Helper to safely update element text
function updateElementText(id, text) {
  const el = document.getElementById(id)
  if (el) el.textContent = text
}

// Display lender permissions for current user role
function displayLenderPermissions(role) {
  console.log('🏦 Lender Access Permissions for ' + role + ':');

  const permissions = {
    admin: {
      getLenders: '✅ Full access - Can view all lenders',
      getActiveLenders: '✅ Full access - Can view active lenders',
      createLender: '✅ Full access - Can create new lenders',
      updateLender: '✅ Full access - Can update lender details',
      deleteLender: '✅ Full access - Can delete lenders',
      getLenderById: '✅ Full access - Can view specific lenders'
    },
    branch_manager: {
      getLenders: '❌ Access denied - Admin only',
      getActiveLenders: '✅ Read-only - Can view active lenders for reference',
      createLender: '❌ Access denied - Admin only',
      updateLender: '❌ Access denied - Admin only',
      deleteLender: '❌ Access denied - Admin only',
      getLenderById: '✅ Read-only - Can view specific active lenders'
    },
    sales_executive: {
      getLenders: '❌ Access denied - Admin only',
      getActiveLenders: '✅ Read-only - Can view active lenders for reference',
      createLender: '❌ Access denied - Admin only',
      updateLender: '❌ Access denied - Admin only',
      deleteLender: '❌ Access denied - Admin only',
      getLenderById: '✅ Read-only - Can view specific active lenders'
    },
    loan_processing_executive: {
      getLenders: '❌ Access denied - Admin only',
      getActiveLenders: '✅ Read-only - Can view active lenders for reference',
      createLender: '❌ Access denied - Admin only',
      updateLender: '❌ Access denied - Admin only',
      deleteLender: '❌ Access denied - Admin only',
      getLenderById: '✅ Read-only - Can view specific active lenders'
    },
    sub_dsa_connector: {
      getLenders: '❌ Access denied',
      getActiveLenders: '❌ Access denied',
      createLender: '❌ Access denied',
      updateLender: '❌ Access denied',
      deleteLender: '❌ Access denied',
      getLenderById: '❌ Access denied'
    },
    finance_accounts: {
      getLenders: '❌ Access denied',
      getActiveLenders: '❌ Access denied',
      createLender: '❌ Access denied',
      updateLender: '❌ Access denied',
      deleteLender: '❌ Access denied',
      getLenderById: '❌ Access denied'
    }
  };

  const userPerms = permissions[role] || permissions['sub_dsa_connector'];
  Object.entries(userPerms).forEach(([method, access]) => {
    console.log(`  ${method}(): ${access}`);
  });

  console.log('\n💡 Note: These permissions apply to Firebase-based lender management.');
  console.log('   The localStorage-based CRM may have different access controls.');
}

// Logout function
function logout() {
  localStorage.removeItem('crm_session')
  window.location.href = 'login.html'
}

// Build month filter for history
function buildMonthFilter() {
  const all = [...getSOD(), ...getEOD(), ...getWOD()]
  const months = new Set()
  all.forEach(l => {
    if (l.date) {
      const [d, m, y] = l.date.split('/')
      if (y && m) months.add(`${y}-${m}`)
    }
  })
  const sorted = [...months].sort().reverse()
  const sel = document.getElementById('histMonthF')
  if (sel) {
    sel.innerHTML = '<option value="">All Months</option>' + sorted.map(m => {
      const [y, mo] = m.split('-')
      const label = new Date(`${y}-${mo}-01`).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
      return `<option value="${m}">${label}</option>`
    }).join('')
  }
}

// Data accessors
function getSOD() { return JSON.parse(localStorage.getItem('crm_leads') || '[]') }
function saveSOD(d) { localStorage.setItem('crm_leads', JSON.stringify(d)) }
function getEOD() { return JSON.parse(localStorage.getItem('crm_eod') || '[]') }
function saveEOD(d) { localStorage.setItem('crm_eod', JSON.stringify(d)) }
function getWOD() { return JSON.parse(localStorage.getItem('crm_wod') || '[]') }
function saveWOD(d) { localStorage.setItem('crm_wod', JSON.stringify(d)) }
function getLeadsJourney() { return JSON.parse(localStorage.getItem('crm_leads_journey') || '[]') }
function saveLeadsJourney(d) { localStorage.setItem('crm_leads_journey', JSON.stringify(d)) }
function getMtgs() { return JSON.parse(localStorage.getItem('crm_meetings') || '[]') }
function saveMtgs(d) { localStorage.setItem('crm_meetings', JSON.stringify(d)) }

// Role-based data access
function mySOD() { const all = getSOD(); return S.role === 'admin' ? all : all.filter(l => l.createdBy === S.email || l.salesExecutive === S.name) }
function myEOD() { const all = getEOD(); return S.role === 'admin' ? all : all.filter(l => l.createdBy === S.email || l.salesExecutive === S.name) }
function myWOD() { const all = getWOD(); return S.role === 'admin' ? all : all.filter(l => l.createdBy === S.email || l.salesExecutive === S.name) }
function myLeadsJ() { const all = getLeadsJourney(); return S.role === 'admin' ? all : all.filter(l => l.createdBy === S.email || l.salesExecutive === S.name) }
function myMtgs() { const all = getMtgs(); return S.role === 'admin' ? all : all.filter(m => m.createdBy === S.email) }

// Support toggle
function setSupportToggle(val) {
  supportSelected = val
  const suppNo = document.getElementById('suppNo')
  const suppYes = document.getElementById('suppYes')
  const supportField = document.getElementById('supportField')
  const suppHint = document.getElementById('suppHint')
  const sSupport = document.getElementById('sSupport')

  if (suppNo) suppNo.classList.toggle('selected', val === 'No')
  if (suppYes) suppYes.classList.toggle('selected', val === 'Yes')
  if (supportField) supportField.style.display = val === 'Yes' ? 'block' : 'none'
  if (suppHint) suppHint.textContent = val === 'Yes' ? 'Describe the support needed:' : 'No support needed'
  if (val === 'Yes') {
    if (sSupport) sSupport.focus()
  } else {
    if (sSupport) sSupport.value = ''
  }
}

// Prefill forms with defaults
function prefillForms() {
  const now = new Date()
  const todayVal = now.toISOString().split('T')[0]

  const sDate = document.getElementById('sDate')
  const eDate = document.getElementById('eDate')
  const lDate = document.getElementById('lDate')
  const lFirstCall = document.getElementById('lFirstCall')

  if (sDate) sDate.value = todayVal
  if (eDate) eDate.value = todayVal
  if (lDate) lDate.value = todayVal
  if (lFirstCall) lFirstCall.value = todayVal

  // Week start (Monday) and end (Sunday)
  const dayOfWeek = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const wStart = document.getElementById('wStart')
  const wEnd = document.getElementById('wEnd')
  if (wStart) wStart.value = monday.toISOString().split('T')[0]
  if (wEnd) wEnd.value = sunday.toISOString().split('T')[0]

  const sEmail = document.getElementById('sEmail')
  const sodHeroDate = document.getElementById('sodHeroDate')
  const sodHeroUser = document.getElementById('sodHeroUser')
  const eodHeroDate = document.getElementById('eodHeroDate')
  const eodHeroUser = document.getElementById('eodHeroUser')
  const wodHeroUser = document.getElementById('wodHeroUser')
  const leadHeroUser = document.getElementById('leadHeroUser')

  if (sEmail) sEmail.value = S.email
  if (sodHeroDate) sodHeroDate.textContent = todayFull()
  if (sodHeroUser) sodHeroUser.textContent = S.name
  if (eodHeroDate) eodHeroDate.textContent = todayFull()
  if (eodHeroUser) eodHeroUser.textContent = S.name
  if (wodHeroUser) wodHeroUser.textContent = S.name
  if (leadHeroUser) leadHeroUser.textContent = S.name

  // Auto-populate Sales Executive fields with logged-in user's name
  const sExec = document.getElementById('sExec')
  const eExec = document.getElementById('eExec')
  const wExec = document.getElementById('wExec')
  const lExec = document.getElementById('lExec')

  if (sExec) sExec.value = S.name
  if (eExec) eExec.value = S.name
  if (wExec) wExec.value = S.name
  if (lExec) lExec.value = S.name

  populateExecSelectors()

  // Set territory based on email for sales executives and employees
  const isSalesExecutive = S.role === 'employee' || S.role === 'sales_executive'
  if (isSalesExecutive) {
    const tMap = { 'vaibhav@fundingsathi.com': 'Thane', 'saleem@fundingsathi.com': 'Thane', 'roshan@fundingsathi.com': 'Mumbai' }
    const sTerritory = document.getElementById('sTerritory')
    if (sTerritory) sTerritory.value = tMap[S.email] || ''
  }
}

function populateExecSelectors() {
  const storedUsers = JSON.parse(localStorage.getItem('crm_users') || '{}')
  const normalizedUsers = {}
  Object.entries(storedUsers).forEach(([email, user]) => {
    const displayName = getUserDisplayName(user)
    normalizedUsers[email] = {
      ...user,
      name: displayName,
      displayName: displayName,
      initials: user.initials || String(displayName || '')
        .split(' ')
        .filter(Boolean)
        .map(n => n[0])
        .join('')
        .toUpperCase()
    }
  })
  if (JSON.stringify(normalizedUsers) !== JSON.stringify(storedUsers)) {
    localStorage.setItem('crm_users', JSON.stringify(normalizedUsers))
  }

  const finalNames = Object.values(normalizedUsers)
    .map(user => user.name)
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index)
  const defaultNames = ['Vaibhav Borge', 'Saleem Khan', 'Roshan Chawan']
  const execNames = finalNames.length ? finalNames : defaultNames
  const isEmployeeLike = S?.role === 'employee' || S?.role === 'sales_executive'
  const loggedInName = S?.name?.trim() || ''

  ;['sExec', 'eExec', 'wExec', 'lExec'].forEach(id => {
    const el = document.getElementById(id)
    if (!el) return

    if (isEmployeeLike) {
      el.innerHTML = loggedInName
        ? `<option value="${loggedInName}">${loggedInName}</option>`
        : '<option value="">Select Executive</option>'
      el.disabled = true
      return
    }

    el.disabled = false
    el.innerHTML = '<option value="">Select Executive</option>'
    execNames.forEach(name => {
      const option = document.createElement('option')
      option.value = name
      option.textContent = name
      el.appendChild(option)
    })
  })
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  // Zia input Enter key support
  const ziaInput = document.getElementById('zia-input')
  if (ziaInput) {
    ziaInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && typeof askZia === 'function') askZia()
    })
  }
})

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initSession, logout, getSOD, saveSOD, getEOD, saveEOD, getWOD, saveWOD, getMtgs, saveMtgs, mySOD, myEOD, myWOD, myMtgs }
}
