# AuthFlow - Modern Authentication System

A full-stack authentication application with dual authentication support: Firebase Auth and JWT-based email/password authentication. Designed to work everywhere - locally, on servers, and on Replit.

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone your-repo-url
cd authflow
npm install
```

### 2. Choose Your Authentication Method

#### Option A: Firebase Only (Recommended for most use cases)
```bash
cp .env.example .env
# Edit .env and add only Firebase configuration:
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_APP_ID=your-firebase-app-id
SESSION_SECRET=your-session-secret
```

#### Option B: JWT Email/Password Only
```bash
cp .env.example .env
# Edit .env and add:
JWT_SECRET=your-jwt-secret-key
SESSION_SECRET=your-session-secret
# Comment out Firebase variables
```

#### Option C: Both Firebase + JWT (Dual Authentication)
```bash
cp .env.example .env
# Edit .env and add both Firebase and JWT configurations
```

### 3. Start the Application
```bash
npm run dev
```

Visit `http://localhost:5000` to see your app!

## 🏗️ Architecture

### Authentication Options
1. **Firebase Authentication**: Google OAuth + Email/Password (handled by Firebase)
2. **JWT Authentication**: Server-side email/password authentication with bcrypt
3. **Replit Auth**: Optional OAuth integration (only when running on Replit)

### Database Support
- **MySQL**: Full database support with session storage
- **In-Memory**: Fallback storage for development (no database required)

### Key Features
- ✅ Responsive design with dark/light mode
- ✅ Form validation with Zod
- ✅ Secure password hashing
- ✅ Session management
- ✅ Type-safe with TypeScript
- ✅ Hot reload development

## 🌍 Deployment Options

### Local Development
```bash
# No special configuration needed
npm run dev
```

### Production Server
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Replit (with optional Replit Auth)
```bash
# On Replit, the app runs automatically
# To enable Replit Auth, add these secrets in Replit:
# REPLIT_DOMAINS=your-repl-domain.replit.app
# REPL_ID=your-repl-id
```

### Docker
```bash
docker-compose up -d
```

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and Firebase config
├── server/                 # Express backend
│   ├── index.ts           # Main server file
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database abstraction
│   ├── db.ts              # Database connection
│   └── replitAuth.ts      # Optional Replit OAuth
├── shared/                 # Shared types and schemas
└── README.md              # This file
```

## 🔧 Configuration

### Required Environment Variables
```bash
# Session security (always required)
SESSION_SECRET=your-32-character-secret-key

# Choose one or both:
# Firebase Auth
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=your-app-id

# JWT Auth  
JWT_SECRET=your-32-character-jwt-secret
```

### Optional Environment Variables
```bash
# Database (uses in-memory if not provided)
DATABASE_URL=mysql://user:pass@host:3306/db

# Server
PORT=5000
NODE_ENV=development

# Replit Auth (only if running on Replit)
REPLIT_DOMAINS=your-repl.replit.app
REPL_ID=your-repl-id
```

## 🚫 Disabling Replit Auth

The app automatically detects if Replit authentication should be enabled based on environment variables:

- **Local/Server**: Replit auth is automatically disabled
- **Replit without auth**: Works with Firebase/JWT only
- **Replit with auth**: Set `REPLIT_DOMAINS` and `REPL_ID` to enable

No code changes needed - it just works!

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run start        # Start production server
npm run check        # Type check
npm run db:push      # Update database schema
```

### Adding Features
1. Add database tables in `shared/schema.ts`
2. Update storage interface in `server/storage.ts`
3. Add API routes in `server/routes.ts`
4. Create React components in `client/src/`

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **Session Security**: HTTP-only cookies, CSRF protection
- **Input Validation**: Zod schemas for all forms
- **JWT Tokens**: Secure token-based authentication
- **Environment Variables**: No secrets in code

## 📊 Database Schema

### Users Table
```sql
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
```

### Sessions Table
```sql
CREATE TABLE sessions (
  sid VARCHAR(128) PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP NOT NULL,
  INDEX IDX_session_expire (expire)
);
```

## 🐛 Troubleshooting

### "Replit auth disabled" message
This is normal! It means the app is running without Replit authentication, using Firebase/JWT instead.

### Database connection errors
The app falls back to in-memory storage automatically. To use MySQL:
1. Install MySQL server
2. Create database: `CREATE DATABASE authflow;`
3. Set `DATABASE_URL` in your `.env`

### Firebase errors
1. Check your Firebase project is active
2. Verify API keys in `.env`
3. Add your domain to Firebase authorized domains

### Build/deployment issues
1. Check all required environment variables are set
2. Ensure Node.js version is 18+
3. Try clearing npm cache: `npm cache clean --force`

## 📚 Documentation

- [Firebase Setup Guide](./README-FIREBASE-SETUP.md)
- [MySQL Setup Guide](./README-MYSQL-SETUP.md)
- [Deployment Guide](./DEPLOYMENT-GUIDE.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**Ready to authenticate users everywhere! 🚀**