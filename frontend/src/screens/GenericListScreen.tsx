import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const productCards = [
  { id: 'p1', name: 'SmartGrid Pro 5000', category: 'Energy Systems', description: 'Intelligent distribution and power optimization for industrial campuses.' },
  { id: 'p2', name: 'EV Concept X1', category: 'Electric Vehicle', description: 'Next-generation mobility platform with connected diagnostics.' },
  { id: 'p3', name: 'Industrial Edge AI', category: 'AI & Robotics', description: 'On-device analytics for production lines and predictive operations.' },
];

const galleryItems = ['Factory', 'Products', 'Exhibition Booth', 'Office', 'Team'];

const videoCards = [
  { id: 'v1', title: 'Company Introduction', duration: '2:14' },
  { id: 'v2', title: 'Product Demo', duration: '1:38' },
  { id: 'v3', title: 'Factory Tour', duration: '3:05' },
  { id: 'v4', title: 'Latest Innovation', duration: '0:58' },
];

const brochureCards = [
  { id: 'b1', title: 'Product Catalog' },
  { id: 'b2', title: 'Company Brochure' },
  { id: 'b3', title: 'Technical Specifications' },
];

export default function GenericListScreen({ category, onBack }: { category: string, onBack: () => void }) {
  const titles: Record<string, string> = {
    products: 'Featured Products',
    gallery: 'Photo Gallery',
    videos: 'Videos',
    brochures: 'Brochures',
  };

  const title = titles[category] || 'Items';

  const renderProducts = () => (
    <ScrollView contentContainerStyle={styles.listContent}>
      {productCards.map((item) => (
        <View key={item.id} style={styles.productCard}>
          <View style={styles.productImage} />
          <Text style={styles.cardCategory}>{item.category}</Text>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardBody}>{item.description}</Text>
          <TouchableOpacity style={styles.cardButton}>
            <Text style={styles.cardButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  const renderGallery = () => (
    <ScrollView contentContainerStyle={styles.galleryGrid}>
      {galleryItems.map((item, index) => (
        <View key={item} style={styles.galleryCard}>
          <View style={[styles.galleryImage, { backgroundColor: index % 2 === 0 ? '#dbeafe' : '#e8f3ec' }]}>
            <Text style={styles.galleryLabel}>{item}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderVideos = () => (
    <ScrollView contentContainerStyle={styles.listContent}>
      {videoCards.map((item, index) => (
        <View key={item.id} style={styles.videoCardVertical}>
          <View style={[styles.videoThumb, { backgroundColor: index % 2 === 0 ? '#111' : '#1f7ae0' }]}>
            <TouchableOpacity style={styles.playButton}>
              <Feather name="play" size={16} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.videoDuration}>{item.duration}</Text>
          </View>
          <Text style={styles.cardTitle}>{item.title}</Text>
        </View>
      ))}
    </ScrollView>
  );

  const renderBrochures = () => (
    <ScrollView contentContainerStyle={styles.listContent}>
      {brochureCards.map((item) => (
        <View key={item.id} style={styles.brochureCard}>
          <View style={styles.brochureIcon}>
            <MaterialCommunityIcons name="file-pdf-box" size={22} color="#1f7ae0" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardBody}>PDF document ready for visitor download.</Text>
          </View>
          <TouchableOpacity style={styles.downloadButton}>
            <Text style={styles.downloadButtonText}>Download</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  const renderContent = () => {
    switch (category) {
      case 'products': return renderProducts();
      case 'gallery': return renderGallery();
      case 'videos': return renderVideos();
      case 'brochures': return renderBrochures();
      default: return null;
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconButton} onPress={onBack}>
          <Feather name="chevron-left" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f7f8fb',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f7',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f7fb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
  },
  listContent: {
    padding: 16,
  },
  productCard: {
    width: '100%',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  productImage: {
    height: 180,
    borderRadius: 18,
    backgroundColor: '#dbeafe',
    marginBottom: 12,
  },
  cardCategory: {
    fontSize: 12,
    color: '#8e8e93',
    marginBottom: 4,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 16,
    color: '#111',
    fontWeight: '800',
    marginBottom: 6,
  },
  cardBody: {
    fontSize: 13,
    lineHeight: 19,
    color: '#4b5563',
    marginBottom: 12,
  },
  cardButton: {
    backgroundColor: '#f5f7fb',
    paddingVertical: 11,
    borderRadius: 16,
    alignItems: 'center',
  },
  cardButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111',
  },
  galleryGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  galleryCard: {
    width: '48%',
    marginBottom: 16,
  },
  galleryImage: {
    height: 150,
    borderRadius: 18,
    justifyContent: 'flex-end',
    padding: 12,
  },
  galleryLabel: {
    color: '#111',
    fontWeight: '800',
    fontSize: 13,
  },
  videoCardVertical: {
    width: '100%',
    marginBottom: 20,
  },
  videoThumb: {
    height: 200,
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoDuration: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    alignSelf: 'flex-end',
  },
  brochureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  brochureIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#eef5ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  downloadButton: {
    backgroundColor: '#1f7ae0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  downloadButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },
});
