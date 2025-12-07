/* ============================================
   CONFIGURATION & CONSTANTS
   ============================================ */

export const CONFIG = {
    // API Configuration
    API: {
        OPENWEATHER_KEY: 'YOUR_API_KEY_HERE', // Get from https://openweathermap.org/api
        OPENWEATHER_BASE: 'https://api.openweathermap.org/data/2.5',
        OPENWEATHER_ONECALL: 'https://api.openweathermap.org/data/3.0/onecall',
        AQI_BASE: 'https://api.openweathermap.org/data/2.5/air_pollution',
        GEOCODING_BASE: 'https://api.openweathermap.org/geo/1.0',
    },
    
    // Default Settings
    DEFAULTS: {
        LOCATION: { lat: 40.7128, lon: -74.0060, name: 'New York' }, // Default to NYC
        UNITS: 'metric', // metric, imperial, standard
        LANGUAGE: 'en',
        REFRESH_INTERVAL: 600000, // 10 minutes
        GRADIENT: 'day',
        THEME: 'day',
    },
    
    // Widget Configuration
    WIDGETS: {
        DEFAULT_ENABLED: [
            'hourly-chart',
            'forecast-7day',
            'aqi-suite',
            'wind-rose',
            'uv-index',
            'humidity-comfort',
        ],
        AVAILABLE: [
            { id: 'current-weather', name: 'Current Weather', icon: '🌤️' },
            { id: 'hourly-chart', name: 'Hourly Forecast', icon: '📊' },
            { id: 'forecast-7day', name: '7-Day Forecast', icon: '📅' },
            { id: 'radar-map', name: 'Radar Map', icon: '🗺️' },
            { id: 'aqi-suite', name: 'Air Quality', icon: '💨' },
            { id: 'wind-rose', name: 'Wind Rose', icon: '🧭' },
            { id: 'uv-index', name: 'UV Index', icon: '☀️' },
            { id: 'humidity-comfort', name: 'Humidity & Comfort', icon: '💧' },
            { id: 'pressure-trend', name: 'Pressure Trend', icon: '📈' },
            { id: 'visibility', name: 'Visibility', icon: '👁️' },
            { id: 'sunrise-sunset', name: 'Sun Times', icon: '🌅' },
            { id: 'moon-phase', name: 'Moon Phase', icon: '🌙' },
            { id: 'precipitation', name: 'Precipitation', icon: '🌧️' },
            { id: 'feels-like', name: 'Feels Like', icon: '🌡️' },
            { id: 'dew-point', name: 'Dew Point', icon: '💦' },
            { id: 'cloud-cover', name: 'Cloud Cover', icon: '☁️' },
        ],
    },
    
    // Gradient Presets
    GRADIENTS: [
        { id: 'dawn', name: 'Dawn', colors: ['#FFDEE9', '#FECFEF', '#B5FFFC'] },
        { id: 'sunrise', name: 'Sunrise', colors: ['#FF9A9E', '#FAD0C4'] },
        { id: 'day', name: 'Day', colors: ['#A1C4FD', '#C2E9FB'] },
        { id: 'twilight', name: 'Twilight', colors: ['#2C3E50', '#4CA1AF', '#667EEA'] },
        { id: 'storm', name: 'Storm', colors: ['#0F2027', '#203A43', '#2C5364'] },
        { id: 'aurora', name: 'Aurora', colors: ['#0FD3FF', '#7F00FF', '#00D2FF'] },
    ],
    
    // Animation Settings
    ANIMATION: {
        PARTICLE_COUNT: 50,
        PARTICLE_SPEED: 0.5,
        GRADIENT_TRANSITION_DURATION: 2000,
        WIDGET_ANIMATION_DELAY: 100,
    },
    
    // Storage Keys
    STORAGE: {
        LOCATION: 'weather_location',
        UNITS: 'weather_units',
        THEME: 'weather_theme',
        GRADIENT: 'weather_gradient',
        WIDGETS: 'weather_widgets',
        LAYOUT: 'weather_layout',
        CUSTOM_THEME: 'weather_custom_theme',
        FAVORITES: 'weather_favorites',
        HISTORY: 'weather_history',
    },
    
    // Weather Condition Mappings
    WEATHER_ICONS: {
        '01d': '☀️', '01n': '🌙',
        '02d': '⛅', '02n': '☁️',
        '03d': '☁️', '03n': '☁️',
        '04d': '☁️', '04n': '☁️',
        '09d': '🌧️', '09n': '🌧️',
        '10d': '🌦️', '10n': '🌧️',
        '11d': '⛈️', '11n': '⛈️',
        '13d': '❄️', '13n': '❄️',
        '50d': '🌫️', '50n': '🌫️',
    },
    
    // AQI Levels
    AQI_LEVELS: [
        { max: 50, label: 'Good', color: '#00e400', description: 'Air quality is satisfactory' },
        { max: 100, label: 'Moderate', color: '#ffff00', description: 'Acceptable for most people' },
        { max: 150, label: 'Unhealthy for Sensitive', color: '#ff7e00', description: 'Sensitive groups may experience effects' },
        { max: 200, label: 'Unhealthy', color: '#ff0000', description: 'Everyone may begin to experience effects' },
        { max: 300, label: 'Very Unhealthy', color: '#8f3f97', description: 'Health alert: everyone may experience serious effects' },
        { max: 500, label: 'Hazardous', color: '#7e0023', description: 'Health warnings of emergency conditions' },
    ],
    
    // UV Index Levels
    UV_LEVELS: [
        { max: 2, label: 'Low', color: '#289500', advice: 'No protection needed' },
        { max: 5, label: 'Moderate', color: '#f7e400', advice: 'Seek shade during midday' },
        { max: 7, label: 'High', color: '#f85900', advice: 'Protection essential' },
        { max: 10, label: 'Very High', color: '#d8001d', advice: 'Extra protection needed' },
        { max: 20, label: 'Extreme', color: '#6b49c8', advice: 'Avoid sun exposure' },
    ],
};

// Helper Functions
export const HELPERS = {
    // Convert temperature between units
    convertTemp(temp, from, to) {
        if (from === to) return temp;
        if (from === 'metric' && to === 'imperial') return (temp * 9/5) + 32;
        if (from === 'imperial' && to === 'metric') return (temp - 32) * 5/9;
        if (from === 'standard') return to === 'metric' ? temp - 273.15 : (temp - 273.15) * 9/5 + 32;
        return temp;
    },
    
    // Format date/time
    formatTime(timestamp, format = 'time') {
        const date = new Date(timestamp * 1000);
        if (format === 'time') return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        if (format === 'date') return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        if (format === 'day') return date.toLocaleDateString('en-US', { weekday: 'short' });
        return date.toLocaleString();
    },
    
    // Get weather icon
    getWeatherIcon(iconCode) {
        return CONFIG.WEATHER_ICONS[iconCode] || '🌤️';
    },
    
    // Get AQI level info
    getAQILevel(aqi) {
        return CONFIG.AQI_LEVELS.find(level => aqi <= level.max) || CONFIG.AQI_LEVELS[CONFIG.AQI_LEVELS.length - 1];
    },
    
    // Get UV level info
    getUVLevel(uv) {
        return CONFIG.UV_LEVELS.find(level => uv <= level.max) || CONFIG.UV_LEVELS[CONFIG.UV_LEVELS.length - 1];
    },
    
    // Calculate wind direction
    getWindDirection(degrees) {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round(degrees / 22.5) % 16;
        return directions[index];
    },
    
    // Debounce function
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
    
    // Throttle function
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
};

export default CONFIG;
