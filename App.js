
import { registerRootComponent } from 'expo';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform } from 'react-native';

// Import your existing React app
import WebApp from './client/src/App';

export default function App() {
  if (Platform.OS === 'web') {
    // For web, use your existing React app
    return (
      <>
        <WebApp />
        <StatusBar style="auto" />
      </>
    );
  }
  
  // For mobile, you'll need to create a React Native version
  // For now, we'll use the web version wrapped
  return (
    <>
      <WebApp />
      <StatusBar style="auto" />
    </>
  );
}

registerRootComponent(App);
