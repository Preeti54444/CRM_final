// ═══════════════════════════════════════════════════════════════
// CRM DASHBOARD - Dashboard Rendering & KPI Functions
// ═══════════════════════════════════════════════════════════════

// Main render function
function renderAll() {
  renderDashboard()
}

// Dashboard renderer
function renderDashboard() {
  const stats = DataStore.getDashboardStats()
  const leads = DataStore.get('leads')
  const isAdmin = S?.role === 'admin'
  
  // Filter tasks by user role
  let allTasks = DataStore.get('tasks')
  if (!isAdmin) {
    // Employees see only tasks assigned to them
    allTasks = allTasks.filter(t => {
      const assignedTo = t.assignedTo?.toLowerCase() || ''
      return assignedTo === S?.email?.toLowerCase() ||
             assignedTo === 'me' ||
             assignedTo === S?.name?.toLowerCase()
    })
  }
  const tasks = allTasks.filter(t => !t.completed)
  const activities = DataStore.get('activities').slice(0, 8)

  // Update KPI Cards
  const kpiLeads = document.getElementById('kpi-leads')
  const kpiDeals = document.getElementById('kpi-deals')
  const kpiWon = document.getElementById('kpi-won')
  const kpiConversion = document.getElementById('kpi-conversion')

  if (kpiLeads) kpiLeads.textContent = stats.leads.total.toLocaleString()
  if (kpiDeals) kpiDeals.textContent = stats.deals.open
  if (kpiWon) kpiWon.textContent = '₹' + (stats.deals.wonValue / 1000000).toFixed(1) + 'Cr'
  if (kpiConversion) kpiConversion.textContent = stats.conversionRate + '%'

  // Update Pipeline stages
  const pipelineData = DataStore.getPipelineData()
  pipelineData.forEach(stage => {
    const countEl = document.getElementById(`pipeline-${stage.stage}-count`)
    const valueEl = document.getElementById(`pipeline-${stage.stage}-value`)
    if (countEl) countEl.textContent = stage.count + ' deals'
    if (valueEl) valueEl.textContent = '₹' + (stage.value / 100000).toFixed(1) + 'L'
  })

  // Update Tasks Subtitle
  const tasksSubtitle = document.getElementById('tasksSubtitle')
  if (tasksSubtitle) {
    tasksSubtitle.textContent = `${tasks.length} pending${isAdmin ? '' : ' for you'}`
  }

  // Render Tasks Panel
  const tasksList = document.getElementById('tasksList')
  const employees = DataStore.get('employees') || []
  if (tasksList) {
    if (tasks.length === 0) {
      tasksList.innerHTML = `<div style="padding:20px;text-align:center;color:var(--gray-400);">${isAdmin ? 'No pending tasks' : 'No tasks assigned to you'}</div>`
    } else {
      tasksList.innerHTML = tasks.slice(0, 5).map(task => {
        const assignee = employees.find(e => e.email === task.assignedTo) ||
                        (task.assignedTo === 'me' ? { name: 'Me', initials: 'ME' } : null)
        const assigneeHtml = isAdmin && assignee ? `
          <div style="display:flex;align-items:center;gap:6px;margin-top:4px;">
            <div style="width:16px;height:16px;border-radius:50%;background:var(--maroon);color:#fff;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:600;">${assignee.initials || assignee.name?.charAt(0)}</div>
            <span style="font-size:10px;color:var(--gray-500);">${assignee.name}</span>
          </div>
        ` : ''
        return `
        <div class="task-item" style="display:flex;align-items:center;gap:10px;padding:10px;border-bottom:1px solid var(--gray-100);">
          <input type="checkbox" onchange="completeTask(${task.id})" style="cursor:pointer;">
          <div style="flex:1;">
            <div style="font-size:13px;font-weight:500;color:var(--gray-800);">${task.title}</div>
            <div style="font-size:11px;color:var(--gray-500);">${task.relatedTo || '—'} • ${task.dueDate || 'No due date'}</div>
            ${assigneeHtml}
          </div>
          <span class="badge ${task.priority}" style="font-size:10px;padding:2px 8px;border-radius:4px;">${task.priority}</span>
        </div>
      `}).join('')
    }
  }

  // Render Recent Leads
  const recentLeadsBody = document.getElementById('recentLeadsBody')
  if (recentLeadsBody) {
    const recentLeads = leads.slice(0, 5)
    if (recentLeads.length === 0) {
      recentLeadsBody.innerHTML = '<tr><td colspan="4" style="padding:20px;text-align:center;color:var(--gray-400);">No leads yet</td></tr>'
    } else {
      recentLeadsBody.innerHTML = recentLeads.map(lead => `
        <tr>
          <td style="padding:12px 16px;border-bottom:1px solid var(--gray-100);">
            <div style="display:flex;align-items:center;gap:8px;">
              <div class="av" style="width:28px;height:28px;font-size:12px;background:var(--maroon-light);color:var(--maroon);">${lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
              <div>
                <div style="font-size:13px;font-weight:500;color:var(--gray-800);">${lead.name}</div>
                <div style="font-size:11px;color:var(--gray-500);">${lead.company}</div>
              </div>
            </div>
          </td>
          <td style="padding:12px 16px;border-bottom:1px solid var(--gray-100);font-size:12px;color:var(--gray-600);">${lead.source || '—'}</td>
          <td style="padding:12px 16px;border-bottom:1px solid var(--gray-100);">
            <span class="status-badge ${lead.status}">${lead.status}</span>
          </td>
          <td style="padding:12px 16px;border-bottom:1px solid var(--gray-100);font-size:12px;color:var(--gray-600);">₹${(lead.dealValue / 100000).toFixed(1)}L</td>
        </tr>
      `).join('')
    }
  }

  // Render Activity Feed
  const activityList = document.getElementById('activityList')
  if (activityList) {
    if (activities.length === 0) {
      activityList.innerHTML = '<div style="padding:20px;text-align:center;color:var(--gray-400);">No recent activity</div>'
    } else {
      activityList.innerHTML = activities.map(act => `
        <div class="activity-item" style="display:flex;gap:12px;padding:12px;border-bottom:1px solid var(--gray-100);">
          <div class="activity-icon ${act.type}" style="width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:var(--gray-100);">
            ${getActivityIcon(act.type)}
          </div>
          <div style="flex:1;">
            <div style="font-size:13px;color:var(--gray-800);">${act.description}</div>
            <div style="font-size:11px;color:var(--gray-500);margin-top:2px;">${formatTime(act.timestamp)}</div>
          </div>
        </div>
      `).join('')
    }
  }
}

// Complete a task
function completeTask(taskId) {
  DataStore.toggleTask(taskId)
  renderDashboard()
  showToast('Task completed!', 'success')
}

// Filter dashboard activities
function filterActivity(type) {
  const activities = DataStore.get('activities')
  const filtered = type === 'all' ? activities.slice(0, 8) : activities.filter(a => a.type === type).slice(0, 8)

  const activityList = document.getElementById('activityList')
  if (activityList) {
    activityList.innerHTML = filtered.map(act => `
      <div class="activity-item" style="display:flex;gap:12px;padding:12px;border-bottom:1px solid var(--gray-100);">
        <div class="activity-icon ${act.type}" style="width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:var(--gray-100);">
          ${getActivityIcon(act.type)}
        </div>
        <div style="flex:1;">
          <div style="font-size:13px;color:var(--gray-800);">${act.description}</div>
          <div style="font-size:11px;color:var(--gray-500);margin-top:2px;">${formatTime(act.timestamp)}</div>
        </div>
      </div>
    `).join('')
  }

  // Update active filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === type)
  })
}

// Static HTML activity filter (for non-DataStore lists)
function filterStaticActivity(filterType) {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active')
    if (btn.dataset.filter === filterType) {
      btn.classList.add('active')
    }
  })

  const activities = document.querySelectorAll('.activity-item')
  activities.forEach(item => {
    if (filterType === 'all' || item.dataset.type === filterType) {
      item.style.display = 'flex'
    } else {
      item.style.display = 'none'
    }
  })
}

// Toggle task completion in UI
function toggleTask(taskId) {
  const taskItem = document.querySelector(`[data-task-id="${taskId}"]`)
  if (!taskItem) return

  const checkbox = taskItem.querySelector('input[type="checkbox"]')
  if (checkbox && checkbox.checked) {
    taskItem.classList.add('completed')
    const tag = taskItem.querySelector('.task-tag')
    if (tag) {
      tag.className = 'task-tag completed'
      tag.textContent = 'Done'
    }
  } else {
    taskItem.classList.remove('completed')
  }

  updateTaskCount()
}

// Update task count display
function updateTaskCount() {
  const totalTasks = document.querySelectorAll('.task-item').length
  const completedTasks = document.querySelectorAll('.task-item.completed').length
  const pendingTasks = totalTasks - completedTasks

  const subtitle = document.getElementById('tasksSubtitle')
  if (subtitle) {
    subtitle.textContent = `${pendingTasks} pending`
  }
}

// Add new task - redirect to Task Assign section for proper task assignment
function addTask() {
  const isAdmin = S?.role === 'admin'
  if (isAdmin) {
    // Navigate to Task Assign section
    const taskAssignBtn = document.querySelector('[data-sec="task-assign"]')
    if (taskAssignBtn) taskAssignBtn.click()
  } else {
    // For employees, show a message to contact admin
    showToast('Please contact admin to assign you new tasks', 'info')
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderDashboard, renderAll, completeTask, filterActivity, toggleTask, addTask }
}
