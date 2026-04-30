import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#2E7D32',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#F5F5F5' },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="record"
          options={{
            title: 'Record Order',
            presentation: 'modal',
            headerStyle: { backgroundColor: '#2E7D32' },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen name="review" options={{ title: 'Review Order' }} />
        <Stack.Screen name="send" options={{ title: 'Send Order' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
