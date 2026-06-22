import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function MapScreen() {
    const chips: string[] = ['All', 'Exhibitors', 'Products', 'Sessions', 'Food Court', 'Restrooms', 'Emergency'];
    const [selectedChip, setSelectedChip] = useState('Exhibitors');

    return (
        <View style={styles.container}>
            {/* Interactive Map (Simulated) */}
            <View style={styles.mapArea}>
                <ScrollView horizontal maximumZoomScale={3} minimumZoomScale={0.5} showsHorizontalScrollIndicator={false}>
                    <ScrollView maximumZoomScale={3} minimumZoomScale={0.5} showsVerticalScrollIndicator={false}>
                        <View style={styles.simulatedMap}>
                            <View style={styles.hallA}>
                                <Text style={styles.hallText}>Hall A</Text>
                                <View style={[styles.booth, styles.activeBooth]}>
                                    <Text style={styles.boothText}>A-101</Text>
                                </View>
                                <View style={[styles.booth, { top: 150, left: 80 }]}><Text style={styles.boothText}>A-102</Text></View>
                                <View style={[styles.booth, { top: 250, left: 160 }]}><Text style={styles.boothText}>A-105</Text></View>
                            </View>
                            <View style={styles.hallB}>
                                <Text style={styles.hallText}>Hall B</Text>
                                <View style={[styles.booth, { top: 60, left: 60, height: 100 }]}><Text style={styles.boothText}>B-205</Text></View>
                                <View style={[styles.booth, { top: 180, left: 180 }]}><Text style={styles.boothText}>B-206</Text></View>
                            </View>
                            
                            {/* Navigation Path Highlight */}
                            <View style={styles.navPath} />
                        </View>
                    </ScrollView>
                </ScrollView>
            </View>

            {/* Overlays / Heads Up Display */}
            <View style={styles.topContainer}>
                {/* App Bar */}
                <View style={styles.appBar}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Feather name="chevron-left" size={24} color="#111" />
                    </TouchableOpacity>
                    <View style={styles.titleCenter}>
                        <Text style={styles.appTitle}>Floor Map</Text>
                        <Text style={styles.appSubtitle}>India Manufacturing Expo 2026</Text>
                    </View>
                    <View style={styles.rightIcons}>
                        <TouchableOpacity style={[styles.iconButton, { marginRight: 8 }]}>
                            <Feather name="filter" size={20} color="#111" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton}>
                            <Ionicons name="layers-outline" size={22} color="#111" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Floating Search Bar */}
                <View style={styles.searchContainer}>
                    <Feather name="search" size={20} color="#8e8e93" style={styles.searchIcon} />
                    <TextInput 
                        placeholder="Search exhibitors, booths, halls..." 
                        placeholderTextColor="#8e8e93"
                        style={styles.searchInput}
                    />
                    <TouchableOpacity>
                        <Feather name="mic" size={20} color="#4f6cf6" />
                    </TouchableOpacity>
                </View>

                {/* Horizontal Filter Chips */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContainer}>
                    {chips.map(chip => (
                        <TouchableOpacity 
                            key={chip} 
                            style={[styles.chip, selectedChip === chip && styles.activeChip]}
                            onPress={() => setSelectedChip(chip)}
                        >
                            <Text style={[styles.chipText, selectedChip === chip && styles.activeChipText]}>{chip}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                
                {/* Live Status Cards */}
                <View style={styles.liveStatusContainer}>
                    <View style={styles.liveStatusCard}>
                        <View style={styles.dotOrange} />
                        <Text style={styles.liveStatusText}>Crowded Area: Hall A</Text>
                    </View>
                    <View style={[styles.liveStatusCard, { marginTop: 8 }]}>
                        <View style={[styles.dotOrange, { backgroundColor: '#2ecc71' }]} />
                        <Text style={styles.liveStatusText}>Live Session Nearby</Text>
                    </View>
                </View>
            </View>

            {/* Quick Action Buttons */}
            <View style={styles.floatingRight}>
                <TouchableOpacity style={styles.fabSmall}>
                    <Feather name="navigation" size={20} color="#1a1a1a" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.fabSmall}>
                    <MaterialCommunityIcons name="qrcode-scan" size={20} color="#1a1a1a" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.fabSmall}>
                    <Feather name="map-pin" size={20} color="#1a1a1a" />
                </TouchableOpacity>
            </View>

            {/* Information Bottom Sheet (Preview) */}
            <View style={styles.bottomSheet}>
                <View style={styles.dragHandle} />
                
                <View style={styles.sheetContent}>
                    <View style={styles.sheetHeader}>
                        <View style={styles.companyLogo}>
                            <Text style={styles.companyLogoText}>TM</Text>
                        </View>
                        <View style={styles.companyInfo}>
                            <Text style={styles.companyName}>Tata Motors</Text>
                            <Text style={styles.boothNumber}>Booth A-101 • Automotive</Text>
                        </View>
                        <TouchableOpacity style={styles.bookmarkBtn}>
                            <Ionicons name="bookmark" size={20} color="#4f6cf6" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.sheetActions}>
                        <TouchableOpacity style={styles.primaryAction}>
                            <Feather name="navigation" size={16} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.primaryActionText}>Directions</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.secondaryAction}>
                            <Text style={styles.secondaryActionText}>View Profile</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Navigation Mode Preview Example */}
                    <View style={styles.navPreview}>
                        <View style={styles.navPreviewLeft}>
                            <MaterialCommunityIcons name="walk" size={24} color="#4f6cf6" />
                        </View>
                        <View style={styles.navPreviewTextContainer}>
                            <Text style={styles.navTime}>2 minutes <Text style={styles.navDistance}>(120 meters)</Text></Text>
                            <Text style={styles.navPathText}>Current Location → Hall A</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    mapArea: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#efefef', // Map base color
    },
    simulatedMap: {
        width: 1200,
        height: 1200,
        padding: 50,
        paddingTop: 300,
        flexDirection: 'row',
    },
    hallA: {
        width: 400,
        height: 550,
        backgroundColor: '#e6f0ff',
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#d2e3fc',
        padding: 20,
        marginRight: 40,
    },
    hallB: {
        width: 450,
        height: 600,
        backgroundColor: '#f4ebfa',
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#e9d6f8',
        padding: 20,
        marginTop: 100,
    },
    hallText: {
        fontSize: 28,
        fontWeight: '800',
        color: 'rgba(0,0,0,0.1)',
        letterSpacing: 2,
        position: 'absolute',
        top: 20,
        left: 20,
    },
    booth: {
        position: 'absolute',
        width: 80,
        height: 60,
        backgroundColor: '#fff',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        top: 100,
        left: 100,
    },
    activeBooth: {
        borderColor: '#4f6cf6',
        borderWidth: 2,
        shadowColor: '#4f6cf6',
        shadowOpacity: 0.4,
        shadowRadius: 10,
    },
    boothText: {
        fontWeight: '700',
        color: '#1a1a1a',
        fontSize: 14,
    },
    navPath: {
        position: 'absolute',
        width: 180,
        height: 6,
        backgroundColor: '#4f6cf6',
        top: 350,
        left: 250,
        transform: [{ rotate: '30deg' }],
        borderRadius: 3,
        opacity: 0.8,
    },
    topContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        paddingTop: 10,
    },
    appBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 12,
        backgroundColor: 'rgba(255,255,255,0.4)',
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
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    titleCenter: {
        alignItems: 'center',
    },
    appTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    appSubtitle: {
        fontSize: 11,
        color: '#8e8e93',
        marginTop: 2,
        fontWeight: '500',
    },
    rightIcons: {
        flexDirection: 'row',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 16,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 4,
        marginBottom: 12,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#1a1a1a',
        fontWeight: '500',
    },
    chipsContainer: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    chip: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    activeChip: {
        backgroundColor: '#1a1a1a',
    },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    activeChipText: {
        color: '#fff',
    },
    liveStatusContainer: {
        paddingHorizontal: 16,
        marginTop: 8,
    },
    liveStatusCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.95)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        alignSelf: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
    },
    dotOrange: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#f39c12',
        marginRight: 8,
    },
    liveStatusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    floatingRight: {
        position: 'absolute',
        right: 16,
        top: 300,
        zIndex: 10,
    },
    fabSmall: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingTop: 12,
        paddingHorizontal: 20,
        paddingBottom: 110, // Margin to allow bottom navigation to overlay cleanly
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 10,
        zIndex: 20,
    },
    dragHandle: {
        width: 36,
        height: 5,
        backgroundColor: '#e0e0e0',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 20,
    },
    sheetContent: {},
    sheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    companyLogo: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#4f6cf6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    companyLogoText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 18,
    },
    companyInfo: {
        flex: 1,
    },
    companyName: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1a1a1a',
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    boothNumber: {
        fontSize: 13,
        color: '#8e8e93',
        fontWeight: '500',
    },
    bookmarkBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f6f7fa',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sheetActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    primaryAction: {
        flex: 1.2,
        flexDirection: 'row',
        backgroundColor: '#4f6cf6',
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    primaryActionText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },
    secondaryAction: {
        flex: 1,
        backgroundColor: '#f6f7fa',
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryActionText: {
        color: '#1a1a1a',
        fontWeight: '700',
        fontSize: 14,
    },
    navPreview: {
        backgroundColor: '#f8f9fc',
        padding: 14,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#eef2ff',
    },
    navPreviewLeft: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#eef2ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    navPreviewTextContainer: {
        flex: 1,
    },
    navTime: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 2,
    },
    navDistance: {
        fontSize: 13,
        color: '#8e8e93',
        fontWeight: '500',
    },
    navPathText: {
        fontSize: 13,
        color: '#8e8e93',
        fontWeight: '500',
    }
});