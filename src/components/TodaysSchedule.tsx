import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function TodaysSchedule() {
  const scheduleData = [
    {
      id: 1,
      time: '09:00 AM',
      duration: '60 min',
      isLive: true,
      title: 'Opening Ceremony & Inaugural Address',
      subtitle: 'Sh. Piyush Goyal, Commerce Ministry',
      location: 'Main Auditorium',
      dotColor: '#eb4d4b',
    },
    {
      id: 2,
      time: '10:30 AM',
      duration: '45 min',
      isLive: false,
      title: 'Industry 4.0: Future of Manufacturing',
      subtitle: 'Dr. Priya Sharma, NASSCOM',
      location: 'Hall B — Tech Zone',
      dotColor: '#4f6cf6',
    },
    {
      id: 3,
      time: '12:00 PM',
      duration: '90 min',
      isLive: false,
      title: 'Robotics & AI in Modern Production',
      subtitle: 'Panel Discussion',
      location: 'Innovation Hub',
      dotColor: '#4f6cf6',
    },
    {
      id: 4,
      time: '02:00 PM',
      duration: '60 min',
      isLive: false,
      title: 'Sustainable Manufacturing Summit',
      subtitle: 'Rajesh Kumar, CII',
      location: 'Conference Room 1',
      dotColor: '#4f6cf6',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Today's Schedule</Text>
        <TouchableOpacity>
          <Text style={styles.linkText}>Full <Feather name="chevron-right" size={12} /></Text>
        </TouchableOpacity>
      </View>

      <View style={styles.timelineContainer}>
        {scheduleData.map((item, index) => (
          <View key={item.id} style={styles.timelineItem}>
            {/* Timeline Line & Dot */}
            <View style={styles.timelineLeft}>
              <View style={[styles.dotContainer, { borderColor: index === 0 ? '#ffcccc' : '#eef2ff' }]}>
                <View style={[styles.dot, { backgroundColor: item.dotColor }]} />
              </View>
              {index !== scheduleData.length - 1 && <View style={styles.line} />}
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
              <View style={styles.timeRow}>
                <Text style={[styles.timeText, { color: item.dotColor }]}>{item.time}</Text>
                <Text style={styles.durationText}> · {item.duration}</Text>
                {item.isLive && (
                  <View style={styles.liveTag}>
                    <Text style={styles.liveText}>LIVE</Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
              
              <View style={styles.locationRow}>
                <Feather name="map-pin" size={12} color="#aaa" style={{ marginRight: 6 }} />
                <Text style={styles.locationText}>{item.location}</Text>
              </View>
              
              <TouchableOpacity>
                <Text style={styles.detailsLink}>See Details <Feather name="arrow-right" size={12} /></Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.bellIcon}>
                <Ionicons name="notifications-outline" size={16} color="#777" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
        
        <TouchableOpacity style={styles.fullScheduleButton}>
            <Text style={styles.linkText}>See Full Schedule <Feather name="chevron-right" size={12} /></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  linkText: {
    color: '#4f6cf6',
    fontWeight: '600',
    fontSize: 14,
  },
  timelineContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  timelineLeft: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  dotContainer: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    backgroundColor: '#fff',
    zIndex: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  line: {
    width: 1,
    flex: 1,
    backgroundColor: '#eee',
    marginTop: -4,
    marginBottom: -4,
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 30,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    marginBottom: 20,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  durationText: {
    fontSize: 13,
    color: '#999',
  },
  liveTag: {
    backgroundColor: '#eb4d4b',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  liveText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
    paddingRight: 30,
  },
  subtitle: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 13,
    color: '#8e8e93',
  },
  detailsLink: {
    color: '#4f6cf6',
    fontWeight: '600',
    fontSize: 14,
  },
  bellIcon: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScheduleButton: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  }
});
