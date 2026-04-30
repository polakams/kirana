import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MicrophoneButton } from '../src/components/MicrophoneButton';
import { useSpeechRecognition } from '../src/hooks/useSpeechRecognition';
import { useOrderParser } from '../src/hooks/useOrderParser';
import { useSettings } from '../src/hooks/useSettings';
import { useOrderHistory } from '../src/hooks/useOrderHistory';
import { getSettings } from '../src/services/storage';
import { generateId } from '../src/utils/idGenerator';
import type { Order } from '../src/models/order';

export default function RecordScreen() {
  const { appendOrderId } = useLocalSearchParams<{ appendOrderId?: string }>();
  const { settings } = useSettings();
  const { orders, addOrUpdate } = useOrderHistory();
  const { loading: parsing, parseTranscript } = useOrderParser();

  const speech = useSpeechRecognition({ language: settings?.speechLanguage ?? 'en-IN' });

  const handleToggleMic = () => {
    if (speech.hasPermission === false) {
      Alert.alert(
        'Microphone Permission Required',
        'Please grant microphone access in device settings to use voice ordering.'
      );
      return;
    }
    if (speech.isListening) {
      speech.stop();
    } else {
      speech.start();
    }
  };

  const handleDone = async () => {
    const fullText = (speech.transcript + ' ' + speech.interimTranscript).trim();
    if (!fullText) {
      Alert.alert('No speech detected', 'Please speak your grocery list and try again.');
      return;
    }

    const newItems = await parseTranscript(fullText);
    if (newItems.length === 0) {
      Alert.alert('Could not parse order', 'Please try again with clearer speech.');
      return;
    }

    if (appendOrderId) {
      // Append mode: merge new items into existing order
      const existing = orders.find((o) => o.id === appendOrderId);
      if (existing) {
        const merged: Order = {
          ...existing,
          items: [...existing.items, ...newItems],
          transcript: [existing.transcript, fullText].filter(Boolean).join(', '),
        };
        await addOrUpdate(merged);
        router.back();
        return;
      }
    }

    // New order
    const currentSettings = await getSettings();
    const order: Order = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      transcript: fullText,
      items: newItems,
      status: 'draft',
      storeContact: currentSettings.storeContact,
    };
    await addOrUpdate(order);
    router.replace({ pathname: '/review', params: { orderId: order.id } });
  };

  const hasContent = speech.segments.length > 0 || !!speech.interimTranscript;
  const isAppending = !!appendOrderId;

  return (
    <SafeAreaView className="flex-1 bg-primary" edges={['bottom']}>
      <View className="flex-1 px-6">
        {isAppending && (
          <View className="mt-4 mb-1 bg-white/10 rounded-xl px-3 py-2">
            <Text className="text-white/70 text-sm text-center">
              Speak more items to add to your order
            </Text>
          </View>
        )}
        {/* Live numbered list */}
        <ScrollView
          className="flex-1 mt-6 mb-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, justifyContent: hasContent ? 'flex-start' : 'center' }}
        >
          {hasContent ? (
            <View className="bg-white/10 rounded-2xl p-4">
              {/* Confirmed segments */}
              {speech.segments.map((seg, i) => (
                <View key={i} className="flex-row mb-2">
                  <Text className="text-white/50 font-mono w-7">{i + 1}.</Text>
                  <Text className="text-white text-base flex-1 capitalize">{seg}</Text>
                </View>
              ))}
              {/* Current interim (in-progress phrase) */}
              {speech.interimTranscript ? (
                <View className="flex-row opacity-50">
                  <Text className="text-white font-mono w-7">{speech.segments.length + 1}.</Text>
                  <Text className="text-white text-base flex-1 italic">{speech.interimTranscript}</Text>
                </View>
              ) : null}
              {speech.isListening && (
                <Text className="text-white/40 text-xs mt-3">Pause after each item...</Text>
              )}
            </View>
          ) : (
            <View className="items-center">
              <Ionicons name="mic-outline" size={48} color="rgba(255,255,255,0.3)" />
              <Text className="text-white/60 text-base mt-3 text-center">
                {speech.isListening
                  ? 'Speak your first item...'
                  : 'Tap the mic button to start'}
              </Text>
              <Text className="text-white/40 text-sm mt-2 text-center">
                Pause briefly between each item
              </Text>
            </View>
          )}

          {speech.error && (
            <Text className="text-yellow-300 text-sm mt-3 text-center">{speech.error}</Text>
          )}
        </ScrollView>

        {/* Mic button */}
        <View className="items-center mb-6">
          <MicrophoneButton
            isListening={speech.isListening}
            onPress={handleToggleMic}
            disabled={parsing}
          />
          <Text className="text-white/70 text-sm mt-3">
            {speech.isListening ? 'Tap to stop' : 'Tap to record'}
          </Text>
        </View>

        {/* Action buttons */}
        <View className="flex-row gap-3 mb-4">
          <TouchableOpacity
            onPress={speech.reset}
            disabled={!hasContent || speech.isListening}
            className={`flex-1 py-3 rounded-xl items-center border border-white/30 ${
              !hasContent || speech.isListening ? 'opacity-40' : ''
            }`}
          >
            <Text className="text-white font-medium">Retake</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDone}
            disabled={!hasContent || speech.isListening || parsing}
            className={`flex-2 flex-1 py-3 rounded-xl items-center bg-white ${
              !hasContent || speech.isListening || parsing ? 'opacity-40' : ''
            }`}
          >
            <Text className="text-primary font-semibold">
              {parsing ? 'Processing...' : 'Done →'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
