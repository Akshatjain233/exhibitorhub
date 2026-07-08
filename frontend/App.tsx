import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import LoginScreen from './src/screens/LoginScreen';
import VisitorNavigator from './src/navigation/VisitorNavigator';
import ExhibitorNavigator from './src/navigation/ExhibitorNavigator';
import {
  clearStoredSession,
  loadStoredSession,
  loginWithEmailPassword,
  registerWithEmailPassword,
  saveSession,
  type AppRole,
  type AuthSession,
} from './src/services/auth';

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const hydrateSession = async () => {
      try {
        const storedSession = await loadStoredSession();
        if (isMounted) {
          setSession(storedSession);
        }
      } finally {
        if (isMounted) {
          setBootstrapping(false);
        }
      }
    };

    void hydrateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogin = async ({ email, password }: { email: string; password: string }) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      const result = await loginWithEmailPassword(email, password);
      setSession(result);
      await saveSession(result);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to login right now.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignup = async ({ email, password }: { email: string; password: string }) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      const result = await registerWithEmailPassword(email, password);
      setSession(result);
      await saveSession(result);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to sign up right now.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setAuthError(null);
    const guestSession = {
      token: 'guest-demo-session',
      role: 'user',
      email: 'user@gmail.com',
      isGuest: true,
    } satisfies AuthSession;

    setSession(guestSession);
    await saveSession(guestSession);
  };

  const handleLogout = () => {
    setSession(null);
    setAuthError(null);
    void clearStoredSession();
  };

  if (bootstrapping) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f7f8fb', alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#1f7ae0" />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  const renderContent = () => {
    if (session === null) {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f7f8fb' }}>
          <LoginScreen 
            onLogin={handleLogin}
            onSignUp={handleSignup}
            onEnterExhibitorDemo={handleGuestLogin}
            isLoading={authLoading}
            errorMessage={authError}
          />
        </SafeAreaView>
      );
    }

    if (session.role === 'user') {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f2f3f7' }}>
          <VisitorNavigator onLogout={handleLogout} />
        </SafeAreaView>
      );
    }

    if (session.role === 'exhibitor') {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f2f3f7' }}>
          <ExhibitorNavigator onLogout={handleLogout} />
        </SafeAreaView>
      );
    }

    return null;
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {renderContent()}
    </SafeAreaProvider>
  );
}
