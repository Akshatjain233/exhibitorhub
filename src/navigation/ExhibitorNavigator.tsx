import React, { useState } from 'react';
import { View, Text } from 'react-native';
import ExhibitorDashboardScreen from '../screens/ExhibitorDashboardScreen';
import ExhibitorOnboardingScreen from '../screens/ExhibitorOnboardingScreen';
import ExhibitorWizardScreen from '../screens/ExhibitorWizardScreen';
import ExhibitorBottomNav from '../components/ExhibitorBottomNav';

interface ExhibitorNavigatorProps {
  onLogout: () => void;
}

export default function ExhibitorNavigator({ onLogout }: ExhibitorNavigatorProps) {
  const [onboardingState, setOnboardingState] = useState({
    isPublished: false,
    currentStep: 0, // 0 = Welcome, 1-8 = Wizard Steps
  });
  
  const [activeTab, setActiveTab] = useState('Dashboard');

  const advanceStep = () => {
    setOnboardingState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
  };

  const goBackStep = () => {
    setOnboardingState(prev => ({ 
      ...prev, 
      currentStep: Math.max(0, prev.currentStep - 1) 
    }));
  };

  const publishBooth = () => {
    setOnboardingState(prev => ({ ...prev, isPublished: true }));
  };

  // If not published, force the user through the wizard
  if (!onboardingState.isPublished) {
    if (onboardingState.currentStep === 0) {
      return <ExhibitorOnboardingScreen onContinue={advanceStep} />;
    }

    return (
      <ExhibitorWizardScreen
        stepIndex={onboardingState.currentStep}
        onNext={advanceStep}
        onBack={goBackStep}
        onSaveDraft={() => console.log('Saved draft at step', onboardingState.currentStep)}
        onSkip={advanceStep}
        onPublish={publishBooth}
      />
    );
  }

  // Once published, allow access to Dashboard and other tabs
  const renderScreen = () => {
    if (activeTab === 'Dashboard') {
      return <ExhibitorDashboardScreen onLogout={onLogout} />;
    }

    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, color: '#8e8e93' }}>{activeTab} module coming soon...</Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f6f7fa' }}>
      {renderScreen()}
      <ExhibitorBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </View>
  );
}
