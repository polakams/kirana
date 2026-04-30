import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { hasOnboarded } from '../src/services/storage';

export default function Index() {
  useEffect(() => {
    hasOnboarded().then((done) => {
      if (done) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/onboarding');
      }
    });
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#2E7D32" />
    </View>
  );
}
