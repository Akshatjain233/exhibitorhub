import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable, TextInput } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SCHEDULE_STORAGE_KEY = 'exhibition.exhibitor.schedule-events';

const days = [
  { id: '1', label: 'Day 1', date: 'Oct 1' },
  { id: '2', label: 'Day 2', date: 'Oct 2' },
  { id: '3', label: 'Day 3', date: 'Oct 3' },
  { id: '4', label: 'Day 4', date: 'Oct 4' },
];

const typeMeta = {
  'Organizer Event': { color: '#1f7ae0', bg: '#eef5ff' },
  'Company Event': { color: '#10b981', bg: '#ecfdf5' },
  'Business Meeting': { color: '#f59e0b', bg: '#fff7e6' },
  Networking: { color: '#ff3b30', bg: '#fff0f0' },
  'My Event': { color: '#1f7ae0', bg: '#eef5ff' },
};

const statusMeta = {
  Completed: '#8e8e93',
  Ongoing: '#10b981',
  Upcoming: '#1f7ae0',
};

const parseTimeToMinutes = (time: string): number => {
  const match = time.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/i);
  if (!match) {
    return Number.MAX_SAFE_INTEGER;
  }
  let hours = parseInt(match[1], 10) % 12;
  const minutes = parseInt(match[2], 10);
  if (match[3].toUpperCase() === 'PM') {
    hours += 12;
  }
  return hours * 60 + minutes;
};

const timeSlots = Array.from({ length: 25 }, (_, i) => {
  const totalMinutes = 8 * 60 + i * 30; // 08:00 AM through 08:00 PM
  let hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
});

const initialScheduleEvents = [
  { id: '1', time: '09:00 AM', title: 'Opening Ceremony', location: 'Main Stage', type: 'Organizer Event' as const, status: 'Completed' as const, reminder: false },
  { id: '2', time: '11:00 AM', title: 'Live Product Demonstration', location: 'Booth A24', type: 'Company Event' as const, status: 'Ongoing' as const, reminder: true },
  { id: '3', time: '02:00 PM', title: 'Customer Meeting', location: 'Meeting Lounge', type: 'Business Meeting' as const, status: 'Upcoming' as const, reminder: true },
  { id: '4', time: '04:00 PM', title: 'Networking Session', location: 'Hall B', type: 'Networking' as const, status: 'Upcoming' as const, reminder: false },
  { id: '5', time: '11:00 AM', title: 'Live Demo', location: 'Booth A24', type: 'My Event' as const, status: 'Upcoming' as const, reminder: true },
  { id: '6', time: '04:30 PM', title: 'Booth Meeting', location: 'Booth A24', type: 'My Event' as const, status: 'Upcoming' as const, reminder: true },
];

type ScheduleEvent = (typeof initialScheduleEvents)[number];

const reminders = [
  { id: '1', icon: 'file-text', iconColor: '#1f7ae0', iconBg: '#eef5ff', text: 'Upload new brochure' },
  { id: '2', icon: 'clock', iconColor: '#ff3b30', iconBg: '#fff0f0', text: 'Demo starts in 20 minutes' },
  { id: '3', icon: 'users', iconColor: '#10b981', iconBg: '#ecfdf5', text: 'Meeting with ABC Industries' },
  { id: '4', icon: 'bell', iconColor: '#f59e0b', iconBg: '#fff7e6', text: 'Organizer briefing' },
];

const quickActions = [
  { id: 'schedule-meeting', icon: 'calendar', title: 'Schedule Meeting', desc: 'Book a slot with a visitor' },
  { id: 'add-reminder', icon: 'bell', title: 'Add Reminder', desc: 'Never miss a task' },
  { id: 'create-live-demo', icon: 'video', title: 'Create Live Demo', desc: 'Announce a booth demo' },
  { id: 'add-presentation', icon: 'monitor', title: 'Add Presentation', desc: 'Host a session' },
];

const fabActions = [
  { id: 'schedule-meeting', icon: 'calendar', label: 'Schedule Meeting' },
  { id: 'add-reminder', icon: 'bell', label: 'Add Reminder' },
  { id: 'create-event', icon: 'plus-circle', label: 'Create Event' },
];

export default function ExhibitorScheduleScreen() {
  const insets = useSafeAreaInsets();
  const [selectedDay, setSelectedDay] = useState('1');
  const [fabMenuOpen, setFabMenuOpen] = useState(false);
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>(initialScheduleEvents);
  const [isEventModalVisible, setIsEventModalVisible] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const hasHydrated = useRef(false);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const stored = await AsyncStorage.getItem(SCHEDULE_STORAGE_KEY);
        if (stored) {
          setScheduleEvents(JSON.parse(stored));
        }
      } finally {
        hasHydrated.current = true;
      }
    };

    void hydrate();
  }, []);

  useEffect(() => {
    if (!hasHydrated.current) {
      return;
    }
    void AsyncStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(scheduleEvents));
  }, [scheduleEvents]);

  const sortedScheduleEvents = [...scheduleEvents].sort(
    (a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time)
  );

  const resetEventForm = () => {
    setEditingEventId(null);
    setEventTitle('');
    setEventTime('');
    setEventLocation('');
    setIsTimeDropdownOpen(false);
  };

  const openAddEventModal = () => {
    resetEventForm();
    setIsEventModalVisible(true);
  };

  const openEditEventModal = (event: ScheduleEvent) => {
    setEditingEventId(event.id);
    setEventTitle(event.title);
    setEventTime(event.time);
    setEventLocation(event.location);
    setIsEventModalVisible(true);
  };

  const closeEventModal = () => {
    setIsEventModalVisible(false);
    resetEventForm();
  };

  const handleSaveEvent = () => {
    if (!eventTitle.trim()) {
      return;
    }

    if (editingEventId) {
      setScheduleEvents((prev) =>
        prev.map((event) =>
          event.id === editingEventId
            ? { ...event, title: eventTitle.trim(), time: eventTime.trim(), location: eventLocation.trim() }
            : event
        )
      );
    } else {
      setScheduleEvents((prev) => [
        ...prev,
        {
          id: `${Date.now()}`,
          title: eventTitle.trim(),
          time: eventTime.trim(),
          location: eventLocation.trim(),
          type: 'My Event',
          status: 'Upcoming',
          reminder: true,
        },
      ]);
    }

    closeEventModal();
  };

  const handleDeleteEvent = (id: string) => {
    setScheduleEvents((prev) => prev.filter((event) => event.id !== id));
  };

  const handleFabAction = (actionId: string) => {
    setFabMenuOpen(false);
    if (actionId === 'create-event') {
      openAddEventModal();
    }
  };

  return (
    <View style={styles.screen}>

      {/* Top App Bar */}
      <View style={styles.appBar}>
        <View>
          <Text style={styles.appBarTitle}>My Schedule</Text>
          <Text style={styles.appBarSubtitle}>Today's Exhibition Plan</Text>
        </View>
        <TouchableOpacity style={styles.calendarIconButton} activeOpacity={0.8}>
          <Feather name="calendar" size={20} color="#111" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Date Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroller} contentContainerStyle={styles.dayScrollerContent}>
          {days.map((day) => {
            const isSelected = day.id === selectedDay;
            return (
              <TouchableOpacity
                key={day.id}
                style={[styles.dayPill, isSelected && styles.dayPillActive]}
                activeOpacity={0.85}
                onPress={() => setSelectedDay(day.id)}
              >
                <Text style={[styles.dayPillLabel, isSelected && styles.dayPillLabelActive]}>{day.label}</Text>
                <Text style={[styles.dayPillDate, isSelected && styles.dayPillDateActive]}>{day.date}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Today's Agenda */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Today's Agenda</Text>
          <TouchableOpacity style={styles.addEventButton} activeOpacity={0.8} onPress={openAddEventModal}>
            <Feather name="plus" size={16} color="#1f7ae0" />
            <Text style={styles.addEventButtonText}>Add Event</Text>
          </TouchableOpacity>
        </View>

        {sortedScheduleEvents.length === 0 ? (
          <View style={styles.emptyEventsCard}>
            <Feather name="calendar" size={20} color="#c7c7cc" style={{ marginBottom: 8 }} />
            <Text style={styles.emptyEventsText}>No events yet. Tap "Add Event" to create one.</Text>
          </View>
        ) : (
          <View style={styles.eventsList}>
            {sortedScheduleEvents.map((item) => {
              const type = typeMeta[item.type];
              return (
                <View key={item.id} style={styles.eventCard}>
                  <View style={styles.eventCardHeader}>
                    <View style={styles.eventCardTitleRow}>
                      <Text style={styles.eventCardTitle}>{item.title}</Text>
                      <View style={[styles.typeBadge, { backgroundColor: type.bg }]}>
                        <Text style={[styles.typeBadgeText, { color: type.color }]}>{item.type}</Text>
                      </View>
                    </View>
                    <Text style={styles.eventCardTime}>
                      {[item.time, item.location].filter(Boolean).join(' · ')}
                    </Text>
                    <View style={styles.eventCardStatusRow}>
                      <Text style={[styles.statusText, { color: statusMeta[item.status] }]}>{item.status}</Text>
                      <Ionicons
                        name={item.reminder ? 'notifications' : 'notifications-outline'}
                        size={13}
                        color={item.reminder ? '#1f7ae0' : '#c7c7cc'}
                      />
                    </View>
                  </View>
                  <View style={styles.eventCardActions}>
                    <TouchableOpacity style={styles.eventActionButton} activeOpacity={0.7} onPress={() => openEditEventModal(item)}>
                      <Feather name="edit-2" size={14} color="#1f7ae0" />
                      <Text style={styles.eventActionText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.eventActionButton} activeOpacity={0.7}>
                      <Feather name="share-2" size={14} color="#1f7ae0" />
                      <Text style={styles.eventActionText}>Share</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.eventActionButton} activeOpacity={0.7} onPress={() => handleDeleteEvent(item.id)}>
                      <Feather name="trash-2" size={14} color="#ff3b30" />
                      <Text style={[styles.eventActionText, { color: '#ff3b30' }]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Upcoming Reminders */}
        <Text style={styles.sectionTitle}>Upcoming Reminders</Text>
        <View style={styles.remindersCard}>
          {reminders.map((reminder, index) => (
            <View key={reminder.id} style={[styles.reminderRow, index !== reminders.length - 1 && styles.borderBottom]}>
              <View style={[styles.reminderIconWrap, { backgroundColor: reminder.iconBg }]}>
                <Feather name={reminder.icon as any} size={15} color={reminder.iconColor} />
              </View>
              <Text style={styles.reminderText}>{reminder.text}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.grid}>
          {quickActions.map((action) => (
            <TouchableOpacity key={action.id} style={styles.gridCard} activeOpacity={0.8}>
              <View style={styles.gridIconWrap}>
                <Feather name={action.icon as any} size={20} color="#1f7ae0" />
              </View>
              <Text style={styles.gridTitle}>{action.title}</Text>
              <Text style={styles.gridDesc}>{action.desc}</Text>
            </TouchableOpacity>
          ))}
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
                onPress={() => handleFabAction(action.id)}
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

      {/* Add / Edit Event Modal */}
      <Modal visible={isEventModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={closeEventModal}>
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeEventModal} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editingEventId ? 'Edit Event' : 'Add Event'}</Text>
            <TouchableOpacity onPress={handleSaveEvent} style={styles.modalSave} disabled={!eventTitle.trim()}>
              <Text style={[styles.modalSaveText, !eventTitle.trim() && styles.modalSaveTextDisabled]}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.modalCard}>
              <Text style={styles.inputLabel}>Event Title</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Live Demo"
                  placeholderTextColor="#8e8e93"
                  value={eventTitle}
                  onChangeText={setEventTitle}
                />
              </View>

              <Text style={styles.inputLabel}>Time</Text>
              <TouchableOpacity
                style={styles.inputContainer}
                activeOpacity={0.8}
                onPress={() => setIsTimeDropdownOpen((open) => !open)}
              >
                <View style={styles.timeInputRow}>
                  <Text style={eventTime ? styles.timeInputValue : styles.timeInputPlaceholder}>
                    {eventTime || 'Select a time'}
                  </Text>
                  <Feather name={isTimeDropdownOpen ? 'chevron-up' : 'chevron-down'} size={16} color="#8e8e93" />
                </View>
              </TouchableOpacity>

              {isTimeDropdownOpen && (
                <View style={styles.timeDropdown}>
                  <ScrollView
                    style={styles.timeDropdownScroll}
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={false}
                  >
                    {timeSlots.map((slot) => {
                      const isSelected = slot === eventTime;
                      return (
                        <TouchableOpacity
                          key={slot}
                          style={[styles.timeSlotRow, isSelected && styles.timeSlotRowActive]}
                          activeOpacity={0.7}
                          onPress={() => {
                            setEventTime(slot);
                            setIsTimeDropdownOpen(false);
                          }}
                        >
                          <Text style={[styles.timeSlotText, isSelected && styles.timeSlotTextActive]}>{slot}</Text>
                          {isSelected && <Feather name="check" size={16} color="#1f7ae0" />}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              <Text style={styles.inputLabel}>Location</Text>
              <View style={[styles.inputContainer, { marginBottom: 0 }]}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Booth A24"
                  placeholderTextColor="#8e8e93"
                  value={eventLocation}
                  onChangeText={setEventLocation}
                />
              </View>
            </View>

            <View style={{ height: 60 }} />
          </ScrollView>
        </SafeAreaView>
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
  calendarIconButton: {
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

  // Date Selector
  dayScroller: {
    marginBottom: 24,
  },
  dayScrollerContent: {
    gap: 10,
    paddingRight: 4,
  },
  dayPill: {
    minWidth: 72,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  dayPillActive: {
    backgroundColor: '#111',
    borderColor: '#111',
  },
  dayPillLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111',
    marginBottom: 2,
  },
  dayPillLabelActive: {
    color: '#fff',
  },
  dayPillDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8e8e93',
  },
  dayPillDateActive: {
    color: 'rgba(255,255,255,0.7)',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  addEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#eef5ff',
  },
  addEventButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1f7ae0',
  },
  emptyEventsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f2f2f7',
    marginBottom: 24,
  },
  emptyEventsText: {
    fontSize: 13,
    color: '#8e8e93',
    fontWeight: '500',
    textAlign: 'center',
  },

  // Today's Agenda (event cards)
  eventsList: {
    gap: 12,
    marginBottom: 24,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f2f2f7',
  },
  eventCardHeader: {
    marginBottom: 12,
  },
  eventCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  eventCardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },
  eventCardTime: {
    fontSize: 12,
    color: '#8e8e93',
    fontWeight: '500',
    marginBottom: 8,
  },
  eventCardStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventCardActions: {
    flexDirection: 'row',
    gap: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e5ea',
    paddingTop: 12,
  },
  eventActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1f7ae0',
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // Upcoming Reminders
  remindersCard: {
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
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  borderBottom: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5ea',
  },
  reminderIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderText: {
    flex: 1,
    fontSize: 13,
    color: '#111',
    fontWeight: '600',
    lineHeight: 18,
  },

  // Quick Actions
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  gridCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f2f2f7',
  },
  gridIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eef5ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  gridTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  gridDesc: {
    fontSize: 12,
    color: '#8e8e93',
    lineHeight: 16,
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

  // Add / Edit Event Modal
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
  modalCancel: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#ff3b30',
  },
  modalSave: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f7ae0',
  },
  modalSaveTextDisabled: {
    color: '#c7c7cc',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f2f2f7',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: '#f7f8fb',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 14,
    justifyContent: 'center',
    marginBottom: 20,
  },
  input: {
    fontSize: 15,
    color: '#111',
    fontWeight: '500',
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeInputValue: {
    fontSize: 15,
    color: '#111',
    fontWeight: '500',
  },
  timeInputPlaceholder: {
    fontSize: 15,
    color: '#8e8e93',
    fontWeight: '500',
  },

  // Inline Time Dropdown
  timeDropdown: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginTop: -12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e5ea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  timeDropdownScroll: {
    maxHeight: 240,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  timeSlotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  timeSlotRowActive: {
    backgroundColor: '#eef5ff',
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  timeSlotTextActive: {
    color: '#1f7ae0',
    fontWeight: '800',
  },
});
