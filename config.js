// Application Configuration
module.exports = {
    // Server Configuration
    server: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development',
        corsOrigin: process.env.CORS_ORIGIN || '*'
    },

    // Database Configuration
    database: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'weather_dashboard',
        connectionLimit: 10,
        waitForConnections: true,
        queueLimit: 0
    },

    // Session Configuration
    session: {
        secret: process.env.SESSION_SECRET || 'your-secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
    },

    // Weather API Configuration
    weather: {
        apiKey: process.env.WEATHER_API_KEY,
        baseUrl: 'https://api.openweathermap.org/data/2.5',
        units: 'metric',
        cacheDuration: 10 * 60 * 1000, // 10 minutes
        requestTimeout: 5000 // 5 seconds
    },

    // Security Configuration
    security: {
        bcryptRounds: 10,
        maxLoginAttempts: 5,
        lockoutDuration: 15 * 60 * 1000, // 15 minutes
        passwordMinLength: 8,
        sessionTimeout: 24 * 60 * 60 * 1000 // 24 hours
    },

    // Rate Limiting
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100,
        message: 'Too many requests, please try again later'
    },

    // Email Configuration (for future features)
    email: {
        enabled: false,
        service: 'gmail',
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASSWORD,
        from: 'noreply@weatherpro.com'
    },

    // Notification Configuration
    notifications: {
        enabled: true,
        types: {
            severe_weather: true,
            daily_forecast: true,
            location_alerts: true
        }
    },

    // Feature Flags
    features: {
        socialLogin: false,
        weatherAlerts: true,
        multipleLocations: true,
        weatherMaps: false,
        historicalData: false,
        airQuality: true,
        uvIndex: true
    },

    // UI Configuration
    ui: {
        defaultTheme: 'auto', // 'light', 'dark', 'auto'
        defaultTempUnit: 'celsius', // 'celsius', 'fahrenheit'
        maxSavedLocations: 10,
        forecastDays: 7,
        hourlyForecastHours: 24
    },

    // Logging Configuration
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: 'json',
        console: true,
        file: false,
        filePath: './logs/app.log'
    },

    // Cache Configuration
    cache: {
        enabled: true,
        ttl: 600, // 10 minutes
        checkPeriod: 120 // 2 minutes
    },

    // API Response Configuration
    api: {
        version: 'v1',
        timeout: 30000, // 30 seconds
        maxPayloadSize: '10mb'
    }
};
