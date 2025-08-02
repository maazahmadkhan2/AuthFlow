# MySQL Setup Guide for AuthFlow

This guide will help you set up the AuthFlow authentication system with MySQL database on your local machine.

## 🚀 Quick Setup

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MySQL Server** (v8.0 or higher)

### 2. Install MySQL
**Windows:** Download from [MySQL official website](https://dev.mysql.com/downloads/installer/)
**macOS:** `brew install mysql`
**Linux:** `sudo apt install mysql-server`

### 3. Start MySQL Service
```bash
# Windows
net start mysql

# macOS
brew services start mysql

# Linux
sudo systemctl start mysql
```

### 4. Create Database
```sql
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE authflow;
EXIT;
```

### 5. Configure Environment
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your settings
# DATABASE_URL=mysql://root:yourpassword@localhost:3306/authflow
```

### 6. Setup Database Tables

**Option A: Using Drizzle (Recommended)**
```bash
# First, update drizzle.config.ts to use MySQL
# Change dialect from "postgresql" to "mysql"

# Then run:
npm run db:push
```

**Option B: Using Setup Script**
```bash
npm run db:setup
```

**Option C: Manual SQL**
```sql
USE authflow;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  profile_image_url TEXT,
  password TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
  sid VARCHAR(128) PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP NOT NULL,
  INDEX IDX_session_expire (expire)
);
```

### 7. Start the Application
```bash
npm install
npm run dev
```

## 🔧 Configuration Options

### Environment Variables

**Required:**
- `DATABASE_URL` - Full MySQL connection string
- `SESSION_SECRET` - Secret key for session encryption

**Optional:**
- `DB_HOST` - MySQL host (default: localhost)
- `DB_PORT` - MySQL port (default: 3306)  
- `DB_USER` - MySQL username (default: root)
- `DB_PASSWORD` - MySQL password
- `DB_NAME` - Database name (default: authflow)

### Database URL Formats
```bash
# Basic format
mysql://username:password@host:port/database

# Examples
mysql://root:mypassword@localhost:3306/authflow
mysql://user:pass@192.168.1.100:3306/myapp
```

## 🐛 Troubleshooting

### Connection Refused Error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solutions:**
1. Start MySQL service
2. Check if MySQL is running on port 3306
3. Verify username/password in .env file

### Authentication Failed
```
Error: Access denied for user 'root'@'localhost'
```
**Solutions:**
1. Reset MySQL root password
2. Create a new MySQL user
3. Check password in .env file

### Database Not Found
```
Error: Unknown database 'authflow'
```
**Solutions:**
1. Create the database: `CREATE DATABASE authflow;`
2. Check database name in .env file

### Drizzle Config Issues
If `npm run db:push` shows PostgreSQL errors:
1. Open `drizzle.config.ts`
2. Change `dialect: "postgresql"` to `dialect: "mysql"`
3. Save and try again

## 📊 Database Schema

The application creates these tables:

### users
- `id` - Auto-increment primary key
- `email` - Unique user email
- `first_name` - User's first name
- `last_name` - User's last name
- `profile_image_url` - Profile picture URL
- `password` - Hashed password
- `email_verified` - Email verification status
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

### sessions
- `sid` - Session ID (primary key)
- `sess` - Session data (JSON)
- `expire` - Session expiration time

## 🔐 Security Notes

1. **Never commit .env file** - It contains sensitive credentials
2. **Use strong SESSION_SECRET** - Generate a random 32+ character string
3. **Secure MySQL** - Don't use root user in production
4. **Regular backups** - Backup your database regularly

## 🚀 Production Deployment

For production:
1. Use environment variables instead of .env file
2. Create dedicated MySQL user with limited privileges
3. Enable SSL/TLS for database connections
4. Use a strong, unique SESSION_SECRET
5. Set up proper firewall rules

## 📞 Support

If you encounter issues:
1. Check this troubleshooting guide
2. Verify MySQL is running and accessible
3. Check the application logs for specific errors
4. Ensure all environment variables are set correctly