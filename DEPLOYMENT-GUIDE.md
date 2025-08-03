# AuthFlow Deployment Guide

This guide explains how to run your authentication application locally and deploy it to servers.

## 🖥️ Running Locally

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MySQL** (optional - app works with in-memory storage)

### Step 1: Clone and Install
```bash
# Clone your project or download the files
git clone your-repo-url
cd your-project

# Install dependencies
npm install
```

### Step 2: Environment Configuration
Create a `.env` file in your project root:

```bash
# Copy from the example file
cp .env.example .env

# Edit the .env file with your actual values
# Firebase Configuration (required for Firebase auth)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_APP_ID=your-firebase-app-id

# JWT Configuration (required for email/password auth)
JWT_SECRET=your-secret-key-for-jwt-tokens

# Database Configuration (optional - uses in-memory if not provided)
DATABASE_URL=mysql://username:password@localhost:3306/database_name

# Session Configuration (required)
SESSION_SECRET=your-session-secret-key

# Server Configuration
PORT=5000
NODE_ENV=development

# Replit Auth (OPTIONAL - only if you want to use Replit's authentication)
# Leave these commented out for local development
# REPLIT_DOMAINS=your-repl-domain.replit.app
# REPL_ID=your-repl-id
```

### Step 3: Database Setup (Optional)
If you want to use MySQL instead of in-memory storage:

```bash
# Install MySQL if you haven't already
# Windows: Download from https://dev.mysql.com/downloads/installer/
# macOS: brew install mysql
# Linux: sudo apt install mysql-server

# Start MySQL
# Windows: net start mysql
# macOS: brew services start mysql
# Linux: sudo systemctl start mysql

# Create database
mysql -u root -p
CREATE DATABASE authflow;
EXIT;

# Push database schema
npm run db:push
```

### Step 4: Start Development Server
```bash
npm run dev
```

Your app will be available at `http://localhost:5000`

## 🌐 Server Deployment

### Option 1: Traditional VPS/Server

#### Requirements
- Ubuntu/CentOS/Debian server
- Node.js 18+
- MySQL (optional)
- Domain name (optional)

#### Setup Steps
```bash
# 1. Connect to your server
ssh username@your-server-ip

# 2. Update system
sudo apt update && sudo apt upgrade -y

# 3. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Install MySQL (optional)
sudo apt install mysql-server

# 5. Upload your project files
# Either git clone or scp your files to the server

# 6. Install dependencies
npm install

# 7. Build for production
npm run build

# 8. Set environment variables
sudo nano /etc/environment
# Add your production environment variables

# 9. Install PM2 for process management
npm install -g pm2

# 10. Start application
pm2 start dist/index.js --name "authflow"
pm2 startup
pm2 save

# 11. Setup reverse proxy with Nginx (optional)
sudo apt install nginx
sudo nano /etc/nginx/sites-available/authflow
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 2: Docker Deployment

#### Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 5000

# Set environment
ENV NODE_ENV=production

# Start application
CMD ["npm", "start"]
```

#### Create docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mysql://root:password@mysql:3306/authflow
      - JWT_SECRET=your-jwt-secret
      - SESSION_SECRET=your-session-secret
      - VITE_FIREBASE_API_KEY=your-firebase-api-key
      - VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
      - VITE_FIREBASE_APP_ID=your-firebase-app-id
    depends_on:
      - mysql

  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=authflow
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

volumes:
  mysql_data:
```

#### Deploy with Docker
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Option 3: Cloud Platforms

#### Vercel (Frontend + Serverless)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Add all your VITE_ variables and other secrets
```

#### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### DigitalOcean App Platform
1. Connect your GitHub repository
2. Set environment variables in the dashboard
3. Deploy automatically on git push

#### AWS/Google Cloud/Azure
Use their respective container services or VM instances following the VPS setup above.

## 🔧 Production Configuration

### Environment Variables
```bash
# Production environment variables
NODE_ENV=production
PORT=5000

# Database (use your production database URL)
DATABASE_URL=mysql://user:password@your-db-host:3306/database

# Security keys (generate new ones for production)
JWT_SECRET=super-secure-random-string-32-chars-minimum
SESSION_SECRET=another-secure-random-string-32-chars-minimum

# Firebase (use production Firebase project)
VITE_FIREBASE_API_KEY=production-firebase-api-key
VITE_FIREBASE_PROJECT_ID=production-firebase-project-id
VITE_FIREBASE_APP_ID=production-firebase-app-id
```

### Security Checklist
- [ ] Use strong, unique JWT_SECRET and SESSION_SECRET
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure firewall rules
- [ ] Use production Firebase project
- [ ] Set up database backups
- [ ] Configure proper CORS settings
- [ ] Use environment variables, not .env files
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Update Firebase authorized domains

### Performance Optimization
```bash
# Enable gzip compression
# Set cache headers
# Use CDN for static assets
# Optimize database queries
# Set up database connection pooling
```

## 🔍 Monitoring & Maintenance

### Health Checks
```bash
# Check application status
curl http://your-domain.com/health

# Check database connection
curl http://your-domain.com/api/health
```

### Logs
```bash
# PM2 logs
pm2 logs authflow

# Docker logs
docker-compose logs -f app

# System logs
sudo journalctl -u authflow -f
```

### Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
npm run build
pm2 restart authflow

# Or with Docker
docker-compose down
docker-compose up --build -d
```

## 🚨 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Find process using port 5000
sudo lsof -i :5000
# Kill the process
sudo kill -9 PID
```

**Database connection failed:**
- Check DATABASE_URL format
- Verify database server is running
- Check firewall rules
- Test connection manually

**Firebase errors:**
- Verify API keys are correct
- Check authorized domains in Firebase console
- Ensure Firebase project is active

**Build failures:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support

For deployment issues:
1. Check server logs first
2. Verify all environment variables are set
3. Test database connectivity
4. Check Firebase configuration
5. Verify port accessibility

The application includes both Firebase authentication and JWT-based authentication, so you can use either or both depending on your needs.