import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Modal, ScrollView, SafeAreaView, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface Product {
  id: string;
  name: string;
  category: string;
  shortDesc: string;
  isFeatured: boolean;
  isActive: boolean;
  image: string;
}

const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Industrial Robot X1',
    category: 'Robotics',
    shortDesc: 'High-speed 6-axis robotic arm for automated assembly.',
    isFeatured: true,
    isActive: true,
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=400',
  }
];

export default function WizardStepProducts() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const openAddModal = () => {
    setEditingId(null);
    setIsFeatured(false);
    setIsActive(true);
    setIsModalVisible(true);
  };

  const openEditModal = (product: Product) => {
    setEditingId(product.id);
    setIsFeatured(product.isFeatured);
    setIsActive(product.isActive);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const duplicateProduct = (product: Product) => {
    setProducts([...products, { ...product, id: Date.now().toString(), name: product.name + ' (Copy)' }]);
  };

  const renderProductCard = (product: Product) => (
    <View key={product.id} style={styles.productCard}>
      <Image source={{ uri: product.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <View style={styles.productHeaderRow}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={[styles.statusBadge, product.isActive ? styles.statusActive : styles.statusInactive]}>
            <Text style={[styles.statusText, product.isActive ? styles.statusTextActive : styles.statusTextInactive]}>
              {product.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
        <Text style={styles.productCategory}>{product.category}</Text>
        <Text style={styles.productDesc} numberOfLines={2}>{product.shortDesc}</Text>
        
        {product.isFeatured && (
          <View style={styles.featuredBadge}>
            <Feather name="star" size={12} color="#f59e0b" style={{ marginRight: 4 }} />
            <Text style={styles.featuredText}>Featured Product</Text>
          </View>
        )}

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(product)}>
            <Feather name="edit-2" size={14} color="#111" />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => duplicateProduct(product)}>
            <Feather name="copy" size={14} color="#111" />
            <Text style={styles.actionText}>Duplicate</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => deleteProduct(product.id)}>
            <Feather name="trash-2" size={14} color="#ff3b30" />
            <Text style={[styles.actionText, { color: '#ff3b30' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderInput = (label: string, placeholder: string, multiline = false) => (
    <View style={styles.formGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput 
        style={[styles.input, multiline && styles.textArea]} 
        placeholder={placeholder}
        placeholderTextColor="#8e8e93"
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
      />
    </View>
  );

  const renderUploadBox = (title: string, sub: string, icon: any) => (
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
        <Text style={styles.headerTitle}>Manage Your Products</Text>
        <Text style={styles.headerSubtitle}>Add the products visitors will discover during the exhibition.</Text>
      </View>

      <TouchableOpacity style={styles.primaryAddBtn} activeOpacity={0.8} onPress={openAddModal}>
        <Feather name="plus" size={20} color="#fff" />
        <Text style={styles.primaryAddText}>Add Product</Text>
      </TouchableOpacity>

      <View style={styles.productList}>
        {products.map(renderProductCard)}
      </View>

      <View style={styles.helpCard}>
        <Feather name="info" size={20} color="#1f7ae0" style={styles.helpIcon} />
        <View style={styles.helpTextWrap}>
          <Text style={styles.helpText}>
            Products added here will automatically appear on your public exhibitor profile and in the exhibition product catalogue.
          </Text>
        </View>
      </View>

      {/* Edit/Add Modal (Full Screen Takeover) */}
      <Modal visible={isModalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Product' : 'Add Product'}</Text>
            <TouchableOpacity onPress={closeModal} style={styles.modalSave}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            
            {/* Toggles */}
            <View style={styles.modalCard}>
              <View style={styles.toggleRow}>
                <View>
                  <Text style={styles.toggleLabel}>Active Status</Text>
                  <Text style={styles.toggleSub}>Product will be visible to visitors.</Text>
                </View>
                <Switch 
                  value={isActive} 
                  onValueChange={setIsActive}
                  trackColor={{ false: '#e5e5ea', true: '#34c759' }}
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.toggleRow}>
                <View>
                  <Text style={styles.toggleLabel}>Featured Product</Text>
                  <Text style={styles.toggleSub}>Highlight this product on your profile.</Text>
                </View>
                <Switch 
                  value={isFeatured} 
                  onValueChange={setIsFeatured}
                  trackColor={{ false: '#e5e5ea', true: '#1f7ae0' }}
                />
              </View>
            </View>

            {/* Basic Info */}
            <View style={styles.modalCard}>
              <Text style={styles.modalCardTitle}>Basic Information</Text>
              {renderInput('Product Name', 'e.g. Industrial Robot X1')}
              {renderInput('Product Category', 'e.g. Automation')}
              {renderInput('Short Description', 'A one sentence summary of the product.')}
              {renderInput('Detailed Description', 'Full product description...', true)}
            </View>

            {/* Specifications */}
            <View style={styles.modalCard}>
              <Text style={styles.modalCardTitle}>Specifications</Text>
              {renderInput('Technical Specifications', 'List key specs...')}
              {renderInput('Applications', 'Where is this used?')}
              {renderInput('Industries Served', 'e.g. Automotive, Aerospace')}
              {renderInput('Key Features', 'What makes this unique?', true)}
            </View>

            {/* Media Upload */}
            <View style={styles.modalCard}>
              <Text style={styles.modalCardTitle}>Media Gallery</Text>
              <Text style={styles.modalCardSub}>Add multiple images and optional video.</Text>
              {renderUploadBox('Upload Product Images', 'Drag & drop or tap to select (PNG, JPG)', 'image')}
              <View style={{ height: 16 }} />
              {renderUploadBox('Upload Product Video', 'Optional (MP4, Max 50MB)', 'video')}
            </View>

            {/* Documents */}
            <View style={styles.modalCard}>
              <Text style={styles.modalCardTitle}>Product Documents</Text>
              {renderUploadBox('PDF Brochure', 'Upload product brochure', 'file-text')}
              <View style={{ height: 12 }} />
              {renderUploadBox('Technical Datasheet', 'Upload datasheet', 'file')}
            </View>

            {/* Live Preview Placeholder */}
            <View style={styles.previewPlaceholder}>
              <Feather name="eye" size={24} color="#8e8e93" style={{ marginBottom: 12 }} />
              <Text style={styles.previewTitle}>Live Preview Available After Saving</Text>
              <Text style={styles.previewSub}>See exactly how visitors will view this product.</Text>
            </View>

            <View style={{ height: 60 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  primaryAddBtn: {
    backgroundColor: '#111',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 14,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryAddText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  productList: {
    marginBottom: 24,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f2f2f7',
  },
  productImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#f1f3f7',
  },
  productInfo: {
    padding: 20,
  },
  productHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  productName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusActive: {
    backgroundColor: '#e6f8ec',
  },
  statusInactive: {
    backgroundColor: '#f2f2f7',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextActive: {
    color: '#10b981',
  },
  statusTextInactive: {
    color: '#8e8e93',
  },
  productCategory: {
    fontSize: 13,
    color: '#8e8e93',
    fontWeight: '600',
    marginBottom: 12,
  },
  productDesc: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 16,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  featuredText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#b45309',
  },
  actionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f1f3f7',
    paddingTop: 16,
    gap: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111',
    marginLeft: 6,
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
  
  // Modal Styles
  modalSafe: {
    flex: 1,
    backgroundColor: '#f6f7fa',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f7',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#ff3b30',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f7ae0',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalCard: {
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
  modalCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
    marginBottom: 16,
  },
  modalCardSub: {
    fontSize: 13,
    color: '#8e8e93',
    marginBottom: 20,
    marginTop: -12,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  toggleSub: {
    fontSize: 12,
    color: '#8e8e93',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f3f7',
    marginVertical: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e5ea',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#111',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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
  previewPlaceholder: {
    backgroundColor: '#f1f3f7',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e5ea',
    borderStyle: 'dashed',
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
  },
});
