import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { saveSettings, markOnboarded } from '../src/services/storage';
import { DEFAULT_SETTINGS } from '../src/models/settings';

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [storeName, setStoreName] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [storeEmail, setStoreEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const steps = [
    {
      title: 'Welcome to Kirana',
      subtitle: 'Order groceries with your voice in any language',
      content: (
        <View className="items-center">
          <View className="w-32 h-32 bg-green-100 rounded-full items-center justify-center mb-6">
            <Ionicons name="basket" size={64} color="#2E7D32" />
          </View>
          <Text className="text-gray-600 text-base text-center px-4">
            Speak your grocery list in English, Hindi, Telugu, or any Indian language.
            We'll convert it into a neat order and send it to your local kirana store.
          </Text>
        </View>
      ),
    },
    {
      title: 'Store Details',
      subtitle: 'Where should we send your orders?',
      content: (
        <View className="gap-4">
          <View>
            <Text className="text-gray-700 text-sm font-medium mb-1">Store Name *</Text>
            <TextInput
              value={storeName}
              onChangeText={setStoreName}
              placeholder="e.g. Ramu Kirana Store"
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-base"
            />
          </View>
          <View>
            <Text className="text-gray-700 text-sm font-medium mb-1">Phone / WhatsApp *</Text>
            <TextInput
              value={storePhone}
              onChangeText={setStorePhone}
              placeholder="+91 98765 43210"
              keyboardType="phone-pad"
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-base"
            />
          </View>
          <View>
            <Text className="text-gray-700 text-sm font-medium mb-1">Email (optional)</Text>
            <TextInput
              value={storeEmail}
              onChangeText={setStoreEmail}
              placeholder="store@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-base"
            />
          </View>
        </View>
      ),
    },
  ];

  const isNextDisabled = step === 1 && (!storeName.trim() || !storePhone.trim());

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
      return;
    }
    setSaving(true);
    try {
      await saveSettings({
        ...DEFAULT_SETTINGS,
        storeContact: {
          name: storeName.trim(),
          phone: storePhone.trim(),
          email: storeEmail.trim() || undefined,
        },
      });
      await markOnboarded();
      router.replace('/(tabs)/home');
    } catch {
      Alert.alert('Error', 'Failed to save settings. Please try again.');
      setSaving(false);
    }
  };

  const current = steps[step];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-6 pt-8 pb-6">
          {/* Progress dots */}
          <View className="flex-row justify-center gap-2 mb-8">
            {steps.map((_, i) => (
              <View
                key={i}
                className={`h-2 rounded-full ${i === step ? 'w-8 bg-primary' : 'w-2 bg-gray-200'}`}
              />
            ))}
          </View>

          <Text className="text-2xl font-bold text-gray-800 text-center mb-2">
            {current.title}
          </Text>
          <Text className="text-gray-500 text-center mb-8">{current.subtitle}</Text>

          <View className="flex-1">{current.content}</View>
        </View>
      </ScrollView>

      <View className="px-6 pb-8">
        <TouchableOpacity
          onPress={handleNext}
          disabled={isNextDisabled || saving}
          className={`rounded-2xl py-4 items-center ${
            isNextDisabled || saving ? 'bg-gray-200' : 'bg-primary'
          }`}
        >
          <Text
            className={`text-base font-semibold ${
              isNextDisabled || saving ? 'text-gray-400' : 'text-white'
            }`}
          >
            {saving ? 'Saving...' : step === steps.length - 1 ? 'Get Started' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
