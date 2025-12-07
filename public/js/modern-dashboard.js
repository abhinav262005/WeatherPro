// ========================================
// MODERN WEATHER DASHBOARD - MAIN SCRIPT
// ========================================

// State Management
const state = {
    user: null,
    currentLocation: null,
    weatherData: null,
    forecastData: null,
    preferences: {
        theme: 'dark',
        accent: 'purple',
        unit: 'celsius'
    }
};

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    loadPreferences();
    setupEventListeners();
    await loadWeatherData();
    updateGreeting();
    setInterval(updateGreeting, 60000); // Update every minute
});

// ========================================
// AUTHENTICATION
// ========================================

async function checkAuth() {
    try {
        const response = await fetch('/api/user');
        if (response.ok) {
            state.user = await response.json();
            updateUserDisplay();
        } else {
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/login';
    }
}

function updateUserDisplay() {
    if (state.user) {
        const avatarBtn = document.getElementById('avatarBtn');
        const initial = state.user.username ? state.user.username[0].toUpperCase() : 'U';
        avatarBtn.querySelector('span').textContent = initial;
    }
}

// ========================================
// PREFERENCES
// ========================================

function loadPreferences() {
    const saved = localStorage.getItem('weatherDashboardPrefs');
    if (saved) {
        state.preferences = { ...state.preferences, ...JSON.parse(saved) };
    }
    applyPreferences();
}

function savePreferences() {
    localStorage.setItem('weatherDashboardPrefs', JSON.stringify(state.preferences));
}

function applyPreferences() {
    document.body.setAttribute('data-theme', state.preferences.theme);
    document.body.setAttribute('data-accent', state.preferences.accent);
    
    // Update active buttons
    document.querySelectorAll('.theme-mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === state.preferences.theme);
    });
    
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.color === state.preferences.accent);
    });
    
    document.querySelectorAll('.unit-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.unit === state.preferences.unit);
    });
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    // Theme panel
    document.getElementById('themeBtn').addEventListener('click', () => {
        document.getElementById('themePanel').classList.add('open');
    });
    
    document.getElementById('closeThemePanel').addEventListener('click', () => {
        document.getElementById('themePanel').classList.remove('open');
    });
    
    // Theme mode toggle
    document.querySelectorAll('.theme-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            state.preferences.theme = btn.dataset.theme;
            savePreferences();
            applyPreferences();
        });
    });
    
    // Accent color picker
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            state.preferences.accent = btn.dataset.color;
            savePreferences();
            applyPreferences();
        });
    });
    
    // Unit toggle
    document.querySelectorAll('.unit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            state.preferences.unit = btn.dataset.unit;
            savePreferences();
            applyPreferences();
            updateTemperatureDisplay();
        });
    });
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Location button
    document.getElementById('locationBtn').addEventListener('click', () => {
        // TODO: Implement location search
        alert('Location search coming soon!');
    });
    
    // Edit layout button
    document.getElementById('editLayoutBtn').addEventListener('click', () => {
        // TODO: Implement layout editor
        alert('Layout editor coming soon!');
    });
    
    // FAB button
    document.getElementById('fabBtn').addEventListener('click', () => {
        // TODO: Implement quick actions
        alert('Quick actions coming soon!');
    });
}

// ========================================
// WEATHER DATA
// ========================================

async function loadWeatherData() {
    showLoading();
    
    try {
        // Get user's location
        const position = await getCurrentPosition();
        state.currentLocation = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
        };
        
        // Fetch weather data
        const [weather, forecast] = await Promise.all([
            fetchWeather(state.currentLocation.lat, state.currentLocation.lon),
            fetchForecast(state.currentLocation.lat, state.currentLocation.lon)
        ]);
        
        state.weatherData = weather;
        state.forecastData = forecast;
        
        updateWeatherDisplay();
        updateForecastDisplay();
        
    } catch (error) {
        console.error('Failed to load weather data:', error);
        showError('Failed to load weather data. Please try again.');
    } finally {
        hideLoading();
    }
}

function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

async function fetchWeather(lat, lon) {
    const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
    if (!response.ok) throw new Error('Failed to fetch weather');
    return response.json();
}

async function fetchForecast(lat, lon) {
    const response = await fetch(`/api/forecast?lat=${lat}&lon=${lon}`);
    if (!response.ok) throw new Error('Failed to fetch forecast');
    return response.json();
}

// ========================================
// DISPLAY UPDATES
// ========================================

function updateWeatherDisplay() {
    if (!state.weatherData) return;
    
    const { main, weather, wind, visibility, clouds, sys } = state.weatherData;
    
    // Location
    document.getElementById('currentLocation').textContent = state.weatherData.name || 'Unknown';
    
    // Main weather
    const temp = convertTemp(main.temp);
    document.getElementById('mainTemp').textContent = Math.round(temp);
    document.getElementById('weatherDesc').textContent = weather[0].description;
    
    // Weather icon
    updateWeatherIcon(weather[0].main, weather[0].icon);
    
    // Details
    document.getElementById('feelsLike').textContent = `${Math.round(convertTemp(main.feels_like))}°${state.preferences.unit === 'celsius' ? 'C' : 'F'}`;
    document.getElementById('humidity').textContent = `${main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${wind.speed} m/s`;
    document.getElementById('visibility').textContent = `${(visibility / 1000).toFixed(1)} km`;
    document.getElementById('pressure').textContent = `${main.pressure} hPa`;
    document.getElementById('cloudiness').textContent = `${clouds.all}%`;
    
    // Sun times
    if (sys.sunrise && sys.sunset) {
        document.getElementById('sunrise').textContent = formatTime(sys.sunrise);
        document.getElementById('sunset').textContent = formatTime(sys.sunset);
    }
    
    // Update greeting subtext based on weather
    updateGreetingSubtext(weather[0].main);
}

function updateWeatherIcon(condition, iconCode) {
    const iconMap = {
        'Clear': 'fa-sun',
        'Clouds': 'fa-cloud',
        'Rain': 'fa-cloud-rain',
        'Drizzle': 'fa-cloud-rain',
        'Thunderstorm': 'fa-bolt',
        'Snow': 'fa-snowflake',
        'Mist': 'fa-smog',
        'Fog': 'fa-smog',
        'Haze': 'fa-smog'
    };
    
    const iconClass = iconMap[condition] || 'fa-cloud-sun';
    
    document.querySelectorAll('.weather-icon-large i, .weather-icon-small i').forEach(icon => {
        icon.className = `fas ${iconClass}`;
    });
}

function updateForecastDisplay() {
    if (!state.forecastData || !state.forecastData.list) return;
    
    const hourlyContainer = document.getElementById('hourlyForecast');
    hourlyContainer.innerHTML = '';
    
    // Show next 12 hours
    const hourlyData = state.forecastData.list.slice(0, 12);
    
    hourlyData.forEach(item => {
        const forecastItem = createForecastItem(item);
        hourlyContainer.appendChild(forecastItem);
    });
}

function createForecastItem(data) {
    const div = document.createElement('div');
    div.className = 'forecast-item';
    
    const time = new Date(data.dt * 1000);
    const temp = Math.round(convertTemp(data.main.temp));
    
    const iconMap = {
        'Clear': 'fa-sun',
        'Clouds': 'fa-cloud',
        'Rain': 'fa-cloud-rain',
        'Drizzle': 'fa-cloud-rain',
        'Thunderstorm': 'fa-bolt',
        'Snow': 'fa-snowflake'
    };
    
    const iconClass = iconMap[data.weather[0].main] || 'fa-cloud-sun';
    
    div.innerHTML = `
        <div class="forecast-time">${time.getHours()}:00</div>
        <div class="forecast-icon"><i class="fas ${iconClass}"></i></div>
        <div class="forecast-temp">${temp}°</div>
    `;
    
    return div;
}

function updateGreeting() {
    const hour = new Date().getHours();
    let greeting = 'Good Evening';
    
    if (hour >= 5 && hour < 12) {
        greeting = 'Good Morning';
    } else if (hour >= 12 && hour < 18) {
        greeting = 'Good Afternoon';
    }
    
    document.getElementById('greetingText').textContent = greeting;
}

function updateGreetingSubtext(condition) {
    const subtexts = {
        'Rain': "Don't forget your umbrella!",
        'Drizzle': "Light rain expected today",
        'Thunderstorm': "Stay safe indoors!",
        'Snow': "Bundle up, it's snowing!",
        'Clear': "Perfect day to go outside!",
        'Clouds': "Cloudy but pleasant",
        'Mist': "Visibility might be low",
        'Fog': "Drive carefully today",
        'Haze': "Air quality might be affected"
    };
    
    const subtext = subtexts[condition] || "Have a great day!";
    document.getElementById('greetingSubtext').textContent = subtext;
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function convertTemp(kelvin) {
    if (state.preferences.unit === 'fahrenheit') {
        return (kelvin - 273.15) * 9/5 + 32;
    }
    return kelvin - 273.15; // Celsius
}

function updateTemperatureDisplay() {
    if (state.weatherData) {
        updateWeatherDisplay();
        updateForecastDisplay();
    }
}

function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
}

function showLoading() {
    document.getElementById('loadingOverlay').classList.add('show');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('show');
}

function showError(message) {
    alert(message); // TODO: Implement better error display
}

async function logout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/login';
    } catch (error) {
        console.error('Logout failed:', error);
        window.location.href = '/login';
    }
}
