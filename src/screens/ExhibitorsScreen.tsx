import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const categoryChips = [
  'All',
  'Technology',
  'Automation',
  'Manufacturing',
  'Electronics',
  'Healthcare',
  'Construction',
  'Automotive',
  'Food',
  'Textiles',
  'Energy',
  'Medical',
  'AI & Robotics',
];

const hallOptions = ['All Halls', 'Hall A', 'Hall B', 'Hall C', 'Hall D'];
const sortOptions = ['A-Z', 'Popular', 'Recently Added', 'Most Visited', 'Featured'];

const featuredExhibitors = [
  {
    id: 'abb',
    name: 'ABB',
    industry: 'Industrial Automation',
    booth: 'Hall B · Booth B-24',
    tagline: 'Powering safer, smarter factories.',
    verified: true,
    logo: 'AB',
  },
  {
    id: 'bosch',
    name: 'Bosch Rexroth',
    industry: 'Motion Control',
    booth: 'Hall C · Booth C-17',
    tagline: 'Precision systems for modern industry.',
    verified: true,
    logo: 'BR',
  },
  {
    id: 'schneider',
    name: 'Schneider Electric',
    industry: 'Energy Management',
    booth: 'Hall A · Booth A-11',
    tagline: 'Building the next generation of efficiency.',
    verified: true,
    logo: 'SE',
  },
  {
    id: 'fanuc',
    name: 'FANUC',
    industry: 'AI Robotics',
    booth: 'Hall D · Booth D-08',
    tagline: 'Automation with world-class reliability.',
    verified: true,
    logo: 'FC',
  },
];

const exhibitors = [
  {
    id: 'siemens',
    name: 'Siemens India',
    industry: 'Industrial Automation',
    country: '🇩🇪',
    booth: 'B-205',
    hall: 'Hall B',
    description: 'Integrated factory software, energy systems, and industrial automation for large-scale operations.',
    tags: ['Automation', 'Industrial IoT', 'Machinery'],
    categories: ['Automation', 'Manufacturing', 'Energy'],
    logo: 'SI',
    verified: true,
    featured: true,
  },
  {
    id: 'tata',
    name: 'Tata Motors',
    industry: 'Automotive',
    country: '🇮🇳',
    booth: 'A-101',
    hall: 'Hall A',
    description: 'Electric mobility, connected vehicle platforms, and advanced manufacturing solutions.',
    tags: ['Automotive', 'EV', 'Mobility'],
    categories: ['Automotive', 'Manufacturing'],
    logo: 'TM',
    verified: true,
    featured: false,
  },
  {
    id: 'medtronic',
    name: 'Medtronic',
    industry: 'Healthcare Technology',
    country: '🇺🇸',
    booth: 'C-114',
    hall: 'Hall C',
    description: 'Connected medical devices and digital care systems for modern healthcare facilities.',
    tags: ['Healthcare', 'Medical', 'Devices'],
    categories: ['Healthcare', 'Medical'],
    logo: 'MD',
    verified: true,
    featured: false,
  },
  {
    id: 'schneider-2',
    name: 'Schneider Electric',
    industry: 'Energy Management',
    country: '🇫🇷',
    booth: 'A-11',
    hall: 'Hall A',
    description: 'Energy infrastructure, building automation, and sustainability platforms for enterprises.',
    tags: ['Energy', 'Automation', 'Sustainability'],
    categories: ['Energy', 'Automation'],
    logo: 'SE',
    verified: true,
    featured: false,
  },
  {
    id: 'fanuc-2',
    name: 'FANUC',
    industry: 'AI & Robotics',
    country: '🇯🇵',
    booth: 'D-08',
    hall: 'Hall D',
    description: 'Industrial robotics, smart manufacturing, and machine control systems.',
    tags: ['AI & Robotics', 'Automation', 'Robotics'],
    categories: ['AI & Robotics', 'Automation'],
    logo: 'FC',
    verified: true,
    featured: false,
  },
  {
    id: 'texpro',
    name: 'TexPro Systems',
    industry: 'Textiles',
    country: '🇮🇳',
    booth: 'C-42',
    hall: 'Hall C',
    description: 'Digital weaving, quality inspection, and production monitoring for textile manufacturers.',
    tags: ['Textiles', 'Machinery', 'Industrial IoT'],
    categories: ['Textiles', 'Manufacturing'],
    logo: 'TP',
    verified: false,
    featured: false,
  },
];

const recommendedForYou = [
  {
    id: 'rec-abb',
    name: 'ABB',
    industry: 'Because you visited Siemens',
    booth: 'B-24',
    logo: 'AB',
  },
  {
    id: 'rec-bosch',
    name: 'Bosch Rexroth',
    industry: 'Similar automation leaders',
    booth: 'C-17',
    logo: 'BR',
  },
  {
    id: 'rec-schneider',
    name: 'Schneider Electric',
    industry: 'Popular in your saved list',
    booth: 'A-11',
    logo: 'SE',
  },
  {
    id: 'rec-fanuc',
    name: 'FANUC',
    industry: 'Frequently viewed by visitors',
    booth: 'D-08',
    logo: 'FC',
  },
];

const recentlyViewed = [
  { id: 'rv-1', name: 'Tata Motors', booth: 'A-101', logo: 'TM' },
  { id: 'rv-2', name: 'Siemens India', booth: 'B-205', logo: 'SI' },
  { id: 'rv-3', name: 'Medtronic', booth: 'C-114', logo: 'MD' },
];

type ExhibitorsScreenProps = {
  onOpenProfile?: () => void;
};

export default function ExhibitorsScreen({ onOpenProfile }: ExhibitorsScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedHall, setSelectedHall] = useState('All Halls');
  const [sortBy, setSortBy] = useState('Featured');
  const [query, setQuery] = useState('');
  const [showEmptyState, setShowEmptyState] = useState(false);

  const filteredExhibitors = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();

    let list = exhibitors.filter((item) => {
      const categoryMatch = selectedCategory === 'All' || item.categories.includes(selectedCategory);
      const hallMatch = selectedHall === 'All Halls' || item.hall === selectedHall;
      const searchMatch = !searchTerm
        || item.name.toLowerCase().includes(searchTerm)
        || item.industry.toLowerCase().includes(searchTerm)
        || item.description.toLowerCase().includes(searchTerm)
        || item.tags.some((tag) => tag.toLowerCase().includes(searchTerm));

      return categoryMatch && hallMatch && searchMatch;
    });

    if (sortBy === 'A-Z') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'Popular') {
      list = [...list].reverse();
    }

    return list;
  }, [query, selectedCategory, selectedHall, sortBy]);

  const renderFlag = (flag: string) => <Text style={styles.flag}>{flag}</Text>;

  const FeatureCard = ({ item }: { item: (typeof featuredExhibitors)[number] }) => (
    <TouchableOpacity style={styles.featuredCard} activeOpacity={0.9}>
      <View style={styles.featuredHeader}>
        <View style={styles.logoSquare}>
          <Text style={styles.logoText}>{item.logo}</Text>
        </View>
        <View style={styles.featuredActions}>
          {item.verified ? (
            <View style={styles.verifiedPill}>
              <Ionicons name="checkmark-circle" size={12} color="#1f7ae0" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          ) : null}
          <TouchableOpacity style={styles.bookmarkCircle}>
            <Ionicons name="bookmark-outline" size={18} color="#8e8e93" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.featuredName}>{item.name}</Text>
      <Text style={styles.featuredIndustry}>{item.industry}</Text>
      <Text style={styles.featuredBooth}>{item.booth}</Text>
      <Text style={styles.featuredTagline}>{item.tagline}</Text>
      <TouchableOpacity style={styles.viewProfileButton} onPress={onOpenProfile}>
        <Text style={styles.viewProfileButtonText}>View Profile</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const ExhibitorCard = ({ item }: { item: (typeof exhibitors)[number] }) => (
    <TouchableOpacity style={styles.listCard} activeOpacity={0.92}>
      <View style={styles.listTopRow}>
        <View style={styles.listLogoRow}>
          <View style={styles.listLogo}>{renderFlag(item.country)}</View>
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.listCompany}>{item.name}</Text>
            </View>
            <Text style={styles.listIndustry}>{item.industry}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.bookmarkCircleSmall}>
          <Ionicons name="bookmark-outline" size={16} color="#8e8e93" />
        </TouchableOpacity>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaPill}>
          <Text style={styles.metaPillText}>{item.booth}</Text>
        </View>
        <View style={styles.metaPillSoft}>
          <Text style={styles.metaPillSoftText}>{item.hall}</Text>
        </View>
      </View>

      <Text style={styles.description}>{item.description}</Text>

      <View style={styles.tagWrap}>
        {item.tags.map((tag) => (
          <View key={tag} style={styles.tagPill}>
            <Text style={styles.tagPillText}>{tag}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.quickActions, { marginTop: 12 }]}>
        <TouchableOpacity style={[styles.quickActionPrimary, { flex: 1, justifyContent: 'center' }]} onPress={onOpenProfile}>
          <Text style={styles.quickActionPrimaryText}>View Profile</Text>
          <Feather name="arrow-right" size={14} color="#fff" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const RecommendationCard = ({ item }: { item: (typeof recommendedForYou)[number] }) => (
    <TouchableOpacity style={styles.recommendationCard} activeOpacity={0.92}>
      <View style={styles.logoSquareSmall}>
        <Text style={styles.logoText}>{item.logo}</Text>
      </View>
      <Text style={styles.recommendationTitle}>{item.name}</Text>
      <Text style={styles.recommendationSub}>{item.industry}</Text>
      <Text style={styles.recommendationBooth}>Booth {item.booth}</Text>
    </TouchableOpacity>
  );

  const ViewedCard = ({ item }: { item: (typeof recentlyViewed)[number] }) => (
    <TouchableOpacity style={styles.viewedCard} activeOpacity={0.9}>
      <View style={styles.logoTiny}>
        <Text style={styles.logoTinyText}>{item.logo}</Text>
      </View>
      <Text style={styles.viewedName}>{item.name}</Text>
      <Text style={styles.viewedBooth}>{item.booth}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={filteredExhibitors}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ExhibitorCard item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={styles.topBar}>
              <TouchableOpacity style={styles.backButton}>
                <Feather name="chevron-left" size={22} color="#111" />
              </TouchableOpacity>

              <View style={styles.topBarTitleWrap}>
                <Text style={styles.topTitle}>Exhibitors</Text>
                <Text style={styles.topSubtitle}>1,245 Companies</Text>
              </View>


            </View>

            <View style={styles.searchBar}>
              <Feather name="search" size={18} color="#8e8e93" />
              <TextInput
                placeholder="Search exhibitors, industries, products..."
                placeholderTextColor="#8e8e93"
                style={styles.searchInput}
                value={query}
                onChangeText={(text) => {
                  setQuery(text);
                }}
              />

            </View>





            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Exhibitor List</Text>
              <Text style={styles.sectionCaption}>{filteredExhibitors.length} results</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="archive-search-outline" size={56} color="#d0d5dd" />
            <Text style={styles.emptyTitle}>No exhibitors found.</Text>
            <Text style={styles.emptySubtitle}>Try another search or category.</Text>
          </View>
        }
        ListFooterComponent={<View style={{ height: 130 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f7f8fb',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  backButton: {
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
  topBarTitleWrap: {
    alignItems: 'center',
    flex: 1,
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
  },
  topSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: '#8e8e93',
    fontWeight: '500',
  },
  topBarActions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconCircle: {
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 15,
    color: '#111',
    fontWeight: '500',
  },
  chipRow: {
    paddingBottom: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: '#fff',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  chipActive: {
    backgroundColor: '#1f7ae0',
  },
  chipText: {
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
  },
  toolbarRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
    marginBottom: 16,
  },
  dropdownButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  dropdownLabel: {
    fontSize: 12,
    color: '#8e8e93',
    fontWeight: '600',
    marginRight: 6,
  },
  dropdownValue: {
    flex: 1,
    fontSize: 13,
    color: '#111',
    fontWeight: '700',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sortText: {
    fontSize: 13,
    color: '#111',
    fontWeight: '700',
    marginRight: 6,
  },
  featuredRow: {
    paddingBottom: 12,
  },
  featuredCard: {
    width: 290,
    marginRight: 14,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  logoSquare: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#1f7ae0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
  },
  featuredActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef5ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 4,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1f7ae0',
  },
  bookmarkCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f5f7fb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
    marginBottom: 4,
  },
  featuredIndustry: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 6,
  },
  featuredBooth: {
    fontSize: 13,
    color: '#1f7ae0',
    fontWeight: '700',
    marginBottom: 8,
  },
  featuredTagline: {
    fontSize: 13,
    lineHeight: 19,
    color: '#4b5563',
    marginBottom: 14,
  },
  viewProfileButton: {
    backgroundColor: '#f5f7fb',
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewProfileButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111',
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
  },
  sectionCaption: {
    fontSize: 12,
    color: '#8e8e93',
    marginTop: 4,
  },
  recommendationRow: {
    paddingBottom: 8,
  },
  recommendationCard: {
    width: 160,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  logoSquareSmall: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#eef5ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
    marginBottom: 4,
  },
  recommendationSub: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  recommendationBooth: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1f7ae0',
  },
  viewedRow: {
    paddingBottom: 12,
  },
  viewedCard: {
    width: 124,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  logoTiny: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#f5f7fb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoTinyText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1f7ae0',
  },
  viewedName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111',
    marginBottom: 4,
  },
  viewedBooth: {
    fontSize: 11,
    color: '#8e8e93',
  },
  listCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  listTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  listLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },
  listLogo: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#f5f7fb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  flag: {
    fontSize: 18,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  listCompany: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
  },
  listIndustry: {
    fontSize: 13,
    color: '#6b7280',
  },
  bookmarkCircleSmall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f5f7fb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  metaPill: {
    backgroundColor: '#eef5ff',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  metaPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1f7ae0',
  },
  metaPillSoft: {
    backgroundColor: '#f5f7fb',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  metaPillSoftText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4b5563',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4b5563',
    marginBottom: 14,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  tagPill: {
    backgroundColor: '#f5f7fb',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  tagPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4b5563',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f5f7fb',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111',
  },
  quickActionPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1f7ae0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  quickActionPrimaryText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 70,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
    marginTop: 14,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 6,
  },
});
