import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ExhibitorOnboardingProps {
  onContinue: () => void;
}

export default function ExhibitorOnboardingScreen({ onContinue }: ExhibitorOnboardingProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      
      {/* Top App Bar */}
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>Exhibitor Portal</Text>
        <TouchableOpacity style={styles.helpButton}>
          <Feather name="help-circle" size={22} color="#111" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800' }} 
            style={styles.illustration}
            resizeMode="cover"
          />
          <Text style={styles.welcomeTitle}>Welcome, ABC Automation Pvt. Ltd.</Text>
          <Text style={styles.welcomeSubtitle}>Your exhibitor account has been created successfully.</Text>
        </View>

        {/* Exhibition Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsCardTitle}>Exhibition Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Exhibition</Text>
            <Text style={styles.detailValue}>India Manufacturing Expo 2026</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Hall</Text>
            <Text style={styles.detailValue}>Hall A</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Booth</Text>
            <Text style={styles.detailValue}>A-24</Text>
          </View>
        </View>

        <Text style={styles.instructionText}>
          Before your booth becomes visible to visitors inside the mobile application, you must complete your profile setup.
        </Text>

        {/* Bottom padding to avoid the sticky action bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={[styles.bottomActionBar, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8} onPress={onContinue}>
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f6f7fa',
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f7',
    position: 'relative',
    zIndex: 10,
  },
  appBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  helpButton: {
    position: 'absolute',
    right: 20,
    top: 12,
  },
  content: {
    padding: 20,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  illustration: {
    width: '100%',
    height: 180,
    borderRadius: 20,
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f2f2f7',
  },
  detailsCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8e8e93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 15,
    color: '#444',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 15,
    color: '#111',
    fontWeight: '700',
  },
  detailDivider: {
    height: 1,
    backgroundColor: '#f1f3f7',
    marginVertical: 12,
  },
  instructionText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e5ea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButton: {
    backgroundColor: '#111',
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
