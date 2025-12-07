// Global state
let currentUser = null;
let currentLocation = { lat: null, lon: null, name: '' };
let weatherData = null;
let forecastData = null;
let map = null;
let mapMarker = null;
let favoriteLocations = [];

// Popular cities data
const popularCities = [
    { name: 'New York', country: 'USA', lat: 40.7128, lon: -74.0060, flag: '🇺🇸' },
    { name: 'London', country: 'UK', lat: 51.5074, lon: -0.1278, flag: '🇬🇧' },
    { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503, flag: '🇯🇵' },
    { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, flag: '🇫🇷' },
    { name: 'Dubai', country: 'UAE', lat: 25.2048, lon: 55.2708, flag: '🇦🇪' },
    { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093, flag: '🇦🇺' },
    { name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198, flag: '🇸🇬' },
    { name: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777, flag: '🇮🇳' },
    { name: 'Berlin', country: 'Germany', lat: 52.5200, lon: 13.4050, flag: '🇩🇪' },
    { name: 'Toronto', country: 'Canada', lat: 43.6532, lon: -79.3832, flag: '🇨🇦' },
    { name: 'Barcelona', country: 'Spain', lat: 41.3851, lon: 2.1734, flag: '🇪🇸' },
    { name: 'Rome', country: 'Italy', lat: 41.9028, lon: 12.4964, flag: '🇮🇹' }
];

const popularCountries = [
    { name: 'United States', capital: 'Washington DC', lat: 38.9072, lon: -77.0369, flag: '🇺🇸' },
    { name: 'United Kingdom', capital: 'London', lat: 51.5074, lon: -0.1278, flag: '🇬🇧' },
    { name: 'Japan', capital: 'Tokyo', lat: 35.6762, lon: 139.6503, flag: '🇯🇵' },
    { name: 'France', capital: 'Paris', lat: 48.8566, lon: 2.3522, flag: '🇫🇷' },
    { name: 'Germany', capital: 'Berlin', lat: 52.5200, lon: 13.4050, flag: '🇩🇪' },
    { name: 'Australia', capital: 'Canberra', lat: -35.2809, lon: 149.1300, flag: '🇦🇺' }
];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    await loadUserData();
    setupEventListeners();
    requestLocationPermission();
    updateDateTime();
    setInterval(updateDateTime, 1000);
});

// Check authentication
async function checkAuth() {
    try {
        const response = await fetch('/api/user');
        if (!response.ok) {
            window.location.href = '/login';
            return;
        }
        currentUser = await response.json();
        updateUserProfile();
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/login';
    }
}

// Update user profile display
function updateUserProfile() {
    if (currentUser) {
        document.querySelector('.user-name').textContent = currentUser.full_name || currentUser.username;
        document.querySelector('.user-email').textContent = currentUser.email;
    }
}

// Load user data
async function loadUserData() {
    try {
        const [preferences, locations] = await Promise.all([
            fetch('/api/preferences').then(r => r.json()),
            fetch('/api/locations').then(r => r.json())
        ]);
        
        applyPreferences(preferences);
        displaySavedLocations(locations);
    } catch (error) {
        console.error('Failed to load user data:', error);
    }
}

// Request location permission
function requestLocationPermission() {
    if ('geolocation' in navigator) {
        showLoading();
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                currentLocation.lat = position.coords.latitude;
                currentLocation.lon = position.coords.longitude;
                await loadWeatherData();
                hideLoading();
            },
            (error) => {
                console.error('Location error:', error);
                hideLoading();
                // Default to a city if location denied
                loadWeatherByCity('London');
            }
        );
    } else {
        loadWeatherByCity('London');
    }
}

// Load weather data
async function loadWeatherData() {
    if (!currentLocation.lat || !currentLocation.lon) return;
    
    try {
        showLoading();
        
        const [weather, forecast] = await Promise.all([
            fetch(`/api/weather?lat=${currentLocation.lat}&lon=${currentLocation.lon}`).then(r => r.json()),
            fetch(`/api/forecast?lat=${currentLocation.lat}&lon=${currentLocation.lon}`).then(r => r.json())
        ]);
        
        weatherData = weather;
        forecastData = forecast;
        
        displayCurrentWeather(weather);
        displayHourlyForecast(forecast);
        displayDailyForecast(forecast);
        
        hideLoading();
    } catch (error) {
        console.error('Failed to load weather:', error);
        hideLoading();
        showError('Failed to load weather data');
    }
}

// Load weather by city
async function loadWeatherByCity(city) {
    try {
        showLoading();
        const weather = await fetch(`/api/weather?city=${city}`).then(r => r.json());
        
        currentLocation.lat = weather.coord.lat;
        currentLocation.lon = weather.coord.lon;
        currentLocation.name = weather.name;
        
        await loadWeatherData();
    } catch (error) {
        console.error('Failed to load weather for city:', error);
        hideLoading();
    }
}

// Display current weather
function displayCurrentWeather(data) {
    const iconMap = {
        '01d': 'fa-sun',
        '01n': 'fa-moon',
        '02d': 'fa-cloud-sun',
        '02n': 'fa-cloud-moon',
        '03d': 'fa-cloud',
        '03n': 'fa-cloud',
        '04d': 'fa-cloud',
        '04n': 'fa-cloud',
        '09d': 'fa-cloud-rain',
        '09n': 'fa-cloud-rain',
        '10d': 'fa-cloud-sun-rain',
        '10n': 'fa-cloud-moon-rain',
        '11d': 'fa-bolt',
        '11n': 'fa-bolt',
        '13d': 'fa-snowflake',
        '13n': 'fa-snowflake',
        '50d': 'fa-smog',
        '50n': 'fa-smog'
    };
    
    const icon = iconMap[data.weather[0].icon] || 'fa-cloud';
    
    document.getElementById('mainWeatherIcon').innerHTML = `<i class="fas ${icon}"></i>`;
    document.getElementById('mainTemp').textContent = Math.round(data.main.temp);
    document.getElementById('weatherDescription').textContent = data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1);
    document.getElementById('weatherLocation').innerHTML = `<i class="fas fa-map-marker-alt"></i><span>${data.name}, ${data.sys.country}</span>`;
    
    document.getElementById('feelsLike').textContent = Math.round(data.main.feels_like) + '°C';
    document.getElementById('windSpeed').textContent = Math.round(data.wind.speed * 3.6) + ' km/h';
    document.getElementById('humidity').textContent = data.main.humidity + '%';
    document.getElementById('visibility').textContent = (data.visibility / 1000).toFixed(1) + ' km';
    document.getElementById('pressure').textContent = data.main.pressure + ' hPa';
    document.getElementById('cloudiness').textContent = data.clouds.all + '%';
    
    // Sunrise and sunset
    const sunrise = new Date(data.sys.sunrise * 1000);
    const sunset = new Date(data.sys.sunset * 1000);
    document.getElementById('sunrise').textContent = formatTime(sunrise);
    document.getElementById('sunset').textContent = formatTime(sunset);
    
    // UV Index (mock data)
    document.getElementById('uvIndex').textContent = Math.floor(Math.random() * 11);
    
    // Update background based on weather
    updateWeatherBackground(data.weather[0].main);
}

// Display hourly forecast
function displayHourlyForecast(data) {
    const container = document.getElementById('hourlyForecast');
    container.innerHTML = '';
    
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
    
    // Show next 24 hours (8 items for 24 hours with 3-hour intervals)
    data.list.slice(0, 8).forEach((item, index) => {
        const time = new Date(item.dt * 1000);
        const icon = iconMap[item.weather[0].icon] || 'fa-cloud';
        
        const hourlyItem = document.createElement('div');
        hourlyItem.className = 'hourly-item';
        hourlyItem.style.animationDelay = `${index * 0.1}s`;
        hourlyItem.innerHTML = `
            <div class="hourly-time">${formatTime(time)}</div>
            <div class="hourly-icon"><i class="fas ${icon}"></i></div>
            <div class="hourly-temp">${Math.round(item.main.temp)}°</div>
            <div style="font-size: 0.85rem; opacity: 0.8; margin-top: 0.5rem;">
                <i class="fas fa-wind"></i> ${Math.round(item.wind.speed * 3.6)} km/h
            </div>
        `;
        container.appendChild(hourlyItem);
    });
    
    // Load alerts in overview
    loadAlertsOverview();
}

// Display daily forecast
function displayDailyForecast(data) {
    const container = document.getElementById('dailyForecast');
    container.innerHTML = '';
    
    const iconMap = {
        '01d': 'fa-sun', '02d': 'fa-cloud-sun', '03d': 'fa-cloud',
        '04d': 'fa-cloud', '09d': 'fa-cloud-rain', '10d': 'fa-cloud-sun-rain',
        '11d': 'fa-bolt', '13d': 'fa-snowflake', '50d': 'fa-smog'
    };
    
    // Group by day
    const dailyData = {};
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toDateString();
        
        if (!dailyData[day]) {
            dailyData[day] = {
                temps: [],
                weather: item.weather[0],
                humidity: [],
                wind: []
            };
        }
        
        dailyData[day].temps.push(item.main.temp);
        dailyData[day].humidity.push(item.main.humidity);
        dailyData[day].wind.push(item.wind.speed);
    });
    
    // Display first 7 days
    Object.keys(dailyData).slice(0, 7).forEach((day, index) => {
        const data = dailyData[day];
        const maxTemp = Math.round(Math.max(...data.temps));
        const minTemp = Math.round(Math.min(...data.temps));
        const avgHumidity = Math.round(data.humidity.reduce((a, b) => a + b) / data.humidity.length);
        const avgWind = Math.round(data.wind.reduce((a, b) => a + b) / data.wind.length * 3.6);
        
        const icon = iconMap[data.weather.icon.replace('n', 'd')] || 'fa-cloud';
        const dayName = index === 0 ? 'Today' : new Date(day).toLocaleDateString('en-US', { weekday: 'long' });
        
        const dailyItem = document.createElement('div');
        dailyItem.className = 'daily-item';
        dailyItem.innerHTML = `
            <div class="daily-day">${dayName}</div>
            <div class="daily-weather">
                <div class="daily-icon"><i class="fas ${icon}"></i></div>
                <div class="daily-desc">${data.weather.description}</div>
            </div>
            <div class="daily-temp">
                <span class="temp-high">${maxTemp}°</span>
                <span class="temp-low">${minTemp}°</span>
            </div>
            <div class="daily-details">
                <span><i class="fas fa-tint"></i> ${avgHumidity}%</span>
                <span><i class="fas fa-wind"></i> ${avgWind} km/h</span>
            </div>
        `;
        container.appendChild(dailyItem);
    });
}

// Display saved locations
function displaySavedLocations(locations) {
    const container = document.getElementById('locationsGrid');
    container.innerHTML = '';
    
    if (locations.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-light);">No saved locations yet. Add one to get started!</p>';
        return;
    }
    
    locations.forEach(location => {
        const card = document.createElement('div');
        card.className = 'location-card';
        card.innerHTML = `
            <div class="location-header">
                <div class="location-name">${location.location_name}</div>
                ${location.is_favorite ? '<i class="fas fa-star location-favorite"></i>' : ''}
            </div>
            <div class="location-weather">
                <div class="location-icon"><i class="fas fa-cloud-sun"></i></div>
                <div class="location-temp">--°</div>
            </div>
            <div class="location-details">
                <span><i class="fas fa-wind"></i> -- km/h</span>
                <span><i class="fas fa-tint"></i> --%</span>
            </div>
        `;
        
        card.addEventListener('click', () => {
            currentLocation.lat = location.latitude;
            currentLocation.lon = location.longitude;
            currentLocation.name = location.location_name;
            loadWeatherData();
            switchSection('overview');
        });
        
        container.appendChild(card);
        
        // Load weather for this location
        loadLocationWeather(location, card);
    });
}

// Load weather for a specific location
async function loadLocationWeather(location, card) {
    try {
        const weather = await fetch(`/api/weather?lat=${location.latitude}&lon=${location.longitude}`).then(r => r.json());
        
        const iconMap = {
            'Clear': 'fa-sun', 'Clouds': 'fa-cloud', 'Rain': 'fa-cloud-rain',
            'Drizzle': 'fa-cloud-rain', 'Thunderstorm': 'fa-bolt',
            'Snow': 'fa-snowflake', 'Mist': 'fa-smog', 'Fog': 'fa-smog'
        };
        
        const icon = iconMap[weather.weather[0].main] || 'fa-cloud';
        
        card.querySelector('.location-icon i').className = `fas ${icon}`;
        card.querySelector('.location-temp').textContent = Math.round(weather.main.temp) + '°';
        card.querySelector('.location-details').innerHTML = `
            <span><i class="fas fa-wind"></i> ${Math.round(weather.wind.speed * 3.6)} km/h</span>
            <span><i class="fas fa-tint"></i> ${weather.main.humidity}%</span>
        `;
    } catch (error) {
        console.error('Failed to load location weather:', error);
    }
}

// Update weather background
function updateWeatherBackground(condition) {
    const body = document.body;
    body.style.transition = 'background 1s ease';
    
    const backgrounds = {
        'Clear': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'Clouds': 'linear-gradient(135deg, #757F9A 0%, #D7DDE8 100%)',
        'Rain': 'linear-gradient(135deg, #4B79A1 0%, #283E51 100%)',
        'Thunderstorm': 'linear-gradient(135deg, #373B44 0%, #4286f4 100%)',
        'Snow': 'linear-gradient(135deg, #E6DADA 0%, #274046 100%)',
        'Mist': 'linear-gradient(135deg, #606c88 0%, #3f4c6b 100%)'
    };
    
    const gradient = backgrounds[condition] || backgrounds['Clear'];
    document.querySelector('.current-weather-card').style.background = gradient;
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            switchSection(section);
            
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });
    
    // Mobile menu
    document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('active');
    });
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        try {
            await fetch('/api/logout', { method: 'POST' });
            localStorage.removeItem('weatherpro_user');
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    });
    
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const icon = document.querySelector('#themeToggle i');
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');
    });
    
    // Refresh
    document.getElementById('refreshBtn').addEventListener('click', () => {
        loadWeatherData();
    });
    
    // Location search
    let searchTimeout;
    document.getElementById('locationSearch').addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = e.target.value.trim();
            if (query.length > 2) {
                loadWeatherByCity(query);
            }
        }, 500);
    });
    
    // Add location
    document.getElementById('addLocationBtn')?.addEventListener('click', () => {
        const locationName = prompt('Enter location name:');
        if (locationName) {
            saveLocation(locationName);
        }
    });
    
    // Save settings
    document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
        saveSettings();
    });
}

// Switch section
function switchSection(section) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.getElementById(section)?.classList.add('active');
}

// Save location
async function saveLocation(locationName) {
    if (!currentLocation.lat || !currentLocation.lon) {
        alert('Please select a location first');
        return;
    }
    
    try {
        await fetch('/api/locations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                locationName,
                latitude: currentLocation.lat,
                longitude: currentLocation.lon,
                isFavorite: false
            })
        });
        
        loadUserData();
        alert('Location saved successfully!');
    } catch (error) {
        console.error('Failed to save location:', error);
        alert('Failed to save location');
    }
}

// Save settings
async function saveSettings() {
    const tempUnit = document.querySelector('input[name="tempUnit"]:checked').value;
    const theme = document.querySelector('input[name="theme"]:checked').value;
    
    try {
        await fetch('/api/preferences', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                temperatureUnit: tempUnit,
                theme: theme,
                defaultLocation: currentLocation.name,
                defaultLat: currentLocation.lat,
                defaultLon: currentLocation.lon
            })
        });
        
        alert('Settings saved successfully!');
    } catch (error) {
        console.error('Failed to save settings:', error);
        alert('Failed to save settings');
    }
}

// Apply preferences
function applyPreferences(prefs) {
    if (prefs.theme === 'dark') {
        document.body.classList.add('dark-theme');
    }
    
    if (prefs.temperature_unit) {
        document.querySelector(`input[name="tempUnit"][value="${prefs.temperature_unit}"]`).checked = true;
    }
    
    if (prefs.theme) {
        document.querySelector(`input[name="theme"][value="${prefs.theme}"]`).checked = true;
    }
}

// Utility functions
function formatTime(date) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    document.getElementById('currentDateTime').textContent = now.toLocaleDateString('en-US', options);
}

function showLoading() {
    document.getElementById('loadingOverlay').classList.add('show');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('show');
}

function showError(message) {
    alert(message);
}

// Load alerts in overview section
async function loadAlertsOverview() {
    try {
        // Check for severe weather conditions
        if (weatherData) {
            const alerts = [];
            
            // Temperature alerts
            if (weatherData.main.temp > 35) {
                alerts.push({
                    type: 'warning',
                    title: 'High Temperature Alert',
                    message: `Temperature is ${Math.round(weatherData.main.temp)}°C. Stay hydrated and avoid prolonged sun exposure.`
                });
            } else if (weatherData.main.temp < 0) {
                alerts.push({
                    type: 'warning',
                    title: 'Freezing Temperature Alert',
                    message: `Temperature is ${Math.round(weatherData.main.temp)}°C. Dress warmly and be cautious of ice.`
                });
            }
            
            // Wind alerts
            if (weatherData.wind.speed > 15) {
                alerts.push({
                    type: 'warning',
                    title: 'Strong Wind Alert',
                    message: `Wind speed is ${Math.round(weatherData.wind.speed * 3.6)} km/h. Secure loose objects.`
                });
            }
            
            // Rain/Storm alerts
            if (weatherData.weather[0].main === 'Thunderstorm') {
                alerts.push({
                    type: 'error',
                    title: 'Thunderstorm Warning',
                    message: 'Thunderstorm detected. Stay indoors and avoid open areas.'
                });
            } else if (weatherData.weather[0].main === 'Rain') {
                alerts.push({
                    type: 'info',
                    title: 'Rain Alert',
                    message: 'Rain expected. Carry an umbrella.'
                });
            }
            
            // Display alerts
            const container = document.getElementById('alertsOverview');
            container.innerHTML = '';
            
            if (alerts.length === 0) {
                container.innerHTML = `
                    <div class="alert-card info">
                        <i class="fas fa-check-circle"></i>
                        <div>
                            <h4>No Active Alerts</h4>
                            <p>Weather conditions are normal. Enjoy your day!</p>
                        </div>
                    </div>
                `;
            } else {
                alerts.forEach(alert => {
                    const alertCard = document.createElement('div');
                    alertCard.className = `alert-card ${alert.type}`;
                    alertCard.innerHTML = `
                        <i class="fas fa-${alert.type === 'error' ? 'exclamation-triangle' : alert.type === 'warning' ? 'exclamation-circle' : 'info-circle'}"></i>
                        <div>
                            <h4>${alert.title}</h4>
                            <p>${alert.message}</p>
                        </div>
                    `;
                    container.appendChild(alertCard);
                });
            }
        }
    } catch (error) {
        console.error('Failed to load alerts:', error);
    }
}


// Initialize Interactive Map
function initializeMap() {
    if (!map) {
        map = L.map('weatherMap').setView([20, 0], 2);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        map.on('click', async (e) => {
            const { lat, lng } = e.latlng;
            await loadMapWeather(lat, lng);
        });
    }
}

// Load weather for map location
async function loadMapWeather(lat, lon) {
    try {
        const weather = await fetch(`/api/weather?lat=${lat}&lon=${lon}`).then(r => r.json());
        
        // Update map marker
        if (mapMarker) {
            map.removeLayer(mapMarker);
        }
        
        mapMarker = L.marker([lat, lon]).addTo(map);
        mapMarker.bindPopup(`<b>${weather.name}</b><br>${Math.round(weather.main.temp)}°C`).openPopup();
        
        // Update map weather info
        document.getElementById('mapLocationName').textContent = `${weather.name}, ${weather.sys.country}`;
        document.getElementById('mapTemp').textContent = Math.round(weather.main.temp) + '°C';
        document.getElementById('mapCondition').textContent = weather.weather[0].description;
        document.getElementById('mapWind').textContent = Math.round(weather.wind.speed * 3.6) + ' km/h';
        document.getElementById('mapHumidity').textContent = weather.main.humidity + '%';
        
        document.getElementById('mapWeatherInfo').style.display = 'block';
        
        // Store for adding to favorites
        currentLocation.mapLat = lat;
        currentLocation.mapLon = lon;
        currentLocation.mapName = weather.name;
    } catch (error) {
        console.error('Failed to load map weather:', error);
    }
}

// Go to coordinates
document.getElementById('goToCoordinates')?.addEventListener('click', () => {
    const lat = parseFloat(document.getElementById('mapLat').value);
    const lon = parseFloat(document.getElementById('mapLon').value);
    
    if (lat && lon && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        map.setView([lat, lon], 10);
        loadMapWeather(lat, lon);
    } else {
        alert('Please enter valid coordinates (Lat: -90 to 90, Lon: -180 to 180)');
    }
});

// Add map location to favorites
document.getElementById('addMapLocation')?.addEventListener('click', async () => {
    if (currentLocation.mapLat && currentLocation.mapLon) {
        await saveLocation(currentLocation.mapName);
        alert('Location added to favorites!');
    }
});

// Load popular cities
function loadPopularCities() {
    const grid = document.getElementById('popularCitiesGrid');
    grid.innerHTML = '';
    
    popularCities.forEach(async (city) => {
        const card = document.createElement('div');
        card.className = 'popular-card';
        card.innerHTML = `
            <div class="popular-header">
                <div>
                    <div class="popular-name">${city.name}</div>
                    <div class="popular-country">${city.country}</div>
                </div>
                <div class="popular-flag">${city.flag}</div>
            </div>
            <div class="popular-weather">
                <div class="popular-icon"><i class="fas fa-cloud"></i></div>
                <div class="popular-temp">--°</div>
            </div>
            <div class="popular-details">
                <span><i class="fas fa-wind"></i> -- km/h</span>
                <span><i class="fas fa-tint"></i> --%</span>
            </div>
        `;
        
        card.addEventListener('click', () => {
            currentLocation.lat = city.lat;
            currentLocation.lon = city.lon;
            currentLocation.name = city.name;
            loadWeatherData();
            switchSection('overview');
        });
        
        grid.appendChild(card);
        
        // Load weather for this city
        try {
            const weather = await fetch(`/api/weather?lat=${city.lat}&lon=${city.lon}`).then(r => r.json());
            const iconMap = {
                'Clear': 'fa-sun', 'Clouds': 'fa-cloud', 'Rain': 'fa-cloud-rain',
                'Snow': 'fa-snowflake', 'Thunderstorm': 'fa-bolt'
            };
            const icon = iconMap[weather.weather[0].main] || 'fa-cloud';
            
            card.querySelector('.popular-icon i').className = `fas ${icon}`;
            card.querySelector('.popular-temp').textContent = Math.round(weather.main.temp) + '°';
            card.querySelector('.popular-details').innerHTML = `
                <span><i class="fas fa-wind"></i> ${Math.round(weather.wind.speed * 3.6)} km/h</span>
                <span><i class="fas fa-tint"></i> ${weather.main.humidity}%</span>
            `;
        } catch (error) {
            console.error('Failed to load city weather:', error);
        }
    });
}

// Load favorites
async function loadFavorites() {
    try {
        const locations = await fetch('/api/locations').then(r => r.json());
        favoriteLocations = locations;
        displayFavorites(locations);
    } catch (error) {
        console.error('Failed to load favorites:', error);
    }
}

// Display favorites
function displayFavorites(locations) {
    const grid = document.getElementById('favoritesGrid');
    grid.innerHTML = '';
    
    if (locations.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-light);">No favorite locations yet. Add some from the map!</p>';
        return;
    }
    
    locations.forEach(async (location) => {
        const card = document.createElement('div');
        card.className = 'favorite-card';
        card.innerHTML = `
            <i class="fas fa-star favorite-star"></i>
            <div class="favorite-location">${location.location_name}</div>
            <div class="favorite-weather">
                <div class="favorite-icon"><i class="fas fa-cloud"></i></div>
                <div class="favorite-temp">--°</div>
            </div>
            <div class="favorite-details">
                <div class="favorite-detail">
                    <div class="favorite-detail-label">Wind</div>
                    <div class="favorite-detail-value">-- km/h</div>
                </div>
                <div class="favorite-detail">
                    <div class="favorite-detail-label">Humidity</div>
                    <div class="favorite-detail-value">--%</div>
                </div>
                <div class="favorite-detail">
                    <div class="favorite-detail-label">Feels</div>
                    <div class="favorite-detail-value">--°</div>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            currentLocation.lat = location.latitude;
            currentLocation.lon = location.longitude;
            currentLocation.name = location.location_name;
            loadWeatherData();
            switchSection('overview');
        });
        
        grid.appendChild(card);
        
        // Load weather
        try {
            const weather = await fetch(`/api/weather?lat=${location.latitude}&lon=${location.longitude}`).then(r => r.json());
            const iconMap = {
                'Clear': 'fa-sun', 'Clouds': 'fa-cloud', 'Rain': 'fa-cloud-rain',
                'Snow': 'fa-snowflake', 'Thunderstorm': 'fa-bolt'
            };
            const icon = iconMap[weather.weather[0].main] || 'fa-cloud';
            
            card.querySelector('.favorite-icon i').className = `fas ${icon}`;
            card.querySelector('.favorite-temp').textContent = Math.round(weather.main.temp) + '°';
            card.querySelectorAll('.favorite-detail-value')[0].textContent = Math.round(weather.wind.speed * 3.6) + ' km/h';
            card.querySelectorAll('.favorite-detail-value')[1].textContent = weather.main.humidity + '%';
            card.querySelectorAll('.favorite-detail-value')[2].textContent = Math.round(weather.main.feels_like) + '°';
        } catch (error) {
            console.error('Failed to load favorite weather:', error);
        }
    });
}

// Compare locations
let compareLocations = [null, null];

async function addCompareLocation(index) {
    const input = document.getElementById(`compareLocation${index}`);
    const city = input.value.trim();
    
    if (!city) return;
    
    try {
        const weather = await fetch(`/api/weather?city=${city}`).then(r => r.json());
        compareLocations[index - 1] = weather;
        
        if (compareLocations[0] && compareLocations[1]) {
            displayComparison();
        }
    } catch (error) {
        alert('City not found');
    }
}

function displayComparison() {
    const grid = document.getElementById('comparisonGrid');
    grid.innerHTML = '';
    
    compareLocations.forEach((weather, index) => {
        if (!weather) return;
        
        const iconMap = {
            'Clear': 'fa-sun', 'Clouds': 'fa-cloud', 'Rain': 'fa-cloud-rain',
            'Snow': 'fa-snowflake', 'Thunderstorm': 'fa-bolt'
        };
        const icon = iconMap[weather.weather[0].main] || 'fa-cloud';
        
        const card = document.createElement('div');
        card.className = 'comparison-card';
        card.innerHTML = `
            <div class="comparison-header">
                <div class="comparison-city">${weather.name}, ${weather.sys.country}</div>
            </div>
            <div class="comparison-main">
                <div class="comparison-icon"><i class="fas ${icon}"></i></div>
                <div class="comparison-temp">${Math.round(weather.main.temp)}°C</div>
                <div class="comparison-condition">${weather.weather[0].description}</div>
            </div>
            <div class="comparison-details">
                <div class="comparison-detail">
                    <div class="comparison-detail-label">Feels Like</div>
                    <div class="comparison-detail-value">${Math.round(weather.main.feels_like)}°C</div>
                </div>
                <div class="comparison-detail">
                    <div class="comparison-detail-label">Wind</div>
                    <div class="comparison-detail-value">${Math.round(weather.wind.speed * 3.6)} km/h</div>
                </div>
                <div class="comparison-detail">
                    <div class="comparison-detail-label">Humidity</div>
                    <div class="comparison-detail-value">${weather.main.humidity}%</div>
                </div>
                <div class="comparison-detail">
                    <div class="comparison-detail-label">Pressure</div>
                    <div class="comparison-detail-value">${weather.main.pressure} hPa</div>
                </div>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

// Update section switching to handle new sections
const originalSwitchSection = switchSection;
switchSection = function(section) {
    originalSwitchSection(section);
    
    if (section === 'maps' && !map) {
        setTimeout(() => initializeMap(), 100);
    } else if (section === 'popular') {
        loadPopularCities();
    } else if (section === 'favorites') {
        loadFavorites();
    }
};

// Tab switching for popular section
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const tab = btn.dataset.tab;
        if (tab === 'cities') {
            loadPopularCities();
        } else if (tab === 'countries') {
            loadPopularCountries();
        }
    });
});

function loadPopularCountries() {
    const grid = document.getElementById('popularCitiesGrid');
    grid.innerHTML = '';
    
    popularCountries.forEach(async (country) => {
        const card = document.createElement('div');
        card.className = 'popular-card';
        card.innerHTML = `
            <div class="popular-header">
                <div>
                    <div class="popular-name">${country.name}</div>
                    <div class="popular-country">${country.capital}</div>
                </div>
                <div class="popular-flag">${country.flag}</div>
            </div>
            <div class="popular-weather">
                <div class="popular-icon"><i class="fas fa-cloud"></i></div>
                <div class="popular-temp">--°</div>
            </div>
            <div class="popular-details">
                <span><i class="fas fa-wind"></i> -- km/h</span>
                <span><i class="fas fa-tint"></i> --%</span>
            </div>
        `;
        
        card.addEventListener('click', () => {
            currentLocation.lat = country.lat;
            currentLocation.lon = country.lon;
            currentLocation.name = country.capital;
            loadWeatherData();
            switchSection('overview');
        });
        
        grid.appendChild(card);
        
        // Load weather
        try {
            const weather = await fetch(`/api/weather?lat=${country.lat}&lon=${country.lon}`).then(r => r.json());
            const iconMap = {
                'Clear': 'fa-sun', 'Clouds': 'fa-cloud', 'Rain': 'fa-cloud-rain',
                'Snow': 'fa-snowflake', 'Thunderstorm': 'fa-bolt'
            };
            const icon = iconMap[weather.weather[0].main] || 'fa-cloud';
            
            card.querySelector('.popular-icon i').className = `fas ${icon}`;
            card.querySelector('.popular-temp').textContent = Math.round(weather.main.temp) + '°';
            card.querySelector('.popular-details').innerHTML = `
                <span><i class="fas fa-wind"></i> ${Math.round(weather.wind.speed * 3.6)} km/h</span>
                <span><i class="fas fa-tint"></i> ${weather.main.humidity}%</span>
            `;
        } catch (error) {
            console.error('Failed to load country weather:', error);
        }
    });
}
