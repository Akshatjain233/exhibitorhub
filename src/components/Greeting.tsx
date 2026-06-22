import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function Greeting() {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Good Morning,</Text>
        <Text style={styles.title}>Akshat 👋</Text>
        <Text style={styles.subtitle}>Ready to explore today's exhibition?</Text>
      </View>
      <Image
        style={styles.image}
        source={{ uri: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=200&q=80' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  textContainer: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#8e8e93',
    marginTop: 8,
  },
  image: {
    width: 100,
    height: 70,
    borderRadius: 12,
  },
});
