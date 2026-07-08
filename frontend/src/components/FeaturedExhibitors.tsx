import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function FeaturedExhibitors() {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Featured Exhibitors</Text>
        <TouchableOpacity>
          <Text style={styles.linkText}>All <Feather name="chevron-right" size={12} /></Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Card 1 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.avatar, { backgroundColor: '#4f6cf6' }]}>
              <Text style={styles.avatarText}>TM</Text>
            </View>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: '#eef2ff' }]}>
              <Ionicons name="bookmark" size={16} color="#4f6cf6" />
            </TouchableOpacity>
          </View>
          <Text style={styles.companyName}>Tata Motors</Text>
          <Text style={styles.category}>Automotive</Text>
          <Text style={styles.booth}>Booth A-101</Text>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>View Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Card 2 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.avatar, { backgroundColor: '#34495e' }]}>
              <Text style={styles.avatarText}>SI</Text>
            </View>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="bookmark-outline" size={16} color="#aaa" />
            </TouchableOpacity>
          </View>
          <Text style={styles.companyName}>Siemens India</Text>
          <Text style={styles.category}>Industrial Automation</Text>
          <Text style={styles.booth}>Booth B-205</Text>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>View Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  linkText: {
    color: '#4f6cf6',
    fontWeight: '600',
    fontSize: 14,
  },
  scrollContent: {
    paddingRight: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    width: 200,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  category: {
    fontSize: 13,
    color: '#8e8e93',
    marginBottom: 6,
  },
  booth: {
    fontSize: 13,
    color: '#4f6cf6',
    fontWeight: '600',
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#f6f7fa',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
  },
});
