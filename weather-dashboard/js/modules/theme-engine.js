/* ============================================
   THEME ENGINE MODULE
   ============================================ */

import CONFIG from '../config.js';

class ThemeEngine {
    constructor() {
        this.customTheme = {};
        this.panel = null;
    }
    
    init() {
        this.panel = document.getElementById('theme-customizer');
        this.loadCustomTheme();
        this.renderThemeControls();
    }
    
    loadCustomTheme() {
        const saved = localStorage.getItem('weather_custom_theme');
        if (saved) {
            this.customTheme = JSON.parse(saved);
            this.applyTheme(this.customTheme);
        }
    }
    
    renderThemeControls() {
        const content = this.panel.querySelector('.panel-content');
        
        content.innerHTML = `
            <div class="theme-controls">
                <section class="theme-section">
                    <h4>Gradient Presets</h4>
                    <div class="gradient-presets">
                        ${CONFIG.GRADIENTS.map(g => `
                            <button class="gradient-preset" data-gradient="${g.id}" 
                                    style="background: linear-gradient(135deg, ${g.colors.join(', ')})">
                                ${g.name}
                            </button>
                        `).join('')}
                    </div>
                </section>
                
                <section class="theme-section">
                    <h4>Glass Effect</h4>
                    <label>
                        Blur Strength
                        <input type="range" id="glass-blur" min="0" max="40" value="20" step="1">
                        <span id="glass-blur-value">20px</span>
                    </label>
                    <label>
                        Opacity
                        <input type="range" id="glass-opacity" min="0" max="30" value="10" step="1">
                        <span id="glass-opacity-value">0.1</span>
                    </label>
                </section>
                
                <section class="theme-section">
                    <h4>Typography</h4>
                    <label>
                        Font Size Scale
                        <input type="range" id="font-scale" min="80" max="120" value="100" step="5">
                        <span id="font-scale-value">100%</span>
                    </label>
                    <label>
                        Layout Mode
                        <select id="layout-mode">
                            <option value="comfortable">Comfortable</option>
                            <option value="compact">Compact</option>
                            <option value="spacious">Spacious</option>
                        </select>
                    </label>
                </section>
                
                <section class="theme-section">
                    <h4>Animation</h4>
                    <label>
                        Animation Speed
                        <input type="range" id="animation-speed" min="50" max="200" value="100" step="10">
                        <span id="animation-speed-value">100%</span>
                    </label>
                    <label>
                        <input type="checkbox" id="reduced-motion">
                        Reduce Motion
                    </label>
                </section>
                
                <section class="theme-section">
                    <h4>Actions</h4>
                    <button id="export-theme" class="theme-btn">Export Theme</button>
                    <button id="import-theme" class="theme-btn">Import Theme</button>
                    <button id="reset-theme" class="theme-btn">Reset to Default</button>
                </section>
            </div>
        `;
        
        this.attachEventListeners();
    }
    
    attachEventListeners() {
        // Gradient presets
        document.querySelectorAll('.gradient-preset').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const gradient = e.target.dataset.gradient;
                document.body.setAttribute('data-gradient', gradient);
                localStorage.setItem('weather_gradient', gradient);
            });
        });
        
        // Glass blur
        const blurInput = document.getElementById('glass-blur');
        const blurValue = document.getElementById('glass-blur-value');
        blurInput.addEventListener('input', (e) => {
            const value = e.target.value;
            blurValue.textContent = `${value}px`;
            document.documentElement.style.setProperty('--glass-blur', `${value}px`);
            this.saveThemeProperty('glassBlur', value);
        });
        
        // Glass opacity
        const opacityInput = document.getElementById('glass-opacity');
        const opacityValue = document.getElementById('glass-opacity-value');
        opacityInput.addEventListener('input', (e) => {
            const value = e.target.value / 100;
            opacityValue.textContent = value.toFixed(2);
            document.documentElement.style.setProperty('--glass-bg', `rgba(255, 255, 255, ${value})`);
            this.saveThemeProperty('glassOpacity', value);
        });
        
        // Font scale
        const fontScaleInput = document.getElementById('font-scale');
        const fontScaleValue = document.getElementById('font-scale-value');
        fontScaleInput.addEventListener('input', (e) => {
            const value = e.target.value;
            fontScaleValue.textContent = `${value}%`;
            document.documentElement.style.fontSize = `${(16 * value) / 100}px`;
            this.saveThemeProperty('fontSize', value);
        });
        
        // Layout mode
        document.getElementById('layout-mode').addEventListener('change', (e) => {
            const mode = e.target.value;
            document.body.setAttribute('data-layout', mode);
            this.saveThemeProperty('layout', mode);
        });
        
        // Animation speed
        const animSpeedInput = document.getElementById('animation-speed');
        const animSpeedValue = document.getElementById('animation-speed-value');
        animSpeedInput.addEventListener('input', (e) => {
            const value = e.target.value;
            animSpeedValue.textContent = `${value}%`;
            const duration = (300 * 100) / value;
            document.documentElement.style.setProperty('--transition-base', `${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`);
            this.saveThemeProperty('animationSpeed', value);
        });
        
        // Reduced motion
        document.getElementById('reduced-motion').addEventListener('change', (e) => {
            if (e.target.checked) {
                document.body.classList.add('reduced-motion');
            } else {
                document.body.classList.remove('reduced-motion');
            }
            this.saveThemeProperty('reducedMotion', e.target.checked);
        });
        
        // Export theme
        document.getElementById('export-theme').addEventListener('click', () => {
            this.exportTheme();
        });
        
        // Import theme
        document.getElementById('import-theme').addEventListener('click', () => {
            this.importTheme();
        });
        
        // Reset theme
        document.getElementById('reset-theme').addEventListener('click', () => {
            this.resetTheme();
        });
    }
    
    saveThemeProperty(key, value) {
        this.customTheme[key] = value;
        localStorage.setItem('weather_custom_theme', JSON.stringify(this.customTheme));
    }
    
    applyTheme(theme) {
        if (theme.glassBlur) {
            document.documentElement.style.setProperty('--glass-blur', `${theme.glassBlur}px`);
        }
        if (theme.glassOpacity) {
            document.documentElement.style.setProperty('--glass-bg', `rgba(255, 255, 255, ${theme.glassOpacity})`);
        }
        if (theme.fontSize) {
            document.documentElement.style.fontSize = `${(16 * theme.fontSize) / 100}px`;
        }
        if (theme.layout) {
            document.body.setAttribute('data-layout', theme.layout);
        }
        if (theme.reducedMotion) {
            document.body.classList.add('reduced-motion');
        }
    }
    
    exportTheme() {
        const themeJSON = JSON.stringify(this.customTheme, null, 2);
        const blob = new Blob([themeJSON], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'weather-theme.json';
        a.click();
        URL.revokeObjectURL(url);
    }
    
    importTheme() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const theme = JSON.parse(event.target.result);
                    this.customTheme = theme;
                    this.applyTheme(theme);
                    localStorage.setItem('weather_custom_theme', JSON.stringify(theme));
                    alert('Theme imported successfully!');
                } catch (error) {
                    alert('Invalid theme file');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }
    
    resetTheme() {
        this.customTheme = {};
        localStorage.removeItem('weather_custom_theme');
        location.reload();
    }
}

export default ThemeEngine;
