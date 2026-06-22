import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function QuickAccess() {
  const items = [
    { id: 1, title: 'Feed', subtitle: 'Latest updates', icon: 'activity', color: '#4f6cf6', bgColor: '#eef2ff', library: 'Feather' },
    { id: 2, title: 'Exhibitors', subtitle: '1,200+ companies', icon: 'business', color: '#8e44ad', bgColor: '#f4ebfa', library: 'Ionicons' },
    { id: 3, title: 'Schedule', subtitle: '18 sessions', icon: 'calendar', color: '#d35400', bgColor: '#fbf0e9', library: 'Feather' },
    { id: 4, title: 'Bookmarks', subtitle: 'Saved items', icon: 'bookmark', color: '#eb4d4b', bgColor: '#ffeef0', library: 'Feather' },
    { id: 5, title: 'Downloads', subtitle: 'Brochures & docs', icon: 'download', color: '#27ae60', bgColor: '#ebfdf2', library: 'Feather' },
    { id: 6, title: 'Gallery', subtitle: 'Event photos', icon: 'camera', color: '#9b59b6', bgColor: '#f4ebfa', library: 'Feather' },
  ];

  const renderIcon = (item: any) => {
    if (item.library === 'Feather') {
      return <Feather name={item.icon} size={24} color={item.color} />;
    } else if (item.library === 'Ionicons') {
      return <Ionicons name={item.icon} size={24} color={item.color} />;
    }
    return <MaterialIcons name={item.icon} size={24} color={item.color} />;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Quick Access</Text>

      <View style={styles.grid}>
        {items.map((item) => (
          <TouchableOpacity key={item.id} style={styles.card}>
            <View style={[styles.iconContainer, { backgroundColor: item.bgColor }]}>
              {renderIcon(item)}
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 8,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 10,
    color: '#8e8e93',
    textAlign: 'center',
  },
});
