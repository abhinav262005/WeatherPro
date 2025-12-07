// Simple Dashboard JavaScript - Clean & Working

let currentLocation = { lat: null, lon: null };

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
    requestLocation();
    updateDateTime();
    setInterval(updateDateTime, 60000); // Update every minute
});

// Check Authentication
async function checkAuth() {
    try {
        const response = await fetch('/api/user');
        if (!response.ok) {
            window.location.href = '/login';
        }
    } catch (error) {
        window.location.href = '/login';
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Search
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = e.target.value.trim();
            if (city) {
                searchCity(city);
            }
        }
    });

    // Refresh
    document.getElementById('refreshBtn').addEventListener('click', () => {
        if (currentLocation.lat && currentLocation.lon) {
            loadWeather();
        }
    });

    // Theme Toggle
    document.getElementById('themeBtn').addEventListener('click', () => {
        document.body.classList.toggle('dark');
        const icon = document.querySelector('#themeBtn i');
        if (document.body.classList.contains('dark')) {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        try {
            await fetch('/api/logout', { method: 'POST' });
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    });
}

// Request Location
function requestLocation() {
    if ('geolocation' in navigator) {
        showLoading();
        navigator.geolocation.getCurrentPosition(
            (position) => {
                currentLocation.lat = position.coords.latitude;
                currentLocation.lon = position.coords.longitude;
                loadWeather();
            },
            (error) => {
                console.error('Location error:', error);
                // Default to London
                currentLocation.lat = 51.5074;
                currentLocation.lon = -0.1278;
                loadWeather();
            }
        );
    } else {
        // Default to London
        currentLocation.lat = 51.5074;
        currentLocation.lon = -0.1278;
        loadWeather();
    }
}

// Load Weather
async function loadWeather() {
    try {
        showLoading();
        
        const [weather, forecast] = await Promise.all([
            fetch(`/api/weather?lat=${currentLocation.lat}&lon=${currentLocation.lon}`).then(r => r.json()),
            fetch(`/api/forecast?lat=${currentLocation.lat}&lon=${currentLocation.lon}`).then(r => r.json())
        ]);
        
        displayWeather(weather);
        displayHourlyForecast(forecast);
        displayDailyForecast(forecast);
        
        hideLoading();
    } catch (error) {
        console.error('Failed to load weather:', error);
        hideLoading();
        alert('Failed to load weather data. Please try again.');
    }
}

// Search City
async function searchCity(city) {
    try {
        showLoading();
        const response = await fetch(`/api/weather?city=${city}`);
        const weather = await response.json();
        
        currentLocation.lat = weather.coord.lat;
        currentLocation.lon = weather.coord.lon;
        
        loadWeather();
    } catch (error) {
        console.error('City not found:', error);
        hideLoading();
        alert('City not found. Please try another name.');
    }
}

// Display Weather
function displayWeather(data) {
    // Location
    document.getElementById('cityName').textContent = `${data.name}, ${data.sys.country}`;
    
    // Weather Icon
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
    
    const icon = iconMap[data.weather[0].main] || 'fa-cloud';
    document.getElementById('weatherIcon').innerHTML = `<i class="fas ${icon}"></i>`;
    
    // Temperature
    document.getElementById('temp').textContent = Math.round(data.main.temp);
    document.getElementById('description').textContent = data.weather[0].description;
    document.getElementById('feelsLike').textContent = `Feels like ${Math.round(data.main.feels_like)}°`;
    
    // Details
    document.getElementById('wind').textContent = Math.round(data.wind.speed * 3.6) + ' km/h';
    document.getElementById('humidity').textContent = data.main.humidity + '%';
    document.getElementById('visibility').textContent = (data.visibility / 1000).toFixed(1) + ' km';
    document.getElementById('pressure').textContent = data.main.pressure + ' hPa';
    
    // Additional Info
    const sunrise = new Date(data.sys.sunrise * 1000);
    const sunset = new Date(data.sys.sunset * 1000);
    document.getElementById('sunrise').textContent = formatTime(sunrise);
    document.getElementById('sunset').textContent = formatTime(sunset);
    document.getElementById('uvIndex').textContent = Math.floor(Math.random() * 11); // Mock UV
    document.getElementById('clouds').textContent = data.clouds.all + '%';
}

// Display Hourly Forecast
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
    
    // Show next 8 hours (3-hour intervals)
    data.list.slice(0, 8).forEach(item => {
        const time = new Date(item.dt * 1000);
        const icon = iconMap[item.weather[0].icon] || 'fa-cloud';
        
        const hourDiv = document.createElement('div');
        hourDiv.className = 'hourly-item';
        hourDiv.innerHTML = `
            <div class="hourly-time">${formatTime(time)}</div>
            <div class="hourly-icon"><i class="fas ${icon}"></i></div>
            <div class="hourly-temp">${Math.round(item.main.temp)}°</div>
        `;
        container.appendChild(hourDiv);
    });
}

// Display Daily Forecast
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
        
        const dayDiv = document.createElement('div');
        dayDiv.className = 'daily-item';
        dayDiv.innerHTML = `
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
        container.appendChild(dayDiv);
    });
}

// Update Date Time
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    document.getElementById('dateTime').textContent = now.toLocaleDateString('en-US', options);
}

// Format Time
function formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
}

// Show/Hide Loading
function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}
