import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Header from '../components/Header';
import Greeting from '../components/Greeting';
import EventBanner from '../components/EventBanner';

import QuickAccess from '../components/QuickAccess';
import LatestUpdates from '../components/LatestUpdates';
import FeaturedExhibitors from '../components/FeaturedExhibitors';
import TodaysSchedule from '../components/TodaysSchedule';
import FeaturedProducts from '../components/FeaturedProducts';
import Sponsors from '../components/Sponsors';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <Header />
      <Greeting />
      <EventBanner />

      <QuickAccess />
      <LatestUpdates />
      <FeaturedExhibitors />
      <TodaysSchedule />
      <FeaturedProducts />
      <Sponsors />
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7fa',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 30,
  },
});
