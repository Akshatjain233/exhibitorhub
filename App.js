import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f2f3f7' }}>
        <StatusBar style="dark" />
        <HomeScreen />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
