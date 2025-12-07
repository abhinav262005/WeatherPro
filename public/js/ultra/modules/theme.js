// ========================================
// THEME ENGINE - Advanced Theme System
// ========================================

export class ThemeEngine {
    constructor() {
        this.themes = {
            dawn: {
                name: 'Dawn',
                gradient: 'linear-gradient(135deg, #FFDEE9 0%, #FECFEF 50%, #B5FFFC 100%)',
                primary: '#FF9A9E',
                secondary: '#FECFEF',
                accent: '#B5FFFC'
            },
            sunrise: {
                name: 'Sunrise',
                gradient: 'linear-gradient(135deg, #FF9A9E 0%, #FAD0C4 100%)',
                primary: '#FF9A9E',
                secondary: '#FAD0C4',
                accent: '#FF6B9D'
            },
            day: {
                name: 'Day',
                gradient: 'linear-gradient(135deg, #A1C4FD 0%, #C2E9FB 100%)',
                primary: '#667eea',
                secondary: '#A1C4FD',
                accent: '#4299e1'
            },
            twilight: {
                name: 'Twilight',
                gradient: 'linear-gradient(135deg, #2C3E50 0%, #4CA1AF 50%, #667EEA 100%)',
                primary: '#667EEA',
                secondary: '#4CA1AF',
                accent: '#764ba2'
            },
            storm: {
                name: 'Storm',
                gradient: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
                primary: '#2C5364',
                secondary: '#203A43',
                accent: '#4CA1AF'
            },
            aurora: {
                name: 'Aurora',
                gradient: 'linear-gradient(135deg, #0FD3FF 0%, #7F00FF 50%, #00D2FF 100%)',
                primary: '#7F00FF',
                secondary: '#0FD3FF',
                accent: '#00D2FF'
            }
        };
        
        this.currentTheme = 'day';
        this.customTheme = null;
    }

    applyTheme(themeName) {
        const theme = this.themes[themeName] || this.themes.day;
        this.currentTheme = themeName;
        
        const root = document.documentElement;
        const gradientOverlay = document.querySelector('.gradient-overlay');
        
        // Apply gradient with animation
        gradientOverlay.style.background = theme.gradient;
        
        // Apply colors
        root.style.setProperty('--primary', theme.primary);
        root.style.setProperty('--secondary', theme.secondary);
        root.style.setProperty('--accent', theme.accent);
        
        // Update body attribute
        document.body.setAttribute('data-theme', themeName);
        
        // Animate transition
        gsap.to(gradientOverlay, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                gsap.to(gradientOverlay, {
                    opacity: 1,
                    duration: 0.5
                });
            }
        });
    }

    autoTheme(weather) {
        const hour = new Date().getHours();
        const condition = weather.weather[0].main.toLowerCase();
        
        // Time-based themes
        if (hour >= 5 && hour < 7) {
            this.applyTheme('dawn');
        } else if (hour >= 7 && hour < 9) {
            this.applyTheme('sunrise');
        } else if (hour >= 9 && hour < 17) {
            // Weather-based during day
            if (condition.includes('rain') || condition.includes('storm')) {
                this.applyTheme('storm');
            } else {
                this.applyTheme('day');
            }
        } else if (hour >= 17 && hour < 20) {
            this.applyTheme('twilight');
        } else {
            // Night themes
            if (condition.includes('clear')) {
                this.applyTheme('aurora');
            } else {
                this.applyTheme('storm');
            }
        }
    }

    togglePanel() {
        const panel = document.getElementById('themePanel');
        panel.classList.toggle('open');
        
        if (panel.classList.contains('open')) {
            this.renderThemeControls();
        }
    }

    renderThemeControls() {
        const content = document.querySelector('#themePanel .panel-content');
        
        content.innerHTML = `
            <div class="theme-section">
                <h3>Preset Themes</h3>
                <div class="theme-presets">
                    ${Object.keys(this.themes).map(key => `
                        <div class="theme-preset ${this.currentTheme === key ? 'active' : ''}" 
                             data-theme="${key}">
                            <div class="theme-preview" style="background: ${this.themes[key].gradient}"></div>
                            <span>${this.themes[key].name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="theme-section">
                <h3>Custom Theme</h3>
                <div class="theme-controls">
                    <div class="control-group">
                        <label>Gradient Start</label>
                        <input type="color" id="gradientStart" value="#A1C4FD">
                    </div>
                    <div class="control-group">
                        <label>Gradient End</label>
                        <input type="color" id="gradientEnd" value="#C2E9FB">
                    </div>
                    <div class="control-group">
                        <label>Accent Color</label>
                        <input type="color" id="accentColor" value="#667eea">
                    </div>
                    <div class="control-group">
                        <label>Gradient Angle</label>
                        <input type="range" id="gradientAngle" min="0" max="360" value="135">
                        <span id="angleValue">135°</span>
                    </div>
                    <div class="control-group">
                        <label>Animation Speed</label>
                        <input type="range" id="animSpeed" min="0.5" max="2" step="0.1" value="1">
                        <span id="speedValue">1x</span>
                    </div>
                    <button class="apply-custom-theme">Apply Custom Theme</button>
                </div>
            </div>
            
            <div class="theme-section">
                <h3>Export/Import</h3>
                <div class="theme-io">
                    <button class="export-theme">Export Theme JSON</button>
                    <button class="import-theme">Import Theme</button>
                    <input type="file" id="themeFileInput" accept=".json" style="display: none;">
                </div>
            </div>
        `;
        
        // Add styles
        this.addThemeStyles();
        
        // Add event listeners
        this.setupThemeListeners();
    }

    setupThemeListeners() {
        // Preset themes
        document.querySelectorAll('.theme-preset').forEach(preset => {
            preset.addEventListener('click', () => {
                const theme = preset.dataset.theme;
                this.applyTheme(theme);
                document.querySelectorAll('.theme-preset').forEach(p => p.classList.remove('active'));
                preset.classList.add('active');
            });
        });
        
        // Custom theme controls
        const angleInput = document.getElementById('gradientAngle');
        const angleValue = document.getElementById('angleValue');
        angleInput?.addEventListener('input', (e) => {
            angleValue.textContent = e.target.value + '°';
        });
        
        const speedInput = document.getElementById('animSpeed');
        const speedValue = document.getElementById('speedValue');
        speedInput?.addEventListener('input', (e) => {
            speedValue.textContent = e.target.value + 'x';
            document.documentElement.style.setProperty('--animation-intensity', e.target.value);
        });
        
        // Apply custom theme
        document.querySelector('.apply-custom-theme')?.addEventListener('click', () => {
            this.applyCustomTheme();
        });
        
        // Export/Import
        document.querySelector('.export-theme')?.addEventListener('click', () => {
            this.exportTheme();
        });
        
        document.querySelector('.import-theme')?.addEventListener('click', () => {
            document.getElementById('themeFileInput').click();
        });
        
        document.getElementById('themeFileInput')?.addEventListener('change', (e) => {
            this.importTheme(e.target.files[0]);
        });
    }

    applyCustomTheme() {
        const start = document.getElementById('gradientStart').value;
        const end = document.getElementById('gradientEnd').value;
        const accent = document.getElementById('accentColor').value;
        const angle = document.getElementById('gradientAngle').value;
        
        const customGradient = `linear-gradient(${angle}deg, ${start} 0%, ${end} 100%)`;
        
        const gradientOverlay = document.querySelector('.gradient-overlay');
        gradientOverlay.style.background = customGradient;
        
        document.documentElement.style.setProperty('--accent', accent);
        document.documentElement.style.setProperty('--primary', start);
        document.documentElement.style.setProperty('--secondary', end);
        
        this.customTheme = { start, end, accent, angle };
    }

    exportTheme() {
        const themeData = {
            name: 'Custom Theme',
            gradient: this.customTheme || this.themes[this.currentTheme],
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(themeData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'weather-theme.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    async importTheme(file) {
        if (!file) return;
        
        try {
            const text = await file.text();
            const themeData = JSON.parse(text);
            
            if (themeData.gradient) {
                // Apply imported theme
                console.log('Imported theme:', themeData);
                // Implementation for applying imported theme
            }
        } catch (error) {
            console.error('Failed to import theme:', error);
        }
    }

    addThemeStyles() {
        if (document.getElementById('theme-panel-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'theme-panel-styles';
        style.textContent = `
            .theme-section {
                margin-bottom: 2rem;
            }
            
            .theme-section h3 {
                font-size: 1.2rem;
                margin-bottom: 1rem;
                opacity: 0.9;
            }
            
            .theme-presets {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
            }
            
            .theme-preset {
                cursor: pointer;
                text-align: center;
                transition: transform 0.3s ease;
            }
            
            .theme-preset:hover {
                transform: scale(1.05);
            }
            
            .theme-preset.active .theme-preview {
                border: 3px solid var(--accent);
                box-shadow: 0 0 20px var(--accent);
            }
            
            .theme-preview {
                width: 100%;
                height: 80px;
                border-radius: 12px;
                margin-bottom: 0.5rem;
                border: 2px solid rgba(255, 255, 255, 0.2);
                transition: all 0.3s ease;
            }
            
            .theme-controls {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            
            .control-group {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }
            
            .control-group label {
                font-size: 0.9rem;
                opacity: 0.8;
            }
            
            .control-group input[type="color"] {
                width: 100%;
                height: 50px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
            }
            
            .control-group input[type="range"] {
                width: 100%;
            }
            
            .apply-custom-theme,
            .export-theme,
            .import-theme {
                padding: 0.8rem 1.5rem;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                color: white;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 1rem;
            }
            
            .apply-custom-theme:hover,
            .export-theme:hover,
            .import-theme:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: translateY(-2px);
            }
            
            .theme-io {
                display: flex;
                flex-direction: column;
                gap: 0.8rem;
            }
        `;
        document.head.appendChild(style);
    }
}
