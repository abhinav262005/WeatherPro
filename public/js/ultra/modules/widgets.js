// ========================================
// WIDGET ENGINE - Modular Widget System
// ========================================

export class WidgetEngine {
    constructor() {
        this.widgets = new Map();
        this.widgetLibrary = {
            hourlyForecast: {
                name: 'Hourly Forecast',
                icon: 'fa-clock',
                render: this.renderHourlyForecast.bind(this)
            },
            weeklyForecast: {
                name: '7-Day Forecast',
                icon: 'fa-calendar-week',
                render: this.renderWeeklyForecast.bind(this)
            },
            airQuality: {
                name: 'Air Quality',
                icon: 'fa-wind',
                render: this.renderAirQuality.bind(this)
            },
            uvIndex: {
                name: 'UV Index',
                icon: 'fa-sun',
                render: this.renderUVIndex.bind(this)
            },
            windRose: {
                name: 'Wind Rose',
                icon: 'fa-compass',
                render: this.renderWindRose.bind(this)
            },
            moonPhase: {
                name: 'Moon Phase',
                icon: 'fa-moon',
                render: this.renderMoonPhase.bind(this)
            },
            sunriseSunset: {
                name: 'Sunrise/Sunset',
                icon: 'fa-sun',
                render: this.renderSunriseSunset.bind(this)
            },
            radar: {
                name: 'Weather Radar',
                icon: 'fa-satellite-dish',
                render: this.renderRadar.bind(this)
            }
        };
        
        this.activeWidgets = ['hourlyForecast', 'weeklyForecast', 'airQuality'];
    }

    init() {
        this.renderActiveWidgets();
    }

    togglePanel() {
        const panel = document.getElementById('widgetPanel');
        panel.classList.toggle('open');
        
        if (panel.classList.contains('open')) {
            this.renderWidgetLibrary();
        }
    }

    renderWidgetLibrary() {
        const library = document.getElementById('widgetLibrary');
        
        library.innerHTML = `
            <h3>Available Widgets</h3>
            <div class="widget-list">
                ${Object.entries(this.widgetLibrary).map(([key, widget]) => `
                    <div class="widget-library-item ${this.activeWidgets.includes(key) ? 'active' : ''}" 
                         data-widget="${key}">
                        <i class="fas ${widget.icon}"></i>
                        <span>${widget.name}</span>
                        <button class="toggle-widget" data-widget="${key}">
                            ${this.activeWidgets.includes(key) ? 'Remove' : 'Add'}
                        </button>
                    </div>
                `).join('')}
            </div>
            
            <div class="widget-actions">
                <button class="reset-layout">Reset Layout</button>
                <button class="export-layout">Export Layout</button>
                <button class="import-layout">Import Layout</button>
            </div>
        `;
        
        this.addWidgetLibraryStyles();
        this.setupWidgetLibraryListeners();
    }

    setupWidgetLibraryListeners() {
        document.querySelectorAll('.toggle-widget').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const widgetKey = btn.dataset.widget;
                this.toggleWidget(widgetKey);
            });
        });
        
        document.querySelector('.reset-layout')?.addEventListener('click', () => {
            this.resetLayout();
        });
        
        document.querySelector('.export-layout')?.addEventListener('click', () => {
            this.exportLayout();
        });
        
        document.querySelector('.import-layout')?.addEventListener('click', () => {
            this.importLayout();
        });
    }

    toggleWidget(widgetKey) {
        const index = this.activeWidgets.indexOf(widgetKey);
        
        if (index > -1) {
            this.activeWidgets.splice(index, 1);
        } else {
            this.activeWidgets.push(widgetKey);
        }
        
        this.renderActiveWidgets();
        this.renderWidgetLibrary();
    }

    renderActiveWidgets() {
        const grid = document.getElementById('widgetGrid');
        grid.innerHTML = '';
        
        this.activeWidgets.forEach(widgetKey => {
            const widgetDef = this.widgetLibrary[widgetKey];
            if (!widgetDef) return;
            
            const widget = document.createElement('div');
            widget.className = 'widget';
            widget.dataset.widget = widgetKey;
            
            widget.innerHTML = `
                <div class="widget-header">
                    <div class="widget-title">
                        <i class="fas ${widgetDef.icon}"></i>
                        ${widgetDef.name}
                    </div>
                    <div class="widget-actions">
                        <button class="widget-btn refresh-widget" title="Refresh">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                        <button class="widget-btn remove-widget" title="Remove">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="widget-content" id="widget-${widgetKey}">
                    <div class="widget-loading">Loading...</div>
                </div>
            `;
            
            grid.appendChild(widget);
            
            // Render widget content
            widgetDef.render(document.getElementById(`widget-${widgetKey}`));
            
            // Add event listeners
            widget.querySelector('.remove-widget').addEventListener('click', () => {
                this.toggleWidget(widgetKey);
            });
            
            widget.querySelector('.refresh-widget').addEventListener('click', () => {
                widgetDef.render(document.getElementById(`widget-${widgetKey}`));
            });
        });
    }

    renderHourlyForecast(container) {
        container.innerHTML = `
            <canvas id="hourlyChart"></canvas>
        `;
        
        // Fetch and render hourly data
        this.fetchHourlyData().then(data => {
            this.createHourlyChart(data);
        });
    }

    async fetchHourlyData() {
        // Mock data - replace with actual API call
        const hours = [];
        const temps = [];
        
        for (let i = 0; i < 24; i++) {
            const hour = new Date();
            hour.setHours(hour.getHours() + i);
            hours.push(hour.getHours() + ':00');
            temps.push(Math.round(20 + Math.random() * 10));
        }
        
        return { hours, temps };
    }

    createHourlyChart(data) {
        const ctx = document.getElementById('hourlyChart');
        if (!ctx) return;
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.hours,
                datasets: [{
                    label: 'Temperature (°C)',
                    data: data.temps,
                    borderColor: 'rgba(102, 126, 234, 1)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.8)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.8)',
                            maxRotation: 0
                        }
                    }
                }
            }
        });
    }

    renderWeeklyForecast(container) {
        container.innerHTML = `
            <div class="weekly-forecast">
                ${this.generateWeeklyForecast()}
            </div>
        `;
    }

    generateWeeklyForecast() {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const icons = ['☀️', '⛅', '☁️', '🌧️', '⛈️', '🌤️', '☀️'];
        
        return days.map((day, i) => `
            <div class="forecast-day">
                <div class="day-name">${day}</div>
                <div class="day-icon">${icons[i]}</div>
                <div class="day-temp">
                    <span class="temp-high">${20 + Math.round(Math.random() * 10)}°</span>
                    <span class="temp-low">${10 + Math.round(Math.random() * 5)}°</span>
                </div>
            </div>
        `).join('');
    }

    renderAirQuality(container) {
        const aqi = Math.round(Math.random() * 150);
        const level = aqi < 50 ? 'Good' : aqi < 100 ? 'Moderate' : aqi < 150 ? 'Unhealthy for Sensitive' : 'Unhealthy';
        const color = aqi < 50 ? '#00e400' : aqi < 100 ? '#ffff00' : aqi < 150 ? '#ff7e00' : '#ff0000';
        
        container.innerHTML = `
            <div class="aqi-display">
                <div class="aqi-value" style="color: ${color}">${aqi}</div>
                <div class="aqi-level">${level}</div>
                <div class="aqi-bar">
                    <div class="aqi-fill" style="width: ${(aqi / 200) * 100}%; background: ${color}"></div>
                </div>
                <div class="aqi-details">
                    <div class="pollutant">
                        <span>PM2.5</span>
                        <span>${Math.round(aqi * 0.4)}</span>
                    </div>
                    <div class="pollutant">
                        <span>PM10</span>
                        <span>${Math.round(aqi * 0.6)}</span>
                    </div>
                    <div class="pollutant">
                        <span>O₃</span>
                        <span>${Math.round(aqi * 0.3)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderUVIndex(container) {
        const uv = Math.round(Math.random() * 11);
        const level = uv < 3 ? 'Low' : uv < 6 ? 'Moderate' : uv < 8 ? 'High' : uv < 11 ? 'Very High' : 'Extreme';
        const color = uv < 3 ? '#00e400' : uv < 6 ? '#ffff00' : uv < 8 ? '#ff7e00' : uv < 11 ? '#ff0000' : '#b54cff';
        
        container.innerHTML = `
            <div class="uv-display">
                <div class="uv-value" style="color: ${color}">${uv}</div>
                <div class="uv-level">${level}</div>
                <div class="uv-bar">
                    <div class="uv-fill" style="width: ${(uv / 11) * 100}%; background: ${color}"></div>
                </div>
                <div class="uv-advice">
                    ${uv < 3 ? '😎 No protection needed' : 
                      uv < 6 ? '🧴 Wear sunscreen' : 
                      uv < 8 ? '👒 Seek shade, wear hat' : 
                      '⚠️ Avoid sun exposure'}
                </div>
            </div>
        `;
    }

    renderWindRose(container) {
        container.innerHTML = `
            <div class="wind-rose">
                <canvas id="windRoseCanvas" width="250" height="250"></canvas>
            </div>
        `;
        
        this.drawWindRose();
    }

    drawWindRose() {
        const canvas = document.getElementById('windRoseCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const centerX = 125;
        const centerY = 125;
        const radius = 100;
        
        // Draw compass
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw directions
        const directions = ['N', 'E', 'S', 'W'];
        const angles = [0, 90, 180, 270];
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        directions.forEach((dir, i) => {
            const angle = (angles[i] - 90) * Math.PI / 180;
            const x = centerX + Math.cos(angle) * (radius + 20);
            const y = centerY + Math.sin(angle) * (radius + 20);
            ctx.fillText(dir, x, y);
        });
        
        // Draw wind arrow (example: from NE)
        const windAngle = 45 * Math.PI / 180;
        const windSpeed = 0.7; // 70% of radius
        
        ctx.strokeStyle = '#667eea';
        ctx.fillStyle = '#667eea';
        ctx.lineWidth = 3;
        
        const arrowX = centerX + Math.cos(windAngle) * radius * windSpeed;
        const arrowY = centerY + Math.sin(windAngle) * radius * windSpeed;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(arrowX, arrowY);
        ctx.stroke();
        
        // Arrow head
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - 10 * Math.cos(windAngle - 0.5), arrowY - 10 * Math.sin(windAngle - 0.5));
        ctx.lineTo(arrowX - 10 * Math.cos(windAngle + 0.5), arrowY - 10 * Math.sin(windAngle + 0.5));
        ctx.closePath();
        ctx.fill();
    }

    renderMoonPhase(container) {
        const phases = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
        const phaseNames = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 
                           'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
        const currentPhase = Math.floor(Math.random() * 8);
        
        container.innerHTML = `
            <div class="moon-phase">
                <div class="moon-icon">${phases[currentPhase]}</div>
                <div class="moon-name">${phaseNames[currentPhase]}</div>
                <div class="moon-illumination">${Math.round(Math.random() * 100)}% Illuminated</div>
            </div>
        `;
    }

    renderSunriseSunset(container) {
        const sunrise = new Date();
        sunrise.setHours(6, 30, 0);
        const sunset = new Date();
        sunset.setHours(18, 45, 0);
        
        container.innerHTML = `
            <div class="sun-times">
                <div class="sun-time">
                    <i class="fas fa-sun sunrise-icon"></i>
                    <div>
                        <div class="time-label">Sunrise</div>
                        <div class="time-value">${sunrise.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                </div>
                <div class="sun-time">
                    <i class="fas fa-moon sunset-icon"></i>
                    <div>
                        <div class="time-label">Sunset</div>
                        <div class="time-value">${sunset.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                </div>
                <div class="daylight">
                    <i class="fas fa-clock"></i>
                    <span>12h 15m of daylight</span>
                </div>
            </div>
        `;
    }

    renderRadar(container) {
        container.innerHTML = `
            <div class="radar-placeholder">
                <i class="fas fa-satellite-dish"></i>
                <p>Weather Radar</p>
                <small>Map integration coming soon</small>
            </div>
        `;
    }

    resetLayout() {
        this.activeWidgets = ['hourlyForecast', 'weeklyForecast', 'airQuality'];
        this.renderActiveWidgets();
        this.renderWidgetLibrary();
    }

    exportLayout() {
        const layout = {
            widgets: this.activeWidgets,
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(layout, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'widget-layout.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    importLayout() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                const layout = JSON.parse(text);
                this.activeWidgets = layout.widgets || [];
                this.renderActiveWidgets();
                this.renderWidgetLibrary();
            } catch (error) {
                console.error('Failed to import layout:', error);
            }
        };
        input.click();
    }

    addWidgetLibraryStyles() {
        if (document.getElementById('widget-library-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'widget-library-styles';
        style.textContent = `
            .widget-list {
                display: flex;
                flex-direction: column;
                gap: 0.8rem;
                margin: 1rem 0;
            }
            
            .widget-library-item {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                transition: all 0.3s ease;
            }
            
            .widget-library-item:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            
            .widget-library-item.active {
                border-color: var(--accent);
            }
            
            .widget-library-item i {
                font-size: 1.5rem;
                color: var(--accent);
            }
            
            .widget-library-item span {
                flex: 1;
            }
            
            .toggle-widget {
                padding: 0.5rem 1rem;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 6px;
                color: white;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .toggle-widget:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            .widget-actions {
                display: flex;
                flex-direction: column;
                gap: 0.8rem;
                margin-top: 2rem;
            }
            
            .widget-actions button {
                padding: 0.8rem;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                color: white;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .widget-actions button:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            .widget-content {
                min-height: 200px;
            }
            
            .widget-loading {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 200px;
                opacity: 0.6;
            }
            
            .weekly-forecast {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 0.5rem;
            }
            
            .forecast-day {
                text-align: center;
                padding: 0.8rem 0.4rem;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
            }
            
            .day-name {
                font-weight: 600;
                margin-bottom: 0.5rem;
            }
            
            .day-icon {
                font-size: 2rem;
                margin: 0.5rem 0;
            }
            
            .day-temp {
                display: flex;
                flex-direction: column;
                gap: 0.2rem;
                font-size: 0.9rem;
            }
            
            .temp-high {
                font-weight: 700;
            }
            
            .temp-low {
                opacity: 0.6;
            }
            
            .aqi-display, .uv-display {
                text-align: center;
                padding: 1rem;
            }
            
            .aqi-value, .uv-value {
                font-size: 4rem;
                font-weight: 900;
                margin-bottom: 0.5rem;
            }
            
            .aqi-level, .uv-level {
                font-size: 1.2rem;
                font-weight: 600;
                margin-bottom: 1rem;
            }
            
            .aqi-bar, .uv-bar {
                height: 10px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 5px;
                overflow: hidden;
                margin-bottom: 1rem;
            }
            
            .aqi-fill, .uv-fill {
                height: 100%;
                transition: width 0.5s ease;
            }
            
            .aqi-details {
                display: flex;
                justify-content: space-around;
                margin-top: 1rem;
            }
            
            .pollutant {
                display: flex;
                flex-direction: column;
                gap: 0.3rem;
            }
            
            .wind-rose {
                display: flex;
                justify-content: center;
                padding: 1rem;
            }
            
            .moon-phase {
                text-align: center;
                padding: 2rem;
            }
            
            .moon-icon {
                font-size: 5rem;
                margin-bottom: 1rem;
            }
            
            .moon-name {
                font-size: 1.3rem;
                font-weight: 600;
                margin-bottom: 0.5rem;
            }
            
            .sun-times {
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
                padding: 1rem;
            }
            
            .sun-time {
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            
            .sun-time i {
                font-size: 2.5rem;
            }
            
            .sunrise-icon {
                color: #FFD700;
            }
            
            .sunset-icon {
                color: #FF6B6B;
            }
            
            .time-label {
                font-size: 0.9rem;
                opacity: 0.7;
            }
            
            .time-value {
                font-size: 1.5rem;
                font-weight: 700;
            }
            
            .daylight {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                padding: 1rem;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
            }
            
            .radar-placeholder {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 250px;
                opacity: 0.6;
            }
            
            .radar-placeholder i {
                font-size: 3rem;
                margin-bottom: 1rem;
            }
        `;
        document.head.appendChild(style);
    }
}
