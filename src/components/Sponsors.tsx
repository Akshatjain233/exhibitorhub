import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Sponsors() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Sponsors & Partners</Text>

      {/* Gold Sponsors */}
      <View style={styles.categoryContainer}>
        <View style={styles.categoryHeader}>
          <View style={[styles.dot, { backgroundColor: '#f5b041' }]} />
          <Text style={[styles.categoryTitle, { color: '#f5b041' }]}>GOLD SPONSORS</Text>
        </View>
        <View style={styles.pillRow}>
          <View style={styles.pill}><Text style={styles.pillText}>Tata Group</Text></View>
          <View style={styles.pill}><Text style={styles.pillText}>Reliance</Text></View>
          <View style={styles.pill}><Text style={styles.pillText}>Adani Group</Text></View>
        </View>
      </View>

      {/* Silver Sponsors */}
      <View style={styles.categoryContainer}>
        <View style={styles.categoryHeader}>
          <View style={[styles.dot, { backgroundColor: '#95a5a6' }]} />
          <Text style={[styles.categoryTitle, { color: '#95a5a6' }]}>SILVER SPONSORS</Text>
        </View>
        <View style={styles.pillRow}>
          <View style={styles.pill}><Text style={styles.pillText}>Mahindra</Text></View>
          <View style={styles.pill}><Text style={styles.pillText}>TVS Group</Text></View>
          <View style={styles.pill}><Text style={styles.pillText}>Godrej</Text></View>
        </View>
      </View>

      {/* Official Partners */}
      <View style={styles.categoryContainer}>
        <View style={styles.categoryHeader}>
          <View style={[styles.dot, { backgroundColor: '#4f6cf6' }]} />
          <Text style={[styles.categoryTitle, { color: '#4f6cf6' }]}>OFFICIAL PARTNERS</Text>
        </View>
        <View style={styles.pillRow}>
          <View style={styles.pill}><Text style={styles.pillText}>CII</Text></View>
          <View style={styles.pill}><Text style={styles.pillText}>NASSCOM</Text></View>
          <View style={styles.pill}><Text style={styles.pillText}>FICCI</Text></View>
          <View style={styles.pill}><Text style={styles.pillText}>Invest India</Text></View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pill: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    marginRight: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
  },
});
