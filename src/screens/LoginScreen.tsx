import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const exhibitions = [
  'India Manufacturing Expo 2026',
  'Auto Expo 2026',
  'PharmaTech Expo',
  'Build India Expo',
  'Smart City Expo',
];

export default function LoginScreen({ onLogin, onEnterExhibitorDemo }: { onLogin: () => void, onEnterExhibitorDemo: () => void }) {
  const insets = useSafeAreaInsets();
  const [selectedExhibition, setSelectedExhibition] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.screen}>
      
      {/* 1. Hero Illustration */}
      <View style={styles.heroContainer}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200' }} 
          style={styles.heroImage} 
        />
        <LinearGradient
          colors={['transparent', 'rgba(247, 248, 251, 0.95)', '#f7f8fb']}
          style={styles.heroGradient}
        />
      </View>

      {/* Main Content Area - overlaps the bottom of the hero slightly */}
      <View style={[styles.content, { paddingTop: Math.max(insets.top, 24) }]}>
        
        {/* 2. Welcome text */}
        <View style={styles.header}>
          <Text style={styles.heroTitle}>Welcome to ExpoConnect</Text>
          <Text style={styles.heroSubtitle}>
            Discover exhibitions, connect with exhibitors, and explore products—all in one app.
          </Text>
        </View>

        {/* 3. Choose Exhibition */}
        <View style={[styles.dropdownWrapper, { zIndex: 10 }]}>
          <TouchableOpacity 
            style={styles.dropdownSelector} 
            activeOpacity={0.8}
            onPress={() => setDropdownOpen(!dropdownOpen)}
          >
            <Feather name="search" size={18} color="#8e8e93" />
            <Text style={[styles.dropdownText, !selectedExhibition && { color: '#8e8e93' }]}>
              {selectedExhibition || 'Select an Exhibition'}
            </Text>
            <Feather name={dropdownOpen ? "chevron-up" : "chevron-down"} size={18} color="#8e8e93" />
          </TouchableOpacity>

          {dropdownOpen && (
            <View style={styles.dropdownList}>
              {exhibitions.map((item, index) => (
                <TouchableOpacity 
                  key={item} 
                  style={[styles.dropdownItem, index !== exhibitions.length - 1 && styles.borderBottom]}
                  onPress={() => {
                    setSelectedExhibition(item);
                    setDropdownOpen(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{item}</Text>
                  {selectedExhibition === item && <Feather name="check" size={16} color="#1f7ae0" />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 4 & 5. Login Form & Guest Button */}
        <View style={[styles.card, { opacity: selectedExhibition ? 1 : 0.5 }]} pointerEvents={selectedExhibition ? 'auto' : 'none'}>
          <View style={styles.inputContainer}>
            <Feather name="mail" size={18} color="#8e8e93" style={styles.inputIcon} />
            <TextInput 
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#8e8e93"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Feather name="lock" size={18} color="#8e8e93" style={styles.inputIcon} />
            <TextInput 
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#8e8e93"
              secureTextEntry
            />
          </View>
          
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8} onPress={onLogin}>
            <Text style={styles.primaryButtonText}>Login</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8} onPress={onEnterExhibitorDemo}>
            <Text style={styles.secondaryButtonText}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }} />

        {/* 6. Sign Up */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity>
            <Text style={styles.footerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f7f8fb',
  },
  heroContainer: {
    height: '25%',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginTop: '10%',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    fontWeight: '500',
  },
  dropdownWrapper: {
    marginBottom: 20,
    position: 'relative',
  },
  dropdownSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  dropdownText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '500',
    color: '#111',
  },
  dropdownList: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  borderBottom: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5ea',
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f2f2f7',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f8fb',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111',
    fontWeight: '500',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 18,
  },
  forgotPasswordText: {
    color: '#1f7ae0',
    fontSize: 13,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#111',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#111',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e5ea',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#8e8e93',
    fontSize: 12,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#111',
  },
  secondaryButtonText: {
    color: '#111',
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#444',
    fontWeight: '500',
  },
  footerLink: {
    fontSize: 14,
    color: '#1f7ae0',
    fontWeight: '700',
  },
});
