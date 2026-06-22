import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Animated } from 'react-native';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const exhibitor = {
  companyName: "ABC Automation Pvt. Ltd.",
  booth: "Hall A • A-24",
  hall: "Hall A",
};

const quickActions = [
  { id: '1', icon: 'plus-square', title: 'Add Product', desc: 'Add new catalog item' },
  { id: '2', icon: 'edit', title: 'Edit Profile', desc: 'Update company info' },
  { id: '3', icon: 'image', title: 'Manage Gallery', desc: 'Upload booth photos' },
  { id: '4', icon: 'file-text', title: 'Brochures', desc: 'Upload PDF documents' },
  { id: '5', icon: 'mic', title: 'Announcements', desc: 'Broadcast to visitors' },
  { id: '6', icon: 'map-pin', title: 'Booth Info', desc: 'Update location details' },
];

const kpis = [
  { label: 'Products', value: '24' },
  { label: 'Gallery', value: '18' },
  { label: 'Documents', value: '6' },
  { label: 'Announcements', value: '4' },
];

const activities = [
  { id: '1', title: 'Product "Industrial Robot X1" added', time: '2 hours ago' },
  { id: '2', title: 'Company profile updated', time: 'Yesterday' },
  { id: '3', title: 'Brochure uploaded', time: 'Yesterday' },
  { id: '4', title: 'Gallery updated', time: '3 days ago' },
];

export default function ExhibitorDashboardScreen({ onLogout }: { onLogout?: () => void }) {
  const insets = useSafeAreaInsets();
  
  // Just a simple scale animation for the main welcome card
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      
      {/* Demo Banner */}
      <View style={styles.demoBanner}>
        <Text style={styles.demoBannerText}>Demo Mode: Exhibitor Portal</Text>
      </View>

      {/* Top App Bar */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>ABC</Text>
          </View>
          <View>
            <Text style={styles.companyName} numberOfLines={1}>{exhibitor.companyName}</Text>
            <Text style={styles.boothText}>{exhibitor.booth}</Text>
          </View>
        </View>
        <View style={styles.appBarRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={22} color="#111" />
            <View style={styles.badge} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onLogout}>
            <Image source={{ uri: 'https://i.pravatar.cc/100?img=11' }} style={styles.avatar} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Welcome Card */}
        <AnimatedTouchableOpacity 
          style={[styles.welcomeCard, { transform: [{ scale: scaleAnim }] }]}
          activeOpacity={0.9}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Text style={styles.welcomeTitle}>Welcome Back 👋</Text>
          <Text style={styles.welcomeSubtitle}>{exhibitor.companyName}</Text>
          <Text style={styles.welcomeDesc}>Manage your exhibition content and keep your booth information updated.</Text>
          <View style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>View Public Profile</Text>
          </View>
        </AnimatedTouchableOpacity>

        {/* Content KPIs */}
        <Text style={styles.sectionTitle}>Your Content</Text>
        <View style={styles.kpiRow}>
          {kpis.map((kpi) => (
            <View key={kpi.label} style={styles.kpiCard}>
              <Text style={styles.kpiValue}>{kpi.value}</Text>
              <Text style={styles.kpiLabel}>{kpi.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.grid}>
          {quickActions.map((action) => (
            <TouchableOpacity key={action.id} style={styles.gridCard} activeOpacity={0.8}>
              <View style={styles.gridIconWrap}>
                <Feather name={action.icon as any} size={20} color="#1f7ae0" />
              </View>
              <Text style={styles.gridTitle}>{action.title}</Text>
              <Text style={styles.gridDesc}>{action.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Profile Status */}
        <Text style={styles.sectionTitle}>Profile Status</Text>
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Profile Completion</Text>
            <Text style={styles.statusPercent}>85%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '85%' }]} />
          </View>
          
          <View style={styles.checklist}>
            <View style={styles.checkItem}>
              <MaterialIcons name="check-circle" size={18} color="#10b981" />
              <Text style={styles.checkText}>Company Profile</Text>
            </View>
            <View style={styles.checkItem}>
              <MaterialIcons name="check-circle" size={18} color="#10b981" />
              <Text style={styles.checkText}>Contact Details</Text>
            </View>
            <View style={styles.checkItem}>
              <MaterialIcons name="check-circle" size={18} color="#10b981" />
              <Text style={styles.checkText}>Products</Text>
            </View>
            <View style={styles.checkItem}>
              <MaterialIcons name="check-circle" size={18} color="#10b981" />
              <Text style={styles.checkText}>Booth Information</Text>
            </View>
            <View style={styles.checkItem}>
              <MaterialIcons name="error" size={18} color="#f59e0b" />
              <Text style={styles.checkTextPending}>Upload Company Video</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Complete Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          {activities.map((act, index) => (
            <View key={act.id} style={[styles.activityRow, index !== activities.length - 1 && styles.borderBottom]}>
              <Feather name="check" size={16} color="#10b981" style={{ marginTop: 2 }} />
              <View style={styles.activityTextWrap}>
                <Text style={styles.activityTitle}>{act.title}</Text>
                <Text style={styles.activityTime}>{act.time}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Space for bottom nav */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={[styles.fab, { bottom: Math.max(insets.bottom, 16) + 80 }]} activeOpacity={0.9}>
        <Feather name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f6f7fa',
  },
  demoBanner: {
    backgroundColor: '#ff3b30',
    paddingVertical: 6,
    alignItems: 'center',
  },
  demoBannerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f7',
  },
  appBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 16,
  },
  logoPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#1f7ae0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  companyName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
  },
  boothText: {
    fontSize: 13,
    color: '#8e8e93',
    fontWeight: '500',
    marginTop: 2,
  },
  appBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff3b30',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  content: {
    padding: 20,
  },
  welcomeCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f2f2f7',
  },
  welcomeTitle: {
    fontSize: 15,
    color: '#8e8e93',
    fontWeight: '600',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  welcomeDesc: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#111',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
    marginBottom: 12,
    marginLeft: 4,
  },
  kpiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  kpiCard: {
    flex: 1,
    minWidth: '40%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f2f2f7',
  },
  kpiValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111',
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 13,
    color: '#8e8e93',
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  gridCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f2f2f7',
  },
  gridIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eef5ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  gridTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  gridDesc: {
    fontSize: 12,
    color: '#8e8e93',
    lineHeight: 16,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f2f2f7',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },
  statusPercent: {
    fontSize: 20,
    fontWeight: '800',
    color: '#10b981',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#f1f3f7',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  checklist: {
    gap: 12,
    marginBottom: 20,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkText: {
    fontSize: 14,
    color: '#111',
    fontWeight: '500',
  },
  checkTextPending: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '500',
  },
  secondaryButton: {
    backgroundColor: '#f5f7fb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#111',
    fontSize: 14,
    fontWeight: '700',
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f2f2f7',
  },
  activityRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  borderBottom: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5ea',
  },
  activityTextWrap: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    color: '#111',
    fontWeight: '600',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#8e8e93',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1f7ae0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1f7ae0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
});
