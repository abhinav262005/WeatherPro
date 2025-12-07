// ========================================
// ALERT ENGINE - Weather Alerts & Notifications
// ========================================

export class AlertEngine {
    constructor() {
        this.alerts = [];
        this.rules = [];
    }

    togglePanel() {
        const panel = document.getElementById('alertCenter');
        panel.classList.toggle('open');
        
        if (panel.classList.contains('open')) {
            this.renderAlerts();
        }
    }

    checkWeatherAlerts(weather) {
        this.alerts = [];
        
        // Temperature alerts
        if (weather.main.temp > 35) {
            this.addAlert('Extreme Heat Warning', 'Temperature exceeds 35°C. Stay hydrated and avoid prolonged sun exposure.', 'warning');
        } else if (weather.main.temp < 0) {
            this.addAlert('Freezing Temperature', 'Temperature below 0°C. Watch for ice and dress warmly.', 'warning');
        }
        
        // Wind alerts
        if (weather.wind.speed > 50) {
            this.addAlert('High Wind Warning', `Wind speed ${Math.round(weather.wind.speed)} km/h. Secure loose objects.`, 'danger');
        } else if (weather.wind.speed > 30) {
            this.addAlert('Windy Conditions', `Wind speed ${Math.round(weather.wind.speed)} km/h. Exercise caution outdoors.`, 'info');
        }
        
        // Weather condition alerts
        const condition = weather.weather[0].main;
        if (condition === 'Thunderstorm') {
            this.addAlert('Thunderstorm Alert', 'Thunderstorm in your area. Stay indoors if possible.', 'danger');
        } else if (condition === 'Snow') {
            this.addAlert('Snow Alert', 'Snowy conditions. Drive carefully and allow extra travel time.', 'warning');
        } else if (condition === 'Rain') {
            this.addAlert('Rain Expected', 'Rain in your area. Don\'t forget your umbrella!', 'info');
        }
        
        // Visibility alerts
        if (weather.visibility < 1000) {
            this.addAlert('Low Visibility', `Visibility ${weather.visibility}m. Drive with caution.`, 'warning');
        }
        
        // Update badge
        this.updateAlertBadge();
        
        // Show notification for critical alerts
        const criticalAlerts = this.alerts.filter(a => a.severity === 'danger');
        if (criticalAlerts.length > 0) {
            this.showAlertNotification(criticalAlerts[0]);
        }
    }

    addAlert(title, message, severity = 'info') {
        this.alerts.push({
            id: Date.now() + Math.random(),
            title,
            message,
            severity,
            timestamp: new Date()
        });
    }

    updateAlertBadge() {
        const badge = document.getElementById('alertBadge');
        badge.textContent = this.alerts.length;
        
        if (this.alerts.length > 0) {
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }

    renderAlerts() {
        const list = document.getElementById('alertList');
        
        if (this.alerts.length === 0) {
            list.innerHTML = `
                <div class="no-alerts">
                    <i class="fas fa-check-circle"></i>
                    <p>No active weather alerts</p>
                    <small>You'll be notified of any severe weather conditions</small>
                </div>
            `;
            return;
        }
        
        list.innerHTML = this.alerts.map(alert => `
            <div class="alert-item alert-${alert.severity}">
                <div class="alert-header">
                    <div class="alert-icon">
                        <i class="fas fa-${this.getAlertIcon(alert.severity)}"></i>
                    </div>
                    <div class="alert-info">
                        <h4>${alert.title}</h4>
                        <small>${this.formatTime(alert.timestamp)}</small>
                    </div>
                    <button class="dismiss-alert" data-id="${alert.id}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <p class="alert-message">${alert.message}</p>
            </div>
        `).join('');
        
        this.addAlertStyles();
        this.setupAlertListeners();
    }

    setupAlertListeners() {
        document.querySelectorAll('.dismiss-alert').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseFloat(btn.dataset.id);
                this.dismissAlert(id);
            });
        });
    }

    dismissAlert(id) {
        this.alerts = this.alerts.filter(a => a.id !== id);
        this.updateAlertBadge();
        this.renderAlerts();
    }

    getAlertIcon(severity) {
        const icons = {
            info: 'info-circle',
            warning: 'exclamation-triangle',
            danger: 'exclamation-circle'
        };
        return icons[severity] || 'info-circle';
    }

    formatTime(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        
        return date.toLocaleDateString();
    }

    showAlertNotification(alert) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(alert.title, {
                body: alert.message,
                icon: '/icon.png',
                badge: '/badge.png'
            });
        }
    }

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    addAlertStyles() {
        if (document.getElementById('alert-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'alert-styles';
        style.textContent = `
            .no-alerts {
                text-align: center;
                padding: 3rem 2rem;
                opacity: 0.6;
            }
            
            .no-alerts i {
                font-size: 4rem;
                color: #48bb78;
                margin-bottom: 1rem;
            }
            
            .no-alerts p {
                font-size: 1.2rem;
                margin-bottom: 0.5rem;
            }
            
            .alert-item {
                padding: 1.5rem;
                margin-bottom: 1rem;
                border-radius: 12px;
                border-left: 4px solid;
                background: rgba(255, 255, 255, 0.05);
            }
            
            .alert-info {
                border-color: #4299e1;
            }
            
            .alert-warning {
                border-color: #ed8936;
            }
            
            .alert-danger {
                border-color: #f56565;
            }
            
            .alert-header {
                display: flex;
                align-items: flex-start;
                gap: 1rem;
                margin-bottom: 0.8rem;
            }
            
            .alert-icon {
                font-size: 1.5rem;
            }
            
            .alert-info .alert-icon {
                color: #4299e1;
            }
            
            .alert-warning .alert-icon {
                color: #ed8936;
            }
            
            .alert-danger .alert-icon {
                color: #f56565;
            }
            
            .alert-info {
                flex: 1;
            }
            
            .alert-info h4 {
                font-size: 1.1rem;
                margin-bottom: 0.3rem;
            }
            
            .alert-info small {
                opacity: 0.6;
                font-size: 0.85rem;
            }
            
            .dismiss-alert {
                background: rgba(255, 255, 255, 0.1);
                border: none;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                color: white;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .dismiss-alert:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: scale(1.1);
            }
            
            .alert-message {
                margin-left: 3.5rem;
                opacity: 0.9;
                line-height: 1.5;
            }
        `;
        document.head.appendChild(style);
    }
}
