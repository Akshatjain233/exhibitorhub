import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function Header() {
  return (
    <View style={styles.container}>
      {/* Left side */}
      <View style={styles.leftContainer}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>IME</Text>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>India Manufacturing Expo 2...</Text>
          <Text style={styles.subtitle}>Pragati Maidan · New Delhi</Text>
          <Text style={styles.subtitle}>17–20 September 2026</Text>
        </View>
      </View>

      {/* Right side */}
      <View style={styles.iconsContainer}>
        <TouchableOpacity style={styles.iconButton}>
          <Feather name="search" size={20} color="#111" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={20} color="#111" />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>
        <Image
          style={styles.profilePic}
          source={{ uri: 'https://i.pravatar.cc/100?img=33' }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
  },
  subtitle: {
    fontSize: 11,
    color: '#777',
    marginTop: 2,
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#eb4d4b',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#f6f7fa',
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '700',
  },
  profilePic: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginLeft: 8,
  },
});
