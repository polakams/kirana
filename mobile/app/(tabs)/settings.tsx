import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '../../src/hooks/useSettings';
import { SPEECH_LANGUAGES } from '../../src/models/settings';

export default function SettingsScreen() {
  const { settings, saveSettings } = useSettings();
  const [storeName, setStoreName] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [storeEmail, setStoreEmail] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setStoreName(settings.storeContact.name);
      setStorePhone(settings.storeContact.phone);
      setStoreEmail(settings.storeContact.email ?? '');
    }
  }, [settings]);

  const handleSave = async () => {
    if (!storeName.trim() || !storePhone.trim()) {
      Alert.alert('Required', 'Store name and phone are required.');
      return;
    }
    setSaving(true);
    try {
      await saveSettings({
        ...(settings!),
        storeContact: {
          name: storeName.trim(),
          phone: storePhone.trim(),
          email: storeEmail.trim() || undefined,
        },
      });
      Alert.alert('Saved', 'Settings updated successfully.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <Text className="text-xl font-bold text-gray-800 mb-4">Settings</Text>

        {/* Store contact */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <Text className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-3">
            Store Contact
          </Text>
          <Field label="Store Name *" value={storeName} onChange={setStoreName} placeholder="Ramu Kirana" />
          <Field label="Phone / WhatsApp *" value={storePhone} onChange={setStorePhone} placeholder="+91 98765 43210" keyboard="phone-pad" />
          <Field label="Email (optional)" value={storeEmail} onChange={setStoreEmail} placeholder="store@example.com" keyboard="email-address" />
        </View>

        {/* Language */}
        {settings && (
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <Text className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-3">
              Speech Language
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {SPEECH_LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  onPress={() => saveSettings({ ...settings, speechLanguage: lang.code })}
                  className={`px-3 py-1.5 rounded-full border ${
                    settings.speechLanguage === lang.code
                      ? 'bg-primary border-primary'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <Text className={`text-sm ${settings.speechLanguage === lang.code ? 'text-white' : 'text-gray-600'}`}>
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          className={`rounded-2xl py-4 items-center mt-2 ${saving ? 'bg-gray-200' : 'bg-primary'}`}
        >
          <Text className={`font-semibold text-base ${saving ? 'text-gray-400' : 'text-white'}`}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label, value, onChange, placeholder, keyboard = 'default',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  keyboard?: 'default' | 'phone-pad' | 'email-address';
}) {
  return (
    <View className="mb-3">
      <Text className="text-gray-700 text-sm font-medium mb-1">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        keyboardType={keyboard}
        autoCapitalize={keyboard === 'email-address' ? 'none' : 'words'}
        className="border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 text-sm bg-gray-50"
      />
    </View>
  );
}
