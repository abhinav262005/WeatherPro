/* ============================================
   WEATHER API MODULE
   ============================================ */

import CONFIG from '../config.js';

class WeatherAPI {
    constructor() {
        this.apiKey = CONFIG.API.OPENWEATHER_KEY;
        this.cache = new Map();
        this.cacheTimeout = 300000; // 5 minutes
    }
    
    async getWeatherData(lat, lon, units = 'metric') {
        const cacheKey = `weather_${lat}_${lon}_${units}`;
        
        // Check cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }
        
        try {
            // Fetch current weather + forecast
            const [current, forecast, airQuality] = await Promise.all([
                this.fetchCurrentWeather(lat, lon, units),
                this.fetchForecast(lat, lon, units),
                this.fetchAirQuality(lat, lon)
            ]);
            
            const data = {
                current: current,
                hourly: forecast.hourly,
                daily: forecast.daily,
                alerts: forecast.alerts || [],
                aqi: airQuality
            };
            
            // Cache the result
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });
            
            return data;
            
        } catch (error) {
            console.error('Weather API Error:', error);
            throw error;
        }
    }
    
    async fetchCurrentWeather(lat, lon, units) {
        const url = `${CONFIG.API.OPENWEATHER_BASE}/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${this.apiKey}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        return {
            temp: data.main.temp,
            feels_like: data.main.feels_like,
            temp_min: data.main.temp_min,
            temp_max: data.main.temp_max,
            pressure: data.main.pressure,
            humidity: data.main.humidity,
            visibility: data.visibility,
            wind_speed: data.wind.speed,
            wind_deg: data.wind.deg,
            clouds: data.clouds.all,
            weather: data.weather,
            dt: data.dt,
            sunrise: data.sys.sunrise,
            sunset: data.sys.sunset,
        };
    }
    
    async fetchForecast(lat, lon, units) {
        // Using One Call API 3.0 (requires subscription) or fallback to 5-day forecast
        const url = `${CONFIG.API.OPENWEATHER_BASE}/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${this.apiKey}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Forecast API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Process hourly data (next 48 hours)
        const hourly = data.list.slice(0, 16).map(item => ({
            dt: item.dt,
            temp: item.main.temp,
            feels_like: item.main.feels_like,
            pressure: item.main.pressure,
            humidity: item.main.humidity,
            weather: item.weather,
            clouds: item.clouds.all,
            wind_speed: item.wind.speed,
            wind_deg: item.wind.deg,
            pop: item.pop, // Probability of precipitation
            rain: item.rain?.['3h'] || 0,
            snow: item.snow?.['3h'] || 0,
        }));
        
        // Process daily data (group by day)
        const dailyMap = new Map();
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000).toDateString();
            if (!dailyMap.has(date)) {
                dailyMap.set(date, []);
            }
            dailyMap.get(date).push(item);
        });
        
        const daily = Array.from(dailyMap.entries()).slice(0, 7).map(([date, items]) => {
            const temps = items.map(i => i.main.temp);
            const weatherCounts = {};
            items.forEach(i => {
                const main = i.weather[0].main;
                weatherCounts[main] = (weatherCounts[main] || 0) + 1;
            });
            const dominantWeather = Object.entries(weatherCounts).sort((a, b) => b[1] - a[1])[0][0];
            const weatherItem = items.find(i => i.weather[0].main === dominantWeather);
            
            return {
                dt: items[0].dt,
                temp: {
                    min: Math.min(...temps),
                    max: Math.max(...temps),
                    day: temps.reduce((a, b) => a + b, 0) / temps.length,
                },
                weather: weatherItem.weather,
                humidity: items.reduce((sum, i) => sum + i.main.humidity, 0) / items.length,
                wind_speed: items.reduce((sum, i) => sum + i.wind.speed, 0) / items.length,
                pop: Math.max(...items.map(i => i.pop || 0)),
            };
        });
        
        return {
            hourly,
            daily,
            alerts: [] // Alerts require One Call API 3.0
        };
    }
    
    async fetchAirQuality(lat, lon) {
        const url = `${CONFIG.API.AQI_BASE}?lat=${lat}&lon=${lon}&appid=${this.apiKey}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) return null;
            
            const data = await response.json();
            const components = data.list[0].components;
            
            return {
                aqi: data.list[0].main.aqi,
                co: components.co,
                no: components.no,
                no2: components.no2,
                o3: components.o3,
                so2: components.so2,
                pm2_5: components.pm2_5,
                pm10: components.pm10,
                nh3: components.nh3,
            };
        } catch (error) {
            console.error('AQI API Error:', error);
            return null;
        }
    }
    
    async searchLocation(query) {
        const url = `${CONFIG.API.GEOCODING_BASE}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${this.apiKey}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) return [];
            
            const data = await response.json();
            return data.map(item => ({
                name: item.name,
                country: item.country,
                state: item.state,
                lat: item.lat,
                lon: item.lon,
            }));
        } catch (error) {
            console.error('Geocoding Error:', error);
            return [];
        }
    }
    
    async reverseGeocode(lat, lon) {
        const url = `${CONFIG.API.GEOCODING_BASE}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${this.apiKey}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) return 'Unknown Location';
            
            const data = await response.json();
            if (data.length === 0) return 'Unknown Location';
            
            const location = data[0];
            return location.state ? `${location.name}, ${location.state}` : `${location.name}, ${location.country}`;
        } catch (error) {
            console.error('Reverse Geocoding Error:', error);
            return 'Unknown Location';
        }
    }
}

export default WeatherAPI;
