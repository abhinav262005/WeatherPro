/* ============================================
   MAIN APPLICATION ORCHESTRATOR
   ============================================ */

import CONFIG, { HELPERS } from './config.js';
import WeatherAPI from './modules/weather-api.js';
import GradientAnimator from './modules/gradient-animator.js';
import ThemeEngine from './modules/theme-engine.js';
import WidgetSystem from './modules/widget-system.js';
import StorageManager from './modules/storage.js';
import Intelligence from './modules/intelligence.js';
import AlertSystem from './modules/alerts.js';

class WeatherApp {
    constructor() {
        this.weatherAPI = new WeatherAPI();
        this.gradientAnimator = new GradientAnimator();
        this.themeEngine = new ThemeEngine();
        this.widgetSystem = new WidgetSystem();
        this.storage = new StorageManager();
        this.intelligence = new Intelligence();
        this.alertSystem = new AlertSystem();
        
        this.currentLocation = null;
        this.weatherData = null;
        this.refreshInterval = null;
        
        this.init();
    }
    
    async init() {
        console.log('🌤️ Initializing Weather Dashboard...');
        
        // Load saved preferences
        this.loadPreferences();
        
        // Initialize UI components
        this.initializeUI();
        
        // Start gradient animation
        this.gradientAnimator.start();
        
        // Load initial weather data
        await this.loadWeatherData();
        
        // Initialize widgets
        this.widgetSystem.init();
        
        // Setup auto-refresh
        this.setupAutoRefresh();
        
        // Register service worker for PWA
        this.registerServiceWorker();
        
        console.log('✅ Weather Dashboard Ready!');
    }
    
    loadPreferences() {
        // Load location
        const savedLocation = this.storage.get(CONFIG.STORAGE.LOCATION);
        this.currentLocation = savedLocation || CONFIG.DEFAULTS.LOCATION;
        
        // Load theme and gradient
        const savedGradient = this.storage.get(CONFIG.STORAGE.GRADIENT) || CONFIG.DEFAULTS.GRADIENT;
        this.setGradient(savedGradient);
        
        // Load units
        const savedUnits = this.storage.get(CONFIG.STORAGE.UNITS) || CONFIG.DEFAULTS.UNITS;
        this.units = savedUnits;
    }
    
    initializeUI() {
        // Location search
        const locationInput = document.getElementById('location-input');
        const geolocateBtn = document.getElementById('geolocate-btn');
        
        locationInput.addEventListener('input', HELPERS.debounce((e) => {
            this.searchLocation(e.target.value);
        }, 500));
        
        geolocateBtn.addEventListener('click', () => this.useGeolocation());
        
        // Top nav buttons
        document.getElementById('theme-btn').addEventListener('click', () => {
            this.togglePanel('theme-customizer');
        });
        
        document.getElementById('widgets-btn').addEventListener('click', () => {
            this.togglePanel('widget-manager');
        });
        
        document.getElementById('alerts-btn').addEventListener('click', () => {
            this.togglePanel('alert-center');
        });
        
        // Close buttons for panels
        document.querySelectorAll('.side-panel .close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const panel = e.target.closest('.side-panel');
                panel.classList.add('hidden');
            });
        });
        
        // Initialize theme customizer
        this.themeEngine.init();
    }
    
    async loadWeatherData() {
        try {
            this.showLoading(true);
            
            // Fetch weather data
            const data = await this.weatherAPI.getWeatherData(
                this.currentLocation.lat,
                this.currentLocation.lon,
                this.units
            );
            
            this.weatherData = data;
            
            // Update UI
            this.updateHeroPanel(data.current);
            this.updateLocationDisplay();
            
            // Update widgets
            this.widgetSystem.updateAllWidgets(data);
            
            // Run intelligence analysis
            const insights = this.intelligence.analyze(data);
            this.displayInsights(insights);
            
            // Check for alerts
            if (data.alerts && data.alerts.length > 0) {
                this.alertSystem.processAlerts(data.alerts);
            }
            
            this.showLoading(false);
            this.showToast('Weather data updated', 'success');
            
        } catch (error) {
            console.error('Error loading weather data:', error);
            this.showLoading(false);
            this.showToast('Failed to load weather data', 'error');
        }
    }
    
    updateHeroPanel(current) {
        // Temperature
        document.getElementById('temp-value').textContent = Math.round(current.temp);
        
        // Weather icon and description
        const weatherIcon = document.getElementById('weather-icon');
        weatherIcon.textContent = HELPERS.getWeatherIcon(current.weather[0].icon);
        
        document.getElementById('weather-main').textContent = current.weather[0].main;
        document.getElementById('weather-desc').textContent = current.weather[0].description;
        
        // Stats
        document.getElementById('feels-like').textContent = `${Math.round(current.feels_like)}°`;
        document.getElementById('humidity').textContent = `${current.humidity}%`;
        document.getElementById('wind').textContent = `${Math.round(current.wind_speed)} km/h`;
        document.getElementById('pressure').textContent = `${current.pressure} hPa`;
        
        // Auto-adjust gradient based on weather and time
        this.autoAdjustGradient(current);
    }
    
    updateLocationDisplay() {
        document.getElementById('location-name').textContent = this.currentLocation.name;
    }
    
    autoAdjustGradient(current) {
        const hour = new Date().getHours();
        const weatherMain = current.weather[0].main.toLowerCase();
        
        let gradient = 'day';
        
        if (weatherMain.includes('storm') || weatherMain.includes('thunder')) {
            gradient = 'storm';
        } else if (hour >= 5 && hour < 7) {
            gradient = 'dawn';
        } else if (hour >= 7 && hour < 9) {
            gradient = 'sunrise';
        } else if (hour >= 9 && hour < 17) {
            gradient = 'day';
        } else if (hour >= 17 && hour < 20) {
            gradient = 'twilight';
        } else {
            gradient = 'aurora';
        }
        
        this.setGradient(gradient);
    }
    
    setGradient(gradientId) {
        document.body.setAttribute('data-gradient', gradientId);
        this.storage.set(CONFIG.STORAGE.GRADIENT, gradientId);
    }
    
    async searchLocation(query) {
        if (query.length < 3) return;
        
        try {
            const results = await this.weatherAPI.searchLocation(query);
            // TODO: Display autocomplete results
            console.log('Search results:', results);
        } catch (error) {
            console.error('Location search error:', error);
        }
    }
    
    async useGeolocation() {
        if (!navigator.geolocation) {
            this.showToast('Geolocation not supported', 'error');
            return;
        }
        
        this.showLoading(true);
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                this.currentLocation = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                    name: 'Current Location'
                };
                
                // Get location name
                const locationName = await this.weatherAPI.reverseGeocode(
                    this.currentLocation.lat,
                    this.currentLocation.lon
                );
                
                this.currentLocation.name = locationName;
                this.storage.set(CONFIG.STORAGE.LOCATION, this.currentLocation);
                
                await this.loadWeatherData();
            },
            (error) => {
                console.error('Geolocation error:', error);
                this.showLoading(false);
                this.showToast('Failed to get location', 'error');
            }
        );
    }
    
    displayInsights(insights) {
        // TODO: Display AI-style insights in a dedicated widget
        console.log('Weather Insights:', insights);
    }
    
    setupAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        this.refreshInterval = setInterval(() => {
            this.loadWeatherData();
        }, CONFIG.DEFAULTS.REFRESH_INTERVAL);
    }
    
    togglePanel(panelId) {
        const panel = document.getElementById(panelId);
        const isHidden = panel.classList.contains('hidden');
        
        // Close all panels first
        document.querySelectorAll('.side-panel').forEach(p => {
            p.classList.add('hidden');
        });
        
        // Toggle the requested panel
        if (isHidden) {
            panel.classList.remove('hidden');
        }
    }
    
    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (show) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    }
    
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${this.getToastIcon(type)}</span>
            <span class="toast-message">${message}</span>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    getToastIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }
    
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('Service Worker registered', reg))
                .catch(err => console.log('Service Worker registration failed', err));
        }
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new WeatherApp());
} else {
    new WeatherApp();
}

export default WeatherApp;
