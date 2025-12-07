/* ============================================
   ALERT SYSTEM MODULE
   ============================================ */

class AlertSystem {
    constructor() {
        this.alerts = [];
        this.container = null;
    }
    
    processAlerts(apiAlerts) {
        this.alerts = apiAlerts.map(alert => ({
            id: Date.now() + Math.random(),
            event: alert.event,
            description: alert.description,
            start: alert.start,
            end: alert.end,
            severity: this.getSeverityLevel(alert.event),
            read: false
        }));
        
        this.displayAlerts();
        this.showNotification();
    }
    
    getSeverityLevel(event) {
        const eventLower = event.toLowerCase();
        if (eventLower.includes('extreme') || eventLower.includes('severe')) return 'severe';
        if (eventLower.includes('warning')) return 'warning';
        return 'info';
    }
    
    displayAlerts() {
        const content = document.getElementById('alerts-content');
        if (!content) return;
        
        if (this.alerts.length === 0) {
            content.innerHTML = '<p class="no-alerts">No active weather alerts</p>';
            return;
        }
        
        content.innerHTML = this.alerts.map(alert => `
            <div class="alert-card ${alert.severity}" data-alert-id="${alert.id}">
                <div class="alert-header">
                    <span class="alert-icon">${this.getAlertIcon(alert.severity)}</span>
                    <h4>${alert.event}</h4>
                </div>
                <p class="alert-description">${alert.description}</p>
                <div class="alert-time">
                    <span>From: ${new Date(alert.start * 1000).toLocaleString()}</span>
                    <span>To: ${new Date(alert.end * 1000).toLocaleString()}</span>
                </div>
            </div>
        `).join('');
    }
    
    getAlertIcon(severity) {
        const icons = {
            severe: '🚨',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[severity] || icons.info;
    }
    
    showNotification() {
        if (this.alerts.length > 0 && 'Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification('Weather Alert', {
                        body: `${this.alerts.length} active weather alert(s)`,
                        icon: '/icon.png'
                    });
                }
            });
        }
    }
}

export default AlertSystem;
