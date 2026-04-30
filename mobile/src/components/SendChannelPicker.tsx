import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { SendChannel } from '../models/order';

interface Channel {
  id: SendChannel;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
}

const CHANNELS: Channel[] = [
  { id: 'whatsapp', label: 'WhatsApp', icon: 'logo-whatsapp', color: '#25D366', bgColor: '#E8F8EE' },
  { id: 'sms', label: 'SMS', icon: 'chatbubble', color: '#007AFF', bgColor: '#E5F1FF' },
  { id: 'email', label: 'Email', icon: 'mail', color: '#EA4335', bgColor: '#FDECEA' },
  { id: 'copy', label: 'Copy', icon: 'copy-outline', color: '#666', bgColor: '#F2F2F2' },
];

interface SendChannelPickerProps {
  selected: SendChannel;
  onSelect: (channel: SendChannel) => void;
}

export function SendChannelPicker({ selected, onSelect }: SendChannelPickerProps) {
  return (
    <View className="flex-row flex-wrap gap-3 justify-center">
      {CHANNELS.map((ch) => (
        <TouchableOpacity
          key={ch.id}
          onPress={() => onSelect(ch.id)}
          activeOpacity={0.8}
          style={{ backgroundColor: selected === ch.id ? ch.bgColor : '#F9F9F9' }}
          className={`items-center px-5 py-4 rounded-2xl border-2 ${
            selected === ch.id ? 'border-current' : 'border-transparent'
          }`}
        >
          <View
            style={{ backgroundColor: ch.bgColor }}
            className="w-12 h-12 rounded-full items-center justify-center mb-2"
          >
            <Ionicons name={ch.icon} size={26} color={ch.color} />
          </View>
          <Text
            style={{ color: selected === ch.id ? ch.color : '#555' }}
            className="text-sm font-medium"
          >
            {ch.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
