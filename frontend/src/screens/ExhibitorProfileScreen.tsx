import React, { useState } from 'react';
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const productCards = [
  {
    id: 'p1',
    name: 'SmartGrid Pro 5000',
    category: 'Energy Systems',
    description: 'Intelligent distribution and power optimization for industrial campuses.',
  },
  {
    id: 'p2',
    name: 'EV Concept X1',
    category: 'Electric Vehicle',
    description: 'Next-generation mobility platform with connected diagnostics.',
  },
  {
    id: 'p3',
    name: 'Industrial Edge AI',
    category: 'AI & Robotics',
    description: 'On-device analytics for production lines and predictive operations.',
  },
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

const reps = [
  { id: 'r1', name: 'Aarav Mehta', role: 'Sales Director', dept: 'Business Development' },
  { id: 'r2', name: 'Maya Singh', role: 'Product Manager', dept: 'Product Strategy' },
  { id: 'r3', name: 'Daniel Stone', role: 'Regional Lead', dept: 'Client Solutions' },
];

const relatedExhibitors = [
  { id: 'rel1', name: 'ABB', industry: 'Automation', booth: 'B-24' },
  { id: 'rel2', name: 'Bosch Rexroth', industry: 'Motion Control', booth: 'C-17' },
  { id: 'rel3', name: 'Schneider Electric', industry: 'Energy', booth: 'A-11' },
  { id: 'rel4', name: 'FANUC', industry: 'Robotics', booth: 'D-08' },
];

const productTags = ['Automation', 'Industrial IoT', 'Robotics', 'Machinery', 'AI', 'Manufacturing', 'Electronics'];

export default function ExhibitorProfileScreen({ onBack, onViewAll }: { onBack?: () => void, onViewAll?: (category: string) => void }) {
  const [selectedTag, setSelectedTag] = useState('Automation');
  const [bookmarked, setBookmarked] = useState(false);
  const [followed, setFollowed] = useState(false);

  return (
    <View style={styles.screen}>
      <FlatList
        data={[]}
        keyExtractor={() => 'profile-empty'}
        renderItem={null as any}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={styles.topBar}>
              <TouchableOpacity style={styles.iconButton} onPress={onBack}>
                <Feather name="chevron-left" size={22} color="#111" />
              </TouchableOpacity>

              <Text style={styles.pageTitle}>Siemens India</Text>

              <View style={styles.topBarActions}>
                <TouchableOpacity style={styles.iconButton}>
                  <Feather name="share-2" size={18} color="#111" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => setBookmarked((value) => !value)}>
                  <Ionicons name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={18} color="#111" />
                </TouchableOpacity>

              </View>
            </View>

            <View style={styles.heroCard}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80' }}
                style={styles.heroImage}
              />
              <View style={styles.heroOverlay} />
              <View style={styles.heroContent}>
                <View style={styles.brandRow}>
                  <View style={styles.heroLogo}>
                    <Text style={styles.heroLogoText}>SI</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.companyRow}>
                      <Text style={styles.companyName}>Siemens India</Text>
                    </View>
                    <Text style={styles.companyMeta}>Industrial Automation · 🇩🇪 Germany</Text>
                    <Text style={styles.companyMeta}>Booth B-205 · Hall B</Text>
                  </View>
                </View>

                <View style={styles.heroActions}>
                  <TouchableOpacity style={[styles.followButton, followed && styles.followButtonActive]} onPress={() => setFollowed((value) => !value)}>
                    <Text style={[styles.followButtonText, followed && styles.followButtonTextActive]}>{followed ? 'Following' : 'Follow'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.heroIconButton} onPress={() => setBookmarked((value) => !value)}>
                    <Ionicons name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={18} color="#111" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.overviewCard}>
              <Text style={styles.sectionTitle}>Company Overview</Text>
              <Text style={styles.aboutText}>
                Siemens India delivers advanced automation, smart energy systems, and industrial software powering safer,
                more efficient operations for global enterprises.
              </Text>

              <View style={styles.infoGrid}>
                <InfoItem label="Established" value="1847" />
                <InfoItem label="Headquarters" value="Munich, Germany" />
                <InfoItem label="Industry" value="Industrial Automation" />
                <InfoItem label="Company Size" value="100,000+" />
                <InfoItem label="Website" value="siemens.com" />
                <InfoItem label="Business Email" value="expo@siemens.com" />
                <InfoItem label="Phone" value="+91 22 1234 5678" />
              </View>
            </View>



            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Featured Products</Text>
              <TouchableOpacity onPress={() => onViewAll?.('products')}>
                <Text style={styles.linkText}>View all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalRow}>
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

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Photo Gallery</Text>
              <TouchableOpacity onPress={() => onViewAll?.('gallery')}>
                <Text style={styles.linkText}>View all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryRow}>
              {galleryItems.map((item, index) => (
                <View key={item} style={styles.galleryCard}>
                  <View style={[styles.galleryImage, { backgroundColor: index % 2 === 0 ? '#dbeafe' : '#e8f3ec' }]}>
                    <Text style={styles.galleryLabel}>{item}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Videos</Text>
              <TouchableOpacity onPress={() => onViewAll?.('videos')}>
                <Text style={styles.linkText}>Latest</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalRow}>
              {videoCards.map((item, index) => (
                <View key={item.id} style={styles.videoCard}>
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

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Brochures</Text>
              <TouchableOpacity onPress={() => onViewAll?.('brochures')}>
                <Text style={styles.linkText}>Downloads</Text>
              </TouchableOpacity>
            </View>
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

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Company Representatives</Text>
              <Text style={styles.linkText}>Team</Text>
            </View>
            {reps.map((rep) => (
              <View key={rep.id} style={styles.repCard}>
                <View style={styles.repAvatar}>
                  <Text style={styles.repAvatarText}>{rep.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.repName}>{rep.name}</Text>
                  <Text style={styles.repRole}>{rep.role}</Text>
                  <Text style={styles.repDept}>{rep.dept}</Text>
                </View>
                <View style={styles.repActions}>
                  <ActionIcon label="Call" icon="phone" />
                  <ActionIcon label="Email" icon="mail" />
                </View>
              </View>
            ))}

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Contact</Text>
              <Text style={styles.linkText}>Direct</Text>
            </View>
            <View style={styles.contactCard}>
              {[
                ['Website', 'siemens.com'],
                ['Email', 'expo@siemens.com'],
                ['Phone', '+91 22 1234 5678'],
                ['LinkedIn', '/company/siemens'],
                ['Instagram', '@siemens'],
                ['Facebook', '/siemens'],
                ['Location', 'Hall B, Booth B-205'],
              ].map(([label, value]) => (
                <View key={label} style={styles.contactRow}>
                  <Text style={styles.contactLabel}>{label}</Text>
                  <Text style={styles.contactValue}>{value}</Text>
                </View>
              ))}
            </View>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Booth Location</Text>
            </View>
            <View style={styles.brochureCard}>
              <View style={styles.brochureIcon}>
                <Feather name="map-pin" size={22} color="#1f7ae0" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Booth B-205</Text>
                <Text style={styles.cardBody}>Hall B</Text>
              </View>
            </View>


          </View>
        }
        ListFooterComponent={
          <View style={styles.footerSpacer} />
        }
      />
    </View>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function ActionIcon({ label, icon }: { label: string; icon: 'phone' | 'mail' | 'message-circle' }) {
  return (
    <TouchableOpacity style={styles.actionIcon}>
      <Feather name={icon} size={14} color="#1f7ae0" />
      <Text style={styles.actionIconText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f7f8fb',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 14,
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
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
    flex: 1,
    textAlign: 'center',
  },
  topBarActions: {
    flexDirection: 'row',
    gap: 8,
  },
  heroCard: {
    height: 280,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#111',
  },
  heroImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 18,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  heroLogo: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#1f7ae0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLogoText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  companyName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  verifiedText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  companyMeta: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  heroActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
  },
  followButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 18,
  },
  followButtonActive: {
    backgroundColor: '#1f7ae0',
  },
  followButtonText: {
    color: '#111',
    fontSize: 14,
    fontWeight: '800',
  },
  followButtonTextActive: {
    color: '#fff',
  },
  heroIconButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
    marginBottom: 10,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#4b5563',
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  infoItem: {
    width: '48%',
    backgroundColor: '#f7f8fb',
    borderRadius: 18,
    padding: 12,
  },
  infoLabel: {
    fontSize: 11,
    color: '#8e8e93',
    marginBottom: 6,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 13,
    color: '#111',
    fontWeight: '700',
    lineHeight: 18,
  },
  chipRow: {
    paddingVertical: 4,
    marginBottom: 10,
  },
  chip: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  chipActive: {
    backgroundColor: '#1f7ae0',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4b5563',
  },
  chipTextActive: {
    color: '#fff',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
    marginTop: 8,
  },
  linkText: {
    fontSize: 13,
    color: '#1f7ae0',
    fontWeight: '700',
  },
  horizontalRow: {
    paddingBottom: 12,
  },
  productCard: {
    width: 220,
    marginRight: 12,
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
    height: 140,
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
  galleryRow: {
    paddingBottom: 10,
  },
  galleryCard: {
    width: 140,
    marginRight: 12,
  },
  galleryImage: {
    height: 110,
    borderRadius: 18,
    justifyContent: 'flex-end',
    padding: 12,
  },
  galleryLabel: {
    color: '#111',
    fontWeight: '800',
    fontSize: 13,
  },
  videoCard: {
    width: 200,
    marginRight: 12,
  },
  videoThumb: {
    height: 120,
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'space-between',
    padding: 12,
    marginBottom: 10,
  },
  playButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
    marginBottom: 12,
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
  repCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  repAvatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#f5f7fb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  repAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1f7ae0',
  },
  repName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
    marginBottom: 2,
  },
  repRole: {
    fontSize: 13,
    color: '#4b5563',
    marginBottom: 2,
  },
  repDept: {
    fontSize: 12,
    color: '#8e8e93',
  },
  repActions: {
    gap: 8,
  },
  actionIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f5f7fb',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  actionIconText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111',
  },
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f7',
  },
  contactLabel: {
    fontSize: 13,
    color: '#8e8e93',
    fontWeight: '700',
  },
  contactValue: {
    fontSize: 13,
    color: '#111',
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right',
    paddingLeft: 12,
  },
  miniMapCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  miniMapTop: {
    height: 150,
    borderRadius: 18,
    backgroundColor: '#f5f7fb',
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  miniHallBlock: {
    position: 'absolute',
    left: 20,
    top: 20,
    width: 120,
    height: 95,
    borderRadius: 16,
    backgroundColor: '#dbeafe',
  },
  miniHallBlockAlt: {
    position: 'absolute',
    right: 20,
    top: 40,
    width: 120,
    height: 95,
    borderRadius: 16,
    backgroundColor: '#e8f3ec',
  },
  miniBooth: {
    position: 'absolute',
    left: 115,
    top: 58,
    width: 92,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#1f7ae0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1f7ae0',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  miniBoothText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },
  navigateButton: {
    flexDirection: 'row',
    backgroundColor: '#1f7ae0',
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  navigateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  walkTime: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600',
  },
  relatedCard: {
    width: 150,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 14,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  relatedLogo: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#eef5ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  relatedLogoText: {
    color: '#1f7ae0',
    fontWeight: '800',
  },
  relatedName: {
    fontSize: 15,
    color: '#111',
    fontWeight: '800',
    marginBottom: 4,
  },
  relatedIndustry: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
  },
  relatedBooth: {
    fontSize: 12,
    color: '#1f7ae0',
    fontWeight: '700',
  },
  footerSpacer: {
    paddingTop: 6,
    paddingBottom: 18,
  },
  ctaCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  visitButton: {
    flex: 1,
    backgroundColor: '#1f7ae0',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  visitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  contactCompanyButton: {
    flex: 1,
    backgroundColor: '#f5f7fb',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  contactCompanyButtonText: {
    color: '#111',
    fontSize: 14,
    fontWeight: '800',
  },
});
