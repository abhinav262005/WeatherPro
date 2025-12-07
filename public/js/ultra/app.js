// ========================================
// ULTRA WEATHER DASHBOARD - MAIN APP
// ========================================

import { BackgroundEngine } from './modules/background.js';
import { ThemeEngine } from './modules/theme.js';
import { WeatherEngine } from './modules/weather.js';
import { WidgetEngine } from './modules/widgets.js';
import { AnimationEngine } from './modules/animations.js';
import { AlertEngine } from './modules/alerts.js';
import { StorageEngine } from './modules/storage.js';

class UltraWeatherApp {
    constructor() {
        this.engines = {};
        this.state = {
            location: null,
            weather: null,
            theme: 'day',
            widgets: [],
            settings: {}
        };
        
        this.init();
    }

    async init() {
        console.log('🌤️ Initializing Ultra Weather Dashboard...');
        
        // Show loading
        this.showLoading();
        
        // Initialize engines
        this.engines.storage = new StorageEngine();
        this.engines.background = new BackgroundEngine();
        this.engines.theme = new ThemeEngine();
        this.engines.weather = new WeatherEngine();
        this.engines.widgets = new WidgetEngine();
        this.engines.animations = new AnimationEngine();
        this.engines.alerts = new AlertEngine();
        
        // Load saved state
        await this.loadState();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize background
        this.engines.background.init();
        
        // Get user location and load weather
        await this.initializeWeather();
        
        // Initialize widgets
        this.engines.widgets.init();
        
        // Hide loading
        this.hideLoading();
        
        console.log('✅ Ultra Weather Dashboard ready!');
    }

    async loadState() {
        const savedState = this.engines.storage.get('appState');
        if (savedState) {
            this.state = { ...this.state, ...savedState };
            this.engines.theme.applyTheme(this.state.theme);
        }
    }

    saveState() {
        this.engines.storage.set('appState', this.state);
    }

    setupEventListeners() {
        // Search
        const searchInput = document.getElementById('locationSearch');
        searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        
        // Theme button
        document.getElementById('themeBtn').addEventListener('click', () => {
            this.engines.theme.togglePanel();
        });
        
        // Widget button
        document.getElementById('widgetBtn').addEventListener('click', () => {
            this.engines.widgets.togglePanel();
        });
        
        // Alert button
        document.getElementById('alertBtn').addEventListener('click', () => {
            this.engines.alerts.togglePanel();
        });
        
        // Settings button
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showSettings();
        });
        
        // Close panel buttons
        document.getElementById('closeThemePanel').addEventListener('click', () => {
            this.engines.theme.togglePanel();
        });
        
        document.getElementById('closeWidgetPanel').addEventListener('click', () => {
            this.engines.widgets.togglePanel();
        });
        
        document.getElementById('closeAlertCenter').addEventListener('click', () => {
            this.engines.alerts.togglePanel();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    async initializeWeather() {
        try {
            // Try to get user's location
            if (navigator.geolocation) {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                });
                
                this.state.location = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };
            } else {
                // Default to a major city
                this.state.location = { lat: 40.7128, lon: -74.0060 }; // New York
            }
            
            await this.loadWeather();
        } catch (error) {
            console.error('Location error:', error);
            // Default location
            this.state.location = { lat: 40.7128, lon: -74.0060 };
            await this.loadWeather();
        }
    }

    async loadWeather() {
        try {
            const weather = await this.engines.weather.fetchWeather(
                this.state.location.lat,
                this.state.location.lon
            );
            
            this.state.weather = weather;
            this.displayWeather(weather);
            
            // Update theme based on weather
            this.engines.theme.autoTheme(weather);
            
            // Check for alerts
            this.engines.alerts.checkWeatherAlerts(weather);
            
        } catch (error) {
            console.error('Weather fetch error:', error);
            this.showNotification('Failed to load weather data', 'error');
        }
    }

    displayWeather(weather) {
        // Update location
        document.getElementById('locationName').textContent = weather.name || 'Unknown Location';
        
        // Update main temperature
        document.getElementById('mainTemp').textContent = Math.round(weather.main.temp);
        
        // Update description
        document.getElementById('weatherDesc').textContent = weather.weather[0].description;
        document.getElementById('feelsLike').textContent = Math.round(weather.main.feels_like);
        
        // Update quick stats
        document.getElementById('windSpeed').textContent = Math.round(weather.wind.speed) + ' km/h';
        document.getElementById('humidity').textContent = weather.main.humidity + '%';
        document.getElementById('visibility').textContent = (weather.visibility / 1000).toFixed(1) + ' km';
        document.getElementById('pressure').textContent = weather.main.pressure + ' hPa';
        
        // Update weather icon
        this.engines.animations.updateWeatherIcon(weather.weather[0].main);
        
        // Animate elements
        this.engines.animations.animateWeatherUpdate();
    }

    async handleSearch(query) {
        if (query.length < 3) {
            document.getElementById('searchResults').classList.remove('show');
            return;
        }
        
        try {
            const results = await this.engines.weather.searchLocation(query);
            this.displaySearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
        }
    }

    displaySearchResults(results) {
        const container = document.getElementById('searchResults');
        
        if (results.length === 0) {
            container.classList.remove('show');
            return;
        }
        
        container.innerHTML = results.map(result => `
            <div class="search-result-item" data-lat="${result.lat}" data-lon="${result.lon}">
                <strong>${result.name}</strong>
                ${result.state ? `, ${result.state}` : ''}, ${result.country}
            </div>
        `).join('');
        
        container.classList.add('show');
        
        // Add click handlers
        container.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                this.state.location = {
                    lat: parseFloat(item.dataset.lat),
                    lon: parseFloat(item.dataset.lon)
                };
                this.loadWeather();
                container.classList.remove('show');
                document.getElementById('locationSearch').value = '';
            });
        });
    }

    handleKeyboard(e) {
        // Ctrl/Cmd + K: Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('locationSearch').focus();
        }
        
        // Ctrl/Cmd + T: Toggle theme panel
        if ((e.ctrlKey || e.metaKey) && e.key === 't') {
            e.preventDefault();
            this.engines.theme.togglePanel();
        }
        
        // Ctrl/Cmd + W: Toggle widget panel
        if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
            e.preventDefault();
            this.engines.widgets.togglePanel();
        }
        
        // Escape: Close all panels
        if (e.key === 'Escape') {
            document.querySelectorAll('.theme-panel, .widget-panel, .alert-center').forEach(panel => {
                panel.classList.remove('open');
            });
        }
    }

    showSettings() {
        // Settings implementation
        console.log('Settings panel');
    }

    showLoading() {
        document.getElementById('loadingOverlay').classList.add('show');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('show');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 15px;
            padding: 1rem 1.5rem;
            color: white;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            gap: 0.8rem;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new UltraWeatherApp();
    });
} else {
    window.app = new UltraWeatherApp();
}

// Add animations to document
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);
