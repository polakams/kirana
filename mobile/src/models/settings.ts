import type { SendChannel } from './order';

export interface AppSettings {
  storeContact: {
    name: string;
    phone: string;
    email?: string;
  };
  defaultSendChannel: SendChannel;
  speechLanguage: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  storeContact: {
    name: '',
    phone: '',
    email: '',
  },
  defaultSendChannel: 'whatsapp',
  speechLanguage: 'en-IN',
};

export const SPEECH_LANGUAGES = [
  { code: 'en-IN', label: 'English (India)' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'te-IN', label: 'Telugu' },
  { code: 'kn-IN', label: 'Kannada' },
  { code: 'ta-IN', label: 'Tamil' },
  { code: 'mr-IN', label: 'Marathi' },
];
