import React, { useState } from 'react';
import { View, Text } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import ExhibitorsScreen from '../screens/ExhibitorsScreen';
import ExhibitorProfileScreen from '../screens/ExhibitorProfileScreen';
import GenericListScreen from '../screens/GenericListScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import SessionDetailsScreen from '../screens/SessionDetailsScreen';
import BottomNav from '../components/BottomNav';

interface VisitorNavigatorProps {
  onLogout: () => void;
}

export default function VisitorNavigator({ onLogout }: VisitorNavigatorProps) {
  const [activeTab, setActiveTab] = useState('Home');
  const [view, setView] = useState('Home');
  const [previousTab, setPreviousTab] = useState('Home');

  const renderScreen = () => {
    if (view === 'Home') {
      return <HomeScreen />;
    }

    if (view === 'Feed') {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Feed coming soon...</Text>
        </View>
      );
    }

    if (view === 'Schedule') {
      return <ScheduleScreen onOpenDetails={() => setView('SessionDetails')} />;
    }

    if (view === 'SessionDetails') {
      return <SessionDetailsScreen onBack={() => setView('Schedule')} />;
    }

    if (view === 'ExhibitorProfile') {
      return <ExhibitorProfileScreen onBack={() => setView('Exhibitors')} onViewAll={(category) => setView(category)} />;
    }

    if (['products', 'gallery', 'videos', 'brochures'].includes(view)) {
      return <GenericListScreen category={view} onBack={() => setView('ExhibitorProfile')} />;
    }

    if (view === 'Exhibitors') {
      return <ExhibitorsScreen onOpenProfile={() => setView('ExhibitorProfile')} />;
    }

    return <UserProfileScreen onBack={() => setView(previousTab)} onLogout={onLogout} />;
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'Profile') {
      setPreviousTab(activeTab !== 'Profile' ? activeTab : previousTab);
      setActiveTab('Profile');
      setView('Profile');
      return;
    }

    setActiveTab(tab);
    setView(tab);
    if (tab !== 'ExhibitorProfile' && tab !== 'Profile' && tab !== 'SessionDetails') {
      setPreviousTab(tab);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f6f7fa' }}>
      {renderScreen()}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </View>
  );
}
