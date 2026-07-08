import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SessionDetailsScreen({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Top App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.iconButton} onPress={onBack}>
          <Feather name="chevron-left" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Session Details</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Feather name="share-2" size={20} color="#111" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.bannerContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800' }} 
            style={styles.bannerImage} 
          />
        </View>

        {/* Session Header Info */}
        <View style={styles.headerInfo}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Keynote</Text>
          </View>
          <Text style={styles.sessionTitle}>Future of Robotics in Manufacturing</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Feather name="calendar" size={16} color="#8e8e93" />
              <Text style={styles.metaText}>Oct 12, 2026</Text>
            </View>
            <View style={styles.metaItem}>
              <Feather name="clock" size={16} color="#8e8e93" />
              <Text style={styles.metaText}>09:00 AM</Text>
            </View>
            <View style={styles.metaItem}>
              <Feather name="map-pin" size={16} color="#8e8e93" />
              <Text style={styles.metaText}>Hall A</Text>
            </View>
          </View>
        </View>

        {/* About the Session */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About the Session</Text>
          <Text style={styles.paragraph}>
            Explore how advanced robotics and AI are transforming the industrial landscape. This keynote will cover the latest breakthroughs in automation and human-robot collaboration, providing actionable insights for modernizing production lines.
          </Text>
          
          <Text style={styles.subTitle}>Topics Covered</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• AI-driven automation</Text>
            <Text style={styles.bulletItem}>• Collaborative robots (Cobots)</Text>
            <Text style={styles.bulletItem}>• Real-time industrial analytics</Text>
            <Text style={styles.bulletItem}>• Sustainable manufacturing practices</Text>
          </View>
        </View>

        {/* Speaker Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Speaker Information</Text>
          <View style={styles.speakerRow}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200' }} 
              style={styles.speakerImage} 
            />
            <View style={styles.speakerInfo}>
              <Text style={styles.speakerName}>Dr. Alan Turing</Text>
              <Text style={styles.speakerDesignation}>Chief Technology Officer</Text>
              <Text style={styles.speakerCompany}>Global Tech Innovations</Text>
            </View>
          </View>
          <Text style={styles.speakerBio}>
            With over 20 years of experience in AI and robotics, Dr. Turing has led groundbreaking projects in industrial automation across Europe and Asia.
          </Text>
        </View>

        {/* Event Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Event Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>12 Oct 2026</Text>
            </View>
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>Time</Text>
              <Text style={styles.infoValue}>09:00 AM - 11:00 AM</Text>
            </View>
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>Venue</Text>
              <Text style={styles.infoValue}>Pragati Maidan</Text>
            </View>
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>Hall Number</Text>
              <Text style={styles.infoValue}>Hall A</Text>
            </View>
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>Language</Text>
              <Text style={styles.infoValue}>English</Text>
            </View>
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>Available Seats</Text>
              <Text style={styles.infoValue}>145 / 500</Text>
            </View>
          </View>
        </View>



        {/* Organizer */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Organizer</Text>
          <Text style={styles.organizerName}>Tech Events Global</Text>
          <Text style={styles.organizerDept}>Corporate Relations Department</Text>
          
          <View style={styles.contactRow}>
            <Feather name="mail" size={16} color="#1f7ae0" />
            <Text style={styles.contactText}>contact@techevents.com</Text>
          </View>
          <View style={styles.contactRow}>
            <Feather name="phone" size={16} color="#1f7ae0" />
            <Text style={styles.contactText}>+1 (555) 123-4567</Text>
          </View>
        </View>

      </ScrollView>

      {/* Bottom Actions Fixed */}
      <View style={[styles.bottomActions, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity style={styles.secondaryAction}>
          <Ionicons name="bookmark-outline" size={22} color="#111" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryAction}>
          <Text style={styles.primaryActionText}>Set Reminder</Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 16,
    marginBottom: 16,
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
  },
  appBarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 120, // space for bottom actions
  },
  bannerContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 24,
    overflow: 'hidden',
    height: 220,
    backgroundColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  headerInfo: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#1f7ae015',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  badgeText: {
    color: '#1f7ae0',
    fontWeight: '600',
    fontSize: 13,
  },
  sessionTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111',
    lineHeight: 34,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#8e8e93',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 15,
    color: '#444',
    lineHeight: 24,
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 12,
  },
  bulletList: {
    gap: 8,
  },
  bulletItem: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  speakerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  speakerImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#eee',
  },
  speakerInfo: {
    flex: 1,
  },
  speakerName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  speakerDesignation: {
    fontSize: 14,
    color: '#1f7ae0',
    fontWeight: '500',
    marginBottom: 2,
  },
  speakerCompany: {
    fontSize: 14,
    color: '#8e8e93',
  },
  speakerBio: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  infoCell: {
    width: '45%',
  },
  infoLabel: {
    fontSize: 13,
    color: '#8e8e93',
    marginBottom: 6,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    color: '#111',
    fontWeight: '600',
  },

  organizerName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  organizerDept: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 16,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  contactText: {
    fontSize: 15,
    color: '#111',
    fontWeight: '500',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f2f2f7',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 8,
  },
  secondaryAction: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#f2f2f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryAction: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
