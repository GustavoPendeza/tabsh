'use client';

import Configs from '@/components/configs';
import Favorites from '@/components/favorites';
import WeatherWidget from '@/components/weather-widget';
import { useEffect, useState } from 'react';

const defaultSettings: Settings = {
  theme: 'dark',
  backgroundType: 'color',
  backgroundColor: '',
  backgroundImage: '',
  weatherLocation: '',
  favorites: [
    { id: '1', name: 'Google', url: 'https://google.com' },
    { id: '2', name: 'YouTube', url: 'https://youtube.com' },
    { id: '3', name: 'GitHub', url: 'https://github.com' }
  ]
};

export default function HomePage() {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    const saved = localStorage.getItem('tabsh-settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  const saveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    localStorage.setItem('tabsh-settings', JSON.stringify(newSettings));
  };

  const isDark = settings.theme === 'dark';

  const getBackgroundStyle = () => {
    if (settings.backgroundType === 'image' && settings.backgroundImage) {
      return {
        backgroundImage: `url(${settings.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }

    return {
      backgroundColor: !settings.backgroundColor
        ? isDark
          ? '#0f172a'
          : '#f8fafc'
        : settings.backgroundColor
    };
  };

  return (
    <div className="min-h-screen w-full" style={getBackgroundStyle()}>
      {/* Overlay para melhor legibilidade quando há imagem de fundo */}
      {settings.backgroundType === 'image' && settings.backgroundImage && (
        <div className="absolute inset-0 bg-black/10 dark:bg-black/30" />
      )}

      {/* Widget do clima */}
      <WeatherWidget settings={settings} />

      {/* Botão de configurações */}
      <Configs
        defaultSettings={defaultSettings}
        settings={settings}
        saveSettings={saveSettings}
      />

      {/* Conteúdo central (Favoritos) */}
      <Favorites settings={settings} saveSettings={saveSettings} />
    </div>
  );
}
