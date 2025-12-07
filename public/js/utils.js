// Utility Functions for Weather Dashboard

// Date and Time Utilities
const DateUtils = {
    formatDate(date, format = 'long') {
        const options = {
            short: { month: 'short', day: 'numeric' },
            long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
            time: { hour: '2-digit', minute: '2-digit' },
            full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
        };
        return new Date(date).toLocaleDateString('en-US', options[format] || options.long);
    },

    formatTime(date, format = '12h') {
        const options = format === '24h' 
            ? { hour: '2-digit', minute: '2-digit', hour12: false }
            : { hour: '2-digit', minute: '2-digit', hour12: true };
        return new Date(date).toLocaleTimeString('en-US', options);
    },

    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };

        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
            }
        }
        return 'just now';
    },

    getDayOfWeek(date) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[new Date(date).getDay()];
    }
};

// Weather Utilities
const WeatherUtils = {
    getWeatherIcon(code, isDay = true) {
        const iconMap = {
            '01': isDay ? 'fa-sun' : 'fa-moon',
            '02': isDay ? 'fa-cloud-sun' : 'fa-cloud-moon',
            '03': 'fa-cloud',
            '04': 'fa-cloud',
            '09': 'fa-cloud-rain',
            '10': isDay ? 'fa-cloud-sun-rain' : 'fa-cloud-moon-rain',
            '11': 'fa-bolt',
            '13': 'fa-snowflake',
            '50': 'fa-smog'
        };
        return iconMap[code.substring(0, 2)] || 'fa-cloud';
    },

    getWeatherColor(condition) {
        const colors = {
            'Clear': '#FDB813',
            'Clouds': '#95A5A6',
            'Rain': '#3498DB',
            'Drizzle': '#5DADE2',
            'Thunderstorm': '#8E44AD',
            'Snow': '#ECF0F1',
            'Mist': '#BDC3C7',
            'Fog': '#95A5A6'
        };
        return colors[condition] || '#95A5A6';
    },

    celsiusToFahrenheit(celsius) {
        return (celsius * 9/5) + 32;
    },

    fahrenheitToCelsius(fahrenheit) {
        return (fahrenheit - 32) * 5/9;
    },

    getUVIndexLevel(index) {
        if (index <= 2) return { level: 'Low', color: '#4CAF50' };
        if (index <= 5) return { level: 'Moderate', color: '#FFC107' };
        if (index <= 7) return { level: 'High', color: '#FF9800' };
        if (index <= 10) return { level: 'Very High', color: '#F44336' };
        return { level: 'Extreme', color: '#9C27B0' };
    },

    getAirQualityLevel(aqi) {
        if (aqi <= 50) return { level: 'Good', color: '#4CAF50' };
        if (aqi <= 100) return { level: 'Moderate', color: '#FFC107' };
        if (aqi <= 150) return { level: 'Unhealthy for Sensitive', color: '#FF9800' };
        if (aqi <= 200) return { level: 'Unhealthy', color: '#F44336' };
        if (aqi <= 300) return { level: 'Very Unhealthy', color: '#9C27B0' };
        return { level: 'Hazardous', color: '#7B1FA2' };
    },

    getWindDirection(degrees) {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round(degrees / 22.5) % 16;
        return directions[index];
    },

    getWeatherDescription(condition) {
        const descriptions = {
            'Clear': 'Clear skies with plenty of sunshine',
            'Clouds': 'Cloudy with overcast conditions',
            'Rain': 'Rainy weather, bring an umbrella',
            'Drizzle': 'Light drizzle expected',
            'Thunderstorm': 'Thunderstorms possible, stay safe',
            'Snow': 'Snowy conditions, drive carefully',
            'Mist': 'Misty conditions, reduced visibility',
            'Fog': 'Foggy weather, be cautious'
        };
        return descriptions[condition] || 'Weather conditions vary';
    }
};

// UI Utilities
const UIUtils = {
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    },

    showModal(title, content, buttons = []) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-content">${content}</div>
                <div class="modal-footer">
                    ${buttons.map(btn => `<button class="btn ${btn.class || ''}" data-action="${btn.action}">${btn.text}</button>`).join('')}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        return modal;
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    animateValue(element, start, end, duration) {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                current = end;
                clearInterval(timer);
            }
            element.textContent = Math.round(current);
        }, 16);
    },

    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification('Copied to clipboard!', 'success');
            });
        } else {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showNotification('Copied to clipboard!', 'success');
        }
    }
};

// Storage Utilities
const StorageUtils = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage error:', e);
            return false;
        }
    },

    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Storage error:', e);
            return defaultValue;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Storage error:', e);
            return false;
        }
    },

    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Storage error:', e);
            return false;
        }
    }
};

// Validation Utilities
const ValidationUtils = {
    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    isValidPassword(password) {
        return password.length >= 8;
    },

    isValidUsername(username) {
        const regex = /^[a-zA-Z0-9_]{3,20}$/;
        return regex.test(username);
    },

    sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }
};

// API Utilities
const APIUtils = {
    async request(url, options = {}) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    },

    async get(url) {
        return this.request(url, { method: 'GET' });
    },

    async post(url, data) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async put(url, data) {
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async delete(url) {
        return this.request(url, { method: 'DELETE' });
    }
};

// Export utilities
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DateUtils,
        WeatherUtils,
        UIUtils,
        StorageUtils,
        ValidationUtils,
        APIUtils
    };
}
