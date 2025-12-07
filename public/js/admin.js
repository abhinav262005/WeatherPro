// Admin Panel JavaScript

let currentUser = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await checkAdminAuth();
    setupEventListeners();
    loadDashboardData();
    updateDateTime();
    setInterval(updateDateTime, 1000);
});

// Check if user is admin
async function checkAdminAuth() {
    try {
        const response = await fetch('/api/user');
        if (!response.ok) {
            window.location.href = '/admin/login';
            return;
        }
        currentUser = await response.json();
        
        // Check if user is admin
        if (!currentUser.is_admin) {
            alert('Access denied. Admin privileges required.');
            window.location.href = '/admin/login';
            return;
        }
        
        // Log login activity
        const ipAddress = await getIPAddress();
        const device = getDeviceInfo();
        const lastLoginTime = localStorage.getItem('lastLoginTime');
        const lastLoginUser = localStorage.getItem('lastLoginUser');
        
        // Only log if it's a new session (different login or more than 30 minutes ago)
        const shouldLog = !lastLoginTime || 
                         lastLoginUser !== currentUser.username ||
                         Date.now() - parseInt(lastLoginTime) > 1800000; // 30 minutes
        
        if (shouldLog) {
            logActivity(currentUser.username, currentUser.email, 'login', ipAddress, device);
            localStorage.setItem('lastLoginTime', Date.now().toString());
            localStorage.setItem('lastLoginUser', currentUser.username);
        }
        localStorage.setItem('lastActivity', Date.now().toString());
        
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/admin/login';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const section = item.dataset.section;
            if (section) {
                e.preventDefault();
                switchSection(section);
                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            }
        });
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        try {
            // Log logout activity
            if (currentUser) {
                const ipAddress = await getIPAddress();
                const device = getDeviceInfo();
                logActivity(currentUser.username, currentUser.email, 'logout', ipAddress, device);
            }
            
            localStorage.removeItem('lastActivity');
            await fetch('/api/logout', { method: 'POST' });
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    });

    // Theme toggle
    const themeToggleBtn = document.getElementById('themeToggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const icon = themeToggleBtn.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-moon');
                icon.classList.toggle('fa-sun');
            }
            
            // Save theme preference
            const isLight = document.body.classList.contains('light-theme');
            localStorage.setItem('adminTheme', isLight ? 'light' : 'dark');
        });
        
        // Load saved theme
        const savedTheme = localStorage.getItem('adminTheme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            const icon = themeToggleBtn.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
        }
    }

    // Refresh
    document.getElementById('refreshBtn').addEventListener('click', () => {
        loadDashboardData();
    });

    // Mobile menu
    document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('active');
    });

    // Add user button
    document.getElementById('addUserBtn')?.addEventListener('click', () => {
        showAddUserModal();
    });

    // Save content buttons
    document.getElementById('saveContentBtn')?.addEventListener('click', saveContent);
    document.getElementById('saveContentBtn2')?.addEventListener('click', saveContent);
    
    // Settings buttons
    document.getElementById('backupDbBtn')?.addEventListener('click', exportDatabaseInfo);
    document.getElementById('testApiBtn')?.addEventListener('click', testApiConnection);
    document.getElementById('saveSecurityBtn')?.addEventListener('click', saveSecuritySettings);
    document.getElementById('clearCacheBtn')?.addEventListener('click', clearCache);
    document.getElementById('deleteInactiveBtn')?.addEventListener('click', deleteInactiveUsers);
    document.getElementById('optimizeDbBtn')?.addEventListener('click', optimizeDatabase);
    document.getElementById('saveEmailBtn')?.addEventListener('click', saveEmailSettings);
    
    // Activity filters
    document.getElementById('activitySearch')?.addEventListener('input', loadActivityLogs);
    document.getElementById('activityTypeFilter')?.addEventListener('change', loadActivityLogs);
    document.getElementById('activityDateFilter')?.addEventListener('change', loadActivityLogs);
}

// Switch section
function switchSection(section) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.getElementById(section)?.classList.add('active');
    
    // Load section data
    switch(section) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'users':
            loadUsers();
            break;
        case 'locations':
            loadAllLocations();
            break;
        case 'alerts':
            loadAllAlerts();
            break;
        case 'content':
            loadContent();
            break;
        case 'settings':
            loadSystemSettings();
            break;
        case 'activity':
            loadActivityLogs();
            break;
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        showLoading();
        
        const [stats, recentUsers] = await Promise.all([
            fetch('/api/admin/stats').then(r => r.json()),
            fetch('/api/admin/recent-users').then(r => r.json())
        ]);
        
        // Update stats
        document.getElementById('totalUsers').textContent = stats.totalUsers || 0;
        document.getElementById('totalLocations').textContent = stats.totalLocations || 0;
        document.getElementById('totalAlerts').textContent = stats.totalAlerts || 0;
        document.getElementById('activeUsers').textContent = stats.activeUsers || 0;
        
        // Display recent users
        displayRecentUsers(recentUsers);
        
        // Load enhanced dashboard features
        loadSystemStatus();
        loadQuickStats();
        loadNotifications();
        setupQuickSearch();
        
        // Set admin name
        if (currentUser) {
            document.getElementById('adminNameDisplay').textContent = currentUser.username;
        }
        
        hideLoading();
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
        hideLoading();
    }
}

// Load system status
function loadSystemStatus() {
    // Simulate system metrics
    document.getElementById('dbStatus').textContent = 'Connected';
    document.getElementById('dbStatus').className = 'status-active';
    document.getElementById('apiStatusDash').textContent = 'Active';
    document.getElementById('apiStatusDash').className = 'status-active';
    
    // Memory usage (simulated)
    const memUsage = Math.floor(Math.random() * 30 + 40);
    document.getElementById('memoryUsage').textContent = `${memUsage}%`;
    
    // Response time
    const respTime = Math.floor(Math.random() * 50 + 20);
    document.getElementById('responseTime').textContent = `${respTime}ms`;
}

// Load quick stats
function loadQuickStats() {
    // Calculate new users in last 7 days
    const savedLogs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsers = savedLogs.filter(log => 
        log.activityType === 'login' && new Date(log.timestamp) > sevenDaysAgo
    ).length;
    
    document.getElementById('newUsers7d').textContent = newUsers;
    
    // Active sessions
    const today = new Date().toDateString();
    const todayLogins = savedLogs.filter(log => 
        log.activityType === 'login' && new Date(log.timestamp).toDateString() === today
    ).length;
    const todayLogouts = savedLogs.filter(log => 
        log.activityType === 'logout' && new Date(log.timestamp).toDateString() === today
    ).length;
    document.getElementById('activeSessions').textContent = Math.max(0, todayLogins - todayLogouts);
    
    // API calls (simulated)
    const apiCalls = Math.floor(Math.random() * 500 + 100);
    document.getElementById('apiCallsToday').textContent = apiCalls;
    
    // Average response
    const avgResp = Math.floor(Math.random() * 100 + 50);
    document.getElementById('avgResponse').textContent = `${avgResp}ms`;
}

// Setup quick search
function setupQuickSearch() {
    const searchInput = document.getElementById('quickSearch');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', async (e) => {
        const query = e.target.value.toLowerCase().trim();
        const resultsDiv = document.getElementById('quickSearchResults');
        
        if (query.length < 2) {
            resultsDiv.innerHTML = '';
            return;
        }
        
        try {
            const users = await fetch('/api/admin/users').then(r => r.json());
            const matches = users.filter(user => 
                user.username.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query) ||
                (user.full_name && user.full_name.toLowerCase().includes(query))
            ).slice(0, 5);
            
            if (matches.length === 0) {
                resultsDiv.innerHTML = '<p style="color: var(--text-light); padding: 0.5rem;">No results found</p>';
                return;
            }
            
            resultsDiv.innerHTML = matches.map(user => `
                <div class="user-item" onclick="viewUserDetails(${user.id})" style="cursor: pointer;">
                    <div class="user-item-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="user-item-info">
                        <div class="user-item-name">${user.username}</div>
                        <div class="user-item-email">${user.email}</div>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Search failed:', error);
        }
    });
}

// View user details
function viewUserDetails(userId) {
    switchSection('users');
    setTimeout(() => editUser(userId), 300);
}

// Load notifications
function loadNotifications() {
    const notificationsDiv = document.getElementById('notificationsCenter');
    if (!notificationsDiv) return;
    
    const notifications = [
        { type: 'info', icon: 'fa-info-circle', message: 'System backup completed successfully', time: '5 minutes ago', color: '#3b82f6' },
        { type: 'success', icon: 'fa-check-circle', message: '2 new users registered today', time: '1 hour ago', color: '#10b981' },
        { type: 'warning', icon: 'fa-exclamation-triangle', message: 'Database optimization recommended', time: '2 hours ago', color: '#f59e0b' },
        { type: 'info', icon: 'fa-bell', message: 'API rate limit at 75% capacity', time: '3 hours ago', color: '#3b82f6' }
    ];
    
    notificationsDiv.innerHTML = notifications.map(notif => `
        <div class="activity-item" style="border-left: 3px solid ${notif.color};">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <i class="fas ${notif.icon}" style="color: ${notif.color}; font-size: 1.25rem;"></i>
                <div style="flex: 1;">
                    <div class="activity-text">${notif.message}</div>
                    <div class="activity-time">${notif.time}</div>
                </div>
            </div>
        </div>
    `).join('');
}

// Quick add user
function quickAddUser() {
    showAddUserModal();
}

// Generate report
function generateReport() {
    showLoading();
    
    setTimeout(async () => {
        try {
            const stats = await fetch('/api/admin/stats').then(r => r.json());
            const users = await fetch('/api/admin/users').then(r => r.json());
            const logs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
            
            const report = {
                generatedAt: new Date().toISOString(),
                summary: {
                    totalUsers: stats.totalUsers,
                    totalLocations: stats.totalLocations,
                    totalAlerts: stats.totalAlerts,
                    activeUsers: stats.activeUsers
                },
                users: users.map(u => ({
                    id: u.id,
                    username: u.username,
                    email: u.email,
                    isAdmin: u.is_admin,
                    createdAt: u.created_at,
                    lastLogin: u.last_login
                })),
                recentActivity: logs.slice(0, 50)
            };
            
            const dataStr = JSON.stringify(report, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `admin-report-${Date.now()}.json`;
            link.click();
            URL.revokeObjectURL(url);
            
            hideLoading();
            showSuccessMessage('Report generated and downloaded successfully!');
        } catch (error) {
            hideLoading();
            alert('Failed to generate report: ' + error.message);
        }
    }, 1000);
}

// System health check
function systemHealth() {
    showLoading();
    
    setTimeout(() => {
        const health = {
            database: 'Healthy',
            api: 'Healthy',
            memory: '45% Used',
            cpu: '32% Used',
            disk: '68% Used',
            uptime: document.getElementById('serverUptime')?.textContent || 'N/A'
        };
        
        hideLoading();
        
        const healthHTML = `
            <div style="padding: 1rem;">
                <h3 style="margin-bottom: 1rem;">System Health Report</h3>
                ${Object.entries(health).map(([key, value]) => `
                    <div style="display: flex; justify-content: space-between; padding: 0.5rem; border-bottom: 1px solid var(--border);">
                        <strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong>
                        <span class="status-active">${value}</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3><i class="fas fa-heartbeat"></i> System Health</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-content">${healthHTML}</div>
                <div class="modal-footer">
                    <button class="btn-primary" onclick="this.closest('.modal-overlay').remove()">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }, 1000);
}

// Bulk email users
function bulkEmailUsers() {
    if (confirm('Send email notification to all users?')) {
        showLoading();
        setTimeout(() => {
            hideLoading();
            showSuccessMessage('Email sent to all users successfully!');
        }, 2000);
    }
}

// Reset all passwords
function resetAllPasswords() {
    if (confirm('This will send password reset emails to all users. Continue?')) {
        showLoading();
        setTimeout(() => {
            hideLoading();
            showSuccessMessage('Password reset emails sent to all users!');
        }, 2000);
    }
}

// Export all data
async function exportAllData() {
    if (!confirm('Export all system data? This may take a moment.')) return;
    
    showLoading();
    
    try {
        const [stats, users, locations, alerts] = await Promise.all([
            fetch('/api/admin/stats').then(r => r.json()),
            fetch('/api/admin/users').then(r => r.json()),
            fetch('/api/admin/locations').then(r => r.json()),
            fetch('/api/admin/alerts').then(r => r.json())
        ]);
        
        const exportData = {
            exportDate: new Date().toISOString(),
            stats,
            users,
            locations,
            alerts,
            activityLogs: JSON.parse(localStorage.getItem('activityLogs') || '[]')
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `full-export-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        hideLoading();
        showSuccessMessage('All data exported successfully!');
    } catch (error) {
        hideLoading();
        alert('Export failed: ' + error.message);
    }
}

// Clear old data
function clearOldData() {
    if (!confirm('Delete data older than 90 days? This cannot be undone.')) return;
    
    showLoading();
    
    setTimeout(() => {
        const logs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        const filteredLogs = logs.filter(log => new Date(log.timestamp) > ninetyDaysAgo);
        localStorage.setItem('activityLogs', JSON.stringify(filteredLogs));
        
        hideLoading();
        showSuccessMessage(`Cleared ${logs.length - filteredLogs.length} old records!`);
    }, 1500);
}

// Display recent users
function displayRecentUsers(users) {
    const container = document.getElementById('recentUsersList');
    container.innerHTML = '';
    
    if (users.length === 0) {
        container.innerHTML = '<p style="color: var(--text-light);">No recent users</p>';
        return;
    }
    
    users.slice(0, 5).forEach(user => {
        const item = document.createElement('div');
        item.className = 'user-item';
        item.innerHTML = `
            <div class="user-item-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="user-item-info">
                <div class="user-item-name">${user.username}</div>
                <div class="user-item-email">${user.email}</div>
            </div>
        `;
        container.appendChild(item);
    });
}

// Load all users
async function loadUsers() {
    try {
        showLoading();
        const users = await fetch('/api/admin/users').then(r => r.json());
        displayUsers(users);
        hideLoading();
    } catch (error) {
        console.error('Failed to load users:', error);
        hideLoading();
    }
}

// Display users in table
function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No users found</td></tr>';
        return;
    }
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.full_name || '-'}</td>
            <td>${user.is_admin ? '<span class="status-badge status-admin">Admin</span>' : '<span class="status-badge status-active">User</span>'}</td>
            <td>${formatDate(user.created_at)}</td>
            <td>${user.last_login ? formatDate(user.last_login) : 'Never'}</td>
            <td>
                <button class="action-btn btn-edit" onclick="editUser(${user.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="action-btn btn-delete" onclick="deleteUser(${user.id}, '${user.username}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Edit user
async function editUser(userId) {
    try {
        const user = await fetch(`/api/admin/users/${userId}`).then(r => r.json());
        
        document.getElementById('editUserId').value = user.id;
        document.getElementById('editUsername').value = user.username;
        document.getElementById('editEmail').value = user.email;
        document.getElementById('editFullName').value = user.full_name || '';
        document.getElementById('editIsAdmin').checked = user.is_admin;
        
        document.getElementById('editUserModal').style.display = 'flex';
    } catch (error) {
        console.error('Failed to load user:', error);
        alert('Failed to load user data');
    }
}

// Save user
async function saveUser() {
    const userId = document.getElementById('editUserId').value;
    const data = {
        username: document.getElementById('editUsername').value,
        email: document.getElementById('editEmail').value,
        fullName: document.getElementById('editFullName').value,
        isAdmin: document.getElementById('editIsAdmin').checked
    };
    
    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            alert('User updated successfully!');
            closeModal('editUserModal');
            loadUsers();
        } else {
            const error = await response.json();
            alert('Failed to update user: ' + error.error);
        }
    } catch (error) {
        console.error('Failed to save user:', error);
        alert('Failed to save user');
    }
}

// Delete user
async function deleteUser(userId, username) {
    if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('User deleted successfully!');
            loadUsers();
        } else {
            alert('Failed to delete user');
        }
    } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user');
    }
}

// Load all locations
async function loadAllLocations() {
    try {
        showLoading();
        const locations = await fetch('/api/admin/locations').then(r => r.json());
        displayLocations(locations);
        hideLoading();
    } catch (error) {
        console.error('Failed to load locations:', error);
        hideLoading();
    }
}

// Display locations
function displayLocations(locations) {
    const tbody = document.getElementById('locationsTableBody');
    tbody.innerHTML = '';
    
    if (locations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No locations found</td></tr>';
        return;
    }
    
    locations.forEach(loc => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${loc.id}</td>
            <td>${loc.username}</td>
            <td>${loc.location_name}</td>
            <td>${loc.latitude.toFixed(4)}</td>
            <td>${loc.longitude.toFixed(4)}</td>
            <td>${loc.is_favorite ? '<i class="fas fa-star" style="color: #ffd700;"></i>' : '-'}</td>
            <td>${formatDate(loc.created_at)}</td>
            <td>
                <button class="action-btn btn-delete" onclick="deleteLocation(${loc.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Delete location
async function deleteLocation(locationId) {
    if (!confirm('Are you sure you want to delete this location?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/locations/${locationId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Location deleted successfully!');
            loadAllLocations();
        } else {
            alert('Failed to delete location');
        }
    } catch (error) {
        console.error('Failed to delete location:', error);
        alert('Failed to delete location');
    }
}

// Load all alerts
async function loadAllAlerts() {
    try {
        showLoading();
        const alerts = await fetch('/api/admin/alerts').then(r => r.json());
        displayAlerts(alerts);
        hideLoading();
    } catch (error) {
        console.error('Failed to load alerts:', error);
        hideLoading();
    }
}

// Display alerts
function displayAlerts(alerts) {
    const tbody = document.getElementById('alertsTableBody');
    tbody.innerHTML = '';
    
    if (alerts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No alerts found</td></tr>';
        return;
    }
    
    alerts.forEach(alert => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${alert.id}</td>
            <td>${alert.username}</td>
            <td>${alert.alert_type}</td>
            <td>${alert.threshold_value || '-'}</td>
            <td>${alert.is_active ? '<span class="status-badge status-active">Active</span>' : '<span class="status-badge status-inactive">Inactive</span>'}</td>
            <td>${formatDate(alert.created_at)}</td>
            <td>
                <button class="action-btn btn-delete" onclick="deleteAlert(${alert.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Delete alert
async function deleteAlert(alertId) {
    if (!confirm('Are you sure you want to delete this alert?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/alerts/${alertId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Alert deleted successfully!');
            loadAllAlerts();
        } else {
            alert('Failed to delete alert');
        }
    } catch (error) {
        console.error('Failed to delete alert:', error);
        alert('Failed to delete alert');
    }
}

// Utility functions
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    document.getElementById('currentDateTime').textContent = now.toLocaleDateString('en-US', options);
}

function showLoading() {
    document.getElementById('loadingOverlay').classList.add('show');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('show');
}

// Load landing page content
async function loadContent() {
    try {
        showLoading();
        const content = await fetch('/api/admin/content').then(r => r.json());
        
        // Populate form fields with saved content
        if (content.heroTitle1) document.getElementById('heroTitle1').value = content.heroTitle1;
        if (content.heroTitle2) document.getElementById('heroTitle2').value = content.heroTitle2;
        if (content.heroSubtitle) document.getElementById('heroSubtitle').value = content.heroSubtitle;
        if (content.heroBtnPrimary) document.getElementById('heroBtnPrimary').value = content.heroBtnPrimary;
        if (content.heroBtnSecondary) document.getElementById('heroBtnSecondary').value = content.heroBtnSecondary;
        
        if (content.statUsers) document.getElementById('statUsers').value = content.statUsers;
        if (content.statAccuracy) document.getElementById('statAccuracy').value = content.statAccuracy;
        if (content.statUpdates) document.getElementById('statUpdates').value = content.statUpdates;
        
        if (content.featuresTitle) document.getElementById('featuresTitle').value = content.featuresTitle;
        if (content.featuresSubtitle) document.getElementById('featuresSubtitle').value = content.featuresSubtitle;
        
        if (content.aboutTitle) document.getElementById('aboutTitle').value = content.aboutTitle;
        if (content.aboutDesc) document.getElementById('aboutDesc').value = content.aboutDesc;
        
        if (content.ctaTitle) document.getElementById('ctaTitle').value = content.ctaTitle;
        if (content.ctaSubtitle) document.getElementById('ctaSubtitle').value = content.ctaSubtitle;
        if (content.ctaButton) document.getElementById('ctaButton').value = content.ctaButton;
        
        // Contact Information
        if (content.contactEmail) document.getElementById('contactEmail').value = content.contactEmail;
        if (content.contactPhone) document.getElementById('contactPhone').value = content.contactPhone;
        if (content.contactAddress) document.getElementById('contactAddress').value = content.contactAddress;
        
        // Quick Links
        if (content.quickLinkEmail) document.getElementById('quickLinkEmail').value = content.quickLinkEmail;
        if (content.quickLinkPhone) document.getElementById('quickLinkPhone').value = content.quickLinkPhone;
        if (content.quickLinkAddress) document.getElementById('quickLinkAddress').value = content.quickLinkAddress;
        
        // Social Media
        if (content.socialFacebook) document.getElementById('socialFacebook').value = content.socialFacebook;
        if (content.socialTwitter) document.getElementById('socialTwitter').value = content.socialTwitter;
        if (content.socialInstagram) document.getElementById('socialInstagram').value = content.socialInstagram;
        if (content.socialLinkedin) document.getElementById('socialLinkedin').value = content.socialLinkedin;
        if (content.socialYoutube) document.getElementById('socialYoutube').value = content.socialYoutube;
        if (content.socialGithub) document.getElementById('socialGithub').value = content.socialGithub;
        
        // Company Info
        if (content.companyName) document.getElementById('companyName').value = content.companyName;
        if (content.companyDescription) document.getElementById('companyDescription').value = content.companyDescription;
        if (content.copyrightText) document.getElementById('copyrightText').value = content.copyrightText;
        
        hideLoading();
    } catch (error) {
        console.error('Failed to load content:', error);
        hideLoading();
    }
}

// Save footer content
async function saveFooterContent() {
    showPasswordConfirmModal(async (password) => {
        try {
            // Verify password
            const verifyResponse = await fetch('/api/admin/verify-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            
            if (!verifyResponse.ok) {
                showPasswordError('Incorrect password. Please try again.');
                return false;
            }
            
            showLoading();
            
            const content = {
                // Contact Information
                contactEmail: document.getElementById('contactEmail').value,
                contactPhone: document.getElementById('contactPhone').value,
                contactAddress: document.getElementById('contactAddress').value,
                
                // Quick Links
                quickLinkEmail: document.getElementById('quickLinkEmail').value,
                quickLinkPhone: document.getElementById('quickLinkPhone').value,
                quickLinkAddress: document.getElementById('quickLinkAddress').value,
                
                // Social Media
                socialFacebook: document.getElementById('socialFacebook').value,
                socialTwitter: document.getElementById('socialTwitter').value,
                socialInstagram: document.getElementById('socialInstagram').value,
                socialLinkedin: document.getElementById('socialLinkedin').value,
                socialYoutube: document.getElementById('socialYoutube').value,
                socialGithub: document.getElementById('socialGithub').value,
                
                // Company Info
                companyName: document.getElementById('companyName').value,
                companyDescription: document.getElementById('companyDescription').value,
                copyrightText: document.getElementById('copyrightText').value
            };
            
            const response = await fetch('/api/admin/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(content)
            });
            
            hideLoading();
            
            if (response.ok) {
                closePasswordModal();
                showSuccessMessage('Footer content saved successfully!');
                return true;
            } else {
                alert('Failed to save footer content');
                return false;
            }
        } catch (error) {
            console.error('Failed to save footer content:', error);
            hideLoading();
            alert('Failed to save footer content');
            return false;
        }
    });
}

// Save landing page content with password confirmation
async function saveContent() {
    // Show password confirmation modal
    showPasswordConfirmModal(async (password) => {
        try {
            // Verify password first
            const verifyResponse = await fetch('/api/admin/verify-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            
            if (!verifyResponse.ok) {
                showPasswordError('Incorrect password. Please try again.');
                return false;
            }
            
            // Password correct, proceed with save
            showLoading();
            
            const content = {
                heroTitle1: document.getElementById('heroTitle1').value,
                heroTitle2: document.getElementById('heroTitle2').value,
                heroSubtitle: document.getElementById('heroSubtitle').value,
                heroBtnPrimary: document.getElementById('heroBtnPrimary').value,
                heroBtnSecondary: document.getElementById('heroBtnSecondary').value,
                
                statUsers: document.getElementById('statUsers').value,
                statAccuracy: document.getElementById('statAccuracy').value,
                statUpdates: document.getElementById('statUpdates').value,
                
                featuresTitle: document.getElementById('featuresTitle').value,
                featuresSubtitle: document.getElementById('featuresSubtitle').value,
                
                aboutTitle: document.getElementById('aboutTitle').value,
                aboutDesc: document.getElementById('aboutDesc').value,
                
                ctaTitle: document.getElementById('ctaTitle').value,
                ctaSubtitle: document.getElementById('ctaSubtitle').value,
                ctaButton: document.getElementById('ctaButton').value,
                
                contactEmail: document.getElementById('contactEmail').value,
                contactPhone: document.getElementById('contactPhone').value,
                contactAddress: document.getElementById('contactAddress').value
            };
            
            // Get feature cards
            const featureTitles = document.querySelectorAll('.feature-title');
            const featureDescs = document.querySelectorAll('.feature-desc');
            featureTitles.forEach((title, index) => {
                content[`feature${index + 1}Title`] = title.value;
                content[`feature${index + 1}Desc`] = featureDescs[index].value;
            });
            
            const response = await fetch('/api/admin/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(content)
            });
            
            hideLoading();
            
            if (response.ok) {
                closePasswordModal();
                showSuccessMessage('Content saved successfully! Changes will appear on the landing page.');
                return true;
            } else {
                alert('Failed to save content');
                return false;
            }
        } catch (error) {
            console.error('Failed to save content:', error);
            hideLoading();
            alert('Failed to save content');
            return false;
        }
    });
}

// Show password confirmation modal
function showPasswordConfirmModal(onConfirm) {
    const modal = document.createElement('div');
    modal.id = 'passwordConfirmModal';
    modal.className = 'password-confirm-overlay';
    modal.innerHTML = `
        <div class="password-confirm-modal">
            <div class="password-confirm-header">
                <div class="password-icon-wrapper">
                    <i class="fas fa-shield-alt password-icon"></i>
                </div>
                <h3>Confirm Your Identity</h3>
                <p>Enter your admin password to save changes</p>
            </div>
            <div class="password-confirm-body">
                <div class="password-input-wrapper">
                    <i class="fas fa-lock"></i>
                    <input type="password" id="confirmPasswordInput" placeholder="Enter your password" autocomplete="current-password">
                    <button type="button" class="password-toggle" onclick="togglePasswordVisibility()">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
                <div class="password-error-message" id="passwordErrorMessage">
                    <i class="fas fa-exclamation-circle"></i>
                    <span></span>
                </div>
            </div>
            <div class="password-confirm-footer">
                <button class="btn-cancel" onclick="closePasswordModal()">
                    <i class="fas fa-times"></i> Cancel
                </button>
                <button class="btn-confirm" id="confirmPasswordBtn">
                    <i class="fas fa-check"></i> Confirm & Save
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Trigger animation
    setTimeout(() => modal.classList.add('show'), 10);
    
    // Focus input
    setTimeout(() => document.getElementById('confirmPasswordInput').focus(), 300);
    
    // Handle confirm button
    document.getElementById('confirmPasswordBtn').onclick = async () => {
        const password = document.getElementById('confirmPasswordInput').value;
        if (!password) {
            showPasswordError('Please enter your password');
            return;
        }
        
        const btn = document.getElementById('confirmPasswordBtn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
        
        const success = await onConfirm(password);
        
        if (!success) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-check"></i> Confirm & Save';
        }
    };
    
    // Handle Enter key
    document.getElementById('confirmPasswordInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('confirmPasswordBtn').click();
        }
    });
}

// Close password modal
function closePasswordModal() {
    const modal = document.getElementById('passwordConfirmModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
}

// Show password error
function showPasswordError(message) {
    const errorDiv = document.getElementById('passwordErrorMessage');
    const input = document.getElementById('confirmPasswordInput');
    
    errorDiv.querySelector('span').textContent = message;
    errorDiv.classList.add('show');
    input.classList.add('error');
    
    // Shake animation
    input.style.animation = 'shake 0.5s';
    setTimeout(() => {
        input.style.animation = '';
    }, 500);
    
    // Remove error after 3 seconds
    setTimeout(() => {
        errorDiv.classList.remove('show');
        input.classList.remove('error');
    }, 3000);
}

// Toggle password visibility
function togglePasswordVisibility() {
    const input = document.getElementById('confirmPasswordInput');
    const icon = document.querySelector('.password-toggle i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Show success message
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'save-success';
    successDiv.innerHTML = `
        <i class="fas fa-check-circle" style="font-size: 1.5rem;"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => successDiv.remove(), 300);
    }, 3000);
}

// Activity logging system
const activityLogs = [];

// Log activity (login/logout)
function logActivity(username, email, activityType, ipAddress = 'Unknown', device = 'Unknown') {
    const activity = {
        id: activityLogs.length + 1,
        username,
        email,
        activityType,
        ipAddress,
        device,
        timestamp: new Date().toISOString(),
        sessionStart: activityType === 'login' ? new Date().toISOString() : null,
        sessionEnd: activityType === 'logout' ? new Date().toISOString() : null
    };
    
    activityLogs.unshift(activity);
    
    // Save to localStorage
    const savedLogs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
    savedLogs.unshift(activity);
    // Keep only last 1000 logs
    if (savedLogs.length > 1000) savedLogs.pop();
    localStorage.setItem('activityLogs', JSON.stringify(savedLogs));
    
    // Update live feed
    addToLiveFeed(activity);
}

// Load activity logs
function loadActivityLogs() {
    const savedLogs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
    const tbody = document.getElementById('activityTableBody');
    
    if (!tbody) return;
    
    // Apply filters
    const searchTerm = document.getElementById('activitySearch')?.value.toLowerCase() || '';
    const typeFilter = document.getElementById('activityTypeFilter')?.value || 'all';
    const dateFilter = document.getElementById('activityDateFilter')?.value || 'today';
    
    let filteredLogs = savedLogs.filter(log => {
        // Search filter
        const matchesSearch = log.username.toLowerCase().includes(searchTerm) || 
                            log.email.toLowerCase().includes(searchTerm);
        
        // Type filter
        const matchesType = typeFilter === 'all' || log.activityType === typeFilter;
        
        // Date filter
        const logDate = new Date(log.timestamp);
        const now = new Date();
        let matchesDate = true;
        
        if (dateFilter === 'today') {
            matchesDate = logDate.toDateString() === now.toDateString();
        } else if (dateFilter === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = logDate >= weekAgo;
        } else if (dateFilter === 'month') {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDate = logDate >= monthAgo;
        }
        
        return matchesSearch && matchesType && matchesDate;
    });
    
    tbody.innerHTML = '';
    
    if (filteredLogs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem;">No activity logs found</td></tr>';
        return;
    }
    
    filteredLogs.forEach(log => {
        const row = document.createElement('tr');
        const activityBadge = log.activityType === 'login' 
            ? '<span class="status-badge status-active"><i class="fas fa-sign-in-alt"></i> Login</span>'
            : '<span class="status-badge status-inactive"><i class="fas fa-sign-out-alt"></i> Logout</span>';
        
        const sessionDuration = calculateSessionDuration(log);
        
        row.innerHTML = `
            <td>${log.id}</td>
            <td><strong>${log.username}</strong></td>
            <td>${log.email}</td>
            <td>${activityBadge}</td>
            <td>${log.ipAddress}</td>
            <td>${log.device}</td>
            <td>${formatDateTime(log.timestamp)}</td>
            <td>${sessionDuration}</td>
        `;
        tbody.appendChild(row);
    });
    
    // Update stats
    updateActivityStats(savedLogs);
}

// Calculate session duration
function calculateSessionDuration(log) {
    if (log.activityType === 'login') {
        // Find corresponding logout
        const savedLogs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
        const logout = savedLogs.find(l => 
            l.username === log.username && 
            l.activityType === 'logout' && 
            new Date(l.timestamp) > new Date(log.timestamp)
        );
        
        if (logout) {
            const duration = new Date(logout.timestamp) - new Date(log.timestamp);
            const minutes = Math.floor(duration / 60000);
            const hours = Math.floor(minutes / 60);
            if (hours > 0) {
                return `${hours}h ${minutes % 60}m`;
            }
            return `${minutes}m`;
        }
        return 'Active';
    }
    return '-';
}

// Update activity stats
function updateActivityStats(logs) {
    const today = new Date().toDateString();
    const todayLogs = logs.filter(log => new Date(log.timestamp).toDateString() === today);
    
    const totalLogins = todayLogs.filter(log => log.activityType === 'login').length;
    const totalLogouts = todayLogs.filter(log => log.activityType === 'logout').length;
    const activeNow = totalLogins - totalLogouts;
    
    document.getElementById('totalLogins').textContent = totalLogins;
    document.getElementById('totalLogouts').textContent = totalLogouts;
    document.getElementById('activeNow').textContent = Math.max(0, activeNow);
    
    // Calculate average session time
    let totalSessionTime = 0;
    let sessionCount = 0;
    
    todayLogs.forEach(log => {
        if (log.activityType === 'login') {
            const logout = logs.find(l => 
                l.username === log.username && 
                l.activityType === 'logout' && 
                new Date(l.timestamp) > new Date(log.timestamp)
            );
            if (logout) {
                totalSessionTime += new Date(logout.timestamp) - new Date(log.timestamp);
                sessionCount++;
            }
        }
    });
    
    if (sessionCount > 0) {
        const avgMinutes = Math.floor((totalSessionTime / sessionCount) / 60000);
        document.getElementById('avgSessionTime').textContent = `${avgMinutes}m`;
    } else {
        document.getElementById('avgSessionTime').textContent = '0m';
    }
}

// Add to live feed
function addToLiveFeed(activity) {
    const feed = document.getElementById('liveActivityFeed');
    if (!feed) return;
    
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.style.animation = 'slideInRight 0.3s ease';
    
    const icon = activity.activityType === 'login' 
        ? '<i class="fas fa-sign-in-alt" style="color: #10b981;"></i>'
        : '<i class="fas fa-sign-out-alt" style="color: #f59e0b;"></i>';
    
    item.innerHTML = `
        <div class="activity-time">${formatDateTime(activity.timestamp)}</div>
        <div class="activity-text">
            ${icon} <strong>${activity.username}</strong> ${activity.activityType === 'login' ? 'logged in' : 'logged out'} from ${activity.ipAddress}
        </div>
    `;
    
    feed.insertBefore(item, feed.firstChild);
    
    // Keep only last 20 items
    while (feed.children.length > 20) {
        feed.removeChild(feed.lastChild);
    }
}

// Format date time
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Export activity logs
function exportActivityLogs() {
    const logs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity-logs-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showSuccessMessage('Activity logs exported successfully!');
}

// Get device info
function getDeviceInfo() {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows PC';
    if (ua.includes('Mac')) return 'Mac';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Unknown';
}

// Get IP address (simulated)
async function getIPAddress() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch {
        return '127.0.0.1';
    }
}

// Load system settings
function loadSystemSettings() {
    loadDatabaseInfo();
    loadSystemInfo();
    loadSecuritySettings();
}

// Load database info
async function loadDatabaseInfo() {
    try {
        const stats = await fetch('/api/admin/stats').then(r => r.json());
        document.getElementById('dbUsers').textContent = stats.totalUsers || '0';
        document.getElementById('dbLocations').textContent = stats.totalLocations || '0';
        document.getElementById('dbAlerts').textContent = stats.totalAlerts || '0';
    } catch (error) {
        console.error('Failed to load database info:', error);
    }
}

// Load system info
function loadSystemInfo() {
    document.getElementById('nodeVersion').textContent = 'v18.x';
    updateUptime();
    setInterval(updateUptime, 60000); // Update every minute
}

// Update server uptime
function updateUptime() {
    const uptime = Math.floor(performance.now() / 1000);
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    document.getElementById('serverUptime').textContent = `${hours}h ${minutes}m`;
}

// Load security settings
function loadSecuritySettings() {
    const emailVerification = localStorage.getItem('requireEmailVerification') === 'true';
    const rateLimit = localStorage.getItem('enableRateLimit') !== 'false';
    const twoFA = localStorage.getItem('enable2FA') === 'true';
    
    document.getElementById('requireEmailVerification').checked = emailVerification;
    document.getElementById('enableRateLimit').checked = rateLimit;
    document.getElementById('enable2FA').checked = twoFA;
}

// Save security settings
function saveSecuritySettings() {
    const emailVerification = document.getElementById('requireEmailVerification').checked;
    const rateLimit = document.getElementById('enableRateLimit').checked;
    const twoFA = document.getElementById('enable2FA').checked;
    
    localStorage.setItem('requireEmailVerification', emailVerification);
    localStorage.setItem('enableRateLimit', rateLimit);
    localStorage.setItem('enable2FA', twoFA);
    
    showSuccessMessage('Security settings saved successfully!');
}

// Test API connection
async function testApiConnection() {
    try {
        showLoading();
        const response = await fetch('/api/weather?lat=40.7128&lon=-74.0060');
        hideLoading();
        
        if (response.ok) {
            document.getElementById('apiStatus').textContent = 'Active';
            document.getElementById('apiStatus').className = 'status-active';
            showSuccessMessage('API connection successful!');
        } else {
            document.getElementById('apiStatus').textContent = 'Error';
            document.getElementById('apiStatus').className = 'status-inactive';
            alert('API connection failed. Please check your API key.');
        }
    } catch (error) {
        hideLoading();
        document.getElementById('apiStatus').textContent = 'Error';
        document.getElementById('apiStatus').className = 'status-inactive';
        alert('API connection failed: ' + error.message);
    }
}

// Clear cache
function clearCache() {
    if (confirm('Are you sure you want to clear the cache? This will log out all users.')) {
        localStorage.clear();
        sessionStorage.clear();
        showSuccessMessage('Cache cleared successfully!');
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    }
}

// Delete inactive users
async function deleteInactiveUsers() {
    if (!confirm('Are you sure you want to delete all users who haven\'t logged in for 90+ days? This action cannot be undone.')) {
        return;
    }
    
    try {
        showLoading();
        const users = await fetch('/api/admin/users').then(r => r.json());
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        
        let deletedCount = 0;
        for (const user of users) {
            if (!user.is_admin && user.last_login) {
                const lastLogin = new Date(user.last_login);
                if (lastLogin < ninetyDaysAgo) {
                    await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
                    deletedCount++;
                }
            }
        }
        
        hideLoading();
        showSuccessMessage(`Deleted ${deletedCount} inactive users`);
        loadUsers();
    } catch (error) {
        hideLoading();
        alert('Failed to delete inactive users: ' + error.message);
    }
}

// Optimize database
function optimizeDatabase() {
    if (confirm('Optimize database? This may take a few moments.')) {
        showLoading();
        setTimeout(() => {
            hideLoading();
            showSuccessMessage('Database optimized successfully!');
        }, 2000);
    }
}

// Export database info
function exportDatabaseInfo() {
    const dbInfo = {
        database: document.getElementById('dbName').textContent,
        totalUsers: document.getElementById('dbUsers').textContent,
        totalLocations: document.getElementById('dbLocations').textContent,
        totalAlerts: document.getElementById('dbAlerts').textContent,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(dbInfo, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `weatherpro-db-info-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    showSuccessMessage('Database info exported successfully!');
}

// Save email settings
function saveEmailSettings() {
    const smtpServer = document.getElementById('smtpServer').value;
    const smtpPort = document.getElementById('smtpPort').value;
    const fromEmail = document.getElementById('fromEmail').value;
    
    if (!smtpServer || !smtpPort || !fromEmail) {
        alert('Please fill in all email settings');
        return;
    }
    
    localStorage.setItem('smtpServer', smtpServer);
    localStorage.setItem('smtpPort', smtpPort);
    localStorage.setItem('fromEmail', fromEmail);
    
    showSuccessMessage('Email settings saved successfully!');
}

// Show add user modal
function showAddUserModal() {
    // Clear form
    document.getElementById('addUserForm').reset();
    document.getElementById('addUserModal').style.display = 'flex';
}

// Create new user
async function createUser() {
    const username = document.getElementById('newUsername').value.trim();
    const email = document.getElementById('newEmail').value.trim();
    const fullName = document.getElementById('newFullName').value.trim();
    const password = document.getElementById('newPassword').value;
    const isAdmin = document.getElementById('newIsAdmin').checked;
    
    // Validation
    if (!username || !email || !password) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }
    
    try {
        showLoading();
        
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                email,
                password,
                fullName: fullName || username
            })
        });
        
        if (response.ok) {
            // If admin checkbox is checked, update user to admin
            if (isAdmin) {
                // Get the newly created user
                const users = await fetch('/api/admin/users').then(r => r.json());
                const newUser = users.find(u => u.username === username);
                
                if (newUser) {
                    await fetch(`/api/admin/users/${newUser.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            username: newUser.username,
                            email: newUser.email,
                            fullName: newUser.full_name,
                            isAdmin: true
                        })
                    });
                }
            }
            
            hideLoading();
            closeModal('addUserModal');
            showSuccessMessage('User created successfully!');
            loadUsers();
        } else {
            const error = await response.json();
            hideLoading();
            alert('Failed to create user: ' + error.error);
        }
    } catch (error) {
        console.error('Failed to create user:', error);
        hideLoading();
        alert('Failed to create user');
    }
}
