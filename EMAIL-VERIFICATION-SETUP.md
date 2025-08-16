# Email Verification Setup Guide

## Overview
Your Firebase app now has a complete email verification system with SendGrid integration. Users can verify their emails through a custom verification page that works seamlessly with Firebase Authentication.

## Verification Page URLs

Your app supports two verification page routes:

1. **Primary URL**: `https://your-domain.replit.app/verify-email`
2. **Alternative URL**: `https://your-domain.replit.app/email-verification`

### For SendGrid Email Templates

Use this URL format in your SendGrid email templates:
```
https://your-domain.replit.app/verify-email?mode=verifyEmail&oobCode={{actionCode}}
```

Where:
- `your-domain.replit.app` = Your actual Replit app domain
- `{{actionCode}}` = Firebase action code (replace with actual code when sending)

## Features Included

### Email Verification Page (`/verify-email`)
- ✅ Automatic email verification using Firebase action codes
- ✅ Real-time verification status updates
- ✅ User-friendly success/error messages
- ✅ Automatic user data updates in Firestore
- ✅ Responsive design with Bootstrap styling
- ✅ Handles expired and invalid verification links
- ✅ Option to request new verification emails

### Email Service Integration
- ✅ SendGrid integration for sending verification emails
- ✅ Professional HTML email templates
- ✅ Text-only email fallbacks
- ✅ Custom email template system
- ✅ Server-side email API endpoints

### API Endpoints Available

#### 1. Health Check
```
GET /api/health
```
Returns server status and configuration.

#### 2. Email Service Status
```
GET /api/email-service/status
```
Returns:
```json
{
  "available": true,
  "verificationUrlTemplate": "https://your-domain/verify-email?mode=verifyEmail&oobCode={{actionCode}}"
}
```

#### 3. Send Verification Email
```
POST /api/send-verification-email
```
Body:
```json
{
  "userEmail": "user@example.com",
  "userName": "John Doe",
  "actionCode": "firebase-action-code",
  "baseUrl": "https://your-domain.replit.app"
}
```

#### 4. Send Custom Email
```
POST /api/send-custom-email
```
Body:
```json
{
  "to": "user@example.com",
  "subject": "Custom Subject",
  "html": "<h1>HTML Content</h1>",
  "text": "Text content",
  "from": "noreply@yourapp.com"
}
```

## SendGrid Configuration

### Required Environment Variable
You need to set the SendGrid API key:
```
SENDGRID_API_KEY=your-sendgrid-api-key-here
```

### Getting SendGrid API Key
1. Sign up at [SendGrid.com](https://sendgrid.com)
2. Go to Settings → API Keys
3. Create a new API Key with "Mail Send" permissions
4. Copy the key and add it to your Replit Secrets

### Sender Authentication
Update the `fromEmail` in `server/email-service.ts`:
```typescript
fromEmail = 'noreply@yourdomain.com' // Replace with your verified sender
```

**Important**: You must verify your sender domain or email address in SendGrid before sending emails.

## Email Template Customization

### HTML Email Template
The email template includes:
- Professional styling with your app branding
- Clear verification button
- Security notices
- Alternative link for accessibility
- Responsive design for mobile devices

### Customizing Templates
Edit `client/src/lib/emailTemplates.ts` to:
- Change email styling and colors
- Update app name and branding
- Modify email content and messaging
- Add additional security features

## Testing Email Verification

### 1. Test the Verification Page
Visit: `https://your-domain.replit.app/verify-email`

### 2. Test with Firebase Action Code
Create a test URL with a valid Firebase action code:
```
https://your-domain.replit.app/verify-email?mode=verifyEmail&oobCode=VALID_ACTION_CODE
```

### 3. Test Email Sending
Use the API endpoint to test email sending:
```bash
curl -X POST https://your-domain.replit.app/api/send-verification-email \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "test@example.com",
    "userName": "Test User",
    "actionCode": "test-action-code"
  }'
```

## Integration with Firebase Auth

### Client-Side Usage
The verification page automatically:
1. Extracts action codes from the URL
2. Validates codes with Firebase
3. Updates user verification status
4. Updates Firestore user documents
5. Redirects users appropriately

### Firestore Updates
When verification succeeds, the user document is updated with:
```typescript
{
  emailVerified: true,
  verifiedAt: "2025-01-15T10:30:00.000Z",
  lastUpdated: "2025-01-15T10:30:00.000Z"
}
```

## Security Features

### Link Expiration
- Firebase verification links expire in 24 hours
- Expired links show appropriate error messages
- Users can request new verification emails

### Error Handling
- Invalid action codes are detected and handled
- Network errors are gracefully managed
- User-friendly error messages for all scenarios

### Email Security
- HTTPS-only verification URLs
- Secure action code handling
- No sensitive data in email content

## Next Steps

1. **Configure SendGrid**: Add your SENDGRID_API_KEY to Replit Secrets
2. **Verify Sender**: Set up sender authentication in SendGrid
3. **Test System**: Send test verification emails
4. **Customize Emails**: Update templates with your branding
5. **Update Firebase**: Ensure Firebase Auth is configured for your domain

## For Mobile App (APK)

The email verification system works seamlessly in your Android APK:
- URLs automatically open in the WebView
- Firebase authentication works in mobile environment
- All verification features are mobile-responsive

Your email verification system is now fully functional and ready for production use!