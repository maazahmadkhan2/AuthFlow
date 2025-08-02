# Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication for the AuthFlow project.

## 🚀 Quick Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "AuthFlow")
4. Accept terms and click "Continue"
5. Disable Google Analytics (optional) and click "Create project"

### 2. Enable Authentication
1. In your Firebase project, click "Authentication" from the sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable the following providers:
   - **Email/Password**: Click, toggle "Enable", and save
   - **Google**: Click, toggle "Enable", add support email, and save

### 3. Configure Web App
1. Go to Project Settings (gear icon in sidebar)
2. In "Your apps" section, click "Web" icon (`</>`)
3. Register your app:
   - App nickname: "AuthFlow Web"
   - Check "Set up Firebase Hosting" (optional)
   - Click "Register app"

### 4. Get Configuration Keys
After registering, you'll see a config object like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  appId: "1:123456789:web:abcdef..."
};
```

### 5. Configure Environment Variables
Create `.env` file in your project root:
```env
VITE_FIREBASE_API_KEY=AIzaSyC...
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef...
```

### 6. Configure Authorized Domains
1. In Firebase Console, go to Authentication > Settings
2. In "Authorized domains" section, add:
   - `localhost` (for development)
   - Your production domain (when deployed)

## 🔧 Configuration Details

### Required Environment Variables
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_PROJECT_ID=your-project-id  
VITE_FIREBASE_APP_ID=your-app-id
```

### Firebase Console Settings

#### Authentication Providers
- **Email/Password**: ✅ Enabled
- **Google**: ✅ Enabled
- **Other providers**: Disabled (can be enabled later)

#### Authorized Domains
- `localhost` (development)
- `your-domain.com` (production)
- Any Replit domains if deploying on Replit

## 🧪 Testing Authentication

### 1. Start the Application
```bash
npm run dev
```

### 2. Test Email/Password Registration
1. Click "Sign Up" tab
2. Fill in: First Name, Last Name, Email, Password
3. Check "Accept Terms" 
4. Click "Create Account"

### 3. Test Email/Password Login
1. Click "Sign In" tab
2. Enter email and password
3. Click "Sign In"

### 4. Test Google Authentication
1. Click "Continue with Google" button
2. Choose Google account
3. Grant permissions
4. Should redirect back to dashboard

## 🔐 Security Configuration

### Firebase Security Rules
In Firebase Console > Authentication > Settings:

#### Password Requirements
- Minimum length: 6 characters (Firebase default)
- Can be customized in your validation schema

#### Email Verification
- Optional: Enable email verification for new accounts
- Go to Authentication > Templates to customize emails

### Environment Security
- **Never commit `.env` files** to version control
- **Use environment variables** in production
- **Rotate API keys** regularly
- **Monitor usage** in Firebase Console

## 🚀 Production Deployment

### Environment Variables
Set these in your production environment:
```env
VITE_FIREBASE_API_KEY=production-api-key
VITE_FIREBASE_PROJECT_ID=production-project-id
VITE_FIREBASE_APP_ID=production-app-id
NODE_ENV=production
```

### Authorized Domains
Add your production domain to Firebase:
1. Firebase Console > Authentication > Settings
2. Add your domain to "Authorized domains"
3. Verify domain ownership if required

### Security Best Practices
1. **Use different Firebase projects** for dev/staging/production
2. **Set up Firebase App Check** for production
3. **Enable audit logging** in Firebase Console
4. **Configure rate limiting** for auth endpoints
5. **Set up monitoring** and alerts

## 🐛 Troubleshooting

### Common Errors

#### "Firebase: Error (auth/invalid-api-key)"
- Check your `VITE_FIREBASE_API_KEY` in `.env`
- Verify the API key in Firebase Console > Project Settings

#### "Firebase: Error (auth/unauthorized-domain)"
- Add your domain to Authorized domains in Firebase Console
- Include `localhost` for development

#### "Firebase: Error (auth/project-not-found)"
- Check your `VITE_FIREBASE_PROJECT_ID` in `.env`
- Verify project ID in Firebase Console

#### Authentication not working
1. Check browser console for errors
2. Verify all environment variables are set
3. Ensure Firebase project is active
4. Check authentication method is enabled

### Debug Mode
Add this to see Firebase errors:
```javascript
// In firebase.ts
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Add for debugging (development only)
if (import.meta.env.DEV) {
  console.log('Firebase Config:', firebaseConfig);
}
```

## 📊 Features Included

### Authentication Methods
- ✅ Email/Password registration
- ✅ Email/Password login  
- ✅ Google OAuth sign-in
- ✅ Secure logout
- ✅ Remember me functionality

### User Interface
- ✅ Responsive design
- ✅ Form validation
- ✅ Password strength indicators
- ✅ Loading states
- ✅ Error handling
- ✅ Success notifications

### Dashboard Features
- ✅ User profile display
- ✅ Authentication status
- ✅ Account creation date
- ✅ Email verification status
- ✅ Provider identification (Google vs Email)

## 🔄 Next Steps

1. **Set up email verification** (optional)
2. **Add password reset** functionality
3. **Configure user profiles** in Firestore
4. **Add role-based access** control
5. **Set up analytics** and monitoring

## 📞 Support

For Firebase-specific issues:
- [Firebase Documentation](https://firebase.google.com/docs/auth)
- [Firebase Support](https://firebase.google.com/support)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase-authentication)

For project-specific issues:
- Check browser developer console
- Verify environment configuration
- Test with simple Firebase setup first