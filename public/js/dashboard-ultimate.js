// ============================================
// ULTIMATE WEATHER DASHBOARD - JAVASCRIPT
// ============================================

// Global State
let currentUser = null;
let currentLocation = { lat: null, lon: null, name: '' };
let weatherData = null;
let customSettings = {
    theme: 'gradient',
    accentColor: '#667eea',
    layout: 'modern',
    fontSize: 16,
    animationSpeed: 'normal',
    weatherEffects: true,
    bgBlur: 20
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    loadCustomSettings();
    setupEventListeners();
    checkAuth();
    requestLocation();
    startClock();
});

// Initialize Dashboard
function initializeDashboard() {
    // Hide loading screen after 2 seconds
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
    }, 2000);
}

// Load Custom Settings
function loadCustomSettings() {
    const saved = localStorage.getItem('weatherpro_custom');
    if (saved) {
        customSettings = JSON.parse(saved);
        applyCustomSettings();
    }
}

// Apply Custom Settings
function applyCustomSettings() {
    const root = document.documentElement;
    const body = document.body;
    
    // Apply theme
    body.setAttribute('data-theme', customSettings.theme);
    
    // Apply accent color
    root.style.setProperty('--primary', customSettings.accentColor);
    
    // Apply font size
    root.style.setProperty('--font-size-base', customSettings.fontSize + 'px');
    
    // Apply blur
    root.style.setProperty('--blur-amount', customSettings.bgBlur + 'px');
    
    // Apply animation speed
    const speeds = { slow: '0.6s', normal: '0.3s', fast: '0.15s', none: '0s' };
    root.style.setProperty('--animation-speed', speeds[customSettings.animationSpeed]);
}

// Setup Event Listeners
function setupEventListeners() {
    // Customization Panel
    document.getElementById('panelToggle').addEventListener('click', () => {
        document.querySelector('.customization-panel').classList.toggle('active');
    });
    
    // Theme Selection
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            customSettings.theme = btn.dataset.theme;
            applyCustomSettings();
        });
    });
    
    // Accent Color
    document.getElementById('accentColor').addEventListener('change', (e) => {
        customSettings.accentColor = e.target.value;
        applyCustomSettings();
    });
    
    // Font Size
    document.getElementById('fontSize').addEventListener('input', (e) => {
        customSettings.fontSize = e.target.value;
        document.getElementById('fontSizeValue').textContent = e.target.value + 'px';
        applyCustomSettings();
    });
    
    // Background Blur
    document.getElementById('bgBlur').addEventListener('input', (e) => {
        customSettings.bgBlur = e.target.value;
        document.getElementById('bgBlurValue').textContent = e.target.value + 'px';
        applyCustomSettings();
    });
    
    // Animation Speed
    document.getElementById('animationSpeed').addEventListener('change', (e) => {
        customSettings.animationSpeed = e.target.value;
        applyCustomSettings();
    });
    
    // Weather Effects
    document.getElementById('weatherEffects').addEventListener('change', (e) => {
        customSettings.weatherEffects = e.target.checked;
    });
    
    // Save Settings
    document.getElementById('saveCustom').addEventListener('click', () => {
        localStorage.setItem('weatherpro_custom', JSON.stringify(customSettings));
        showNotification('Settings saved successfully!', 'success');
    });
    
    // Reset Settings
    document.getElementById('resetCustom').addEventListener('click', () => {
        customSettings = {
            theme: 'gradient',
            accentColor: '#667eea',
            layout: 'modern',
            fontSize: 16,
            animationSpeed: 'normal',
            weatherEffects: true,
            bgBlur: 20
        };
        applyCustomSettings();
        localStorage.removeItem('weatherpro_custom');
        showNotification('Settings reset to default', 'info');
    });
    
    // Navigation
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.dataset.view;
            switchView(view);
            document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
    
    // Voice Search
    document.getElementById('voiceSearch').addEventListener('click', startVoiceSearch);
    
    // Fullscreen
    document.getElementById('fullscreenBtn').addEventListener('click', toggleFullscreen);
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Global Search
    document.getElementById('globalSearch').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchLocation(e.target.value);
        }
    });
}

// Check Authentication
async function checkAuth() {
    try {
        const response = await fetch('/api/user');
        if (!response.ok) {
            window.location.href = '/login';
            return;
        }
        currentUser = await response.json();
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/login';
    }
}

// Request Location
function requestLocation() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                currentLocation.lat = position.coords.latitude;
                currentLocation.lon = position.coords.longitude;
                loadWeatherData();
            },
            (error) => {
                console.error('Location error:', error);
                // Default to London
                currentLocation.lat = 51.5074;
                currentLocation.lon = -0.1278;
                loadWeatherData();
            }
        );
    }
}

// Load Weather Data
async function loadWeatherData() {
    if (!currentLocation.lat || !currentLocation.lon) return;
    
    try {
        const response = await fetch(`/api/weather?lat=${currentLocation.lat}&lon=${currentLocation.lon}`);
        weatherData = await response.json();
        
        displayWeather(weatherData);
        loadForecast();
        
        // Trigger weather effects
        if (customSettings.weatherEffects && typeof weatherEffects !== 'undefined') {
            weatherEffects.triggerWeatherEffect(weatherData.weather[0].main);
        }
    } catch (error) {
        console.error('Failed to load weather:', error);
        showNotification('Failed to load weather data', 'error');
    }
}

// Display Weather
function displayWeather(data) {
    // Location
    document.getElementById('currentLocation').textContent = `${data.name}, ${data.sys.country}`;
    
    // Main weather
    const iconMap = {
        'Clear': 'fa-sun',
        'Clouds': 'fa-cloud',
        'Rain': 'fa-cloud-rain',
        'Drizzle': 'fa-cloud-rain',
        'Thunderstorm': 'fa-bolt',
        'Snow': 'fa-snowflake',
        'Mist': 'fa-smog',
        'Fog': 'fa-smog'
    };
    
    const icon = iconMap[data.weather[0].main] || 'fa-cloud';
    document.getElementById('mainIcon').innerHTML = `<i class="fas ${icon}"></i>`;
    document.getElementById('mainTemp').textContent = Math.round(data.main.temp);
    document.getElementById('weatherCondition').textContent = data.weather[0].main;
    document.getElementById('weatherDesc').textContent = data.weather[0].description;
    
    // Details
    document.getElementById('feelsLike').textContent = Math.round(data.main.feels_like) + '°';
    document.getElementById('windSpeed').textContent = Math.round(data.wind.speed * 3.6) + ' km/h';
    document.getElementById('humidity').textContent = data.main.humidity + '%';
    document.getElementById('visibility').textContent = (data.visibility / 1000).toFixed(1) + ' km';
    document.getElementById('pressure').textContent = data.main.pressure + ' hPa';
    document.getElementById('cloudCover').textContent = data.clouds.all + '%';
    
    // Sunrise/Sunset
    const sunrise = new Date(data.sys.sunrise * 1000);
    const sunset = new Date(data.sys.sunset * 1000);
    document.getElementById('sunriseTime').textContent = formatTime(sunrise);
    document.getElementById('sunsetTime').textContent = formatTime(sunset);
    
    // UV Index (mock)
    const uvIndex = Math.floor(Math.random() * 11);
    document.getElementById('uvIndex').textContent = uvIndex;
    document.getElementById('uvLevel').textContent = getUVLevel(uvIndex);
    document.getElementById('uvFill').style.width = (uvIndex / 11 * 100) + '%';
}

// Load Forecast
async function loadForecast() {
    try {
        const response = await fetch(`/api/forecast?lat=${currentLocation.lat}&lon=${currentLocation.lon}`);
        const data = await response.json();
        
        displayHourlyForecast(data);
        displayDailyForecast(data);
    } catch (error) {
        console.error('Failed to load forecast:', error);
    }
}

// Display Hourly Forecast
function displayHourlyForecast(data) {
    const container = document.getElementById('hourlyForecast');
    container.innerHTML = '';
    
    data.list.slice(0, 8).forEach(item => {
        const time = new Date(item.dt * 1000);
        const temp = Math.round(item.main.temp);
        const icon = getWeatherIcon(item.weather[0].icon);
        
        const hourCard = document.createElement('div');
        hourCard.className = 'hourly-card';
        hourCard.innerHTML = `
            <div class="hour-time">${formatTime(time)}</div>
            <i class="fas ${icon} hour-icon"></i>
            <div class="hour-temp">${temp}°</div>
        `;
        container.appendChild(hourCard);
    });
}

// Display Daily Forecast
function displayDailyForecast(data) {
    const container = document.getElementById('forecastGrid');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Group by day
    const dailyData = {};
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000).toDateString();
        if (!dailyData[date]) {
            dailyData[date] = {
                temps: [],
                weather: item.weather[0],
                humidity: [],
                wind: []
            };
        }
        dailyData[date].temps.push(item.main.temp);
        dailyData[date].humidity.push(item.main.humidity);
        dailyData[date].wind.push(item.wind.speed);
    });
    
    // Display first 7 days
    Object.keys(dailyData).slice(0, 7).forEach((day, index) => {
        const data = dailyData[day];
        const maxTemp = Math.round(Math.max(...data.temps));
        const minTemp = Math.round(Math.min(...data.temps));
        const icon = getWeatherIcon(data.weather.icon);
        const dayName = index === 0 ? 'Today' : new Date(day).toLocaleDateString('en-US', { weekday: 'short' });
        
        const dayCard = document.createElement('div');
        dayCard.className = 'forecast-card';
        dayCard.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <i class="fas ${icon} forecast-icon"></i>
            <div class="forecast-temp">${maxTemp}° / ${minTemp}°</div>
            <div class="forecast-desc">${data.weather.description}</div>
        `;
        container.appendChild(dayCard);
    });
}

// Switch View
function switchView(view) {
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(view)?.classList.add('active');
}

// Voice Search
function startVoiceSearch() {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'en-US';
        recognition.start();
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('globalSearch').value = transcript;
            searchLocation(transcript);
        };
        
        recognition.onerror = () => {
            showNotification('Voice search failed', 'error');
        };
    } else {
        showNotification('Voice search not supported', 'error');
    }
}

// Search Location
async function searchLocation(query) {
    try {
        const response = await fetch(`/api/weather?city=${query}`);
        const data = await response.json();
        
        currentLocation.lat = data.coord.lat;
        currentLocation.lon = data.coord.lon;
        currentLocation.name = data.name;
        
        loadWeatherData();
    } catch (error) {
        showNotification('Location not found', 'error');
    }
}

// Toggle Fullscreen
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        document.getElementById('fullscreenBtn').innerHTML = '<i class="fas fa-compress"></i>';
    } else {
        document.exitFullscreen();
        document.getElementById('fullscreenBtn').innerHTML = '<i class="fas fa-expand"></i>';
    }
}

// Logout
async function logout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/login';
    } catch (error) {
        console.error('Logout failed:', error);
    }
}

// Start Clock
function startClock() {
    updateClock();
    setInterval(updateClock, 1000);
}

function updateClock() {
    const now = new Date();
    document.getElementById('localTime').textContent = formatTime(now);
}

// Utility Functions
function formatTime(date) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function getWeatherIcon(code) {
    const iconMap = {
        '01d': 'fa-sun', '01n': 'fa-moon',
        '02d': 'fa-cloud-sun', '02n': 'fa-cloud-moon',
        '03d': 'fa-cloud', '03n': 'fa-cloud',
        '04d': 'fa-cloud', '04n': 'fa-cloud',
        '09d': 'fa-cloud-rain', '09n': 'fa-cloud-rain',
        '10d': 'fa-cloud-sun-rain', '10n': 'fa-cloud-moon-rain',
        '11d': 'fa-bolt', '11n': 'fa-bolt',
        '13d': 'fa-snowflake', '13n': 'fa-snowflake',
        '50d': 'fa-smog', '50n': 'fa-smog'
    };
    return iconMap[code] || 'fa-cloud';
}

function getUVLevel(index) {
    if (index <= 2) return 'Low';
    if (index <= 5) return 'Moderate';
    if (index <= 7) return 'High';
    if (index <= 10) return 'Very High';
    return 'Extreme';
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10001;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
    .hourly-card {
        min-width: 100px;
        padding: 1.5rem 1rem;
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 15px;
        text-align: center;
        transition: all 0.3s ease;
    }
    .hourly-card:hover {
        background: rgba(255, 255, 255, 0.25);
        transform: translateY(-5px);
    }
    .hour-time {
        font-size: 0.9rem;
        margin-bottom: 0.8rem;
        opacity: 0.9;
    }
    .hour-icon {
        font-size: 2.5rem;
        margin-bottom: 0.8rem;
    }
    .hour-temp {
        font-size: 1.3rem;
        font-weight: 700;
    }
    .forecast-card {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 20px;
        padding: 2rem;
        text-align: center;
        color: white;
        transition: all 0.3s ease;
    }
    .forecast-card:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-10px);
    }
    .forecast-day {
        font-size: 1.2rem;
        font-weight: 700;
        margin-bottom: 1rem;
    }
    .forecast-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
    }
    .forecast-temp {
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
    }
    .forecast-desc {
        font-size: 0.9rem;
        opacity: 0.9;
    }
    .forecast-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 1.5rem;
    }
`;
document.head.appendChild(style);
