import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';

const mockImages = [
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=300',
];

const mockVideos = [
  { id: '1', title: 'Factory Tour 2026', duration: '2:45', thumb: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&q=80&w=400' },
];

const mockDocs = [
  { id: '1', name: 'Company_Profile_2026.pdf', size: '2.4 MB', date: 'Oct 12, 2026' },
  { id: '2', name: 'Technical_Datasheet_X1.pdf', size: '1.1 MB', date: 'Oct 14, 2026' },
];

export default function WizardStepMedia() {

  const renderSectionHeader = (title: string, desc?: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {desc && <Text style={styles.sectionDesc}>{desc}</Text>}
    </View>
  );

  const renderUploadBox = (title: string, sub: string, icon: any = 'upload-cloud') => (
    <TouchableOpacity style={styles.uploadBox} activeOpacity={0.8}>
      <View style={styles.uploadIconWrap}>
        <Feather name={icon} size={24} color="#1f7ae0" />
      </View>
      <Text style={styles.uploadTitle}>{title}</Text>
      <Text style={styles.uploadSub}>{sub}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Company Media</Text>
        <Text style={styles.headerSubtitle}>Upload images, videos and documents that visitors can access.</Text>
      </View>

      {/* SECTION 1: GALLERY */}
      <View style={styles.card}>
        {renderSectionHeader('Company Gallery')}
        
        <View style={styles.imageGrid}>
          {mockImages.map((uri, idx) => (
            <View key={idx} style={styles.imageGridItem}>
              <Image source={{ uri }} style={styles.gridImage} />
              <View style={styles.gridActions}>
                <TouchableOpacity style={styles.gridActionBtn}>
                  <Feather name="eye" size={12} color="#444" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.gridActionBtn}>
                  <Feather name="refresh-cw" size={12} color="#444" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.gridActionBtn}>
                  <Feather name="trash-2" size={12} color="#ff3b30" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          {/* Add New Placeholder in Grid */}
          <TouchableOpacity style={styles.addGridItem} activeOpacity={0.8}>
            <Feather name="plus" size={24} color="#1f7ae0" />
            <Text style={styles.addGridText}>Add Image</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.8}>
          <Feather name="upload" size={16} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.primaryBtnText}>Upload Images</Text>
        </TouchableOpacity>
      </View>

      {/* SECTION 2: VIDEOS */}
      <View style={styles.card}>
        {renderSectionHeader('Company Videos')}
        
        {mockVideos.map((video) => (
          <View key={video.id} style={styles.videoRow}>
            <View style={styles.videoThumbWrap}>
              <Image source={{ uri: video.thumb }} style={styles.videoThumb} />
              <View style={styles.playOverlay}>
                <Feather name="play" size={12} color="#fff" />
              </View>
            </View>
            <View style={styles.videoInfo}>
              <Text style={styles.videoTitle}>{video.title}</Text>
              <Text style={styles.videoDuration}>{video.duration}</Text>
            </View>
            <View style={styles.rowActions}>
              <TouchableOpacity style={styles.iconBtn}><Feather name="eye" size={16} color="#444" /></TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}><Feather name="refresh-cw" size={16} color="#444" /></TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}><Feather name="trash-2" size={16} color="#ff3b30" /></TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.8}>
          <Feather name="video" size={16} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.primaryBtnText}>Upload Video</Text>
        </TouchableOpacity>
      </View>

      {/* SECTION 3: DOCUMENTS */}
      <View style={styles.card}>
        {renderSectionHeader('Documents')}
        
        {mockDocs.map((doc) => (
          <View key={doc.id} style={styles.docRow}>
            <View style={styles.docIconWrap}>
              <Feather name="file-text" size={20} color="#ff3b30" />
            </View>
            <View style={styles.docInfo}>
              <Text style={styles.docName}>{doc.name}</Text>
              <View style={styles.docMetaRow}>
                <Text style={styles.docMeta}>{doc.size}</Text>
                <Text style={styles.docMetaDot}> • </Text>
                <Text style={styles.docMeta}>{doc.date}</Text>
              </View>
            </View>
            <View style={styles.rowActions}>
              <TouchableOpacity style={styles.iconBtn}><Feather name="eye" size={16} color="#444" /></TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}><Feather name="refresh-cw" size={16} color="#444" /></TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}><Feather name="trash-2" size={16} color="#ff3b30" /></TouchableOpacity>
            </View>
          </View>
        ))}

        {renderUploadBox('Upload Document', 'Drag & drop or tap to select (PDF, Max 10MB)', 'upload-cloud')}
      </View>

      {/* SECTION 4: FEATURED DOWNLOAD */}
      <View style={styles.card}>
        {renderSectionHeader('Featured Download', 'Select one document to appear prominently.')}
        <TouchableOpacity style={styles.dropdown} activeOpacity={0.7}>
          <Text style={styles.dropdownText}>Company_Profile_2026.pdf</Text>
          <Feather name="chevron-down" size={20} color="#8e8e93" />
        </TouchableOpacity>
      </View>

      {/* SECTION 5: LIVE PREVIEW */}
      <View style={styles.previewPlaceholder}>
        <Feather name="monitor" size={24} color="#8e8e93" style={{ marginBottom: 12 }} />
        <Text style={styles.previewTitle}>Media Live Preview</Text>
        <Text style={styles.previewSub}>This shows how gallery images, videos, and brochures will appear to visitors.</Text>
      </View>

      {/* HELP CARD */}
      <View style={styles.helpCard}>
        <Feather name="info" size={20} color="#1f7ae0" style={styles.helpIcon} />
        <View style={styles.helpTextWrap}>
          <Text style={styles.helpText}>
            All uploaded media will automatically appear on your company profile, product pages, and downloads section within the visitor application.
          </Text>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  card: {
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
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
  },
  sectionDesc: {
    fontSize: 13,
    color: '#8e8e93',
    marginTop: 4,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  imageGridItem: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f1f3f7',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gridActions: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  gridActionBtn: {
    padding: 4,
  },
  addGridItem: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: '#fafbfc',
    borderWidth: 1.5,
    borderColor: '#e5e5ea',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addGridText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f7ae0',
    marginTop: 4,
  },
  primaryBtn: {
    backgroundColor: '#111',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  videoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f7',
    marginBottom: 16,
  },
  videoThumbWrap: {
    width: 80,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 12,
  },
  videoThumb: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoInfo: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    marginBottom: 2,
  },
  videoDuration: {
    fontSize: 12,
    color: '#8e8e93',
  },
  rowActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    padding: 4,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f7',
    marginBottom: 16,
  },
  docIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#fff0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    marginBottom: 2,
  },
  docMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  docMeta: {
    fontSize: 12,
    color: '#8e8e93',
  },
  docMetaDot: {
    fontSize: 12,
    color: '#c7c7cc',
    marginHorizontal: 4,
  },
  uploadBox: {
    backgroundColor: '#fafbfc',
    borderWidth: 1.5,
    borderColor: '#e5e5ea',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eef5ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  uploadSub: {
    fontSize: 13,
    color: '#8e8e93',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e5ea',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownText: {
    fontSize: 15,
    color: '#111',
    fontWeight: '500',
  },
  previewPlaceholder: {
    backgroundColor: '#f9f9fb',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e5ea',
    borderStyle: 'dashed',
    marginBottom: 24,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#444',
    marginBottom: 6,
  },
  previewSub: {
    fontSize: 13,
    color: '#8e8e93',
    textAlign: 'center',
    lineHeight: 20,
  },
  helpCard: {
    flexDirection: 'row',
    backgroundColor: '#eef5ff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  helpIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  helpTextWrap: {
    flex: 1,
  },
  helpText: {
    fontSize: 14,
    color: '#1c4a85',
    lineHeight: 20,
    fontWeight: '500',
  },
});
