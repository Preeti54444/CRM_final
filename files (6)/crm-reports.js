
function submitSOD() {
  const industry = document.getElementById('sIndustry')?.value?.trim()
  const target = document.getElementById('sTarget')?.value?.trim()
  const dateRaw = document.getElementById('sDate')?.value

  if (!industry) { showToast('Please enter the Focus Industry/Segment.', 'error'); return }
  if (!target) { showToast('Please enter your Target for Today.', 'error'); return }
  if (!dateRaw) { showToast('Please select a date.', 'error'); return }

  const supportVal = supportSelected === 'Yes' ? 'Yes – ' + document.getElementById('sSupport')?.value?.trim() : 'No'

  const entry = {
    id: 'SOD-' + Date.now(),
    timestamp: new Date().toLocaleString('en-IN'),
    email: S.email,
    date: fmtDate(dateRaw),
    salesExecutive: S.name,
    createdBy: S.email,
    createdByName: S.name,
    territory: document.getElementById('sTerritory')?.value?.trim() || '',
    targetLeads: target,
    keyMeetings: document.getElementById('sMeetings')?.value?.trim() || '',
    industry,
    supportNeeded: supportVal,
    remarks: document.getElementById('sRemarks')?.value?.trim() || '',
    aiScore1: parseInt(document.getElementById('sScore1')?.value) || 70,
    aiScore2: parseInt(document.getElementById('sScore2')?.value) || 65,
    aiScore3: parseInt(document.getElementById('sScore3')?.value) || 60,
    isHistorical: false
  }

  const btn = document.getElementById('sodSubmitBtn')
  if (btn) {
    btn.disabled = true
    btn.innerHTML = '<div class="spinner"></div> Submitting…'
  }

  setTimeout(() => {
    const d = getSOD()
    d.push(entry)
    saveSOD(d)
    console.debug('SOD saved:', entry.id, 'totalSOD=', getSOD().length)

    // Reset form
    const sTarget = document.getElementById('sTarget')
    const sIndustry = document.getElementById('sIndustry')
    const sMeetings = document.getElementById('sMeetings')
    const sRemarks = document.getElementById('sRemarks')
    if (sTarget) sTarget.value = ''
    if (sIndustry) sIndustry.value = ''
    if (sMeetings) sMeetings.value = ''
    if (sRemarks) sRemarks.value = ''
    setSupportToggle('No')

    if (btn) {
      btn.disabled = false
      btn.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Submit SOD Report'
    }

    showToast('SOD report submitted successfully', 'success')
    renderDashboard()
    // Update SOD history view immediately so the new entry is visible
    try { renderSODHistory() } catch (e) { /* ignore if view not present */ }
  }, 400)
}

function renderSODHistory() {
  const q = document.getElementById('histSearch')?.value?.toLowerCase() || ''
  const execF = document.getElementById('histExecF')?.value || ''
  let leads = mySOD()

  if (q) leads = leads.filter(l =>
    (l.salesExecutive && l.salesExecutive.toLowerCase().includes(q)) ||
    (l.industry && l.industry.toLowerCase().includes(q)) ||
    (l.targetLeads && l.targetLeads.toLowerCase().includes(q))
  )

  if (execF) leads = leads.filter(l => l.salesExecutive === execF)

  const tbody = document.getElementById('sodHistBody')
  const showing = document.getElementById('sodHistCount')

  if (showing) showing.textContent = leads.length

  if (tbody) {
    if (leads.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" style="padding:40px;text-align:center;color:var(--gray-400);">No SOD reports found</td></tr>'
    } else {
      tbody.innerHTML = leads.slice().reverse().map(l => `
        <tr style="border-bottom:1px solid var(--gray-100);">
          <td style="padding:14px 16px;">${l.date || '—'}</td>
          <td style="padding:14px 16px;">${l.salesExecutive || '—'}</td>
          <td style="padding:14px 16px;">${l.industry || '—'}</td>
          <td style="padding:14px 16px;">${l.targetLeads || '—'}</td>
          <td style="padding:14px 16px;">${l.supportNeeded || 'No'}</td>
        </tr>
      `).join('')
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// EOD - END OF DAY
// ═══════════════════════════════════════════════════════════════

function submitEOD() {
  const dateRaw = document.getElementById('eDate')?.value

  if (!dateRaw) { showToast('Please select a date.', 'error'); return }

  const entry = {
    id: 'EOD-' + Date.now(),
    timestamp: new Date().toLocaleString('en-IN'),
    email: S.email,
    date: fmtDate(dateRaw),
    salesExecutive: S.name,
    createdBy: S.email,
    createdByName: S.name,
    callsMade: document.getElementById('eCallsMade')?.value || 0,
    meetingsHeld: document.getElementById('eMeetingsHeld')?.value || 0,
    keyClients: document.getElementById('eKeyClients')?.value?.trim() || '',
    dealsMovedNextStage: document.getElementById('eDeals')?.value?.trim() || '',
    challengesFaced: document.getElementById('eChallenges')?.value?.trim() || '',
    learnings: document.getElementById('eLearnings')?.value?.trim() || '',
    remarks: document.getElementById('eRemarks')?.value?.trim() || '',
    score: parseInt(document.getElementById('eScore')?.value) || 70,
    aiScore1: parseInt(document.getElementById('eScore')?.value) || 70,
    isHistorical: false
  }

  const btn = document.getElementById('eodSubmitBtn')
  if (btn) {
    btn.disabled = true
    btn.innerHTML = '<div class="spinner"></div> Saving…'
  }

  setTimeout(() => {
    const d = getEOD()
    d.push(entry)
    saveEOD(d)
    console.debug('EOD saved:', entry.id, 'totalEOD=', getEOD().length)

    if (btn) {
      btn.disabled = false
      btn.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Save EOD Summary'
    }

    showToast('EOD summary saved successfully', 'success')
    renderDashboard()
    // Update EOD history view immediately so the new entry is visible
    try { renderEODHistory() } catch (e) { /* ignore if view not present */ }
  }, 400)
}

function renderEOD() {
  const eodDateSub = document.getElementById('eodDateSub')
  if (eodDateSub) eodDateSub.textContent = todayFull()
}

function renderEODHistory() {
  const q = document.getElementById('eodSearch')?.value?.toLowerCase() || ''
  const execF = document.getElementById('eodExecF')?.value || ''
  let eods = myEOD()

  if (q) eods = eods.filter(l =>
    (l.salesExecutive && l.salesExecutive.toLowerCase().includes(q)) ||
    (l.keyClients && l.keyClients.toLowerCase().includes(q)) ||
    (l.remarks && l.remarks.toLowerCase().includes(q))
  )

  if (execF) eods = eods.filter(l => l.salesExecutive === execF)

  const tbody = document.getElementById('eodHistBody')
  const showing = document.getElementById('eodHistCount')

  if (showing) showing.textContent = eods.length

  if (tbody) {
    if (eods.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="padding:40px;text-align:center;color:var(--gray-400);">No EOD reports found</td></tr>'
    } else {
      tbody.innerHTML = eods.slice().reverse().map(l => `
        <tr style="border-bottom:1px solid var(--gray-100);">
          <td style="padding:14px 16px;">${l.date || '—'}</td>
          <td style="padding:14px 16px;">${l.salesExecutive || '—'}</td>
          <td style="padding:14px 16px;">${l.callsMade || 0}</td>
          <td style="padding:14px 16px;">${l.meetingsHeld || 0}</td>
          <td style="padding:14px 16px;">${l.score || '—'}</td>
        </tr>
      `).join('')
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// WOD - WEEKLY REPORT
// ═══════════════════════════════════════════════════════════════

function submitWOD() {
  const startRaw = document.getElementById('wStart')?.value
  const endRaw = document.getElementById('wEnd')?.value

  if (!startRaw || !endRaw) { showToast('Please select week dates.', 'error'); return }

  const entry = {
    id: 'WOD-' + Date.now(),
    timestamp: new Date().toLocaleString('en-IN'),
    email: S.email,
    salesExecutive: S.name,
    createdBy: S.email,
    createdByName: S.name,
    weekStart: fmtDate(startRaw),
    weekEnd: fmtDate(endRaw),
    leadsAdded: document.getElementById('wLeads')?.value || 0,
    callsMade: document.getElementById('wCalls')?.value || 0,
    meetingsHeld: document.getElementById('wMeetings')?.value || 0,
    dealsClosed: document.getElementById('wDeals')?.value || 0,
    revenue: document.getElementById('wRevenue')?.value?.trim() || '',
    challenges: document.getElementById('wChallenges')?.value?.trim() || '',
    nextWeekPlan: document.getElementById('wNextWeek')?.value?.trim() || '',
    isHistorical: false
  }

  const btn = document.getElementById('wodSubmitBtn')
  if (btn) {
    btn.disabled = true
    btn.innerHTML = '<div class="spinner"></div> Saving…'
  }

  setTimeout(() => {
    const d = getWOD()
    d.push(entry)
    saveWOD(d)
    console.debug('WOD saved:', entry.id, 'totalWOD=', getWOD().length)

    if (btn) {
      btn.disabled = false
      btn.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Submit Weekly Report'
    }

    showToast('Weekly report submitted successfully', 'success')
    renderDashboard()
    // Update WOD history view immediately so the new entry is visible
    try { renderWODHistory() } catch (e) { /* ignore if view not present */ }
  }, 400)
}

function renderWODHistory() {
  const q = document.getElementById('wodSearch')?.value?.toLowerCase() || ''
  const execF = document.getElementById('wodExecF')?.value || ''
  let wods = myWOD()

  if (q) wods = wods.filter(l =>
    (l.salesExecutive && l.salesExecutive.toLowerCase().includes(q)) ||
    (l.challenges && l.challenges.toLowerCase().includes(q))
  )

  if (execF) wods = wods.filter(l => l.salesExecutive === execF)

  const tbody = document.getElementById('wodHistBody')
  const showing = document.getElementById('wodHistCount')

  if (showing) showing.textContent = wods.length

  if (tbody) {
    if (wods.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="padding:40px;text-align:center;color:var(--gray-400);">No weekly reports found</td></tr>'
    } else {
      tbody.innerHTML = wods.slice().reverse().map(l => `
        <tr style="border-bottom:1px solid var(--gray-100);">
          <td style="padding:14px 16px;">${l.weekStart || '—'} - ${l.weekEnd || '—'}</td>
          <td style="padding:14px 16px;">${l.salesExecutive || '—'}</td>
          <td style="padding:14px 16px;">${l.leadsAdded || 0}</td>
          <td style="padding:14px 16px;">${l.dealsClosed || 0}</td>
          <td style="padding:14px 16px;">${l.revenue || '—'}</td>
        </tr>
      `).join('')
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// LEADS JOURNEY
// ═══════════════════════════════════════════════════════════════

function normalizeCompanyName(name) {
  if (!name) return ''
  return name
    .toLowerCase()
    .replace(/[.,&\/\\]/g, ' ')
    .replace(/\b(ltd|pvt|private|limited|llp|inc|corp|corporation|co|company|india)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function submitLead() {
  const exec = document.getElementById('lExec')?.value
  const company = document.getElementById('lCompany')?.value?.trim()
  const contact = document.getElementById('lContact')?.value?.trim()
  const source = document.getElementById('lSource')?.value
  const status = document.getElementById('lStatus')?.value
  const dateRaw = document.getElementById('lDate')?.value

  if (!company) { showToast('Please enter the Company Name.', 'error'); return }
  if (!dateRaw) { showToast('Please enter the Date of Entry.', 'error'); return }

  // Check for duplicate lead entry by normalized company name only
  const existingLeads = DataStore.get('leads') || []
  const existingJourneyLeads = getLeadsJourney() || []
  const allLeads = existingLeads.concat(existingJourneyLeads)
  const newCompanyNorm = normalizeCompanyName(company)

  const duplicateExists = allLeads.some(lead => {
    const existingCompany = lead.companyName || lead.company || ''
    const existingCompanyNorm = normalizeCompanyName(existingCompany)
    return existingCompanyNorm && existingCompanyNorm === newCompanyNorm
  })

  if (duplicateExists) {
    showToast('A lead with the same company name already exists. Please update the existing lead instead.', 'error')
    return
  }

  const entry = {
    id: 'LEAD-' + Date.now(),
    timestamp: new Date().toLocaleString('en-IN'),
    dateOfEntry: fmtDate(dateRaw),
    salesExecutive: S.name,
    createdBy: S.email,
    createdByName: S.name,
    companyName: company,
    contactPerson: contact,
    designation: document.getElementById('lDesig')?.value?.trim() || '',
    contactNumber: document.getElementById('lPhone')?.value?.trim() || '',
    emailId: document.getElementById('lEmail')?.value?.trim() || '',
    location: document.getElementById('lLocation')?.value?.trim() || '',
    dateOfFirstCall: fmtDate(document.getElementById('lFirstCall')?.value) || '',
    purposeOfCall: document.getElementById('lPurpose')?.value || '',
    productDiscussed: document.getElementById('lProduct')?.value || '',
    callOutcome: document.getElementById('lOutcome')?.value || '',
    currentStatus: status || '',
    proposalShared: document.getElementById('lProposal')?.value || '',
    nextFollowUp: fmtDate(document.getElementById('lFollowup')?.value) || '',
    dealValue: document.getElementById('lDealValue')?.value || '',
    finalOutcome: document.getElementById('lFinal')?.value || '',
    learningChallenge: document.getElementById('lLearning')?.value?.trim() || '',
    leadSource: source || '',
    isHistorical: false
  }

  const btn = document.getElementById('leadSubmitBtn')
  if (btn) {
    btn.disabled = true
    btn.innerHTML = '<div class="spinner"></div> Saving…'
  }

  setTimeout(() => {
    const d = getLeadsJourney()
    d.push(entry)
    saveLeadsJourney(d)

    // Also add to DataStore leads
    DataStore.add('leads', {
      name: contact || company,
      company: company,
      email: entry.emailId,
      phone: entry.contactNumber,
      status: (status || 'new lead').toLowerCase(),
      source: (source || 'other').toLowerCase(),
      dealValue: parseInt(entry.dealValue.replace(/[^0-9]/g, '')) || 0,
      assignedTo: S.email
    })

    // Reset form
    ;['lCompany', 'lContact', 'lDesig', 'lPhone', 'lEmail', 'lLocation', 'lFirstCall', 'lFollowup', 'lDealValue', 'lLearning'].forEach(id => {
      const el = document.getElementById(id)
      if (el) el.value = ''
    })

    if (btn) {
      btn.disabled = false
      btn.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Save Lead'
    }

    showToast('Lead journey entry saved successfully', 'success')
    renderDashboard()
  }, 400)
}

// Make globally available for onclick handlers
window.submitLead = submitLead

function renderLeads() {
  const q = document.getElementById('leadSearch')?.value?.toLowerCase() || ''
  const execF = document.getElementById('leadExecF')?.value || ''
  const statusF = document.getElementById('leadStatusF')?.value || ''

  let filtered = myLeadsJ()

  if (q) filtered = filtered.filter(l =>
    (l.companyName && l.companyName.toLowerCase().includes(q)) ||
    (l.contactPerson && l.contactPerson.toLowerCase().includes(q)) ||
    (l.company && l.company.toLowerCase().includes(q)) ||
    (l.leadName && l.leadName.toLowerCase().includes(q))
  )

  if (execF) filtered = filtered.filter(l => l.salesExecutive === execF)
  if (statusF) filtered = filtered.filter(l => (l.currentStatus || l.status) === statusF)

  const tbody = document.getElementById('leadsBody')
  const showing = document.getElementById('leadsCount')

  if (showing) showing.textContent = filtered.length + ' entries'

  if (tbody) {
    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="padding:40px;text-align:center;color:var(--gray-400);">No leads found</td></tr>'
    } else {
      const displayData = filtered.slice(-100).reverse()
      tbody.innerHTML = displayData.map(l => {
        const date = l.dateOfEntry || l.timestamp || '—'
        const exec = l.salesExecutive || '—'
        const comp = l.companyName || l.company || '—'
        const cont = l.contactPerson || l.leadName || '—'
        const prod = l.productDiscussed || '—'
        const src = l.leadSource || l.source || '—'
        const stat = l.currentStatus || l.status || '—'
        const foll = l.nextFollowUp || l.firstCallDate || '—'
        let dv = l.dealValue || '—'
        if (dv !== '—' && !dv.toString().includes('₹')) dv = '₹' + dv

        return `
        <tr style="border-bottom:1px solid var(--gray-100);">
          <td style="padding:14px 16px;">${date}</td>
          <td style="padding:14px 16px;color:var(--gray-700);">${exec}</td>
          <td style="padding:14px 16px;color:var(--gray-700);">${l.createdByName || l.createdBy || '—'}</td>
          <td style="padding:14px 16px;font-weight:500;color:var(--gray-900);">${comp}</td>
          <td style="padding:14px 16px;color:var(--gray-700);">${cont}</td>
          <td style="padding:14px 16px;color:var(--gray-700);">${prod}</td>
          <td style="padding:14px 16px;color:var(--gray-700);">${src}</td>
          <td style="padding:14px 16px;">
            <span class="badge ${stat.replace(/\s+/g, '-').toLowerCase()}">${stat}</span>
          </td>
          <td style="padding:14px 16px;color:var(--gray-700);">${foll}</td>
          <td style="padding:14px 16px;color:var(--gray-700);">${dv}</td>
          <td style="padding:14px 16px;text-align:center;display:flex;justify-content:center;gap:8px;">
            <button class="btn-icon" onclick="openProfile('lead','${l.id}')" title="View profile" style="background:transparent;border:none;cursor:pointer;font-size:16px;color:var(--gray-500);padding:4px 8px;border-radius:4px;transition:all 0.2s;" onmouseover="this.style.color='#2563eb'" onmouseout="this.style.color='var(--gray-500)'">👤</button>
            <button class="btn-icon" onclick="openLeadCaseManager('${l.id}')" title="Manage lender cases" style="background:transparent;border:none;cursor:pointer;font-size:16px;color:var(--gray-500);padding:4px 8px;border-radius:4px;transition:all 0.2s;" onmouseover="this.style.color='#0f766e'" onmouseout="this.style.color='var(--gray-500)'">🏦</button>
            <button class="btn-icon" onclick="deleteLead('${l.id}')" title="Delete lead" style="background:transparent;border:none;cursor:pointer;font-size:16px;color:var(--gray-500);padding:4px 8px;border-radius:4px;transition:all 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='var(--gray-500)'">🗑️</button>
          </td>
        </tr>
      `}).join('')
    }
  }
}

function deleteLead(leadId) {
  if (!confirm('Are you sure you want to delete this lead?')) return

  const allLeads = getLeadsJourney()
  const leadIndex = allLeads.findIndex(l => String(l.id) === String(leadId))
  if (leadIndex === -1) return

  const [removedLead] = allLeads.splice(leadIndex, 1)
  saveLeadsJourney(allLeads)

  const company = (removedLead.companyName || removedLead.company || '').trim().toLowerCase()
  const contact = (removedLead.contactPerson || removedLead.leadName || '').trim().toLowerCase()
  const email = (removedLead.emailId || '').trim().toLowerCase()
  const phone = (removedLead.contactNumber || '').replace(/[^0-9]/g, '')

  const stored = DataStore.getAll()
  if (stored.leads && Array.isArray(stored.leads)) {
    stored.leads = stored.leads.filter(item => {
      const existingCompany = (item.company || '').trim().toLowerCase()
      const existingContact = (item.name || '').trim().toLowerCase()
      const existingEmail = (item.email || '').trim().toLowerCase()
      const existingPhone = (item.phone || '').replace(/[^0-9]/g, '')

      const sameCompany = company && existingCompany === company
      const sameContact = contact && existingContact === contact
      const sameEmail = email && existingEmail === email
      const samePhone = phone && existingPhone === phone

      return !(sameCompany && (sameContact || sameEmail || samePhone) || sameEmail || samePhone)
    })
    DataStore.saveAll(stored)
  }

  showToast('Lead deleted', 'info')
  renderLeads()
}

let currentCaseLeadId = null

function showCaseManagementSection() {
  document.querySelectorAll('.nav-btn').forEach(n => n.classList.remove('active'))
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'))
  const section = document.getElementById('sec-case-management')
  if (section) section.classList.add('active')
  const topTitle = document.getElementById('topTitle')
  if (topTitle) topTitle.textContent = 'Multi-Lender Case Management'
}

function refreshCaseManagement() {
  if (!currentCaseLeadId) {
    showToast('Select a lead to view cases', 'info')
    return
  }
  const lead = getLeadsJourney().find(l => String(l.id) === String(currentCaseLeadId))
  if (!lead) {
    showToast('Lead not found', 'error')
    return
  }
  renderCaseManagementHeader(lead)
  renderLoanApplicationsTable()
}

function openLeadCaseManager(leadId) {
  const lead = getLeadsJourney().find(l => String(l.id) === String(leadId))
  if (!lead) {
    showToast('Lead not found', 'error')
    return
  }
  currentCaseLeadId = String(leadId)
  showCaseManagementSection()
  hideCaseApplicationForm()
  renderCaseManagementHeader(lead)
  renderLoanApplicationsTable()
}

function renderCaseManagementHeader(lead) {
  const summary = document.getElementById('caseLeadSummary')
  const stats = document.getElementById('caseSummary')
  const applications = DataStore.getLoanApplications(lead.id)
  const totalValue = applications.reduce((sum, app) => sum + Number(app.loanAmount || 0), 0)
  const openApps = applications.filter(app => !['Closed', 'Rejected'].includes(app.applicationStatus || app.status)).length

  if (summary) {
    summary.innerHTML = `<strong>${lead.companyName || lead.company || 'Unknown Company'}</strong> · Contact: ${lead.contactPerson || lead.leadName || '—'} · Status: ${lead.currentStatus || lead.status || '—'} · Deal: ${lead.dealValue ? '₹' + lead.dealValue : '—'}`
  }
  if (stats) {
    stats.innerHTML = [
      `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px;min-width:170px;"><div style="font-size:12px;color:#475569;margin-bottom:8px;">Active lender cases</div><div style="font-size:16px;font-weight:700;color:#0f766e;">${openApps}</div></div>`,
      `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:14px;min-width:170px;"><div style="font-size:12px;color:#7f1d1d;margin-bottom:8px;">Total loan amount</div><div style="font-size:16px;font-weight:700;color:#991b1b;">₹${totalValue.toLocaleString()}</div></div>`,
      `<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:14px;min-width:170px;"><div style="font-size:12px;color:#1e3a8a;margin-bottom:8px;">Applications logged</div><div style="font-size:16px;font-weight:700;color:#1d4ed8;">${applications.length}</div></div>`
    ].join('')
  }
}

function renderLoanApplicationsTable() {
  const tableContainer = document.getElementById('caseApplicationsTableContainer')
  if (!tableContainer) return

  if (!currentCaseLeadId) {
    tableContainer.innerHTML = '<div style="padding:24px;color:var(--gray-500);">Select a lead from Lead Journey to view lender applications.</div>'
    return
  }

  const search = document.getElementById('caseSearch')?.value?.toLowerCase() || ''
  let applications = DataStore.getLoanApplications(currentCaseLeadId)

  if (search) {
    applications = applications.filter(a =>
      [a.lenderName, a.productType, a.applicationStatus || a.status, a.remarks].some(value =>
        String(value || '').toLowerCase().includes(search)
      )
    )
  }

  if (applications.length === 0) {
    tableContainer.innerHTML = '<div style="padding:24px;color:var(--gray-500);">No lender applications found for this lead. Click Add Loan Application to create one.</div>'
    return
  }

  tableContainer.innerHTML = `
    <table style="width:100%;border-collapse:collapse;min-width:760px;">
      <thead>
        <tr style="background:#f8fafc;color:#0f172a;text-align:left;font-size:13px;line-height:1.6;">
          <th style="padding:14px 16px;border-bottom:1px solid #e2e8f0;">Lender</th>
          <th style="padding:14px 16px;border-bottom:1px solid #e2e8f0;">Product</th>
          <th style="padding:14px 16px;border-bottom:1px solid #e2e8f0;">Amount</th>
          <th style="padding:14px 16px;border-bottom:1px solid #e2e8f0;">Status</th>
          <th style="padding:14px 16px;border-bottom:1px solid #e2e8f0;">Submission</th>
          <th style="padding:14px 16px;border-bottom:1px solid #e2e8f0;">Queries</th>
          <th style="padding:14px 16px;border-bottom:1px solid #e2e8f0;">Actions</th>
        </tr>
      </thead>
      <tbody>${applications.map(app => {
        const queryCount = DataStore.getLenderQueries(app.id).length
        return `
          <tr style="border-bottom:1px solid #f1f5f9;">
            <td style="padding:14px 16px;vertical-align:top;">${app.lenderName || '—'}</td>
            <td style="padding:14px 16px;vertical-align:top;">${app.productType || '—'}<br><small style="color:#64748b;">${app.tenor || '—'}</small></td>
            <td style="padding:14px 16px;vertical-align:top;">₹${Number(app.loanAmount || 0).toLocaleString()}</td>
            <td style="padding:14px 16px;vertical-align:top;"><span class="badge ${String(app.applicationStatus || app.status || 'unknown').replace(/\s+/g, '-').toLowerCase()}">${app.applicationStatus || app.status || '—'}</span></td>
            <td style="padding:14px 16px;vertical-align:top;">${app.submissionDate || '—'}</td>
            <td style="padding:14px 16px;vertical-align:top;">${queryCount} logged</td>
            <td style="padding:14px 16px;vertical-align:top;display:flex;gap:8px;flex-wrap:wrap;">
              <button class="btn btn-outline" onclick="addLenderQuery('${app.id}')" style="padding:6px 10px;">Add Query</button>
              <button class="btn btn-outline" onclick="deleteLoanApplication('${app.id}')" style="padding:6px 10px;">Delete</button>
            </td>
          </tr>
        `
      }).join('')}</tbody>
    </table>
  `
}

function showCaseApplicationForm() {
  if (!currentCaseLeadId) {
    showToast('Open a lead first before adding an application.', 'info')
    return
  }
  const form = document.getElementById('caseApplicationForm')
  if (form) form.style.display = 'block'
}

function hideCaseApplicationForm() {
  const form = document.getElementById('caseApplicationForm')
  if (form) form.style.display = 'none'
  const inputs = ['caseLender','caseProduct','caseLoanAmount','caseTenor','caseStatus','caseExecutive','caseRemarks']
  inputs.forEach(id => {
    const el = document.getElementById(id)
    if (el) el.value = ''
  })
  if (document.getElementById('caseStatus')) document.getElementById('caseStatus').value = 'Proposal Shared'
}

function addLoanApplication() {
  if (!currentCaseLeadId) {
    showToast('Open a lead before adding a loan application.', 'error')
    return
  }

  const lender = document.getElementById('caseLender')?.value.trim()
  const product = document.getElementById('caseProduct')?.value.trim()
  const amount = Number(document.getElementById('caseLoanAmount')?.value || 0)
  const tenor = document.getElementById('caseTenor')?.value.trim()
  const status = document.getElementById('caseStatus')?.value || 'Proposal Shared'
  const executive = document.getElementById('caseExecutive')?.value.trim() || S.name || S.email || 'Unassigned'
  const remarks = document.getElementById('caseRemarks')?.value.trim()

  if (!lender || amount <= 0) {
    showToast('Please provide lender name and loan amount.', 'error')
    return
  }

  const lead = getLeadsJourney().find(l => String(l.id) === String(currentCaseLeadId))
  if (!lead) {
    showToast('Lead not found', 'error')
    return
  }

  DataStore.add('loanApplications', {
    leadId: Number(currentCaseLeadId),
    leadCompany: lead.companyName || lead.company || '',
    lenderName: lender,
    productType: product || 'General Loan',
    loanAmount: amount,
    tenor: tenor || 'N/A',
    applicationStatus: status,
    assignedExecutive: executive,
    submissionDate: new Date().toISOString().slice(0, 10),
    lastUpdate: new Date().toISOString().slice(0, 10),
    lenderCaseId: `${lender.split(' ')[0].toUpperCase()}-${Date.now()}`,
    remarks
  })

  showToast('Loan application added successfully.', 'success')
  hideCaseApplicationForm()
  renderCaseManagementHeader(lead)
  renderLoanApplicationsTable()
}

function deleteLoanApplication(applicationId) {
  if (!confirm('Delete this loan application?')) return
  const id = Number(applicationId)
  const stored = DataStore.getAll()
  stored.loanApplications = stored.loanApplications.filter(app => Number(app.id) !== id)
  stored.lenderQueries = stored.lenderQueries.filter(q => Number(q.applicationId) !== id)
  DataStore.saveAll(stored)
  showToast('Loan application removed.', 'info')
  renderLoanApplicationsTable()
  if (currentCaseLeadId) {
    const lead = getLeadsJourney().find(l => String(l.id) === String(currentCaseLeadId))
    if (lead) renderCaseManagementHeader(lead)
  }
}

function addLenderQuery(applicationId) {
  const app = DataStore.getById('loanApplications', Number(applicationId))
  if (!app) {
    showToast('Application not found.', 'error')
    return
  }

  const description = prompt('Enter the lender query or update:')
  if (!description || !description.trim()) return

  const raisedBy = typeof S !== 'undefined' ? S.name || S.email : 'System'

  DataStore.add('lenderQueries', {
    applicationId: Number(applicationId),
    leadId: Number(app.leadId),
    description: description.trim(),
    status: 'Open',
    raisedBy: raisedBy || 'System',
    createdAt: new Date().toISOString()
  })

  showToast('Lender query logged.', 'success')
  renderLoanApplicationsTable()
}

// ═══════════════════════════════════════════════════════════════
// PIPELINE & FORECASTING
// ═══════════════════════════════════════════════════════════════

function renderPipeline() {
  const pipelineData = DataStore.getPipelineData()
  // Already handled in dashboard
}

function renderForecasting() {
  const pipelineData = DataStore.getPipelineData()
  const forecastContainer = document.getElementById('forecast-by-stage')

  if (!forecastContainer) return

  const totalValue = pipelineData.reduce((sum, s) => sum + s.value, 0)

  forecastContainer.innerHTML = pipelineData.map(stage => {
    const percentage = totalValue > 0 ? Math.round((stage.value / totalValue) * 100) : 0
    const weightedValue = Math.round(stage.value * (stage.stage === 'closed-won' ? 1 : stage.stage === 'closed-lost' ? 0 : 0.3))

    return `
      <div class="forecast-stage" style="margin-bottom:20px;padding:16px;background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <div style="font-weight:600;color:var(--gray-900);">${stage.label}</div>
          <div style="font-size:12px;color:var(--gray-500);">${stage.count} deals</div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
          <div style="flex:1;height:8px;background:var(--gray-100);border-radius:4px;overflow:hidden;">
            <div style="width:${percentage}%;height:100%;background:var(--maroon);border-radius:4px;"></div>
          </div>
          <div style="font-size:13px;font-weight:500;color:var(--gray-700);min-width:80px;text-align:right;">₹${(stage.value / 100000).toFixed(1)}L</div>
        </div>
        <div style="font-size:12px;color:var(--gray-500);">Weighted: ₹${(weightedValue / 100000).toFixed(1)}L</div>
      </div>
    `
  }).join('')

  // Summary
  const totalOpen = pipelineData.filter(s => !['closed-won', 'closed-lost'].includes(s.stage)).reduce((sum, s) => sum + s.value, 0)
  const wonValue = pipelineData.find(s => s.stage === 'closed-won')?.value || 0

  const forecastSummary = document.getElementById('forecast-summary')
  if (forecastSummary) {
    forecastSummary.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:20px;background:var(--gray-50);border-radius:var(--radius);">
        <div style="text-align:center;">
          <div style="font-size:24px;font-weight:700;color:var(--gray-900);">₹${(totalOpen / 100000).toFixed(1)}L</div>
          <div style="font-size:12px;color:var(--gray-500);">Pipeline Value</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:24px;font-weight:700;color:var(--success);">₹${(wonValue / 100000).toFixed(1)}L</div>
          <div style="font-size:12px;color:var(--gray-500);">Won This Month</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:24px;font-weight:700;color:var(--maroon);">₹${(totalOpen * 0.3 / 100000).toFixed(1)}L</div>
          <div style="font-size:12px;color:var(--gray-500);">Forecast (30%)</div>
        </div>
      </div>
    `
  }
}

// ═══════════════════════════════════════════════════════════════
// ANALYTICS & REPORTS
// ═══════════════════════════════════════════════════════════════

function renderAnalytics() {
  const allSOD = getSOD()
  const allEOD = getEOD()
  const allWOD = getWOD()
  const allLeads = getLeadsJourney()

  const stats = DataStore.getDashboardStats()

  const analyticsStats = document.getElementById('analyticsStats')
  if (analyticsStats) {
    analyticsStats.innerHTML = `
      <div class="stat-card g"><div class="stat-val">${allSOD.length}</div><div class="stat-label">Total SOD Entries</div></div>
      <div class="stat-card b"><div class="stat-val">${allEOD.length}</div><div class="stat-label">Total EOD Entries</div></div>
      <div class="stat-card p"><div class="stat-val">${allWOD.length}</div><div class="stat-label">Total WOD Entries</div></div>
      <div class="stat-card o"><div class="stat-val">${allLeads.length}</div><div class="stat-label">Lead Journey Entries</div></div>
      <div class="stat-card g"><div class="stat-val">${stats.leads.total}</div><div class="stat-label">Total CRM Leads</div></div>
      <div class="stat-card b"><div class="stat-val">${stats.deals.total}</div><div class="stat-label">Total Deals</div></div>
    `
  }
}

function renderReports() {
  // Reports section is static with placeholders
}

function renderTeam() {
  if (S.role !== 'admin') return

  const allSOD = getSOD()
  const allEOD = getEOD()

  const team = [
    { n: 'Vaibhav Borge', i: 'VB' },
    { n: 'Saleem Khan', i: 'SK' },
    { n: 'Roshan Chawan', i: 'RC' }
  ]

  const tbody = document.getElementById('teamTableBody')
  if (tbody) {
    tbody.innerHTML = team.map(m => {
      const sodCount = allSOD.filter(s => s.salesExecutive === m.n).length
      const eodCount = allEOD.filter(s => s.salesExecutive === m.n).length

      return `
        <tr style="border-bottom:1px solid var(--gray-100);">
          <td style="padding:14px 16px;">
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="width:36px;height:36px;background:var(--maroon-light);border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--maroon);font-weight:600;">${m.i}</div>
              <div style="font-weight:500;color:var(--gray-900);">${m.n}</div>
            </div>
          </td>
          <td style="padding:14px 16px;text-align:center;color:var(--gray-700);">${sodCount}</td>
          <td style="padding:14px 16px;text-align:center;color:var(--gray-700);">${eodCount}</td>
          <td style="padding:14px 16px;text-align:center;color:var(--gray-700);">Active</td>
        </tr>
      `
    }).join('')
  }
}

// Placeholder renderers
function renderAccounts() {
  const accounts = DataStore.get('accounts')
  const tbody = document.getElementById('accountsTableBody')
  if (!tbody) return

  if (accounts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="padding:40px;text-align:center;color:var(--gray-400);">No accounts found</td></tr>'
  } else {
    tbody.innerHTML = accounts.map(a => `
      <tr style="border-bottom:1px solid var(--gray-100);">
        <td style="padding:14px 16px;">
          <div style="font-weight:500;color:var(--gray-900);">${a.name}</div>
          <div style="font-size:12px;color:var(--gray-500);">${a.industry || '—'}</div>
        </td>
        <td style="padding:14px 16px;color:var(--gray-700);">${a.type || '—'}</td>
        <td style="padding:14px 16px;color:var(--gray-700);">₹${(a.revenue / 10000000).toFixed(1)}Cr</td>
        <td style="padding:14px 16px;color:var(--gray-700);">${a.phone || '—'}</td>
      </tr>
    `).join('')
  }
}

function renderContacts() {
  let contacts = DataStore.get('contacts') || []
  const tbody = document.getElementById('contactsTableBody')
  if (!tbody) return

  // Get search query
  const searchQuery = document.getElementById('contactSearch')?.value?.toLowerCase() || ''
  
  // Get filter checkboxes
  const filterAll = document.getElementById('filterAll')?.checked
  const filterCustomer = document.getElementById('filterCustomer')?.checked
  const filterProspect = document.getElementById('filterProspect')?.checked
  const filterPartner = document.getElementById('filterPartner')?.checked

  // Filter by search
  if (searchQuery) {
    contacts = contacts.filter(c => 
      (c.name && c.name.toLowerCase().includes(searchQuery)) ||
      (c.company && c.company.toLowerCase().includes(searchQuery)) ||
      (c.email && c.email.toLowerCase().includes(searchQuery))
    )
  }

  // Filter by type (if "All" is not checked and at least one type is checked)
  if (!filterAll && (filterCustomer || filterProspect || filterPartner)) {
    contacts = contacts.filter(c => {
      const type = c.type?.toLowerCase()
      return (filterCustomer && type === 'customer') ||
             (filterProspect && type === 'prospect') ||
             (filterPartner && type === 'partner')
    })
  }

  // Handle "All" checkbox logic - if "All" is checked, uncheck others
  if (filterAll) {
    const customerCb = document.getElementById('filterCustomer')
    const prospectCb = document.getElementById('filterProspect')
    const partnerCb = document.getElementById('filterPartner')
    if (customerCb) customerCb.checked = false
    if (prospectCb) prospectCb.checked = false
    if (partnerCb) partnerCb.checked = false
  }

  if (contacts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="padding:40px;text-align:center;color:var(--gray-400);">No contacts found</td></tr>'
  } else {
    tbody.innerHTML = contacts.map(c => `
      <tr style="border-bottom:1px solid var(--gray-100);">
        <td style="padding:14px 16px;"><input type="checkbox"></td>
        <td style="padding:14px 16px;">
          <div style="font-weight:500;color:var(--gray-900);">${c.name}</div>
        </td>
        <td style="padding:14px 16px;color:var(--gray-700);">${c.company || '—'}</td>
        <td style="padding:14px 16px;color:var(--gray-700);">${c.email || '—'}</td>
        <td style="padding:14px 16px;color:var(--gray-700);">${c.phone || '—'}</td>
        <td style="padding:14px 16px;">
          <span class="badge ${c.type}">${c.type || '—'}</span>
        </td>
        <td style="padding:14px 16px;text-align:center;">
          <button class="btn-icon" onclick="openProfile('contact','${c.id}')" title="View profile" style="background:transparent;border:none;cursor:pointer;font-size:16px;color:var(--gray-500);padding:4px 8px;border-radius:4px;transition:all 0.2s;" onmouseover="this.style.color='#2563eb'" onmouseout="this.style.color='var(--gray-500)'">👤</button>
        </td>
      </tr>
    `).join('')
  }

  const showing = document.getElementById('contactsShowing')
  if (showing) showing.textContent = contacts.length
}

function renderDeals() {
  const deals = DataStore.get('deals')
  const tbody = document.getElementById('dealsTableBody')
  if (!tbody) return

  if (deals.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="padding:40px;text-align:center;color:var(--gray-400);">No deals found</td></tr>'
  } else {
    tbody.innerHTML = deals.map(d => `
      <tr style="border-bottom:1px solid var(--gray-100);">
        <td style="padding:14px 16px;">
          <div style="font-weight:500;color:var(--gray-900);">${d.name}</div>
          <div style="font-size:12px;color:var(--gray-500);">${d.company || '—'}</div>
        </td>
        <td style="padding:14px 16px;color:var(--gray-700);">₹${(d.value / 100000).toFixed(1)}L</td>
        <td style="padding:14px 16px;">
          <span class="badge ${d.stage}">${d.stage || '—'}</span>
        </td>
        <td style="padding:14px 16px;color:var(--gray-700);">${d.probability || 0}%</td>
        <td style="padding:14px 16px;color:var(--gray-700);">${d.closeDate || '—'}</td>
      </tr>
    `).join('')
  }

  const showing = document.getElementById('dealsShowing')
  if (showing) showing.textContent = deals.length
}

function renderCampaigns() {
  const campaigns = DataStore.get('campaigns')
  const tbody = document.getElementById('campaignsTableBody')
  if (!tbody) return

  if (campaigns.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="padding:40px;text-align:center;color:var(--gray-400);">No campaigns found</td></tr>'
  } else {
    tbody.innerHTML = campaigns.map(c => `
      <tr style="border-bottom:1px solid var(--gray-100);">
        <td style="padding:14px 16px;">
          <div style="font-weight:500;color:var(--gray-900);">${c.name}</div>
          <div style="font-size:12px;color:var(--gray-500);">${c.type || '—'}</div>
        </td>
        <td style="padding:14px 16px;color:var(--gray-700);">${c.startDate || '—'} - ${c.endDate || '—'}</td>
        <td style="padding:14px 16px;">
          <span class="badge ${c.status?.toLowerCase()}">${c.status || '—'}</span>
        </td>
        <td style="padding:14px 16px;color:var(--gray-700);">${c.leadsGenerated || 0}</td>
        <td style="padding:14px 16px;color:var(--gray-700);">
          <button class="btn-icon" onclick="showToast('Campaign details - Coming Soon', 'info')">📊</button>
        </td>
      </tr>
    `).join('')
  }

  const showing = document.getElementById('campaignsShowing')
  if (showing) showing.textContent = campaigns.length
}

function handleDocumentTypeFilterChange(changedCheckbox) {
  const checkboxes = Array.from(document.querySelectorAll('input[name="documentTypeFilter"]'))
  const allCheckbox = checkboxes.find(cb => cb.value === 'all')

  if (changedCheckbox.value === 'all' && changedCheckbox.checked) {
    checkboxes.forEach(cb => {
      if (cb !== changedCheckbox) cb.checked = false
    })
  } else if (changedCheckbox.value !== 'all' && changedCheckbox.checked) {
    if (allCheckbox) allCheckbox.checked = false
  } else if (changedCheckbox.value !== 'all' && !changedCheckbox.checked) {
    const anySpecific = checkboxes.some(cb => cb.value !== 'all' && cb.checked)
    if (!anySpecific && allCheckbox) allCheckbox.checked = true
  }

  renderDocuments()
}

function getSelectedDocumentTypes() {
  const checkboxes = Array.from(document.querySelectorAll('input[name="documentTypeFilter"]'))
  const allCheckbox = checkboxes.find(cb => cb.value === 'all')
  const selectedTypes = checkboxes
    .filter(cb => cb.value !== 'all' && cb.checked)
    .map(cb => cb.value.toLowerCase())

  if (allCheckbox?.checked || selectedTypes.length === 0) {
    return []
  }

  return selectedTypes
}

function renderDocuments() {
  const documents = DataStore.get('documents') || []
  const tbody = document.getElementById('documentsTableBody')
  const countEl = document.getElementById('documentsCount')
  const showingEl = document.getElementById('documentsShowing')

  if (!tbody) return

  // Filter by search if present
  const search = document.getElementById('documentSearch')?.value?.toLowerCase() || ''
  const selectedTypes = getSelectedDocumentTypes()

  let filtered = documents
  if (search) {
    filtered = filtered.filter(d =>
      d.name?.toLowerCase().includes(search) ||
      d.relatedTo?.toLowerCase().includes(search) ||
      d.type?.toLowerCase().includes(search)
    )
  }

  if (selectedTypes.length > 0) {
    filtered = filtered.filter(d => selectedTypes.includes(d.type?.toLowerCase()))
  }

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="padding:40px;text-align:center;color:var(--gray-400);">No documents found. Click "Upload Document" to add one.</td></tr>'
  } else {
    tbody.innerHTML = filtered.map(d => `
      <tr style="border-bottom:1px solid var(--gray-100);">
        <td style="padding:14px 16px;"><input type="checkbox"></td>
        <td style="padding:14px 16px;">
          <div style="font-weight:500;color:var(--gray-900);">${d.name}</div>
          <div style="font-size:12px;color:var(--gray-500);">${d.fileName || ''}</div>
        </td>
        <td style="padding:14px 16px;">
          <span class="badge ${d.type?.toLowerCase()}">${d.type || 'Other'}</span>
        </td>
        <td style="padding:14px 16px;color:var(--gray-700);">${d.relatedTo || '—'}</td>
        <td style="padding:14px 16px;color:var(--gray-700);">${d.fileSize || '—'}</td>
        <td style="padding:14px 16px;color:var(--gray-700);font-size:12px;">${d.uploadedAt || '—'}</td>
        <td style="padding:14px 16px;text-align:right;">
          <button class="btn-icon" onclick="deleteDocument(${d.id})" title="Delete document">🗑️</button>
        </td>
      </tr>
    `).join('')
  }

  if (countEl) countEl.textContent = `Total Records ${filtered.length}`
  if (showingEl) showingEl.textContent = filtered.length
}

function renderDocumentsLoanApplications() {
  const search = document.getElementById('caseDocSearch')?.value?.toLowerCase() || ''
  const applications = DataStore.get('loanApplications') || []
  const filtered = applications.filter(app => {
    if (!search) return true
    const lead = getLeadsJourney().find(l => String(l.id) === String(app.leadId))
    const leadText = lead?.companyName || lead?.company || app.leadCompany || ''
    return [app.applicationId, app.lenderName, app.productType, app.applicationStatus || app.status, leadText]
      .some(value => String(value || '').toLowerCase().includes(search))
  })

  renderDocumentsCaseSummary(filtered)

  const container = document.getElementById('documentsCaseTableContainer')
  if (!container) return

  if (filtered.length === 0) {
    container.innerHTML = '<div style="padding:24px;color:var(--gray-500);">No loan applications found. Refine the search or use the lead view to create a new application.</div>'
    return
  }

  container.innerHTML = `
    <div style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;min-width:860px;">
        <thead>
          <tr style="background:#f8fafc;color:#0f172a;text-align:left;font-size:13px;line-height:1.6;">
            <th style="padding:14px 16px;border-bottom:1px solid #e2e8f0;">Application</th>
            <th style="padding:14px 16px;border-bottom:1px solid #e2e8f0;">Lead</th>
            <th style="padding:14px 16px;border-bottom:1px solid #e2e8f0;">Product</th>
            <th style="padding:14px 16px;border-bottom:1px solid #e2e8f0;">Lender</th>
            <th style="padding:14px 16px;border-bottom:1px solid #e2e8f0;">Applied / Sanctioned</th>
            <th style="padding:14px 16px;border-bottom:1px solid #e2e8f0;">Status</th>
            <th style="padding:14px 16px;border-bottom:1px solid #e2e8f0;">Actions</th>
          </tr>
        </thead>
        <tbody>${filtered.map(app => {
          const lead = getLeadsJourney().find(l => String(l.id) === String(app.leadId))
          const leadName = lead?.companyName || lead?.company || app.leadCompany || 'Unknown'
          const sanctioned = app.sanctionedAmount ? `₹${Number(app.sanctionedAmount).toLocaleString()}` : '—'
          const applied = app.appliedAmount ? `₹${Number(app.appliedAmount).toLocaleString()}` : '—'
          const statusText = app.applicationStatus || app.status || '—'
          const statusClass = String(statusText || 'unknown').replace(/\s+/g, '-').toLowerCase()
          return `
            <tr style="border-bottom:1px solid #f1f5f9;">
              <td style="padding:14px 16px;vertical-align:top;"><strong>${app.applicationId || '—'}</strong><br><small style="color:#64748b;">${app.lenderCaseId || 'No lender ref'}</small></td>
              <td style="padding:14px 16px;vertical-align:top;">${leadName}</td>
              <td style="padding:14px 16px;vertical-align:top;">${app.productType || '—'}</td>
              <td style="padding:14px 16px;vertical-align:top;">${app.lenderName || '—'}</td>
              <td style="padding:14px 16px;vertical-align:top;">${applied} / ${sanctioned}</td>
              <td style="padding:14px 16px;vertical-align:top;"><span class="badge ${statusClass}">${statusText}</span></td>
              <td style="padding:14px 16px;vertical-align:top;display:flex;gap:8px;flex-wrap:wrap;">
                <button class="btn btn-outline" onclick="openDocumentsLoanApplication('${app.id}')" style="padding:6px 10px;">Open Case</button>
                <button class="btn btn-outline" onclick="addLenderQuery('${app.id}')" style="padding:6px 10px;">Add Query</button>
              </td>
            </tr>
          `
        }).join('')}</tbody>
      </table>
    </div>
  `
}

function renderDocumentsCaseSummary(apps) {
  const summary = document.getElementById('documentsCaseSummary')
  if (!summary) return

  const total = apps.length
  const active = apps.filter(app => (app.applicationStatus || app.status) && !['Rejected','Closed'].includes(app.applicationStatus || app.status)).length
  const sanctioned = apps.filter(app => Number(app.sanctionedAmount) > 0).length
  const disbursed = apps.filter(app => Number(app.disbursalAmount) > 0).length

  summary.innerHTML = [
    `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px;min-width:150px;"><div style="font-size:12px;color:#475569;margin-bottom:6px;">Applications</div><div style="font-size:16px;font-weight:700;color:#0f766e;">${total}</div></div>`,
    `<div style="background:#fefce8;border:1px solid #fde68a;border-radius:12px;padding:14px;min-width:150px;"><div style="font-size:12px;color:#92400e;margin-bottom:6px;">Active</div><div style="font-size:16px;font-weight:700;color:#b45309;">${active}</div></div>`,
    `<div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:12px;padding:14px;min-width:150px;"><div style="font-size:12px;color:#065f46;margin-bottom:6px;">Sanctioned</div><div style="font-size:16px;font-weight:700;color:#047857;">${sanctioned}</div></div>`,
    `<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:14px;min-width:150px;"><div style="font-size:12px;color:#1e3a8a;margin-bottom:6px;">Disbursed</div><div style="font-size:16px;font-weight:700;color:#1d4ed8;">${disbursed}</div></div>`
  ].join('')
}

function openDocumentsLoanApplication(applicationId) {
  const app = DataStore.getById('loanApplications', Number(applicationId))
  if (!app) {
    showToast('Loan application not found', 'error')
    return
  }

  let lead = getLeadsJourney().find(l => String(l.id) === String(app.leadId))
  if (!lead) {
    lead = DataStore.get('leads').find(l => String(l.id) === String(app.leadId))
  }

  if (!lead) {
    showToast('Lead for this application could not be located.', 'error')
    return
  }

  openLeadCaseManager(lead.id)
}

function deleteDocument(documentId) {
  if (!confirm('Are you sure you want to delete this document?')) return

  DataStore.delete('documents', documentId)
  renderDocuments()
  showToast('Document deleted successfully', 'info')
}

// Placeholders for other sections
function renderIntegrations() {}
function renderAutomation() {}

// ═══════════════════════════════════════════════════════════════
// TASK ASSIGNMENT - Admin can assign tasks to employees
// ═══════════════════════════════════════════════════════════════

let currentTaskFilter = 'all'

function renderTaskAssign() {
  const isAdmin = S?.role === 'admin'
  const employees = DataStore.get('employees') || []

  // Populate assignee dropdown for admin
  if (isAdmin) {
    const assigneeSelect = document.getElementById('taskAssignee')
    if (assigneeSelect && assigneeSelect.options.length <= 1) {
      employees.forEach(e => {
        const option = document.createElement('option')
        option.value = e.email
        option.textContent = `${e.name} (${e.territory || 'All'})`
        assigneeSelect.appendChild(option)
      })
    }
  }

  // Set default due date
  const dueDateInput = document.getElementById('taskDueDate')
  if (dueDateInput && !dueDateInput.value) {
    dueDateInput.value = new Date().toISOString().split('T')[0]
  }

  // Render task table
  renderTasksTable()
}

function renderTasksTable() {
  const isAdmin = S?.role === 'admin'
  let tasks = DataStore.get('tasks') || []
  const employees = DataStore.get('employees') || []

  // Filter tasks based on role
  if (!isAdmin) {
    tasks = tasks.filter(t => {
      const assignedTo = t.assignedTo?.toLowerCase() || ''
      return assignedTo === S?.email?.toLowerCase() ||
             assignedTo === 'me' ||
             assignedTo === S?.name?.toLowerCase()
    })
  }

  // Apply status filter
  if (currentTaskFilter === 'pending') {
    tasks = tasks.filter(t => !t.completed)
  } else if (currentTaskFilter === 'completed') {
    tasks = tasks.filter(t => t.completed)
  } else if (currentTaskFilter === 'overdue') {
    const today = new Date().toISOString().split('T')[0]
    tasks = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < today)
  }

  // Sort by priority and due date
  const priorityOrder = { urgent: 1, high: 2, medium: 3, low: 4 }
  tasks.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    const priDiff = (priorityOrder[a.priority] || 5) - (priorityOrder[b.priority] || 5)
    if (priDiff !== 0) return priDiff
    return (a.dueDate || '').localeCompare(b.dueDate || '')
  })

  const tbody = document.getElementById('tasksTableBody')
  const countEl = document.getElementById('tasksCount')
  const showingEl = document.getElementById('tasksShowing')

  if (!tbody) return

  if (countEl) countEl.textContent = `Total Records ${tasks.length}`
  if (showingEl) showingEl.textContent = tasks.length

  if (tasks.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="padding:40px;text-align:center;color:var(--gray-400);">${isAdmin ? 'No tasks found. Assign tasks using the form.' : 'No tasks assigned to you yet.'}</td></tr>`
    return
  }

  tbody.innerHTML = tasks.map(task => {
    const isOverdue = !task.completed && task.dueDate && task.dueDate < new Date().toISOString().split('T')[0]
    const assignee = employees.find(e => e.email === task.assignedTo) || { name: task.assignedTo || 'Unknown' }

    return `
      <tr style="border-bottom:1px solid var(--gray-100);">
        <td style="padding:14px 16px;"><input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTaskStatus('${task.id}')"></td>
        <td style="padding:14px 16px;">
          <div style="font-weight:500;color:var(--gray-900);">${task.title}</div>
          <div style="font-size:12px;color:var(--gray-500);">${task.description || ''}</div>
        </td>
        <td style="padding:14px 16px;color:var(--gray-700);">${assignee.name}</td>
        <td style="padding:14px 16px;color:${isOverdue ? '#ef4444' : 'var(--gray-700)'};font-weight:${isOverdue ? '600' : '400'};">
          ${task.dueDate || '—'}
          ${isOverdue ? ' <span style="color:#ef4444;font-size:11px;">(Overdue)</span>' : ''}
        </td>
        <td style="padding:14px 16px;">
          <span class="badge ${task.priority || 'medium'}">${task.priority || 'medium'}</span>
        </td>
        <td style="padding:14px 16px;">
          <span class="badge ${task.completed ? 'completed' : 'pending'}">${task.completed ? 'Completed' : 'Pending'}</span>
        </td>
      </tr>
    `
  }).join('')
}

function toggleTaskStatus(taskId) {
  const tasks = DataStore.get('tasks') || []
  const task = tasks.find(t => t.id === taskId)
  if (task) {
    task.completed = !task.completed
    DataStore.set('tasks', tasks)
    showToast(task.completed ? 'Task completed!' : 'Task reopened', 'success')
    renderTasksTable()
  }
}

function renderTaskList() {
  const isAdmin = S?.role === 'admin'
  let tasks = DataStore.get('tasks') || []
  const employees = DataStore.get('employees') || []

  // Filter tasks based on role and current filter
  if (!isAdmin) {
    // Employees see only tasks assigned to them (by email or name match)
    tasks = tasks.filter(t => {
      const assignedTo = t.assignedTo?.toLowerCase() || ''
      return assignedTo === S?.email?.toLowerCase() ||
             assignedTo === 'me' ||
             assignedTo === S?.name?.toLowerCase() ||
             assignedTo === 'all'
    })
  }

  // Apply status filter
  if (currentTaskFilter === 'pending') {
    tasks = tasks.filter(t => !t.completed)
  } else if (currentTaskFilter === 'completed') {
    tasks = tasks.filter(t => t.completed)
  } else if (currentTaskFilter === 'overdue') {
    const today = new Date().toISOString().split('T')[0]
    tasks = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < today)
  }

  // Sort by priority and due date
  const priorityOrder = { urgent: 1, high: 2, medium: 3, low: 4 }
  tasks.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    const priDiff = (priorityOrder[a.priority] || 5) - (priorityOrder[b.priority] || 5)
    if (priDiff !== 0) return priDiff
    return (a.dueDate || '').localeCompare(b.dueDate || '')
  })

  // Update count
  const countEl = document.getElementById('taskCount')
  if (countEl) countEl.textContent = tasks.length

  if (tasks.length === 0) {
    return `
      <div style="padding:60px 20px;text-align:center;color:var(--gray-400);">
        <div style="font-size:48px;margin-bottom:16px;">📋</div>
        <div style="font-size:16px;font-weight:500;margin-bottom:8px;">No tasks found</div>
        <div style="font-size:14px;">${isAdmin ? 'Assign tasks to your team members using the form above' : 'No tasks assigned to you yet'}</div>
      </div>
    `
  }

  let html = `
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <thead>
        <tr style="background:var(--gray-50);border-bottom:1px solid var(--gray-200);">
          <th style="padding:12px 16px;text-align:left;font-weight:600;color:var(--gray-700);font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Status</th>
          <th style="padding:12px 16px;text-align:left;font-weight:600;color:var(--gray-700);font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Task</th>
          ${isAdmin ? `<th style="padding:12px 16px;text-align:left;font-weight:600;color:var(--gray-700);font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Assigned To</th>` : ''}
          <th style="padding:12px 16px;text-align:left;font-weight:600;color:var(--gray-700);font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Due Date</th>
          <th style="padding:12px 16px;text-align:left;font-weight:600;color:var(--gray-700);font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Priority</th>
          <th style="padding:12px 16px;text-align:center;font-weight:600;color:var(--gray-700);font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Actions</th>
        </tr>
      </thead>
      <tbody>
  `

  tasks.forEach(task => {
    const isOverdue = !task.completed && task.dueDate && task.dueDate < new Date().toISOString().split('T')[0]
    const priorityClass = task.priority || 'medium'
    const priorityColors = {
      urgent: '#dc2626',
      high: '#ea580c',
      medium: '#2563eb',
      low: '#16a34a'
    }

    const assignee = employees.find(e => e.email === task.assignedTo) ||
                    (task.assignedTo === 'me' ? { name: 'Me', initials: 'ME' } : null)

    html += `
      <tr style="border-bottom:1px solid var(--gray-100);${task.completed ? 'opacity:0.6;background:#f9fafb;' : ''}">
        <td style="padding:14px 16px;">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="completeAssignedTask(${task.id})" style="width:18px;height:18px;accent-color:var(--maroon);cursor:pointer;">
            <span style="font-size:12px;color:var(--gray-500);">${task.completed ? 'Done' : 'Pending'}</span>
          </label>
        </td>
        <td style="padding:14px 16px;">
          <div style="font-weight:500;color:var(--gray-900);${task.completed ? 'text-decoration:line-through;' : ''}">${task.title}</div>
          <div style="font-size:12px;color:var(--gray-500);margin-top:2px;">
            ${task.relatedTo ? `<span style="margin-right:8px;">📎 ${task.relatedTo}</span>` : ''}
            <span style="text-transform:capitalize;">${task.type || 'task'}</span>
          </div>
          ${task.notes ? `<div style="font-size:12px;color:var(--gray-400);margin-top:4px;font-style:italic;">${task.notes}</div>` : ''}
        </td>
        ${isAdmin ? `
          <td style="padding:14px 16px;">
            <div style="display:flex;align-items:center;gap:8px;">
              <div style="width:28px;height:28px;border-radius:50%;background:var(--maroon);color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;">
                ${assignee ? assignee.initials || assignee.name?.charAt(0) : '?'}
              </div>
              <div>
                <div style="font-size:13px;font-weight:500;color:var(--gray-900);">${assignee ? assignee.name : task.assignedTo}</div>
                ${assignee?.territory ? `<div style="font-size:11px;color:var(--gray-400);">${assignee.territory}</div>` : ''}
              </div>
            </div>
          </td>
        ` : ''}
        <td style="padding:14px 16px;">
          <div style="font-size:13px;color:${isOverdue ? '#dc2626' : 'var(--gray-700)'};font-weight:${isOverdue ? '600' : '400'};">
            ${task.dueDate ? formatDate(task.dueDate) : '—'}
            ${isOverdue ? '<span style="margin-left:4px;">⚠️</span>' : ''}
          </div>
        </td>
        <td style="padding:14px 16px;">
          <span style="display:inline-block;padding:4px 10px;border-radius:4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;background:${priorityColors[priorityClass]}15;color:${priorityColors[priorityClass]};">
            ${task.priority || 'medium'}
          </span>
        </td>
        <td style="padding:14px 16px;text-align:center;">
          <button class="btn-icon" onclick="deleteTask(${task.id})" title="Delete task" style="background:transparent;border:none;cursor:pointer;font-size:16px;color:var(--gray-400);padding:4px 8px;border-radius:4px;transition:all 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='var(--gray-400)'">🗑️</button>
        </td>
      </tr>
    `
  })

  html += `</tbody></table>`
  return html
}

function filterTasks(filter) {
  currentTaskFilter = filter
  renderTaskAssign()
}

function assignTask() {
  const title = document.getElementById('taskTitle')?.value?.trim()
  const assignee = document.getElementById('taskAssignee')?.value
  const dueDate = document.getElementById('taskDueDate')?.value
  const priority = document.getElementById('taskPriority')?.value || 'medium'
  const type = document.getElementById('taskType')?.value || 'task'
  const relatedTo = document.getElementById('taskRelated')?.value?.trim()
  const notes = document.getElementById('taskNotes')?.value?.trim()

  if (!title) {
    showToast('Please enter a task title', 'error')
    return
  }
  if (!assignee) {
    showToast('Please select an employee to assign this task', 'error')
    return
  }
  if (!dueDate) {
    showToast('Please select a due date', 'error')
    return
  }

  const task = {
    title,
    assignedTo: assignee,
    dueDate,
    priority,
    type,
    relatedTo: relatedTo || '',
    notes: notes || '',
    completed: false,
    status: 'pending',
    assignedBy: S?.email || 'admin',
    assignedAt: new Date().toISOString()
  }

  DataStore.add('tasks', task)
  showToast('Task assigned successfully!', 'success')
  clearTaskForm()
  renderTaskAssign()
}

function clearTaskForm() {
  ;['taskTitle', 'taskAssignee', 'taskDueDate', 'taskDescription'].forEach(id => {
    const el = document.getElementById(id)
    if (el) el.value = ''
  })
  // Reset dropdowns
  const priority = document.getElementById('taskPriority')
  const type = document.getElementById('taskType')
  if (priority) priority.value = 'medium'
  if (type) type.value = 'task'

  // Keep due date as today
  const dueDate = document.getElementById('taskDueDate')
  if (dueDate) dueDate.value = new Date().toISOString().split('T')[0]
}

// Alias for HTML onclick handler
function submitTask() {
  return assignTask()
}

function completeAssignedTask(taskId) {
  const task = DataStore.toggleTask(taskId)
  if (task) {
    const msg = task.completed ? 'Task marked as completed!' : 'Task marked as pending'
    showToast(msg, task.completed ? 'success' : 'info')
    renderTaskAssign()
  }
}

function deleteTask(taskId) {
  if (!confirm('Are you sure you want to delete this task?')) return

  DataStore.delete('tasks', taskId)
  showToast('Task deleted', 'info')
  renderTaskAssign()
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (dateStr === today.toISOString().split('T')[0]) return 'Today'
  if (dateStr === tomorrow.toISOString().split('T')[0]) return 'Tomorrow'

  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ═══════════════════════════════════════════════════════════════
// MODAL BACKDROP HELPERS
// ═══════════════════════════════════════════════════════════════

function closeAllModals() {
  ;['contactModal', 'dealModal', 'campaignModal', 'documentModal', 'todayDoneModal', 'visitModal', 'projectModal', 'meetingModal', 'joinMeetingModal', 'profileModal'].forEach(id => {
    const modal = document.getElementById(id)
    if (modal) modal.style.display = 'none'
  })
  const backdrop = document.getElementById('modalBackdrop')
  if (backdrop) backdrop.style.display = 'none'
}

function openProfile(type, profileId) {
  let profile
  if (type === 'contact') {
    const contacts = DataStore.get('contacts') || []
    profile = contacts.find(c => String(c.id) === String(profileId))
  } else if (type === 'lead') {
    profile = myLeadsJ().find(l => String(l.id) === String(profileId))
  }

  if (!profile) {
    showToast('Profile not found', 'error')
    return
  }

  renderProfileModal(type, profile)
  const modal = document.getElementById('profileModal')
  const backdrop = document.getElementById('modalBackdrop')
  if (modal) modal.style.display = 'flex'
  if (backdrop) backdrop.style.display = 'block'
}

function renderProfileModal(type, profile) {
  const titleEl = document.getElementById('profileModalTitle')
  const bodyEl = document.getElementById('profileModalContent')
  if (!bodyEl || !titleEl) return

  const formatRow = (label, value) => `
    <div style="display:grid;grid-template-columns:140px 1fr;gap:12px;align-items:flex-start;margin-bottom:12px;">
      <div style="font-weight:600;color:var(--gray-700);">${label}</div>
      <div style="color:var(--gray-900);">${value || '—'}</div>
    </div>`

  let content = ''
  if (type === 'contact') {
    const name = profile.name || `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Contact Profile'
    titleEl.textContent = name

    content = `
      ${formatRow('Company', profile.company)}
      ${formatRow('Title', profile.title)}
      ${formatRow('Email', profile.email)}
      ${formatRow('Phone', profile.phone)}
      ${formatRow('Type', profile.type)}
      ${formatRow('Source', profile.source)}
      ${formatRow('Address', profile.address)}
      ${formatRow('Notes', profile.notes)}
      ${formatRow('Created', profile.createdAt ? new Date(profile.createdAt).toLocaleString('en-IN') : '—')}
    `
  } else {
    const name = profile.companyName || profile.company || profile.leadName || 'Lead Profile'
    titleEl.textContent = `${name}`

    content = `
      ${formatRow('Contact', profile.contactPerson || profile.leadName)}
      ${formatRow('Company', profile.companyName || profile.company)}
      ${formatRow('Email', profile.emailId || profile.email)}
      ${formatRow('Phone', profile.contactNumber || profile.phone)}
      ${formatRow('Status', profile.currentStatus || profile.status)}
      ${formatRow('Source', profile.leadSource || profile.source)}
      ${formatRow('Product', profile.productDiscussed)}
      ${formatRow('Executive', profile.salesExecutive)}
      ${formatRow('Follow-up', profile.nextFollowUp || profile.firstCallDate)}
      ${formatRow('Deal Value', profile.dealValue ? (profile.dealValue.toString().startsWith('₹') ? profile.dealValue : '₹' + profile.dealValue) : '—')}
      ${formatRow('Notes', profile.notes || profile.description || '')}
      ${formatRow('Created', profile.dateOfEntry || profile.timestamp || '—')}
    `
  }

  bodyEl.innerHTML = `
    <div style="display:grid;gap:18px;">
      ${content}
    </div>`
}

function closeProfileModal() {
  const modal = document.getElementById('profileModal')
  const backdrop = document.getElementById('modalBackdrop')
  if (modal) modal.style.display = 'none'
  if (backdrop) backdrop.style.display = 'none'
}

// ═══════════════════════════════════════════════════════════════
// CONTACT MODAL FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function openContactModal() {
  console.log('openContactModal called')
  const modal = document.getElementById('contactModal')
  const backdrop = document.getElementById('modalBackdrop')
  console.log('modal found:', modal)
  if (modal) {
    modal.style.display = 'flex'
    if (backdrop) backdrop.style.display = 'block'
    console.log('modal opened')
  }
}

function closeContactModal() {
  const modal = document.getElementById('contactModal')
  const backdrop = document.getElementById('modalBackdrop')
  if (modal) modal.style.display = 'none'
  if (backdrop) backdrop.style.display = 'none'
  clearContactForm()
}

function clearContactForm() {
  ;['contactFirstName', 'contactLastName', 'contactEmail', 'contactPhone', 'contactCompany', 'contactTitle', 'contactAddress', 'contactNotes'].forEach(id => {
    const el = document.getElementById(id)
    if (el) el.value = ''
  })
  ;['contactType', 'contactSource'].forEach(id => {
    const el = document.getElementById(id)
    if (el) el.selectedIndex = 0
  })
}

function submitContact() {
  const firstName = document.getElementById('contactFirstName')?.value?.trim()
  const lastName = document.getElementById('contactLastName')?.value?.trim()
  const email = document.getElementById('contactEmail')?.value?.trim()

  if (!firstName || !lastName) { showToast('Please enter first and last name', 'error'); return }
  if (!email) { showToast('Please enter email address', 'error'); return }

  const contact = {
    id: 'CONTACT-' + Date.now(),
    firstName,
    lastName,
    name: `${firstName} ${lastName}`,
    email,
    phone: document.getElementById('contactPhone')?.value?.trim() || '',
    company: document.getElementById('contactCompany')?.value?.trim() || '',
    title: document.getElementById('contactTitle')?.value?.trim() || '',
    type: document.getElementById('contactType')?.value || 'prospect',
    source: document.getElementById('contactSource')?.value || 'other',
    address: document.getElementById('contactAddress')?.value?.trim() || '',
    notes: document.getElementById('contactNotes')?.value?.trim() || '',
    createdAt: new Date().toISOString()
  }

  DataStore.add('contacts', contact)
  closeContactModal()
  renderContacts()
  showToast('Contact created successfully', 'success')
}

// ═══════════════════════════════════════════════════════════════
// DEAL MODAL FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function openDealModal() {
  const modal = document.getElementById('dealModal')
  if (modal) modal.style.display = 'flex'
}

function closeDealModal() {
  const modal = document.getElementById('dealModal')
  if (modal) modal.style.display = 'none'
  clearDealForm()
}

function clearDealForm() {
  ;['dealName', 'dealCompany', 'dealContact', 'dealValue', 'dealCloseDate', 'dealProbability', 'dealDescription'].forEach(id => {
    const el = document.getElementById(id)
    if (el) el.value = ''
  })
  ;['dealStage', 'dealSource'].forEach(id => {
    const el = document.getElementById(id)
    if (el) el.selectedIndex = 0
  })
}

function submitDeal() {
  const name = document.getElementById('dealName')?.value?.trim()
  const company = document.getElementById('dealCompany')?.value?.trim()
  const value = document.getElementById('dealValue')?.value

  if (!name) { showToast('Please enter deal name', 'error'); return }
  if (!company) { showToast('Please enter company name', 'error'); return }
  if (!value) { showToast('Please enter deal value', 'error'); return }

  const deal = {
    id: 'DEAL-' + Date.now(),
    name,
    company,
    contact: document.getElementById('dealContact')?.value?.trim() || '',
    value: parseFloat(value) || 0,
    stage: document.getElementById('dealStage')?.value || 'prospecting',
    closeDate: document.getElementById('dealCloseDate')?.value || '',
    probability: parseInt(document.getElementById('dealProbability')?.value) || 20,
    source: document.getElementById('dealSource')?.value || 'other',
    description: document.getElementById('dealDescription')?.value?.trim() || '',
    createdAt: new Date().toISOString(),
    assignedTo: S?.email || ''
  }

  DataStore.add('deals', deal)
  closeDealModal()
  renderDeals()
  renderDashboard()
  showToast('Deal created successfully', 'success')
}

// ═══════════════════════════════════════════════════════════════
// CAMPAIGN MODAL FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function openCampaignModal() {
  const modal = document.getElementById('campaignModal')
  if (modal) modal.style.display = 'flex'
}

function closeCampaignModal() {
  const modal = document.getElementById('campaignModal')
  if (modal) modal.style.display = 'none'
  clearCampaignForm()
}

function clearCampaignForm() {
  ;['campaignName', 'campaignStartDate', 'campaignEndDate', 'campaignBudget', 'campaignTarget', 'campaignDescription', 'campaignGoals'].forEach(id => {
    const el = document.getElementById(id)
    if (el) el.value = ''
  })
  ;['campaignType', 'campaignStatus'].forEach(id => {
    const el = document.getElementById(id)
    if (el) el.selectedIndex = 0
  })
}

function submitCampaign() {
  const name = document.getElementById('campaignName')?.value?.trim()
  const type = document.getElementById('campaignType')?.value

  if (!name) { showToast('Please enter campaign name', 'error'); return }

  const campaign = {
    id: 'CAMP-' + Date.now(),
    name,
    type,
    status: document.getElementById('campaignStatus')?.value || 'draft',
    startDate: document.getElementById('campaignStartDate')?.value || '',
    endDate: document.getElementById('campaignEndDate')?.value || '',
    budget: parseFloat(document.getElementById('campaignBudget')?.value) || 0,
    target: document.getElementById('campaignTarget')?.value?.trim() || '',
    description: document.getElementById('campaignDescription')?.value?.trim() || '',
    goals: document.getElementById('campaignGoals')?.value?.trim() || '',
    createdAt: new Date().toISOString(),
    leads: 0,
    conversions: 0
  }

  DataStore.add('campaigns', campaign)
  closeCampaignModal()
  renderCampaigns()
  showToast('Campaign created successfully', 'success')
}

// ═══════════════════════════════════════════════════════════════
// DOCUMENT MODAL FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function openDocumentModal() {
  const modal = document.getElementById('documentModal')
  if (modal) modal.style.display = 'flex'
}

function closeDocumentModal() {
  const modal = document.getElementById('documentModal')
  if (modal) modal.style.display = 'none'
  clearDocumentForm()
}

function clearDocumentForm() {
  ;['docName', 'docRelated', 'docDescription', 'docFile'].forEach(id => {
    const el = document.getElementById(id)
    if (el) el.value = ''
  })
  document.getElementById('docType').selectedIndex = 0
  document.getElementById('docFileName').textContent = 'No file selected'
}

function handleFileSelect() {
  const fileInput = document.getElementById('docFile')
  const fileName = fileInput?.files?.[0]?.name || 'No file selected'
  document.getElementById('docFileName').textContent = fileName
}

function submitDocument() {
  const name = document.getElementById('docName')?.value?.trim()
  const type = document.getElementById('docType')?.value
  const fileInput = document.getElementById('docFile')
  const file = fileInput?.files?.[0]

  if (!name) { showToast('Please enter document name', 'error'); return }
  if (!file) { showToast('Please select a file', 'error'); return }

  // Simulate file upload - store metadata only
  const docData = {
    id: 'DOC-' + Date.now(),
    name,
    type,
    relatedTo: document.getElementById('docRelated')?.value?.trim() || '',
    description: document.getElementById('docDescription')?.value?.trim() || '',
    fileName: file.name,
    fileSize: formatFileSize(file.size),
    uploadedAt: new Date().toLocaleString('en-IN'),
    uploadedBy: S?.name || 'User'
  }

  DataStore.add('documents', docData)
  closeDocumentModal()
  renderDocuments()
  showToast('Document uploaded successfully', 'success')
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Make modal functions globally available
window.openContactModal = openContactModal
window.closeContactModal = closeContactModal
window.submitContact = submitContact
window.openDealModal = openDealModal
window.closeDealModal = closeDealModal
window.submitDeal = submitDeal
window.openCampaignModal = openCampaignModal
window.closeCampaignModal = closeCampaignModal
window.submitCampaign = submitCampaign
window.openDocumentModal = openDocumentModal
window.closeDocumentModal = closeDocumentModal
window.submitDocument = submitDocument
window.handleFileSelect = handleFileSelect
// ═══════════════════════════════════════════════════════════════
// TODAY'S DONE FUNCTIONS
// ═══════════════════════════════════════════════════════════════

let currentTodayDoneFilter = 'all'

function openTodayDoneModal() {
  const modal = document.getElementById('todayDoneModal')
  const backdrop = document.getElementById('modalBackdrop')
  if (modal) {
    modal.style.display = 'flex'
    if (backdrop) backdrop.style.display = 'block'
  }
}

function closeTodayDoneModal() {
  const modal = document.getElementById('todayDoneModal')
  const backdrop = document.getElementById('modalBackdrop')
  if (modal) modal.style.display = 'none'
  if (backdrop) backdrop.style.display = 'none'
  clearTodayDoneForm()
}

function clearTodayDoneForm() {
  ;['tdActivityType', 'tdDescription', 'tdRelatedTo'].forEach(id => {
    const el = document.getElementById(id)
    if (el) el.value = ''
  })
  const status = document.getElementById('tdStatus')
  if (status) status.value = 'completed'
}

function submitTodayDone() {
  const type = document.getElementById('tdActivityType')?.value
  const description = document.getElementById('tdDescription')?.value?.trim()

  if (!type) { showToast('Please select activity type', 'error'); return }
  if (!description) { showToast('Please enter description', 'error'); return }

  const activity = {
    id: 'ACT-' + Date.now(),
    type,
    description,
    relatedTo: document.getElementById('tdRelatedTo')?.value?.trim() || '',
    status: document.getElementById('tdStatus')?.value || 'completed',
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toLocaleString('en-IN'),
    createdBy: S?.name || 'User'
  }

  DataStore.add('activities', activity)
  closeTodayDoneModal()
  renderTodayDone()
  showToast('Activity logged successfully', 'success')
}

function renderTodayDone() {
  const activities = DataStore.get('activities') || []
  const tbody = document.getElementById('todayDoneTableBody')
  const countEl = document.getElementById('todayDoneCount')

  if (!tbody) return

  let filtered = activities
  if (currentTodayDoneFilter !== 'all') {
    filtered = activities.filter(a => a.type === currentTodayDoneFilter)
  }

  if (countEl) countEl.textContent = filtered.length + ' activities'

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="padding:40px;text-align:center;color:var(--gray-400);">No activities logged yet</td></tr>'
  } else {
    tbody.innerHTML = filtered.slice().reverse().map(a => `
      <tr style="border-bottom:1px solid var(--gray-100);">
        <td style="padding:14px 16px;">${a.date || '—'}</td>
        <td style="padding:14px 16px;"><span class="badge ${a.type}">${a.type}</span></td>
        <td style="padding:14px 16px;">${a.description}</td>
        <td style="padding:14px 16px;color:var(--gray-700);">${a.relatedTo || '—'}</td>
        <td style="padding:14px 16px;"><span class="badge ${a.status}">${a.status}</span></td>
      </tr>
    `).join('')
  }
}

function filterTodayDone(filter) {
  currentTodayDoneFilter = filter
  renderTodayDone()
  
  // Update active tab styling
  const buttons = document.querySelectorAll('#sec-today-done .view-tab')
  buttons.forEach(btn => {
    btn.classList.remove('active')
    if (btn.textContent.toLowerCase().includes(filter) || 
        (filter === 'all' && btn.textContent.includes('All'))) {
      btn.classList.add('active')
    }
  })
}

// ═══════════════════════════════════════════════════════════════
// VISITS FUNCTIONS
// ═══════════════════════════════════════════════════════════════

let currentVisitFilter = 'all'

function openVisitModal() {
  const modal = document.getElementById('visitModal')
  const backdrop = document.getElementById('modalBackdrop')
  if (modal) {
    modal.style.display = 'flex'
    if (backdrop) backdrop.style.display = 'block'
  }
}

function closeVisitModal() {
  const modal = document.getElementById('visitModal')
  const backdrop = document.getElementById('modalBackdrop')
  if (modal) modal.style.display = 'none'
  if (backdrop) backdrop.style.display = 'none'
  clearVisitForm()
}

function clearVisitForm() {
  ;['visitClient', 'visitLocation', 'visitDate', 'visitNotes'].forEach(id => {
    const el = document.getElementById(id)
    if (el) el.value = ''
  })
  ;['visitType', 'visitOutcome'].forEach(id => {
    const el = document.getElementById(id)
    if (el) el.selectedIndex = 0
  })
}

function submitVisit() {
  const client = document.getElementById('visitClient')?.value?.trim()
  const type = document.getElementById('visitType')?.value
  const location = document.getElementById('visitLocation')?.value?.trim()
  const date = document.getElementById('visitDate')?.value

  if (!client) { showToast('Please enter client name', 'error'); return }
  if (!type) { showToast('Please select visit type', 'error'); return }
  if (!location) { showToast('Please enter location', 'error'); return }
  if (!date) { showToast('Please select date', 'error'); return }

  const visit = {
    id: 'VISIT-' + Date.now(),
    client,
    type,
    location,
    date,
    outcome: document.getElementById('visitOutcome')?.value || '',
    notes: document.getElementById('visitNotes')?.value?.trim() || '',
    status: 'completed',
    createdAt: new Date().toLocaleString('en-IN'),
    createdBy: S?.name || 'User'
  }

  DataStore.add('visits', visit)
  closeVisitModal()
  renderVisits()
  showToast('Visit logged successfully', 'success')
}

function renderVisits() {
  const visits = DataStore.get('visits') || []
  const tbody = document.getElementById('visitsTableBody')
  const countEl = document.getElementById('visitsCount')

  if (!tbody) return

  let filtered = visits
  if (currentVisitFilter !== 'all') {
    filtered = visits.filter(v => v.status === currentVisitFilter)
  }

  if (countEl) countEl.textContent = filtered.length + ' visits'

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="padding:40px;text-align:center;color:var(--gray-400);">No visits logged yet</td></tr>'
  } else {
    tbody.innerHTML = filtered.slice().reverse().map(v => `
      <tr style="border-bottom:1px solid var(--gray-100);">
        <td style="padding:14px 16px;">${v.date || '—'}</td>
        <td style="padding:14px 16px;font-weight:500;">${v.client}</td>
        <td style="padding:14px 16px;"><span class="badge ${v.type}">${v.type}</span></td>
        <td style="padding:14px 16px;color:var(--gray-700);">${v.location}</td>
        <td style="padding:14px 16px;"><span class="badge ${v.status}">${v.status}</span></td>
        <td style="padding:14px 16px;color:var(--gray-700);">${v.outcome || '—'}</td>
      </tr>
    `).join('')
  }
}

function filterVisits(filter) {
  currentVisitFilter = filter
  renderVisits()
  
  // Update active tab styling
  const buttons = document.querySelectorAll('#sec-visits .view-tab')
  buttons.forEach(btn => {
    btn.classList.remove('active')
    if (btn.textContent.toLowerCase().includes(filter) || 
        (filter === 'all' && btn.textContent.includes('All'))) {
      btn.classList.add('active')
    }
  })
}

// ═══════════════════════════════════════════════════════════════
// PROJECTS FUNCTIONS
// ═══════════════════════════════════════════════════════════════

let currentProjectFilter = 'all'

function openProjectModal() {
  const modal = document.getElementById('projectModal')
  const backdrop = document.getElementById('modalBackdrop')
  if (modal) {
    modal.style.display = 'flex'
    if (backdrop) backdrop.style.display = 'block'
  }
}

function closeProjectModal() {
  const modal = document.getElementById('projectModal')
  const backdrop = document.getElementById('modalBackdrop')
  if (modal) modal.style.display = 'none'
  if (backdrop) backdrop.style.display = 'none'
  clearProjectForm()
}

function clearProjectForm() {
  ;['projectName', 'projectClient', 'projectStartDate', 'projectDueDate', 'projectDescription'].forEach(id => {
    const el = document.getElementById(id)
    if (el) el.value = ''
  })
  const status = document.getElementById('projectStatus')
  if (status) status.value = 'active'
}

function submitProject() {
  const name = document.getElementById('projectName')?.value?.trim()
  const client = document.getElementById('projectClient')?.value?.trim()

  if (!name) { showToast('Please enter project name', 'error'); return }
  if (!client) { showToast('Please enter client name', 'error'); return }

  const project = {
    id: 'PROJ-' + Date.now(),
    name,
    client,
    startDate: document.getElementById('projectStartDate')?.value || '',
    dueDate: document.getElementById('projectDueDate')?.value || '',
    description: document.getElementById('projectDescription')?.value?.trim() || '',
    status: document.getElementById('projectStatus')?.value || 'active',
    progress: 0,
    createdAt: new Date().toLocaleString('en-IN'),
    createdBy: S?.name || 'User'
  }

  DataStore.add('projects', project)
  closeProjectModal()
  renderProjects()
  showToast('Project created successfully', 'success')
}

function renderProjects() {
  const projects = DataStore.get('projects') || []
  const tbody = document.getElementById('projectsTableBody')
  const countEl = document.getElementById('projectsCount')

  if (!tbody) return

  let filtered = projects
  if (currentProjectFilter !== 'all') {
    filtered = projects.filter(p => p.status === currentProjectFilter)
  }

  if (countEl) countEl.textContent = filtered.length + ' projects'

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="padding:40px;text-align:center;color:var(--gray-400);">No projects yet. Create your first project!</td></tr>'
  } else {
    tbody.innerHTML = filtered.slice().reverse().map(p => `
      <tr style="border-bottom:1px solid var(--gray-100);">
        <td style="padding:14px 16px;font-weight:500;">${p.name}</td>
        <td style="padding:14px 16px;color:var(--gray-700);">${p.client}</td>
        <td style="padding:14px 16px;"><span class="badge ${p.status}">${p.status}</span></td>
        <td style="padding:14px 16px;">
          <div style="width:100px;height:8px;background:var(--gray-200);border-radius:4px;overflow:hidden;">
            <div style="width:${p.progress}%;height:100%;background:var(--maroon);"></div>
          </div>
          <span style="font-size:11px;color:var(--gray-500);">${p.progress}%</span>
        </td>
        <td style="padding:14px 16px;color:var(--gray-700);">${p.dueDate || '—'}</td>
        <td style="padding:14px 16px;">
          <button class="btn-icon" onclick="showToast('Edit project - Coming Soon', 'info')">✏️</button>
        </td>
      </tr>
    `).join('')
  }
}

function filterProjects(filter) {
  currentProjectFilter = filter
  renderProjects()
  
  // Update active tab styling
  const buttons = document.querySelectorAll('#sec-projects .view-tab')
  buttons.forEach(btn => {
    btn.classList.remove('active')
    if (btn.textContent.toLowerCase().includes(filter) || 
        (filter === 'all' && btn.textContent.includes('All'))) {
      btn.classList.add('active')
    }
  })
}

// ═══════════════════════════════════════════════════════════════
// WINDOW EXPORTS
// ═══════════════════════════════════════════════════════════════

window.closeAllModals = closeAllModals
window.renderTasksTable = renderTasksTable
window.toggleTaskStatus = toggleTaskStatus
window.filterTasks = filterTasks
window.submitTask = submitTask
window.assignTask = assignTask

// Today's Done exports
window.openTodayDoneModal = openTodayDoneModal
window.closeTodayDoneModal = closeTodayDoneModal
window.submitTodayDone = submitTodayDone
window.renderTodayDone = renderTodayDone
window.filterTodayDone = filterTodayDone

// Visits exports
window.openVisitModal = openVisitModal
window.closeVisitModal = closeVisitModal
window.submitVisit = submitVisit
window.renderVisits = renderVisits
window.filterVisits = filterVisits

// Projects exports
window.openProjectModal = openProjectModal
window.closeProjectModal = closeProjectModal
window.submitProject = submitProject
window.renderProjects = renderProjects
window.filterProjects = filterProjects

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    submitSOD, renderSODHistory,
    submitEOD, renderEOD, renderEODHistory,
    submitWOD, renderWODHistory,
    submitLead, renderLeads,
    renderPipeline, renderForecasting,
    renderAnalytics, renderReports, renderTeam,
    renderAccounts, renderContacts, renderDeals, renderCampaigns,
    openContactModal, closeContactModal, submitContact,
    openDealModal, closeDealModal, submitDeal,
    openCampaignModal, closeCampaignModal, submitCampaign,
    openDocumentModal, closeDocumentModal, submitDocument,
    openProfile, closeProfileModal,
    submitTask, assignTask, toggleTaskStatus
  }
}

// ═══════════════════════════════════════════════════════════════
// CALLS/TELEPHONY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function renderCalls() {
  const calls = DataStore.get('calls') || []
  const tbody = document.getElementById('callBody')
  const countEl = document.getElementById('callCount')
  
  if (!tbody) return

  // Get filter values
  const search = document.getElementById('callSearch')?.value?.toLowerCase() || ''
  const statusF = document.getElementById('callStatusF')?.value || ''
  const priorityF = document.getElementById('callPriorityF')?.value || ''

  // Filter calls
  let filtered = calls
  if (search) {
    filtered = filtered.filter(c => 
      (c.customer && c.customer.toLowerCase().includes(search)) ||
      (c.phone && c.phone.toLowerCase().includes(search))
    )
  }
  if (statusF) filtered = filtered.filter(c => c.outcome === statusF)
  if (priorityF) filtered = filtered.filter(c => c.priority === priorityF)

  if (countEl) countEl.textContent = filtered.length + ' calls'

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="padding:40px;text-align:center;color:var(--gray-400);">No calls found</td></tr>'
  } else {
    tbody.innerHTML = filtered.slice().reverse().map(c => `
      <tr style="border-bottom:1px solid var(--gray-100);">
        <td style="padding:14px 16px;">${c.date || '—'}<br><span style="font-size:11px;color:var(--gray-500);">${c.time || ''}</span></td>
        <td style="padding:14px 16px;font-weight:500;">${c.customer || '—'}</td>
        <td style="padding:14px 16px;color:var(--gray-700);">${c.phone || '—'}</td>
        <td style="padding:14px 16px;color:var(--gray-700);">${c.duration || '—'}</td>
        <td style="padding:14px 16px;"><span class="badge ${c.outcome?.toLowerCase().replace(/\s+/g, '-')}">${c.outcome || '—'}</span></td>
        <td style="padding:14px 16px;"><span class="badge ${c.priority?.toLowerCase()}">${c.priority || '—'}</span></td>
        <td style="padding:14px 16px;color:var(--gray-700);">${c.agent || '—'}</td>
        <td style="padding:14px 16px;">${c.recording ? '▶️' : '—'}</td>
        <td style="padding:14px 16px;"><button class="btn-icon" onclick="showToast('Call details - Coming Soon', 'info')">👁️</button></td>
      </tr>
    `).join('')
  }
}

// Make globally available
window.renderCalls = renderCalls

// ═══════════════════════════════════════════════════════════════
// WORKQUEUE SIMPLE FILTER
// ═══════════════════════════════════════════════════════════════

function filterWq(el, type) {
  // Update active state on sidebar items
  document.querySelectorAll('#sec-workqueue .wq-list:first-of-type .wq-item').forEach(item => {
    item.classList.remove('active')
  })
  el.classList.add('active')
  
  // Update the title
  const titleEl = document.getElementById('wqTitle')
  if (titleEl) {
    titleEl.textContent = type.charAt(0).toUpperCase() + type.slice(1)
  }
  
  // Show sample data based on type (static demo data)
  const tbody = document.getElementById('wqTableBody')
  if (!tbody) return
  
  const sampleData = {
    tasks: [
      { subject: 'Follow up with Lead', related: 'Chau Kitzman (Sample)', time: 'Today 11:46 AM', icon: 'task' },
      { subject: 'Send proposal email', related: 'Acme Corp', time: 'Today 2:00 PM', icon: 'task' }
    ],
    meetings: [
      { subject: 'Discovery Call with Client', related: 'John Doe (Sample)', time: 'Tomorrow 10:00 AM', icon: 'meeting' }
    ],
    calls: [
      { subject: 'Follow up with Lead', related: 'Chau Kitzman (Sample)', time: 'Today 11:46 AM', icon: 'call' }
    ]
  }
  
  const data = sampleData[type] || sampleData.calls
  
  tbody.innerHTML = data.map(row => `
    <tr>
      <td><input type="checkbox"></td>
      <td class="subject">${row.subject}</td>
      <td class="related">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
        ${row.related}
      </td>
      <td class="time">${row.time}</td>
    </tr>
  `).join('')
  
  // Update total count
  const totalEl = document.getElementById('wqTotalRecords')
  if (totalEl) {
    totalEl.textContent = `Total Records ${data.length}`
  }
}

// Make globally available
window.filterWq = filterWq

// ═══════════════════════════════════════════════════════════════
// FUNDING SATHI MEETING ROOM (Admin & Members Only)
// ═══════════════════════════════════════════════════════════════

let currentRoomId = null
let meetingTimer = null
let meetingStartTime = null
let micEnabled = false
let cameraEnabled = false
let screenSharing = false

// Helper to check if user has access (admin or member)
function hasMeetingAccess() {
  const role = S?.role?.toLowerCase()
  return role === 'admin' || role === 'member'
}

function generateRoomId() {
  return 'FS-' + Math.floor(1000 + Math.random() * 9000)
}

function showCreateRoomModal() {
  if (!hasMeetingAccess()) {
    showToast('Access denied. Only members and admins can create meeting rooms.', 'error')
    return
  }
  const modal = document.getElementById('meetingModal')
  const backdrop = document.getElementById('modalBackdrop')
  if (modal) {
    modal.style.display = 'flex'
    if (backdrop) backdrop.style.display = 'block'
    document.getElementById('roomIdInput').value = generateRoomId()
  }
}

function showJoinRoomModal() {
  if (!hasMeetingAccess()) {
    showToast('Access denied. Only members and admins can join meeting rooms.', 'error')
    return
  }
  const modal = document.getElementById('joinMeetingModal')
  const backdrop = document.getElementById('modalBackdrop')
  if (modal) {
    modal.style.display = 'flex'
    if (backdrop) backdrop.style.display = 'block'
  }
}

function createRoom() {
  if (!hasMeetingAccess()) {
    showToast('Access denied. Only members and admins can create meeting rooms.', 'error')
    return
  }
  const roomName = document.getElementById('roomNameInput')?.value || 'New Meeting'
  currentRoomId = document.getElementById('roomIdInput')?.value || generateRoomId()
  
  closeAllModals()
  startMeeting(currentRoomId, roomName)
  showToast('Meeting room created: ' + currentRoomId, 'success')
}

function joinRoom(roomId) {
  if (!hasMeetingAccess()) {
    showToast('Access denied. Only members and admins can join meeting rooms.', 'error')
    return
  }
  if (!roomId) {
    roomId = document.getElementById('joinRoomIdInput')?.value
  }
  if (!roomId) {
    showToast('Please enter a room ID', 'error')
    return
  }
  
  currentRoomId = roomId
  closeAllModals()
  startMeeting(currentRoomId, 'Joined Meeting')
  showToast('Joined room: ' + currentRoomId, 'success')
}

function createInstantRoom() {
  if (!hasMeetingAccess()) {
    showToast('Access denied. Only members and admins can start instant meetings.', 'error')
    return
  }
  currentRoomId = generateRoomId()
  startMeeting(currentRoomId, 'Instant Meeting')
  showToast('Instant meeting started: ' + currentRoomId, 'success')
}

function startMeeting(roomId, roomName) {
  document.getElementById('roomListContainer').style.display = 'none'
  document.getElementById('meetingRoomContainer').style.display = 'block'
  document.getElementById('currentRoomId').textContent = roomId
  
  // Start timer
  meetingStartTime = Date.now()
  meetingTimer = setInterval(updateMeetingTimer, 1000)
  
  // Reset controls
  micEnabled = false
  cameraEnabled = false
  updateControlButtons()
}

function leaveMeeting() {
  if (meetingTimer) {
    clearInterval(meetingTimer)
    meetingTimer = null
  }
  
  document.getElementById('meetingRoomContainer').style.display = 'none'
  document.getElementById('roomListContainer').style.display = 'block'
  currentRoomId = null
  
  showToast('Left the meeting', 'info')
}

function updateMeetingTimer() {
  if (!meetingStartTime) return
  const elapsed = Math.floor((Date.now() - meetingStartTime) / 1000)
  const hours = Math.floor(elapsed / 3600).toString().padStart(2, '0')
  const minutes = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0')
  const seconds = (elapsed % 60).toString().padStart(2, '0')
  document.getElementById('meetingTimer').textContent = `${hours}:${minutes}:${seconds}`
}

function toggleMic() {
  micEnabled = !micEnabled
  updateControlButtons()
  showToast(micEnabled ? 'Microphone enabled' : 'Microphone muted', 'info')
}

function toggleCamera() {
  cameraEnabled = !cameraEnabled
  updateControlButtons()
  showToast(cameraEnabled ? 'Camera enabled' : 'Camera disabled', 'info')
}

function toggleScreenShare() {
  screenSharing = !screenSharing
  showToast(screenSharing ? 'Screen sharing started' : 'Screen sharing stopped', 'info')
}

function toggleChat() {
  showToast('Chat feature coming soon', 'info')
}

function toggleParticipants() {
  showToast('Participants panel coming soon', 'info')
}

function updateControlButtons() {
  const micBtn = document.getElementById('micBtn')
  const camBtn = document.getElementById('camBtn')
  
  if (micBtn) {
    micBtn.style.background = micEnabled ? 'var(--maroon)' : 'var(--gray-700)'
  }
  if (camBtn) {
    camBtn.style.background = cameraEnabled ? 'var(--maroon)' : 'var(--gray-700)'
  }
}

function copyRoomLink() {
  if (!currentRoomId) return
  const link = `${window.location.origin}/meet/${currentRoomId}`
  navigator.clipboard.writeText(link).then(() => {
    showToast('Room link copied to clipboard', 'success')
  }).catch(() => {
    showToast('Failed to copy link', 'error')
  })
}

// Make globally available
window.showCreateRoomModal = showCreateRoomModal
window.showJoinRoomModal = showJoinRoomModal
window.createRoom = createRoom
window.joinRoom = joinRoom
window.createInstantRoom = createInstantRoom
window.leaveMeeting = leaveMeeting
window.toggleMic = toggleMic
window.toggleCamera = toggleCamera
window.toggleScreenShare = toggleScreenShare
window.toggleChat = toggleChat
window.toggleParticipants = toggleParticipants
window.copyRoomLink = copyRoomLink
