import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface WizardLayoutProps {
  stepTitle: string;
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onSaveDraft: () => void;
  onSkip: () => void;
  onContinue: () => void;
  children: ReactNode;
  isLastStep?: boolean;
}

export default function WizardLayout({
  stepTitle,
  currentStep,
  totalSteps,
  onBack,
  onSaveDraft,
  onSkip,
  onContinue,
  children,
  isLastStep = false,
}: WizardLayoutProps) {
  const insets = useSafeAreaInsets();
  const progressPercent = (currentStep / totalSteps) * 100;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.screen, { paddingTop: insets.top }]}>
      
      {/* Top Navigation */}
      <View style={styles.topNav}>
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Feather name="arrow-left" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.stepTitle}>{stepTitle}</Text>
          <View style={styles.placeholderIcon} />
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressTextRow}>
            <Text style={styles.progressText}>Step {currentStep} of {totalSteps}</Text>
            <Text style={styles.progressText}>{Math.round(progressPercent)}% Complete</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>
      </View>

      {/* Content Area */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {children}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {!isLastStep ? (
          <>
            <TouchableOpacity style={styles.saveDraftBtn} activeOpacity={0.7} onPress={onSaveDraft}>
              <Text style={styles.saveDraftText}>Save Draft</Text>
            </TouchableOpacity>

            <View style={styles.rightActions}>
              <TouchableOpacity style={styles.skipBtn} activeOpacity={0.7} onPress={onSkip}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.continueBtn} activeOpacity={0.8} onPress={onContinue}>
                <Text style={styles.continueText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.lastStepActions}>
            <TouchableOpacity style={styles.editBtn} activeOpacity={0.8} onPress={onBack}>
              <Text style={styles.editText}>Edit Information</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.publishBtn} activeOpacity={0.8} onPress={onContinue}>
              <Text style={styles.publishText}>Publish Booth</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f6f7fa',
  },
  topNav: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f7',
    paddingBottom: 16,
    zIndex: 10,
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    padding: 4,
  },
  placeholderIcon: {
    width: 32,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginTop: 4,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8e8e93',
    textTransform: 'uppercase',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#f1f3f7',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1f7ae0',
    borderRadius: 3,
  },
  content: {
    padding: 20,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e5ea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 8,
  },
  saveDraftBtn: {
    paddingVertical: 12,
  },
  saveDraftText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8e8e93',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  skipBtn: {
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },
  continueBtn: {
    backgroundColor: '#111',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  continueText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  lastStepActions: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  editBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e5e5ea',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  editText: {
    color: '#111',
    fontSize: 15,
    fontWeight: '700',
  },
  publishBtn: {
    flex: 1,
    backgroundColor: '#10b981', // Emerald green for publishing
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  publishText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
