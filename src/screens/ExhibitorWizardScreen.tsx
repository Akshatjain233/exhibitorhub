import React from 'react';
import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity } from 'react-native';
import WizardLayout from '../components/WizardLayout';
import WizardStepProducts from '../components/WizardStepProducts';
import WizardStepMedia from '../components/WizardStepMedia';
import { Feather } from '@expo/vector-icons';

interface ExhibitorWizardProps {
  stepIndex: number; // 1 to 5
  onNext: () => void;
  onBack: () => void;
  onSaveDraft: () => void;
  onSkip: () => void;
  onPublish: () => void;
}

// User condensed the steps from 8 to 5.
const stepsConfig = [
  { title: 'Company Information' },         // 1
  { title: 'Booth & Contact Information' }, // 2
  { title: 'Products' },                    // 3
  { title: 'Media & Documents' },           // 4
  { title: 'Preview Public Profile' }       // 5
];

const exhibitor = {
  companyName: "ABC Automation Pvt. Ltd.",
  exhibitionName: "India Manufacturing Expo 2026",
  hall: "Hall A",
  booth: "A-24",
};

export default function ExhibitorWizardScreen({
  stepIndex,
  onNext,
  onBack,
  onSaveDraft,
  onSkip,
  onPublish
}: ExhibitorWizardProps) {
  const stepConfig = stepsConfig[stepIndex - 1];
  const totalSteps = 5;
  const isLastStep = stepIndex === totalSteps;

  const renderDropdown = (label: string, placeholder: string) => (
    <View style={styles.formGroup}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.dropdown} activeOpacity={0.7}>
        <Text style={styles.dropdownText}>{placeholder}</Text>
        <Feather name="chevron-down" size={20} color="#8e8e93" />
      </TouchableOpacity>
    </View>
  );

  const renderInput = (label: string, placeholder: string, keyboardType: any = 'default', multiline = false) => (
    <View style={styles.formGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput 
        style={[styles.input, multiline && styles.textAreaSmall]} 
        placeholder={placeholder}
        placeholderTextColor="#8e8e93"
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );

  const renderInputWithIcon = (label: string, placeholder: string, iconName: any) => (
    <View style={styles.formGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWithIcon}>
        <Feather name={iconName} size={18} color="#8e8e93" style={styles.inputIcon} />
        <TextInput 
          style={styles.inputField} 
          placeholder={placeholder}
          placeholderTextColor="#8e8e93"
        />
      </View>
    </View>
  );

  const renderImageUpload = (label: string, isBanner: boolean = false) => (
    <View style={styles.formGroup}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={[styles.uploadBox, isBanner && styles.uploadBoxBanner]} activeOpacity={0.8}>
        <View style={styles.uploadIconWrap}>
          <Feather name="upload-cloud" size={24} color="#1f7ae0" />
        </View>
        <Text style={styles.uploadTitle}>Tap to upload or drag and drop</Text>
        <Text style={styles.uploadSub}>PNG, JPG, JPEG (Max 5MB)</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSectionCard = (title: string, children: React.ReactNode) => (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );

  const renderFormContent = () => {
    switch (stepIndex) {
      case 1:
        return (
          <>
            <View style={styles.readOnlyCard}>
              <View style={styles.readOnlyHeader}>
                <Feather name="lock" size={16} color="#8e8e93" />
                <Text style={styles.readOnlyTitle}>System Information</Text>
              </View>
              <Text style={styles.readOnlyDesc}>These fields are pre-filled by the Admin and cannot be edited.</Text>
              
              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyLabel}>Company Name</Text>
                <View style={styles.disabledInput}>
                  <Text style={styles.disabledInputText}>{exhibitor.companyName}</Text>
                  <Feather name="lock" size={16} color="#c7c7cc" />
                </View>
              </View>
              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyLabel}>Exhibition Name</Text>
                <View style={styles.disabledInput}>
                  <Text style={styles.disabledInputText}>{exhibitor.exhibitionName}</Text>
                  <Feather name="lock" size={16} color="#c7c7cc" />
                </View>
              </View>
              
              <View style={styles.row}>
                <View style={[styles.readOnlyField, { flex: 1, marginRight: 12 }]}>
                  <Text style={styles.readOnlyLabel}>Hall Number</Text>
                  <View style={styles.disabledInput}>
                    <Text style={styles.disabledInputText}>{exhibitor.hall}</Text>
                    <Feather name="lock" size={16} color="#c7c7cc" />
                  </View>
                </View>
                <View style={[styles.readOnlyField, { flex: 1 }]}>
                  <Text style={styles.readOnlyLabel}>Booth Number</Text>
                  <View style={styles.disabledInput}>
                    <Text style={styles.disabledInputText}>{exhibitor.booth}</Text>
                    <Feather name="lock" size={16} color="#c7c7cc" />
                  </View>
                </View>
              </View>
            </View>

            {renderImageUpload("Company Logo")}
            {renderImageUpload("Company Banner", true)}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Company Description</Text>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                placeholder="Enter a comprehensive description of your business..."
                placeholderTextColor="#8e8e93"
                multiline
                numberOfLines={6}
              />
            </View>

            {renderDropdown("Industry", "Select Industry")}
            {renderDropdown("Business Category", "Select Category")}
            
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 12 }}>
                {renderDropdown("Established Year", "YYYY")}
              </View>
              <View style={{ flex: 1 }}>
                {renderDropdown("Company Size", "Select Size")}
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 12 }}>
                {renderDropdown("Country", "Select Country")}
              </View>
              <View style={{ flex: 1 }}>
                {renderInput("City", "Enter City")}
              </View>
            </View>

            {renderInput("Website", "https://", "url")}

            <View style={styles.helpCard}>
              <Feather name="info" size={20} color="#1f7ae0" style={styles.helpIcon} />
              <View style={styles.helpTextWrap}>
                <Text style={styles.helpText}>
                  Your company profile helps visitors discover your business during the exhibition. Make sure the information is accurate and up to date.
                </Text>
              </View>
            </View>
          </>
        );
      
      case 2:
        return (
          <>
            {renderSectionCard("Booth Information", 
              <>
                {renderInput("Booth Tagline", "e.g. Innovating the Future of Robotics")}
                {renderInput("Short Booth Description", "Briefly describe what visitors will find at your booth...", "default", true)}
                {renderDropdown("Product Categories", "Select Categories (Multi)")}
                {renderDropdown("Business Categories", "Select Categories (Multi)")}
                {renderInput("Products Available At Booth", "e.g. Robot Arms, Conveyors, PLCs")}
                {renderInput("Booth Highlights", "List key attractions at your booth...", "default", true)}
              </>
            )}

            {renderSectionCard("Contact Details", 
              <>
                {renderInput("Primary Contact Person", "Full Name")}
                {renderInput("Designation", "e.g. Sales Director")}
                
                <View style={styles.row}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    {renderInput("Business Email", "email@company.com", "email-address")}
                  </View>
                  <View style={{ flex: 1 }}>
                    {renderInput("Support Email", "support@company.com", "email-address")}
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    {renderInput("Phone Number", "+1 234 567 8900", "phone-pad")}
                  </View>
                  <View style={{ flex: 1 }}>
                    {renderInput("WhatsApp Number", "+1 234 567 8900", "phone-pad")}
                  </View>
                </View>

                {renderInput("Office Address", "Full HQ or Branch Address", "default", true)}

                <TouchableOpacity style={styles.addRepButton} activeOpacity={0.7}>
                  <Feather name="plus" size={18} color="#1f7ae0" />
                  <Text style={styles.addRepText}>Add Business Representative</Text>
                </TouchableOpacity>
              </>
            )}

            {renderSectionCard("Online Presence", 
              <>
                {renderInputWithIcon("Website", "https://", "globe")}
                {renderInputWithIcon("LinkedIn", "https://linkedin.com/company/", "linkedin")}
                {renderInputWithIcon("Facebook", "https://facebook.com/", "facebook")}
                {renderInputWithIcon("Instagram", "https://instagram.com/", "instagram")}
                {renderInputWithIcon("YouTube", "https://youtube.com/c/", "youtube")}
                {renderInputWithIcon("X (Twitter)", "https://x.com/", "twitter")}
              </>
            )}

            {renderSectionCard("Visitor Information", 
              <>
                {renderInput("Business Hours During Exhibition", "e.g. 9:00 AM - 6:00 PM")}
                {renderDropdown("Languages Spoken", "Select Languages")}
                {renderInput("Company Services", "e.g. Manufacturing, Installation, Custom Solutions", "default", true)}
              </>
            )}

            <View style={styles.helpCard}>
              <Feather name="info" size={20} color="#1f7ae0" style={styles.helpIcon} />
              <View style={styles.helpTextWrap}>
                <Text style={styles.helpText}>
                  These details will appear on your public exhibitor profile and help visitors contact your company during the exhibition.
                </Text>
              </View>
            </View>
          </>
        );

      case 3:
        return <WizardStepProducts />;

      case 4:
        return <WizardStepMedia />;

      case 5:
        return (
          <View style={styles.previewContainer}>
            <View style={styles.previewHeader}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800' }} style={styles.previewImage} />
              <View style={styles.previewLogo}>
                <Text style={styles.previewLogoText}>ABC</Text>
              </View>
            </View>
            <View style={styles.previewBody}>
              <Text style={styles.previewTitle}>ABC Automation Pvt. Ltd.</Text>
              <Text style={styles.previewSubtitle}>Hall A • Booth A-24</Text>
              <View style={styles.previewTags}>
                <View style={styles.tag}><Text style={styles.tagText}>Manufacturing</Text></View>
                <View style={styles.tag}><Text style={styles.tagText}>Robotics</Text></View>
              </View>
              <Text style={styles.previewDesc}>
                Leading provider of industrial automation solutions. We specialize in robotic assembly lines and smart manufacturing software.
              </Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <WizardLayout
      stepTitle={stepConfig.title}
      currentStep={stepIndex}
      totalSteps={totalSteps}
      onBack={onBack}
      onSaveDraft={onSaveDraft}
      onSkip={onSkip}
      onContinue={isLastStep ? onPublish : onNext}
      isLastStep={isLastStep}
    >
      <View style={styles.contentWrapper}>
        {renderFormContent()}
      </View>
    </WizardLayout>
  );
}

const styles = StyleSheet.create({
  contentWrapper: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  sectionCard: {
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
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f7',
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
    letterSpacing: -0.3,
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
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e5ea',
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  inputField: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#111',
  },
  textArea: {
    height: 140,
    textAlignVertical: 'top',
  },
  textAreaSmall: {
    height: 80,
    textAlignVertical: 'top',
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
    color: '#8e8e93',
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
  uploadBoxBanner: {
    paddingVertical: 40,
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
  readOnlyCard: {
    backgroundColor: '#f9f9fb',
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  readOnlyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  readOnlyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
    marginLeft: 8,
  },
  readOnlyDesc: {
    fontSize: 13,
    color: '#666',
    marginBottom: 20,
  },
  readOnlyField: {
    marginBottom: 16,
  },
  readOnlyLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
  },
  disabledInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f2f3f7',
    borderWidth: 1,
    borderColor: '#e5e5ea',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  disabledInputText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  helpCard: {
    flexDirection: 'row',
    backgroundColor: '#eef5ff',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
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
  placeholderCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5ea',
    borderStyle: 'dashed',
    marginTop: 20,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  placeholderDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  previewContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f2f2f7',
  },
  previewHeader: {
    height: 140,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  previewLogo: {
    position: 'absolute',
    bottom: -24,
    left: 20,
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#1f7ae0',
    borderWidth: 3,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewLogoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  previewBody: {
    padding: 20,
    paddingTop: 36,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
    marginBottom: 4,
  },
  previewSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f7ae0',
    marginBottom: 16,
  },
  previewTags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#f2f3f7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#444',
  },
  previewDesc: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
  },
  addRepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#1f7ae0',
    borderStyle: 'dashed',
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: '#f7fbff',
  },
  addRepText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f7ae0',
    marginLeft: 8,
  },
});
