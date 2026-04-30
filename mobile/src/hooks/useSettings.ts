import { useState, useEffect, useCallback } from 'react';
import type { AppSettings } from '../models/settings';
import { getSettings, saveSettings as persistSettings } from '../services/storage';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const saveSettings = useCallback(async (updated: AppSettings) => {
    setSettings(updated);
    await persistSettings(updated);
  }, []);

  return { settings, loading, saveSettings };
}
