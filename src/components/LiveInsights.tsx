import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

export default function LiveInsights() {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Live Insights</Text>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveIndicatorText}>Live</Text>
        </View>
      </View>

      <View style={styles.grid}>
        {/* Card 1 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: '#eef2ff' }]}>
              <Feather name="users" size={16} color="#4f6cf6" />
            </View>
            <Text style={styles.cardLabel}>+842 today</Text>
          </View>
          <Text style={styles.cardValue}>12,847</Text>
          <Text style={styles.cardSubtitle}>Visitors Checked In</Text>
        </View>

        {/* Card 2 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: '#ebfdf2' }]}>
              <MaterialCommunityIcons name="pulse" size={18} color="#45c474" />
            </View>
            <Text style={styles.cardLabel}>Above{"\n"}average</Text>
          </View>
          <Text style={styles.cardValue}>78%</Text>
          <Text style={styles.cardSubtitle}>Hall Occupancy</Text>
        </View>

        {/* Card 3 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: '#ffeef0' }]}>
              <Ionicons name="radio-outline" size={18} color="#eb4d4b" />
            </View>
            <Text style={styles.cardLabel}>3 starting{"\n"}soon</Text>
          </View>
          <Text style={styles.cardValue}>6</Text>
          <Text style={styles.cardSubtitle}>Live Sessions</Text>
        </View>

        {/* Card 4 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: '#fff5e6' }]}>
              <Feather name="box" size={16} color="#f39c12" />
            </View>
            <Text style={styles.cardLabel}>Today</Text>
          </View>
          <Text style={styles.cardValue}>34</Text>
          <Text style={styles.cardSubtitle}>Products Launched</Text>
        </View>
      </View>
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
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#eb4d4b',
    marginRight: 4,
  },
  liveIndicatorText: {
    color: '#eb4d4b',
    fontSize: 12,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
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
    marginBottom: 20,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    fontSize: 11,
    color: '#999',
    textAlign: 'right',
    lineHeight: 14,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#8e8e93',
  },
});
