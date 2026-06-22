import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Animated } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const MenuItem = ({ icon, title, subtitle, onPress }: any) => {
  return (
    <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.menuIconContainer}>
        <Feather name={icon} size={20} color="#1f7ae0" />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      <Feather name="chevron-right" size={20} color="#c7c7cc" />
    </TouchableOpacity>
  );
};

const SimpleMenuItem = ({ title, isLast, onPress }: any) => {
  return (
    <TouchableOpacity style={[styles.simpleMenuItem, !isLast && styles.borderBottom]} activeOpacity={0.7} onPress={onPress}>
      <Text style={styles.simpleMenuTitle}>{title}</Text>
      <Feather name="chevron-right" size={20} color="#c7c7cc" />
    </TouchableOpacity>
  );
};

export default function UserProfileScreen({ onBack, onLogout }: { onBack?: () => void, onLogout?: () => void }) {
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Top App Bar */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
              <Feather name="chevron-left" size={28} color="#111" />
            </TouchableOpacity>
          )}
          <Text style={styles.appBarTitle}>Profile</Text>
        </View>
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
          <Ionicons name="notifications-outline" size={24} color="#111" />
          <View style={styles.badge} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <AnimatedTouchableOpacity 
          style={[styles.headerCard, { transform: [{ scale: scaleAnim }] }]}
          activeOpacity={0.9}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Image source={{ uri: 'https://i.pravatar.cc/300?img=12' }} style={styles.avatar} />
          <Text style={styles.userName}>Akshat Jain</Text>
          <Text style={styles.userInfo}>akshat.jain@example.com</Text>
          <Text style={styles.userInfo}>+91 98765 43210</Text>
          <View style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </View>
        </AnimatedTouchableOpacity>

        {/* Account Section */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.cardGroup}>
          <SimpleMenuItem title="Personal Information" />
          <SimpleMenuItem title="Login & Security" />
          <SimpleMenuItem title="Change Password" isLast />
        </View>

        {/* My Activity Section */}
        <Text style={styles.sectionTitle}>My Activity</Text>
        <View style={styles.cardGroup}>
          <MenuItem icon="bookmark" title="My Bookmarks" subtitle="Saved exhibitors and products" />
          <View style={styles.divider} />
          <MenuItem icon="calendar" title="My Schedule" subtitle="Your planned sessions" />
          <View style={styles.divider} />
          <MenuItem icon="download" title="Downloaded Files" subtitle="Brochures and floor maps" />
        </View>

        {/* Settings Section */}
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.cardGroup}>
          <SimpleMenuItem title="Language" />
          <SimpleMenuItem title="Notification Preferences" />
          <SimpleMenuItem title="Privacy Policy" />
          <SimpleMenuItem title="Terms & Conditions" />
          <SimpleMenuItem title="About App" isLast />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.8} onPress={onLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f7f8fb',
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f7f8fb',
    zIndex: 10,
  },
  appBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 4,
    marginLeft: -8,
  },
  appBarTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111',
    letterSpacing: -0.5,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff3b30',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120, // space for bottom nav
  },
  headerCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 3,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    backgroundColor: '#eee',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  userInfo: {
    fontSize: 15,
    color: '#8e8e93',
    marginBottom: 4,
  },
  editButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#f2f2f7',
    borderRadius: 20,
  },
  editButtonText: {
    color: '#111',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8e8e93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 16,
    marginBottom: 8,
  },
  cardGroup: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
    overflow: 'hidden',
  },
  simpleMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  borderBottom: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5ea',
  },
  simpleMenuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f2f7fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#8e8e93',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e5e5ea',
    marginLeft: 72,
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ff3b3020',
  },
  logoutText: {
    color: '#ff3b30',
    fontSize: 16,
    fontWeight: '700',
  },
});
