import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Animated, Modal, Pressable } from 'react-native';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const exhibitor = {
  companyName: 'ABC Automation Pvt. Ltd.',
  logoInitials: 'AB',
  exhibitionName: 'India Manufacturing Expo 2026',
  hall: 'Hall A',
  booth: 'A-24',
  status: 'published' as 'published' | 'draft',
  profileCompletion: 85,
};

const quickActions = [
  { id: 'add-product', icon: 'plus-square', title: 'Add Product', desc: 'Add a new catalog item' },
  { id: 'manage-products', icon: 'box', title: 'Manage Products', desc: 'Edit your catalog' },
  { id: 'manage-media', icon: 'image', title: 'Manage Media', desc: 'Photos & videos' },
  { id: 'upload-brochures', icon: 'file-text', title: 'Upload Brochures', desc: 'PDF documents' },
  { id: 'edit-profile', icon: 'edit-3', title: 'Edit Company Profile', desc: 'Update company info' },
  { id: 'announcement', icon: 'mic', title: 'Create Announcement', desc: 'Broadcast to visitors' },
];

const boothChecklist = [
  { id: '1', label: 'Company Information', done: true },
  { id: '2', label: 'Contact Information', done: true },
  { id: '3', label: 'Products', done: true },
  { id: '4', label: 'Media & Documents', done: false },
  { id: '5', label: 'Published', done: true },
];

const scheduleItems = [
  { id: '1', time: '09:00 AM', title: 'Opening Ceremony', location: 'Main Auditorium', dotColor: '#4f6cf6', reminder: true },
  { id: '2', time: '11:30 AM', title: 'Product Demonstration', location: 'Hall A · Booth A-24', dotColor: '#10b981', reminder: true },
  { id: '3', time: '01:00 PM', title: 'Customer Meeting', location: 'Meeting Room 2', dotColor: '#f59e0b', reminder: false },
  { id: '4', time: '03:00 PM', title: 'Live Demo', location: 'Hall A · Booth A-24', dotColor: '#ff3b30', reminder: true, isLive: true },
  { id: '5', time: '05:30 PM', title: 'Networking Session', location: 'Innovation Hub', dotColor: '#4f6cf6', reminder: false },
];

const recentUpdates = [
  { id: '1', title: 'Product "Industrial Robot X1" added', time: '2 hours ago' },
  { id: '2', title: 'Gallery updated', time: 'Yesterday' },
  { id: '3', title: 'Brochure uploaded', time: 'Yesterday' },
  { id: '4', title: 'Company profile edited', time: '3 days ago' },
  { id: '5', title: 'Announcement published', time: '4 days ago' },
];

const notifications = [
  { id: '1', icon: 'clock', iconColor: '#f59e0b', iconBg: '#fff7e6', text: 'Hall A timing updated for tomorrow' },
  { id: '2', icon: 'bell', iconColor: '#1f7ae0', iconBg: '#eef5ff', text: 'Reminder: Product Demonstration in 2 hours' },
  { id: '3', icon: 'check-circle', iconColor: '#10b981', iconBg: '#ecfdf5', text: 'Your announcement was approved' },
  { id: '4', icon: 'upload', iconColor: '#8e8e93', iconBg: '#f1f3f7', text: 'Document upload successful' },
];

const fabActions = [
  { id: 'add-product', icon: 'plus-square', label: 'Add Product' },
  { id: 'upload-media', icon: 'image', label: 'Upload Media' },
  { id: 'upload-brochure', icon: 'file-text', label: 'Upload Brochure' },
  { id: 'create-announcement', icon: 'mic', label: 'Create Announcement' },
];

export default function ExhibitorDashboardScreen({ onLogout }: { onLogout?: () => void }) {
  const insets = useSafeAreaInsets();
  const [fabMenuOpen, setFabMenuOpen] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

  const isPublished = exhibitor.status === 'published';
  const isBoothComplete = boothChecklist.every((item) => item.done);

  return (
    <View style={styles.screen}>

      {/* Demo Banner */}
      <View style={styles.demoBanner}>
        <Text style={styles.demoBannerText}>Demo Mode: Exhibitor Portal</Text>
      </View>

      {/* Top App Bar */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>{exhibitor.logoInitials}</Text>
          </View>
          <View>
            <Text style={styles.companyName} numberOfLines={1}>{exhibitor.companyName}</Text>
            <Text style={styles.boothText}>{exhibitor.hall} • {exhibitor.booth}</Text>
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

        {/* Hero Card */}
        <AnimatedTouchableOpacity
          style={[styles.heroCard, { transform: [{ scale: scaleAnim }] }]}
          activeOpacity={0.9}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <View style={styles.heroTopRow}>
            <View style={styles.heroLogoWrap}>
              <Text style={styles.heroLogoText}>{exhibitor.logoInitials}</Text>
            </View>
            <View style={styles.heroIdentity}>
              <Text style={styles.heroCompanyName} numberOfLines={1}>{exhibitor.companyName}</Text>
              <Text style={styles.heroExhibitionName} numberOfLines={1}>{exhibitor.exhibitionName}</Text>
            </View>
            <View style={[styles.statusPill, isPublished ? styles.statusPillLive : styles.statusPillDraft]}>
              <View style={[styles.statusDot, { backgroundColor: isPublished ? '#10b981' : '#8e8e93' }]} />
              <Text style={[styles.statusPillText, { color: isPublished ? '#10b981' : '#8e8e93' }]}>
                {isPublished ? 'Published' : 'Draft'}
              </Text>
            </View>
          </View>

          <View style={styles.heroBoothRow}>
            <Feather name="map-pin" size={13} color="#8e8e93" />
            <Text style={styles.heroBoothText}>{exhibitor.hall} · Booth {exhibitor.booth}</Text>
          </View>

          <View style={styles.heroProgressRow}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${exhibitor.profileCompletion}%` }]} />
            </View>
            <Text style={styles.heroProgressText}>{exhibitor.profileCompletion}% complete</Text>
          </View>

          <View style={styles.heroButtonRow}>
            <TouchableOpacity style={styles.primaryButton} activeOpacity={0.85}>
              <Feather name="external-link" size={15} color="#fff" />
              <Text style={styles.primaryButtonText}>View Public Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.heroSecondaryButton} activeOpacity={0.85}>
              <Feather name="share-2" size={15} color="#111" />
              <Text style={styles.heroSecondaryButtonText}>Share QR</Text>
            </TouchableOpacity>
          </View>
        </AnimatedTouchableOpacity>

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

        {/* Booth Completion */}
        <Text style={styles.sectionTitle}>Booth Completion</Text>
        <View style={styles.statusCard}>
          <View style={styles.checklist}>
            {boothChecklist.map((item) => (
              <View key={item.id} style={styles.checkItem}>
                <MaterialIcons
                  name={item.done ? 'check-circle' : 'radio-button-unchecked'}
                  size={18}
                  color={item.done ? '#10b981' : '#c7c7cc'}
                />
                <Text style={item.done ? styles.checkText : styles.checkTextPending}>{item.label}</Text>
              </View>
            ))}
          </View>

          {!isBoothComplete && (
            <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.85}>
              <Text style={styles.secondaryButtonText}>Continue Editing</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* My Schedule */}
        <Text style={styles.sectionTitle}>My Schedule</Text>
        <View style={styles.scheduleCard}>
          {scheduleItems.map((item, index) => (
            <View key={item.id} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View style={[styles.dotContainer, { borderColor: item.isLive ? '#ffcccc' : '#eef2ff' }]}>
                  <View style={[styles.dot, { backgroundColor: item.dotColor }]} />
                </View>
                {index !== scheduleItems.length - 1 && <View style={styles.line} />}
              </View>

              <View style={[styles.scheduleContent, index !== scheduleItems.length - 1 && styles.scheduleContentBorder]}>
                <View style={styles.scheduleTimeRow}>
                  <Text style={[styles.scheduleTime, { color: item.dotColor }]}>{item.time}</Text>
                  {item.isLive && (
                    <View style={styles.liveTag}>
                      <Text style={styles.liveTagText}>LIVE</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.scheduleTitle}>{item.title}</Text>
                <View style={styles.scheduleLocationRow}>
                  <Feather name="map-pin" size={12} color="#8e8e93" />
                  <Text style={styles.scheduleLocationText}>{item.location}</Text>
                  <Ionicons
                    name={item.reminder ? 'notifications' : 'notifications-outline'}
                    size={14}
                    color={item.reminder ? '#1f7ae0' : '#c7c7cc'}
                    style={styles.reminderIcon}
                  />
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.viewScheduleButton} activeOpacity={0.8}>
            <Text style={styles.viewScheduleText}>View Full Schedule</Text>
            <Feather name="chevron-right" size={14} color="#1f7ae0" />
          </TouchableOpacity>
        </View>

        {/* Recent Updates */}
        <Text style={styles.sectionTitle}>Recent Updates</Text>
        <View style={styles.activityCard}>
          {recentUpdates.map((act, index) => (
            <View key={act.id} style={[styles.activityRow, index !== recentUpdates.length - 1 && styles.borderBottom]}>
              <Feather name="check" size={16} color="#10b981" style={{ marginTop: 2 }} />
              <View style={styles.activityTextWrap}>
                <Text style={styles.activityTitle}>{act.title}</Text>
                <Text style={styles.activityTime}>{act.time}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Notifications */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.notificationsCard}>
          {notifications.map((note, index) => (
            <View key={note.id} style={[styles.notificationRow, index !== notifications.length - 1 && styles.borderBottom]}>
              <View style={[styles.notificationIconWrap, { backgroundColor: note.iconBg }]}>
                <Feather name={note.icon as any} size={15} color={note.iconColor} />
              </View>
              <Text style={styles.notificationText}>{note.text}</Text>
            </View>
          ))}

          <TouchableOpacity style={styles.viewScheduleButton} activeOpacity={0.8}>
            <Text style={styles.viewScheduleText}>View All Notifications</Text>
            <Feather name="chevron-right" size={14} color="#1f7ae0" />
          </TouchableOpacity>
        </View>

        {/* Space for bottom nav */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { bottom: Math.max(insets.bottom, 16) + 80 }]}
        activeOpacity={0.9}
        onPress={() => setFabMenuOpen(true)}
      >
        <Feather name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      {/* FAB Quick Action Menu */}
      <Modal visible={fabMenuOpen} transparent animationType="fade" onRequestClose={() => setFabMenuOpen(false)}>
        <Pressable style={styles.fabBackdrop} onPress={() => setFabMenuOpen(false)}>
          <View style={[styles.fabMenuCard, { marginBottom: Math.max(insets.bottom, 16) + 150 }]}>
            {fabActions.map((action, index) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.fabMenuRow, index !== fabActions.length - 1 && styles.borderBottom]}
                activeOpacity={0.7}
                onPress={() => setFabMenuOpen(false)}
              >
                <View style={styles.fabMenuIconWrap}>
                  <Feather name={action.icon as any} size={18} color="#1f7ae0" />
                </View>
                <Text style={styles.fabMenuLabel}>{action.label}</Text>
                <Feather name="chevron-right" size={16} color="#c7c7cc" />
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
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

  // Hero Card
  heroCard: {
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
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroLogoWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#1f7ae0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  heroLogoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  heroIdentity: {
    flex: 1,
    paddingRight: 8,
  },
  heroCompanyName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
    letterSpacing: -0.3,
  },
  heroExhibitionName: {
    fontSize: 13,
    color: '#8e8e93',
    fontWeight: '600',
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusPillLive: {
    backgroundColor: '#ecfdf5',
  },
  statusPillDraft: {
    backgroundColor: '#f1f3f7',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  heroBoothRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  heroBoothText: {
    fontSize: 13,
    color: '#8e8e93',
    fontWeight: '600',
  },
  heroProgressRow: {
    marginBottom: 18,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#f1f3f7',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  heroProgressText: {
    fontSize: 12,
    color: '#8e8e93',
    fontWeight: '700',
  },
  heroButtonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#111',
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  heroSecondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#111',
  },
  heroSecondaryButtonText: {
    color: '#111',
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

  // Quick Actions
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

  // Booth Completion
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
  checklist: {
    gap: 14,
    marginBottom: 4,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkText: {
    fontSize: 14,
    color: '#111',
    fontWeight: '600',
  },
  checkTextPending: {
    fontSize: 14,
    color: '#8e8e93',
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f5f7fb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  secondaryButtonText: {
    color: '#111',
    fontSize: 14,
    fontWeight: '700',
  },

  // My Schedule
  scheduleCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f2f2f7',
  },
  timelineItem: {
    flexDirection: 'row',
  },
  timelineLeft: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  dotContainer: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    backgroundColor: '#fff',
    zIndex: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  line: {
    width: 1,
    flex: 1,
    backgroundColor: '#eee',
    marginTop: -4,
    marginBottom: -4,
  },
  scheduleContent: {
    flex: 1,
    paddingBottom: 16,
  },
  scheduleContentBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
    marginBottom: 16,
  },
  scheduleTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  scheduleTime: {
    fontSize: 13,
    fontWeight: '700',
  },
  liveTag: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  liveTagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  scheduleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
    marginBottom: 6,
  },
  scheduleLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scheduleLocationText: {
    fontSize: 12,
    color: '#8e8e93',
    flex: 1,
  },
  reminderIcon: {
    marginLeft: 4,
  },
  viewScheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 4,
  },
  viewScheduleText: {
    color: '#1f7ae0',
    fontSize: 14,
    fontWeight: '700',
  },

  // Recent Updates
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
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

  // Notifications
  notificationsCard: {
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
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  notificationIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationText: {
    flex: 1,
    fontSize: 13,
    color: '#111',
    fontWeight: '600',
    lineHeight: 18,
  },

  // FAB
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
  fabBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 17, 17, 0.35)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
  },
  fabMenuCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  fabMenuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  fabMenuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#eef5ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabMenuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
  },
});
