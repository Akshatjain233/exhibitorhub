import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';

export default function FeaturedProducts() {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Featured Products</Text>
        <TouchableOpacity>
          <Text style={styles.linkText}>Browse <Feather name="chevron-right" size={12} /></Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Card 1 */}
        <View style={styles.card}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=300&q=80' }} 
            style={styles.image} 
          />
          <View style={styles.cardInfo}>
            <Text style={styles.company}>Tata Motors</Text>
            <Text style={styles.productName}>EV Concept X1</Text>
            <Text style={styles.category}>Electric Vehicle</Text>
            
            <View style={styles.bottomRow}>
              <View style={styles.ratingRow}>
                <FontAwesome name="star" size={14} color="#f39c12" style={{ marginRight: 4 }} />
                <Text style={styles.ratingText}>4.8</Text>
              </View>
              <TouchableOpacity style={styles.viewButton}>
                <Text style={styles.viewButtonText}>View</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Card 2 */}
        <View style={styles.card}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1581092334884-5a2e5572e903?auto=format&fit=crop&w=300&q=80' }} 
            style={styles.image} 
          />
          <View style={styles.cardInfo}>
            <Text style={styles.company}>Siemens India</Text>
            <Text style={styles.productName}>SmartGrid Pro 5000</Text>
            <Text style={styles.category}>Energy Systems</Text>
            
            <View style={styles.bottomRow}>
              <View style={styles.ratingRow}>
                <FontAwesome name="star" size={14} color="#f39c12" style={{ marginRight: 4 }} />
                <Text style={styles.ratingText}>4.6</Text>
              </View>
              <TouchableOpacity style={styles.viewButton}>
                <Text style={styles.viewButtonText}>View</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    width: 220,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 130,
    backgroundColor: '#f0f0f0',
  },
  cardInfo: {
    padding: 16,
  },
  company: {
    fontSize: 12,
    color: '#8e8e93',
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  category: {
    fontSize: 13,
    color: '#aaa',
    marginBottom: 16,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  viewButton: {
    backgroundColor: '#4f6cf6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});
