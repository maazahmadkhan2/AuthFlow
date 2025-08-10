# Android APK Build Guide

## Overview
Your Firebase web app is now ready to be converted into an Android APK for Play Store publishing. The Capacitor configuration is complete and all necessary files are set up.

## Prerequisites for Building APK

### Option 1: Build Locally (Recommended)
You'll need to set up Android development on your local machine:

1. **Install Android Studio**: Download from https://developer.android.com/studio
2. **Install Java JDK 17**: Ensure Java 17 is installed
3. **Set Environment Variables**:
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

### Option 2: Use Cloud Build Services
- **GitHub Actions**: Set up CI/CD for automatic builds
- **Bitrise**: Mobile-focused CI/CD platform
- **Codemagic**: Flutter/React Native focused but supports Capacitor

## Build Steps

### 1. Download Project Files
Download all project files to your local machine, especially the `android/` folder.

### 2. Build Web Assets
```bash
npm install
npm run build
npx cap sync android
```

### 3. Build APK
```bash
cd android
./gradlew assembleDebug  # For debug APK
./gradlew assembleRelease  # For release APK (requires signing)
```

### 4. Find Your APK
- Debug APK: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release APK: `android/app/build/outputs/apk/release/app-release.apk`

## App Configuration

### Current App Details
- **App ID**: com.authflow.app
- **App Name**: AuthFlow
- **Version**: 1.0 (versionCode: 1)

### Firebase Configuration
Your Firebase configuration is already set up with these environment variables:
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_APP_ID

### App Permissions
The app includes standard permissions for:
- Internet access (for Firebase)
- Network state (for connectivity checks)

## Play Store Publishing Requirements

### 1. App Signing
For Play Store publishing, you need to sign your APK:

```bash
# Generate keystore (do this once)
keytool -genkey -v -keystore my-upload-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias

# Sign APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-upload-key.keystore app-release-unsigned.apk my-key-alias
```

### 2. App Bundle (Recommended)
Google Play prefers App Bundles:
```bash
cd android
./gradlew bundleRelease
```
Find your bundle at: `android/app/build/outputs/bundle/release/app-release.aab`

### 3. Required Assets
- **App Icon**: Update icons in `android/app/src/main/res/drawable/` and `android/app/src/main/res/mipmap-*/`
- **Screenshots**: Take screenshots for Play Store listing
- **Description**: Write app description for Play Store

## Testing Your APK

### 1. Install on Device
```bash
adb install app-debug.apk
```

### 2. Test Features
- Firebase authentication (login/register)
- User dashboard functionality
- Admin features (if applicable)
- Offline behavior

## Troubleshooting

### Common Issues
1. **Build Errors**: Ensure Android SDK is properly installed
2. **Firebase Not Working**: Check if Firebase config is included in the build
3. **App Crashes**: Check logs with `adb logcat`

### Support
- Your app is already configured and ready to build
- All necessary Capacitor plugins are included
- Firebase authentication will work in the mobile app

## Next Steps
1. Set up local Android development environment
2. Build and test the APK
3. Create Play Store developer account
4. Prepare store listing assets
5. Upload signed APK/AAB to Play Store

Your web app has been successfully prepared for mobile conversion!