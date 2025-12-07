/* ============================================
   WIDGET SYSTEM MODULE
   Manages dynamic widget loading and layout
   ============================================ */

import CONFIG from '../config.js';
import { HELPERS } from '../config.js';

class WidgetSystem {
    constructor() {
        this.widgets = new Map();
        this.container = null;
        this.activeWidgets = [];
    }
    
    init() {
        this.container = document.getElementById('widget-grid');
        this.loadActiveWidgets();
        this.renderWidgets();
    }
    
    loadActiveWidgets() {
        // Load from storage or use defaults
        const saved = localStorage.getItem('weather_active_widgets');
        this.activeWidgets = saved ? JSON.parse(saved) : CONFIG.WIDGETS.DEFAULT_ENABLED;
    }
    
    renderWidgets() {
        if (!this.container) return;
        
        this.container.innerHTML = '';
        
        this.activeWidgets.forEach((widgetId, index) => {
            const widget = this.createWidget(widgetId);
            if (widget) {
                setTimeout(() => {
                    this.container.appendChild(widget);
                    widget.classList.add('fade-in');
                }, index * CONFIG.ANIMATION.WIDGET_ANIMATION_DELAY);
            }
        });
    }
    
    createWidget(widgetId) {
        const widgetConfig = CONFIG.WIDGETS.AVAILABLE.find(w => w.id === widgetId);
        if (!widgetConfig) return null;
        
        const widget = document.createElement('div');
        widget.className = 'widget';
        widget.id = `widget-${widgetId}`;
        widget.setAttribute('data-widget-id', widgetId);
        
        widget.innerHTML = `
            <div class="widget-card glass-panel">
                <div class="widget-header">
                    <h3 class="widget-title">
                        <span class="widget-icon">${widgetConfig.icon}</span>
                        ${widgetConfig.name}
                    </h3>
                    <div class="widget-actions">
                        <button class="widget-btn" data-action="refresh" title="Refresh">🔄</button>
                        <button class="widget-btn" data-action="remove" title="Remove">✕</button>
                    </div>
                </div>
                <div class="widget-content" id="content-${widgetId}">
                    <div class="widget-loading">Loading...</div>
                </div>
            </div>
        `;
        
        // Add event listeners
        widget.querySelector('[data-action="refresh"]').addEventListener('click', () => {
            this.refreshWidget(widgetId);
        });
        
        widget.querySelector('[data-action="remove"]').addEventListener('click', () => {
            this.removeWidget(widgetId);
        });
        
        return widget;
    }
    
    updateAllWidgets(weatherData) {
        this.activeWidgets.forEach(widgetId => {
            this.updateWidget(widgetId, weatherData);
        });
    }
    
    updateWidget(widgetId, weatherData) {
        const content = document.getElementById(`content-${widgetId}`);
        if (!content) return;
        
        switch(widgetId) {
            case 'hourly-chart':
                this.renderHourlyChart(content, weatherData.hourly);
                break;
            case 'forecast-7day':
                this.renderForecastCards(content, weatherData.daily);
                break;
            case 'aqi-suite':
                this.renderAQI(content, weatherData.aqi);
                break;
            case 'wind-rose':
                this.renderWindRose(content, weatherData.current);
                break;
            case 'uv-index':
                this.renderUVIndex(content, weatherData.current);
                break;
            case 'humidity-comfort':
                this.renderHumidityComfort(content, weatherData.current);
                break;
            default:
                content.innerHTML = '<p>Widget not implemented yet</p>';
        }
    }
    
    renderHourlyChart(container, hourlyData) {
        container.innerHTML = '<canvas id="hourly-chart-canvas"></canvas>';
        
        const canvas = container.querySelector('canvas');
        const ctx = canvas.getContext('2d');
        
        // Prepare data
        const labels = hourlyData.slice(0, 12).map(h => HELPERS.formatTime(h.dt, 'time'));
        const temps = hourlyData.slice(0, 12).map(h => Math.round(h.temp));
        const precipitation = hourlyData.slice(0, 12).map(h => (h.pop * 100).toFixed(0));
        
        // Create chart using Chart.js
        if (window.Chart) {
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Temperature (°C)',
                        data: temps,
                        borderColor: 'rgba(255, 255, 255, 0.8)',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y',
                    }, {
                        label: 'Precipitation (%)',
                        data: precipitation,
                        borderColor: 'rgba(100, 200, 255, 0.8)',
                        backgroundColor: 'rgba(100, 200, 255, 0.2)',
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y1',
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: { color: 'white' }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: 'white' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        y: {
                            type: 'linear',
                            position: 'left',
                            ticks: { color: 'white' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        y1: {
                            type: 'linear',
                            position: 'right',
                            ticks: { color: 'white' },
                            grid: { display: false }
                        }
                    }
                }
            });
        }
    }
    
    renderForecastCards(container, dailyData) {
        container.innerHTML = '<div class="forecast-cards"></div>';
        const cardsContainer = container.querySelector('.forecast-cards');
        
        dailyData.forEach(day => {
            const card = document.createElement('div');
            card.className = 'forecast-card glass-mini';
            card.innerHTML = `
                <div class="forecast-day">${HELPERS.formatTime(day.dt, 'day')}</div>
                <div class="forecast-icon">${HELPERS.getWeatherIcon(day.weather[0].icon)}</div>
                <div class="forecast-temp">${Math.round(day.temp.max)}°</div>
                <div class="forecast-temp-range">${Math.round(day.temp.min)}°</div>
            `;
            cardsContainer.appendChild(card);
        });
    }
    
    renderAQI(container, aqiData) {
        if (!aqiData) {
            container.innerHTML = '<p>Air quality data unavailable</p>';
            return;
        }
        
        const level = HELPERS.getAQILevel(aqiData.aqi * 50); // Convert 1-5 scale to AQI
        
        container.innerHTML = `
            <div class="aqi-display">
                <div class="aqi-value" style="color: ${level.color}">
                    ${aqiData.aqi}
                </div>
                <div class="aqi-label">${level.label}</div>
                <div class="aqi-description">${level.description}</div>
                <div class="aqi-components">
                    <div class="aqi-component">
                        <span>PM2.5</span>
                        <strong>${aqiData.pm2_5.toFixed(1)}</strong>
                    </div>
                    <div class="aqi-component">
                        <span>PM10</span>
                        <strong>${aqiData.pm10.toFixed(1)}</strong>
                    </div>
                    <div class="aqi-component">
                        <span>O₃</span>
                        <strong>${aqiData.o3.toFixed(1)}</strong>
                    </div>
                    <div class="aqi-component">
                        <span>NO₂</span>
                        <strong>${aqiData.no2.toFixed(1)}</strong>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderWindRose(container, currentData) {
        const direction = HELPERS.getWindDirection(currentData.wind_deg);
        const speed = Math.round(currentData.wind_speed);
        
        container.innerHTML = `
            <div class="wind-display">
                <div class="wind-compass">
                    <div class="wind-arrow" style="transform: rotate(${currentData.wind_deg}deg)">↑</div>
                </div>
                <div class="wind-info">
                    <div class="wind-direction">${direction}</div>
                    <div class="wind-speed">${speed} km/h</div>
                </div>
            </div>
        `;
    }
    
    renderUVIndex(container, currentData) {
        const uv = currentData.uvi || 0;
        const level = HELPERS.getUVLevel(uv);
        
        container.innerHTML = `
            <div class="uv-display">
                <div class="uv-value" style="color: ${level.color}">${uv.toFixed(1)}</div>
                <div class="uv-label">${level.label}</div>
                <div class="uv-advice">${level.advice}</div>
                <div class="uv-bar">
                    <div class="uv-fill" style="width: ${(uv / 11) * 100}%; background: ${level.color}"></div>
                </div>
            </div>
        `;
    }
    
    renderHumidityComfort(container, currentData) {
        const humidity = currentData.humidity;
        const temp = currentData.temp;
        
        // Calculate comfort level
        let comfort = 'Comfortable';
        if (humidity > 70) comfort = 'Humid';
        if (humidity < 30) comfort = 'Dry';
        if (temp > 30 && humidity > 60) comfort = 'Very Humid';
        
        container.innerHTML = `
            <div class="humidity-display">
                <div class="humidity-value">${humidity}%</div>
                <div class="humidity-label">Humidity</div>
                <div class="comfort-level">${comfort}</div>
                <div class="humidity-bar">
                    <div class="humidity-fill" style="width: ${humidity}%"></div>
                </div>
            </div>
        `;
    }
    
    refreshWidget(widgetId) {
        console.log(`Refreshing widget: ${widgetId}`);
        // Trigger data refresh
    }
    
    removeWidget(widgetId) {
        this.activeWidgets = this.activeWidgets.filter(id => id !== widgetId);
        localStorage.setItem('weather_active_widgets', JSON.stringify(this.activeWidgets));
        
        const widget = document.querySelector(`[data-widget-id="${widgetId}"]`);
        if (widget) {
            widget.style.opacity = '0';
            setTimeout(() => widget.remove(), 300);
        }
    }
    
    addWidget(widgetId) {
        if (!this.activeWidgets.includes(widgetId)) {
            this.activeWidgets.push(widgetId);
            localStorage.setItem('weather_active_widgets', JSON.stringify(this.activeWidgets));
            this.renderWidgets();
        }
    }
}

export default WidgetSystem;
