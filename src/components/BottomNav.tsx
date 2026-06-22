import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function BottomNav({ activeTab = 'Home', onTabChange = () => {} }: any) {
  const tabs = [
    { id: 'Home', icon: 'home' as any },
    { id: 'Feed', icon: 'activity' as any },
    { id: 'Exhibitors', icon: 'users' as any },
    { id: 'Schedule', icon: 'calendar' as any },
    { id: 'Profile', icon: 'user' as any },
  ];

  return (
    <>
      <TouchableOpacity style={styles.fab}>
        <MaterialCommunityIcons name="qrcode-scan" size={24} color="#fff" />
      </TouchableOpacity>
      
      <View style={styles.container}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity key={tab.id} style={styles.navItem} onPress={() => onTabChange(tab.id)}>
              <View style={[styles.iconContainer, isActive && { backgroundColor: '#eef2ff' }]}>
                <Feather name={tab.icon} size={20} color={isActive ? '#4f6cf6' : '#8e8e93'} style={!isActive && styles.singleIcon} />
              </View>
              <Text style={[styles.navText, isActive && { color: '#4f6cf6', fontWeight: '700' }]}>{tab.id}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100, // Make sure it sits above map layer
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 44,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  singleIcon: {
    marginBottom: 6,
    marginTop: 4,
  },
  navText: {
    fontSize: 10,
    color: '#8e8e93',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 100,
  }
});
