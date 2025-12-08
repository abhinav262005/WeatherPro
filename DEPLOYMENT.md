# Deployment Guide

This guide covers deploying WeatherPro to production environments.

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database properly set up and secured
- [ ] SSL certificate obtained
- [ ] Domain name configured
- [ ] Firewall rules configured
- [ ] Backup strategy in place
- [ ] Monitoring tools set up

## Environment Variables for Production

```env
NODE_ENV=production
DB_HOST=your_production_db_host
DB_USER=your_production_db_user
DB_PASSWORD=strong_secure_password
DB_NAME=weather_dashboard
SESSION_SECRET=very_long_random_string_at_least_64_characters
PORT=3000
WEATHER_API_KEY=your_openweathermap_api_key
```

## Deployment Options

### Option 1: Traditional VPS (DigitalOcean, Linode, AWS EC2)

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Install Nginx
sudo apt install -y nginx

# Install PM2 (Process Manager)
sudo npm install -g pm2
```

#### 2. Application Setup

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/abhinav262005/WeatherPro.git
cd WeatherPro

# Install dependencies
sudo npm install --production

# Setup environment
sudo cp .env.example .env
sudo nano .env  # Edit with production values

# Setup database
mysql -u root -p < database.sql
```

#### 3. Configure PM2

```bash
# Start application
pm2 start server.js --name weather-dashboard

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### 4. Configure Nginx

Create `/etc/nginx/sites-available/weather-dashboard`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/weather-dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. Setup SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Option 2: Heroku

#### 1. Prepare Application

Create `Procfile`:
```
web: node server.js
```

#### 2. Deploy

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Add MySQL addon
heroku addons:create jawsdb:kitefin

# Set environment variables
heroku config:set SESSION_SECRET=your_secret
heroku config:set WEATHER_API_KEY=your_api_key

# Deploy
git push heroku main

# Run database migrations
heroku run bash
mysql -h hostname -u username -p database_name < database.sql
```

### Option 3: Docker

#### 1. Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

#### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - DB_USER=root
      - DB_PASSWORD=your_password
      - DB_NAME=weather_dashboard
      - SESSION_SECRET=your_secret
      - WEATHER_API_KEY=your_api_key
    depends_on:
      - db

  db:
    image: mysql:8
    environment:
      - MYSQL_ROOT_PASSWORD=your_password
      - MYSQL_DATABASE=weather_dashboard
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database.sql:/docker-entrypoint-initdb.d/init.sql

volumes:
  mysql_data:
```

#### 3. Deploy

```bash
docker-compose up -d
```

## Post-Deployment

### 1. Verify Deployment

- [ ] Application accessible via domain
- [ ] HTTPS working correctly
- [ ] Database connections working
- [ ] User registration working
- [ ] Weather data loading
- [ ] All features functional

### 2. Setup Monitoring

```bash
# PM2 monitoring
pm2 monitor

# Setup log rotation
pm2 install pm2-logrotate
```

### 3. Setup Backups

```bash
# Database backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u root -p weather_dashboard > /backups/weather_dashboard_$DATE.sql
```

Add to crontab:
```bash
0 2 * * * /path/to/backup-script.sh
```

### 4. Performance Optimization

#### Enable Compression in server.js:

```javascript
const compression = require('compression');
app.use(compression());
```

#### Setup Redis for Sessions (Optional):

```bash
npm install redis connect-redis
```

```javascript
const redis = require('redis');
const RedisStore = require('connect-redis')(session);
const redisClient = redis.createClient();

app.use(session({
    store: new RedisStore({ client: redisClient }),
    // ... other options
}));
```

## Security Hardening

### 1. Firewall Configuration

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. Fail2Ban Setup

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Regular Updates

```bash
# Create update script
#!/bin/bash
cd /var/www/weather-dashboard
git pull
npm install --production
pm2 restart weather-dashboard
```

## Troubleshooting

### Application Won't Start

```bash
# Check PM2 logs
pm2 logs weather-dashboard

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Check application logs
tail -f logs/app.log
```

### Database Connection Issues

```bash
# Test MySQL connection
mysql -u username -p -h hostname database_name

# Check MySQL status
sudo systemctl status mysql
```

### High Memory Usage

```bash
# Check PM2 status
pm2 status

# Restart application
pm2 restart weather-dashboard
```

## Maintenance

### Regular Tasks

- Update dependencies monthly: `npm update`
- Review logs weekly
- Check disk space: `df -h`
- Monitor database size
- Review security advisories
- Test backups regularly

### Scaling

For high traffic:
1. Use load balancer (Nginx, HAProxy)
2. Setup multiple app instances with PM2 cluster mode
3. Use Redis for session storage
4. Implement caching strategy
5. Use CDN for static assets

## Support

For deployment issues, check:
- Application logs
- Server logs
- Database logs
- Nginx logs

Create an issue on GitHub if you need help!
