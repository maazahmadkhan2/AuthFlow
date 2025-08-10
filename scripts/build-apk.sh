#!/bin/bash

# APK Build Script for AuthFlow App
# This script builds the web assets and prepares Android project for APK generation

echo "🚀 Building AuthFlow Android APK..."

# Step 1: Build web assets
echo "📦 Building web assets..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Web build failed"
    exit 1
fi

# Step 2: Sync assets to Android
echo "🔄 Syncing assets to Android project..."
npx cap sync android
if [ $? -ne 0 ]; then
    echo "❌ Capacitor sync failed"
    exit 1
fi

# Step 3: Copy assets
echo "📋 Copying web assets..."
npx cap copy android
if [ $? -ne 0 ]; then
    echo "❌ Asset copy failed"
    exit 1
fi

echo "✅ Build preparation complete!"
echo ""
echo "📱 Next steps:"
echo "1. Open Android Studio or use command line with Android SDK"
echo "2. Navigate to android/ folder"
echo "3. Run: ./gradlew assembleDebug (for debug APK)"
echo "4. Run: ./gradlew assembleRelease (for release APK)"
echo ""
echo "📍 APK will be located at:"
echo "  Debug: android/app/build/outputs/apk/debug/app-debug.apk"
echo "  Release: android/app/build/outputs/apk/release/app-release.apk"
echo ""
echo "🎯 Your app is ready for Android building!"