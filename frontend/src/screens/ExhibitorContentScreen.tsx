import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Pressable } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const contentModules = [
  {
    id: 'products',
    icon: 'box',
    iconBg: '#eef5ff',
    iconColor: '#1f7ae0',
    title: 'Products',
    desc: 'Manage products displayed in the exhibition.',
    count: '24 Products',
  },
  {
    id: 'gallery',
    icon: 'image',
    iconBg: '#ecfdf5',
    iconColor: '#10b981',
    title: 'Gallery',
    desc: 'Manage company images.',
    count: '18 Images',
  },
  {
    id: 'videos',
    icon: 'video',
    iconBg: '#fff7e6',
    iconColor: '#f59e0b',
    title: 'Videos',
    desc: 'Manage promotional and product videos.',
    count: '6 Videos',
  },
  {
    id: 'documents',
    icon: 'file-text',
    iconBg: '#fff0f0',
    iconColor: '#ff3b30',
    title: 'Brochures & Documents',
    desc: 'Manage brochures, catalogues, certificates and PDFs.',
    count: '12 Documents',
  },
  {
    id: 'announcements',
    icon: 'mic',
    iconBg: '#eef5ff',
    iconColor: '#1f7ae0',
    title: 'Announcements',
    desc: 'Publish company updates, offers and product launches.',
    count: '3 Active',
  },
  {
    id: 'featured',
    icon: 'star',
    iconBg: '#fff7e6',
    iconColor: '#f59e0b',
    title: 'Featured Content',
    desc: 'Choose featured products and documents shown first to visitors.',
    count: 'Curate',
  },
];

const recentlyUpdated = [
  { id: '1', title: 'Industrial Robot X1 updated', time: '2 hours ago' },
  { id: '2', title: 'Gallery image uploaded', time: 'Yesterday' },
  { id: '3', title: 'Company brochure replaced', time: 'Yesterday' },
  { id: '4', title: 'Announcement published', time: '3 days ago' },
];

const contentStatus = [
  { id: 'products', label: 'Products', state: 'complete' as const },
  { id: 'gallery', label: 'Gallery', state: 'complete' as const },
  { id: 'videos', label: 'Videos', state: 'missing' as const },
  { id: 'documents', label: 'Documents', state: 'complete' as const },
  { id: 'announcements', label: 'Announcements', state: 'active' as const },
];

const fabActions = [
  { id: 'add-product', icon: 'plus-square', label: 'Add Product' },
  { id: 'upload-images', icon: 'image', label: 'Upload Images' },
  { id: 'upload-video', icon: 'video', label: 'Upload Video' },
  { id: 'upload-document', icon: 'file-text', label: 'Upload Document' },
  { id: 'create-announcement', icon: 'mic', label: 'Create Announcement' },
];

const statusMeta = {
  complete: { icon: 'check-circle', color: '#10b981', label: 'Complete' },
  active: { icon: 'check-circle', color: '#10b981', label: 'Active' },
  missing: { icon: 'error', color: '#f59e0b', label: 'Missing' },
};

export default function ExhibitorContentScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [fabMenuOpen, setFabMenuOpen] = useState(false);
  const hasMissingContent = contentStatus.some((item) => item.state === 'missing');

  return (
    <View style={styles.screen}>

      {/* Top App Bar */}
      <View style={styles.appBar}>
        <View>
          <Text style={styles.appBarTitle}>Content Management</Text>
          <Text style={styles.appBarSubtitle}>Manage everything visitors see</Text>
        </View>
        <TouchableOpacity style={styles.searchIconButton} activeOpacity={0.8}>
          <Feather name="search" size={20} color="#111" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Search */}
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color="#8e8e93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, brochures, gallery..."
            placeholderTextColor="#8e8e93"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Content Modules */}
        <Text style={styles.sectionTitle}>Content Modules</Text>
        <View style={styles.moduleList}>
          {contentModules.map((module) => (
            <TouchableOpacity key={module.id} style={styles.moduleCard} activeOpacity={0.85}>
              <View style={[styles.moduleIconWrap, { backgroundColor: module.iconBg }]}>
                <Feather name={module.icon as any} size={26} color={module.iconColor} />
              </View>
              <View style={styles.moduleTextWrap}>
                <Text style={styles.moduleTitle}>{module.title}</Text>
                <Text style={styles.moduleDesc}>{module.desc}</Text>
                <View style={[styles.moduleCountPill, { backgroundColor: module.iconBg }]}>
                  <Text style={[styles.moduleCountText, { color: module.iconColor }]}>{module.count}</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#c7c7cc" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Recently Updated */}
        <Text style={styles.sectionTitle}>Recently Updated</Text>
        <View style={styles.activityCard}>
          {recentlyUpdated.map((item, index) => (
            <View key={item.id} style={[styles.activityRow, index !== recentlyUpdated.length - 1 && styles.borderBottom]}>
              <Feather name="check" size={16} color="#10b981" style={{ marginTop: 2 }} />
              <View style={styles.activityTextWrap}>
                <Text style={styles.activityTitle}>{item.title}</Text>
                <Text style={styles.activityTime}>{item.time}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Content Status */}
        <Text style={styles.sectionTitle}>Content Status</Text>
        <View style={styles.statusCard}>
          <View style={styles.checklist}>
            {contentStatus.map((item) => {
              const meta = statusMeta[item.state];
              return (
                <View key={item.id} style={styles.checkItem}>
                  <Text style={styles.checkLabel}>{item.label}</Text>
                  <View style={styles.checkValue}>
                    <MaterialIcons name={meta.icon as any} size={16} color={meta.color} />
                    <Text style={[styles.checkValueText, { color: meta.color }]}>{meta.label}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {hasMissingContent && (
            <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.85}>
              <Text style={styles.secondaryButtonText}>Review Missing Content</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Space for bottom nav */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { bottom: Math.max(insets.bottom, 16) + 80 }]}
        activeOpacity={0.9}
        onPress={() => setFabMenuOpen(true)}
      >
        <Feather name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      {/* FAB Quick Action Menu */}
      <Modal visible={fabMenuOpen} transparent animationType="fade" onRequestClose={() => setFabMenuOpen(false)}>
        <Pressable style={styles.fabBackdrop} onPress={() => setFabMenuOpen(false)}>
          <View style={[styles.fabMenuCard, { marginBottom: Math.max(insets.bottom, 16) + 150 }]}>
            {fabActions.map((action, index) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.fabMenuRow, index !== fabActions.length - 1 && styles.borderBottom]}
                activeOpacity={0.7}
                onPress={() => setFabMenuOpen(false)}
              >
                <View style={styles.fabMenuIconWrap}>
                  <Feather name={action.icon as any} size={18} color="#1f7ae0" />
                </View>
                <Text style={styles.fabMenuLabel}>{action.label}</Text>
                <Feather name="chevron-right" size={16} color="#c7c7cc" />
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f7',
  },
  appBarTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
    letterSpacing: -0.3,
  },
  appBarSubtitle: {
    fontSize: 13,
    color: '#8e8e93',
    fontWeight: '500',
    marginTop: 2,
  },
  searchIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f7fb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 14,
    height: 50,
    paddingHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111',
    fontWeight: '500',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
    marginBottom: 12,
    marginLeft: 4,
  },

  // Content Modules
  moduleList: {
    gap: 12,
    marginBottom: 24,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f2f2f7',
  },
  moduleIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleTextWrap: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
    marginBottom: 3,
  },
  moduleDesc: {
    fontSize: 12,
    color: '#8e8e93',
    lineHeight: 16,
    marginBottom: 8,
  },
  moduleCountPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  moduleCountText: {
    fontSize: 11,
    fontWeight: '800',
  },

  // Recently Updated
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f2f2f7',
  },
  activityRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  borderBottom: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5ea',
  },
  activityTextWrap: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    color: '#111',
    fontWeight: '600',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#8e8e93',
  },

  // Content Status
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f2f2f7',
  },
  checklist: {
    gap: 14,
    marginBottom: 4,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkLabel: {
    fontSize: 14,
    color: '#111',
    fontWeight: '600',
  },
  checkValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkValueText: {
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#f5f7fb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  secondaryButtonText: {
    color: '#111',
    fontSize: 14,
    fontWeight: '700',
  },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1f7ae0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1f7ae0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
  fabBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 17, 17, 0.35)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
  },
  fabMenuCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  fabMenuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  fabMenuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#eef5ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabMenuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
  },
});
