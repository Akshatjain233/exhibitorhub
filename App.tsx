import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import LoginScreen from './src/screens/LoginScreen';
import VisitorNavigator from './src/navigation/VisitorNavigator';
import ExhibitorNavigator from './src/navigation/ExhibitorNavigator';

type AppMode = "visitor" | "exhibitor" | null;

export default function App() {
  const [appMode, setAppMode] = useState<AppMode>(null);

  const renderContent = () => {
    if (appMode === null) {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f7f8fb' }}>
          <LoginScreen 
            onLogin={() => setAppMode('visitor')} 
            onEnterExhibitorDemo={() => setAppMode('exhibitor')} 
          />
        </SafeAreaView>
      );
    }

    if (appMode === 'visitor') {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f2f3f7' }}>
          <VisitorNavigator onLogout={() => setAppMode(null)} />
        </SafeAreaView>
      );
    }

    if (appMode === 'exhibitor') {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f2f3f7' }}>
          <ExhibitorNavigator onLogout={() => setAppMode(null)} />
        </SafeAreaView>
      );
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {renderContent()}
    </SafeAreaProvider>
  );
}
