import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

interface UseSpeechRecognitionOptions {
  language?: string;
}

export interface SpeechState {
  isListening: boolean;
  segments: string[];        // one entry per spoken phrase (separated by pause)
  interimTranscript: string; // current in-progress phrase
  transcript: string;        // all segments joined with ", " for parsing
  error: string | null;
  hasPermission: boolean | null;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const { language = 'en-IN' } = options;
  const [state, setState] = useState<SpeechState>({
    isListening: false,
    segments: [],
    interimTranscript: '',
    transcript: '',
    error: null,
    hasPermission: null,
  });
  const segmentsRef = useRef<string[]>([]);

  useEffect(() => {
    ExpoSpeechRecognitionModule.requestPermissionsAsync().then(({ granted }) => {
      setState((s) => ({ ...s, hasPermission: granted }));
    });
  }, []);

  useSpeechRecognitionEvent('result', (event) => {
    const bestResult = event.results[0];
    if (!bestResult) return;
    if (event.isFinal) {
      const phrase = bestResult.transcript.trim();
      if (phrase) {
        segmentsRef.current = [...segmentsRef.current, phrase];
        setState((s) => ({
          ...s,
          segments: segmentsRef.current,
          transcript: segmentsRef.current.join(', '),
          interimTranscript: '',
        }));
      }
    } else {
      setState((s) => ({ ...s, interimTranscript: bestResult.transcript }));
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    setState((s) => ({ ...s, isListening: false, error: event.message }));
  });

  useSpeechRecognitionEvent('end', () => {
    setState((s) => ({ ...s, isListening: false, interimTranscript: '' }));
  });

  const start = useCallback(async () => {
    segmentsRef.current = [];
    setState((s) => ({
      ...s,
      isListening: true,
      segments: [],
      transcript: '',
      interimTranscript: '',
      error: null,
    }));
    ExpoSpeechRecognitionModule.start({
      lang: language,
      interimResults: true,
      continuous: true,
    });
  }, [language]);

  const stop = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
    setState((s) => ({ ...s, isListening: false }));
  }, []);

  const reset = useCallback(() => {
    segmentsRef.current = [];
    setState((s) => ({
      ...s,
      segments: [],
      transcript: '',
      interimTranscript: '',
      error: null,
    }));
  }, []);

  return { ...state, start, stop, reset };
}
