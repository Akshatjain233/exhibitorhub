import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function LatestUpdates() {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Latest Updates</Text>
        <TouchableOpacity>
          <Text style={styles.linkText}>See all <Feather name="chevron-right" size={12} /></Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Card 1 */}
        <View style={styles.card}>
          <View style={[styles.tag, { backgroundColor: '#ffeef0' }]}>
            <Text style={[styles.tagText, { color: '#eb4d4b' }]}>Urgent</Text>
          </View>
          <Text style={styles.cardTitle}>Hall A Entrance Shifted</Text>
          <Text style={styles.cardDesc}>Main entrance relocated to Gate 3 due to ongoing construction</Text>
          <Text style={styles.timeText}>2 min ago</Text>
        </View>

        {/* Card 2 */}
        <View style={styles.card}>
          <View style={[styles.tag, { backgroundColor: '#eef2ff' }]}>
            <Text style={[styles.tagText, { color: '#4f6cf6' }]}>Live Now</Text>
          </View>
          <Text style={styles.cardTitle}>CEO Keynote Session</Text>
          <Text style={styles.cardDesc}>Begins in 15 minutes at Main Auditorium — regular seating full</Text>
          <Text style={styles.timeText}>10 min ago</Text>
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
    width: 260,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 13,
    color: '#8e8e93',
    lineHeight: 18,
    marginBottom: 16,
  },
  timeText: {
    fontSize: 12,
    color: '#b0b0b5',
    marginTop: 'auto',
  },
});
