import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Pressable,
  PanResponder,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const dateItems = [
  { day: 'Day 1', date: '17 Sept' },
  { day: 'Day 2', date: '18 Sept' },
  { day: 'Day 3', date: '19 Sept' },
  { day: 'Day 4', date: '20 Sept' },
];

const chips = ['All', 'Keynotes', 'Seminars', 'Workshops', 'Product Launches', 'Networking', 'Panel Discussions', 'Live Demos'];
const recommended = ['AI in Smart Manufacturing', 'Future of Industrial Automation', 'Industry 5.0 Panel'];

const timeline = [
  {
    id: 's1',
    time: '09:00 AM',
    title: 'Opening Keynote: The Future of Smart Industry',
    type: 'Keynote',
    color: '#1f7ae0',
    speaker: 'Sh. Piyush Goyal',
    hall: 'Main Auditorium',
    duration: '60 min',
    seats: '48 seats left',
    live: true,
  },
  {
    id: 's2',
    time: '10:30 AM',
    title: 'Robotics in Manufacturing Lines',
    type: 'Workshop',
    color: '#2ecc71',
    speaker: 'Dr. Priya Sharma',
    hall: 'Hall B',
    duration: '45 min',
    seats: '26 seats left',
    live: false,
  },
  {
    id: 's3',
    time: '12:00 PM',
    title: 'Next-Gen Product Launch Showcase',
    type: 'Product Launch',
    color: '#f39c12',
    speaker: 'Siemens India',
    hall: 'Hall C',
    duration: '30 min',
    seats: '12 seats left',
    live: false,
  },
  {
    id: 's4',
    time: '02:00 PM',
    title: 'Business Networking Lunch',
    type: 'Networking',
    color: '#8e44ad',
    speaker: 'Hosted by CII',
    hall: 'Networking Lounge',
    duration: '60 min',
    seats: 'Open table seating',
    live: false,
  },
  {
    id: 's5',
    time: '04:00 PM',
    title: 'Industry 4.0 Seminar',
    type: 'Seminar',
    color: '#9aa0a6',
    speaker: 'Bosch Rexroth',
    hall: 'Hall D',
    duration: '40 min',
    seats: '14 seats left',
    live: false,
  },
];

const featuredSpeakers = [
  { id: 'f1', name: 'Dr. Priya Sharma', company: 'NASSCOM', role: 'Technology Leader', time: '10:30 AM' },
  { id: 'f2', name: 'Sh. Piyush Goyal', company: 'Commerce Ministry', role: 'Chief Guest', time: '09:00 AM' },
  { id: 'f3', name: 'Amit Verma', company: 'FANUC', role: 'Automation Expert', time: '02:00 PM' },
];

const upcoming = [
  { id: 'u1', title: 'Workshop starts in 18 min', subtitle: 'Hall B · Robotics in Manufacturing Lines' },
  { id: 'u2', title: 'Panel starts in 26 min', subtitle: 'Hall C · Industry Leaders Discussion' },
  { id: 'u3', title: 'Product launch in 29 min', subtitle: 'Hall A · New Mobility Platform' },
];

const scheduleStats = [
  { label: 'Sessions Today', value: '18' },
  { label: 'Bookmarked', value: '6' },
  { label: 'Attending', value: '4' },
  { label: 'Completed', value: '3' },
];

const SwipeableRow = ({ children, id, currentlyOpenId, onOpen, onDelete }: { children: React.ReactNode; id: string; currentlyOpenId: string | null; onOpen: (id: string | null) => void; onDelete: () => void }) => {
  const pan = useRef(new Animated.Value(0)).current;
  const isOpen = useRef(false);

  useEffect(() => {
    if (currentlyOpenId !== id && isOpen.current) {
      Animated.spring(pan, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
      }).start(() => {
        isOpen.current = false;
      });
    }
  }, [currentlyOpenId, id, pan]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
      onPanResponderGrant: () => {
        onOpen(id);
      },
      onPanResponderMove: (_, gestureState) => {
        const startX = isOpen.current ? -80 : 0;
        const nextX = Math.max(-100, Math.min(0, startX + gestureState.dx));
        pan.setValue(nextX);
      },
      onPanResponderRelease: (_, gestureState) => {
        const startX = isOpen.current ? -80 : 0;
        const finalX = startX + gestureState.dx;
        
        if (finalX < -40) {
          Animated.spring(pan, {
            toValue: -80,
            useNativeDriver: true,
            bounciness: 0,
          }).start(() => {
            isOpen.current = true;
          });
        } else {
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
          }).start(() => {
            isOpen.current = false;
            if (currentlyOpenId === id) {
              onOpen(null);
            }
          });
        }
      },
    })
  ).current;

  return (
    <View style={{ position: 'relative', overflow: 'hidden' }}>
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={() => onDelete()}
        style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, backgroundColor: '#ff3b30', justifyContent: 'center', alignItems: 'center' }}
      >
        <Feather name="trash-2" size={20} color="#fff" />
      </TouchableOpacity>
      <Animated.View style={{ transform: [{ translateX: pan }], backgroundColor: '#fff' }} {...panResponder.panHandlers}>
        {children}
      </Animated.View>
    </View>
  );
};

export default function ScheduleScreen({ onOpenDetails }: { onOpenDetails?: () => void }) {
  const [selectedDay, setSelectedDay] = useState('Day 1');
  const [selectedChip, setSelectedChip] = useState('All');
  const [selectedSession, setSelectedSession] = useState<(typeof timeline)[number] | null>(timeline[0]);
  const [sheetVisible, setSheetVisible] = useState(true);
  const [mySchedule, setMySchedule] = useState<(typeof timeline)[number][]>([]);
  const [openSwipeId, setOpenSwipeId] = useState<string | null>(null);

  const closeSheet = () => {
    Animated.timing(sheetTranslateY, {
      toValue: 800,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setSheetVisible(false);
      sheetTranslateY.setValue(0);
    });
  };
  const [reminders, setReminders] = useState<Record<string, boolean>>({
    s1: true,
    s2: false,
    s3: true,
    s4: false,
    s5: false,
  });
  const pulse = useRef(new Animated.Value(1)).current;
  const sheetTranslateY = useRef(new Animated.Value(0)).current;
  const sheetDragOffset = useRef(0);
  const collapsedSheetY = 280;

  const sheetPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const shouldMove = Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && Math.abs(gestureState.dy) > 4;
        return shouldMove;
      },
      onPanResponderGrant: () => {
        sheetTranslateY.stopAnimation((value) => {
          sheetDragOffset.current = value;
        });
      },
      onPanResponderMove: (_, gestureState) => {
        const nextValue = Math.max(0, sheetDragOffset.current + gestureState.dy);
        sheetTranslateY.setValue(nextValue);
      },
      onPanResponderRelease: (_, gestureState) => {
        const shouldCollapse = gestureState.dy > 50 || gestureState.vy > 0.5;

        if (shouldCollapse) {
          Animated.timing(sheetTranslateY, {
            toValue: 800,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            setSheetVisible(false);
            sheetTranslateY.setValue(0);
          });
        } else {
          Animated.spring(sheetTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [pulse]);

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.topIcon}>
            <Feather name="chevron-left" size={22} color="#111" />
          </TouchableOpacity>
          <View style={styles.topCenter}>
            <Text style={styles.pageTitle}>Event Schedule</Text>
            <Text style={styles.pageSubtitle}>India Manufacturing Expo 2026</Text>
          </View>

        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
          {dateItems.map((item) => {
            const active = item.day === selectedDay;
            return (
              <TouchableOpacity key={item.day} style={[styles.dateCard, active && styles.dateCardActive]} onPress={() => setSelectedDay(item.day)}>
                <Text style={[styles.dateDay, active && styles.dateDayActive]}>{item.day}</Text>
                <Text style={[styles.dateValue, active && styles.dateValueActive]}>{item.date}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>



        <TouchableOpacity style={styles.liveCard} activeOpacity={0.92}>
          <View style={styles.liveTopRow}>
            <Animated.View style={[styles.liveBadge, { transform: [{ scale: pulse }] }]}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBadgeText}>LIVE</Text>
            </Animated.View>
            <Text style={styles.remainingTime}>Ends in 12 min</Text>
          </View>
          <Text style={styles.liveTitle}>Opening Keynote: The Future of Smart Industry</Text>
          <Text style={styles.liveSpeaker}>Sh. Piyush Goyal · Main Auditorium</Text>
          <View style={styles.liveFooter}>
            <Text style={styles.liveMeta}>Current Hall · Main Auditorium</Text>
            <TouchableOpacity style={styles.joinButton}>
              <Text style={styles.joinButtonText}>Join Now</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <Text style={styles.sectionCaption}>Today</Text>
        </View>
        <View style={styles.statsGrid}>
          {scheduleStats.map((item) => (
            <View key={item.label} style={styles.statCard}>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Today's Timeline</Text>
          <Text style={styles.sectionCaption}>Tap a session for details</Text>
        </View>
        {timeline.map((item) => {
          const active = selectedSession?.id === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => {
                setSelectedSession(item);
                setSheetVisible(true);
                sheetTranslateY.setValue(0);
              }}
              style={({ pressed }) => [styles.sessionCard, pressed && styles.pressedCard, active && styles.sessionCardActive]}
            >
              <View style={styles.timelineLeft}>
                <View style={[styles.timelineDot, { backgroundColor: item.color }]} />
                <View style={styles.timelineLine} />
              </View>
              <View style={styles.sessionBody}>
                <View style={styles.sessionTopRow}>
                  <Text style={styles.sessionTime}>{item.time}</Text>
                  <View style={[styles.typeBadge, { backgroundColor: `${item.color}15` }]}>
                    <Text style={[styles.typeBadgeText, { color: item.color }]}>{item.type}</Text>
                  </View>
                </View>
                <Text style={styles.sessionTitle}>{item.title}</Text>
                <View style={styles.personRow}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarInitials}>{item.speaker.split(' ').map((part) => part[0]).join('').slice(0, 2)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sessionSpeaker}>{item.speaker}</Text>
                    <Text style={styles.sessionMeta}>{item.hall} · {item.duration} · {item.seats}</Text>
                  </View>
                  <TouchableOpacity style={styles.bookmarkCircle}>
                    <Ionicons name="bookmark-outline" size={16} color="#8e8e93" />
                  </TouchableOpacity>
                </View>
                <View style={styles.sessionActions}>
                  <TouchableOpacity style={[styles.detailsButton, { flex: 1 }]} onPress={onOpenDetails}>
                    <Text style={styles.detailsButtonText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Pressable>
          );
        })}

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Featured Speakers</Text>
          <Text style={styles.sectionCaption}>Experts on stage</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalRow}>
          {featuredSpeakers.map((item) => (
            <View key={item.id} style={styles.speakerCard}>
              <Image source={{ uri: `https://i.pravatar.cc/200?u=${item.id}` }} style={styles.speakerPhoto} />
              <Text style={styles.speakerName}>{item.name}</Text>
              <Text style={styles.speakerCompany}>{item.company}</Text>
              <Text style={styles.speakerRole}>{item.role}</Text>
              <Text style={styles.speakerTime}>{item.time}</Text>
              <TouchableOpacity style={styles.speakerButton}>
                <Text style={styles.speakerButtonText}>View Profile</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Starting Within 30 Minutes</Text>
          <Text style={styles.sectionCaption}>Upcoming sessions</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalRow}>
          {upcoming.map((item) => (
            <View key={item.id} style={styles.upcomingCard}>
              <View style={styles.upcomingIcon}><MaterialCommunityIcons name="alarm-check" size={18} color="#1f7ae0" /></View>
              <Text style={styles.upcomingTitle}>{item.title}</Text>
              <Text style={styles.upcomingSubtitle}>{item.subtitle}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>My Schedule</Text>
          <Text style={styles.sectionCaption}>Bookmarked sessions</Text>
        </View>
        <View style={styles.agendaCard}>
          {mySchedule.length > 0 ? mySchedule.map((item) => (
            <SwipeableRow 
              key={item.id} 
              id={item.id}
              currentlyOpenId={openSwipeId}
              onOpen={setOpenSwipeId}
              onDelete={() => setMySchedule(current => current.filter(s => s.id !== item.id))}
            >
              <View style={styles.agendaRow}>
                <Text style={styles.agendaTime}>{item.time}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.agendaTitle}>{item.title}</Text>
                  <Text style={styles.agendaMeta}>{item.hall}</Text>
                </View>
                <Ionicons name="bookmark" size={16} color="#1f7ae0" />
              </View>
            </SwipeableRow>
          )) : (
            <Text style={{ textAlign: 'center', color: '#8e8e93', paddingVertical: 20 }}>No sessions added yet.</Text>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
        <Feather name="calendar" size={22} color="#fff" />
      </TouchableOpacity>

      {sheetVisible ? (
        <Animated.View
          style={[styles.bottomSheet, { transform: [{ translateY: sheetTranslateY }] }]}
          {...sheetPanResponder.panHandlers}
        >
          <View style={styles.bottomSheetHandle} />
          <View style={styles.bottomSheetRow}>
            <View style={styles.sheetImage} />
            <View style={{ flex: 1 }}>
              <Text style={styles.sheetTitle}>{selectedSession?.title}</Text>
              <Text style={styles.sheetMeta}>{selectedSession?.speaker}</Text>
              <Text style={styles.sheetMeta}>{selectedSession?.hall} · {selectedSession?.duration}</Text>
            </View>
          </View>
          <Text style={styles.sheetDescription}>
            Session details preview with hall navigation, walking time, topics covered, and direct actions to add the event to your agenda.
          </Text>
          <View style={styles.sheetButtons}>
            <TouchableOpacity 
              style={[styles.sheetPrimaryButton, { flex: 1 }]}
              onPress={() => {
                if (selectedSession && !mySchedule.some(s => s.id === selectedSession.id)) {
                  setMySchedule([...mySchedule, selectedSession]);
                }
                closeSheet();
              }}
            >
              <Text style={styles.sheetPrimaryButtonText}>Add to My Schedule</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f7f8fb',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 280,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  topIcon: {
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
  topCenter: {
    flex: 1,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
  },
  pageSubtitle: {
    fontSize: 11,
    color: '#8e8e93',
    marginTop: 2,
  },
  topActions: {
    flexDirection: 'row',
    gap: 8,
  },
  dateRow: {
    paddingBottom: 12,
  },
  dateCard: {
    width: 92,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  dateCardActive: {
    backgroundColor: '#1f7ae0',
  },
  dateDay: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    marginBottom: 4,
  },
  dateDayActive: {
    color: '#fff',
  },
  dateValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111',
  },
  dateValueActive: {
    color: '#fff',
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
    shadowRadius: 4,
    elevation: 1,
  },
  chipActive: {
    backgroundColor: '#1f7ae0',
  },
  chipText: {
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#fff',
  },
  secondaryRow: {
    paddingTop: 4,
    paddingBottom: 10,
  },
  secondaryFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  secondaryFilterLabel: {
    fontSize: 12,
    color: '#111',
    fontWeight: '700',
  },
  liveCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  liveTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffeef0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e74c3c',
  },
  liveBadgeText: {
    color: '#e74c3c',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  remainingTime: {
    fontSize: 12,
    color: '#8e8e93',
    fontWeight: '600',
  },
  liveTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
    marginBottom: 6,
  },
  liveSpeaker: {
    fontSize: 13,
    color: '#4b5563',
    marginBottom: 14,
  },
  liveFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveMeta: {
    fontSize: 12,
    color: '#6b7280',
  },
  joinButton: {
    backgroundColor: '#1f7ae0',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111',
  },
  sectionCaption: {
    fontSize: 12,
    color: '#8e8e93',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  sessionCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  pressedCard: {
    transform: [{ scale: 0.99 }],
  },
  sessionCardActive: {
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  timelineLeft: {
    width: 16,
    alignItems: 'center',
    marginRight: 12,
    paddingTop: 4,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#eef2f7',
    marginTop: 6,
  },
  sessionBody: {
    flex: 1,
  },
  sessionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionTime: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1f7ae0',
  },
  typeBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
    marginBottom: 12,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#f5f7fb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1f7ae0',
  },
  sessionSpeaker: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
    marginBottom: 2,
  },
  sessionMeta: {
    fontSize: 12,
    color: '#6b7280',
  },
  bookmarkCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f5f7fb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reminderLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '700',
  },
  detailsButton: {
    flex: 1,
    backgroundColor: '#f5f7fb',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  detailsButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111',
  },
  horizontalRow: {
    paddingBottom: 10,
  },
  speakerCard: {
    width: 180,
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 14,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  speakerPhoto: {
    width: 56,
    height: 56,
    borderRadius: 20,
    marginBottom: 12,
  },
  speakerName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
    marginBottom: 4,
  },
  speakerCompany: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  speakerRole: {
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 8,
  },
  speakerTime: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1f7ae0',
    marginBottom: 12,
  },
  speakerButton: {
    backgroundColor: '#f5f7fb',
    borderRadius: 14,
    paddingVertical: 11,
    alignItems: 'center',
  },
  speakerButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111',
  },
  upcomingCard: {
    width: 180,
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
  upcomingIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#eef5ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  upcomingTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111',
    marginBottom: 4,
  },
  upcomingSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
  },
  agendaCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  agendaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f7',
  },
  agendaTime: {
    width: 72,
    fontSize: 12,
    color: '#1f7ae0',
    fontWeight: '800',
  },
  agendaTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111',
    marginBottom: 3,
  },
  agendaMeta: {
    fontSize: 11,
    color: '#6b7280',
  },
  recommendCard: {
    width: 230,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 14,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  recommendImage: {
    height: 120,
    borderRadius: 18,
    backgroundColor: '#dbeafe',
    marginBottom: 12,
  },
  recommendLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 4,
    fontWeight: '700',
  },
  recommendTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
    marginBottom: 12,
  },
  recommendButton: {
    backgroundColor: '#f5f7fb',
    borderRadius: 14,
    paddingVertical: 11,
    alignItems: 'center',
  },
  recommendButtonPrimary: {
    backgroundColor: '#1f7ae0',
  },
  recommendButtonText: {
    color: '#111',
    fontSize: 12,
    fontWeight: '800',
  },
  recommendButtonTextPrimary: {
    color: '#fff',
  },
  scheduleSummaryCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  scheduleSummaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
    marginBottom: 4,
  },
  scheduleSummaryBody: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 19,
    marginBottom: 12,
  },
  viewFullButton: {
    backgroundColor: '#1f7ae0',
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
  },
  viewFullButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 92,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1f7ae0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 20,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 118,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 10,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#e5e7eb',
    alignSelf: 'center',
    marginBottom: 14,
  },
  bottomSheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  sheetImage: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#dbeafe',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
    marginBottom: 4,
  },
  sheetMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  sheetBookmark: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f7fb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: '#4b5563',
    marginBottom: 12,
  },
  sheetMapCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f8fb',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },
  sheetMapLeft: {
    width: 24,
    alignItems: 'center',
    marginRight: 10,
  },
  sheetMapDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2ecc71',
  },
  sheetMapLine: {
    width: 2,
    height: 28,
    backgroundColor: '#dbeafe',
    marginVertical: 4,
  },
  sheetMapText: {
    fontSize: 12,
    color: '#111',
    fontWeight: '700',
    marginBottom: 4,
  },
  sheetButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  sheetPrimaryButton: {
    flex: 1.2,
    backgroundColor: '#1f7ae0',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  sheetPrimaryButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  sheetSecondaryButton: {
    flex: 1,
    backgroundColor: '#f5f7fb',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  sheetSecondaryButtonText: {
    color: '#111',
    fontSize: 13,
    fontWeight: '800',
  },
});
