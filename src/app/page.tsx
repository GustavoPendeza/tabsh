/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import getWeatherHumidity from '@/lib/weather-humidity';
import {
  Cloud,
  CloudOff,
  CloudRain,
  CloudSnow,
  Download,
  ImageIcon,
  MapPin,
  Moon,
  Palette,
  Plus,
  Settings,
  Sun,
  Upload,
  X,
  Zap
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

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

interface ContextMenuState {
  x: number;
  y: number;
  favorite: Favorite;
}

export default function HomePage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newFavorite, setNewFavorite] = useState({ name: '', url: '' });
  const [editingFavorite, setEditingFavorite] = useState<Favorite | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const draggedItem = useRef<Favorite | null>(null);
  const dragOverItem = useRef<Favorite | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('tabsh-settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  // Aplica a classe 'dark' ao elemento <html> com base no tema selecionado
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Debounce para aguardar o usuário terminar de digitar
    const timeout = setTimeout(() => {
      // Atualiza o clima a cada 5 minutos
      const updateWeather = () => {
        if (settings.weatherLocation) {
          fetchWeather(settings.weatherLocation);
        } else {
          // Tentar obter localização automaticamente
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                fetchWeatherByCoords(
                  position.coords.latitude,
                  position.coords.longitude
                );
              },
              () => {
                // Fallback para uma cidade padrão
                fetchWeather('São Paulo');
              }
            );
          } else {
            fetchWeather('São Paulo');
          }
        }
      };

      // Atualiza imediatamente ao montar
      updateWeather();

      // Atualiza a cada 5 minutos
      const interval = setInterval(updateWeather, 5 * 60 * 1000);

      return () => clearInterval(interval);
    }, 800); // 800ms após digitar

    return () => clearTimeout(timeout);
  }, [settings.weatherLocation]);

  const fetchWeatherHumidity = async (lat: string, lon: string) => {
    try {
      const humidity = await getWeatherHumidity(lat, lon);
      return humidity;
    } catch (error) {
      console.error('Erro ao obter umidade:', error);
      toast.error('Erro ao obter umidade. Usando valor padrão.');
      return 65; // Valor padrão
    }
  };

  const fetchWeather = async (location: string) => {
    if (!weather) setWeatherLoading(true);

    try {
      const city = location || 'São Paulo';
      // Busca coordenadas da cidade usando Nominatim
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(city)}&format=json&limit=1`
      );
      const geoData = await geoRes.json();
      const lat = geoData[0]?.lat || '-23.5505';
      const lon = geoData[0]?.lon || '-46.6333';
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Clima não encontrado');
      const data = await res.json();

      if (!data.current_weather) throw new Error('Clima não encontrado');

      const temp = Math.round(data.current_weather.temperature);
      const wind = Math.round(data.current_weather.windspeed);
      const code = data.current_weather.weathercode;
      let condition = 'Ensolarado';
      if ([1, 2, 3].includes(code)) condition = 'Parcialmente nublado';
      if ([45, 48].includes(code)) condition = 'Nublado';
      if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code))
        condition = 'Chuvoso';
      if ([71, 73, 75, 77, 85, 86].includes(code)) condition = 'Neve';
      if ([95, 96, 99].includes(code)) condition = 'Tempestade';

      const humidity = await fetchWeatherHumidity(lat, lon);

      const weatherData: WeatherData = {
        temperature: temp,
        condition,
        location: city,
        humidity,
        windSpeed: wind,
        icon: 'sun'
      };

      setWeather(weatherData);
    } catch (error) {
      console.error('Erro ao buscar clima:', error);
      toast.error('Erro ao buscar clima. Verifique a localização.');
    } finally {
      setWeatherLoading(false);
    }
  };

  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    if (!weather) setWeatherLoading(true);

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
      const res = await fetch(url);
      const data = await res.json();
      if (!data.current_weather) throw new Error('Clima não encontrado');

      const temp = Math.round(data.current_weather.temperature);
      const wind = Math.round(data.current_weather.windspeed);
      const code = data.current_weather.weathercode;
      let condition = 'Ensolarado';
      if ([1, 2, 3].includes(code)) condition = 'Parcialmente nublado';
      if ([45, 48].includes(code)) condition = 'Nublado';
      if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code))
        condition = 'Chuvoso';
      if ([71, 73, 75, 77, 85, 86].includes(code)) condition = 'Neve';
      if ([95, 96, 99].includes(code)) condition = 'Tempestade';

      // Busca reversa para nome da cidade (opcional)
      let locationName = 'Sua localização';
      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=pt`
        );
        const geoData = await geoRes.json();
        locationName =
          geoData.address?.city ||
          geoData.address?.town ||
          geoData.address?.village ||
          geoData.address?.state ||
          'Sua localização';
      } catch {
        console.error('Erro ao obter localização por coordenadas.');
        toast.error('Erro ao obter localização por coordenadas.');
      }

      const humidity = await fetchWeatherHumidity(
        lat.toString(),
        lon.toString()
      );

      const weatherData: WeatherData = {
        temperature: temp,
        condition,
        location: locationName,
        humidity,
        windSpeed: wind,
        icon: 'sun'
      };

      setWeather(weatherData);
    } catch (error) {
      console.error('Erro ao buscar clima:', error);
      toast.error('Erro ao buscar clima.');
    } finally {
      setWeatherLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'ensolarado':
        return <Sun className="h-6 w-6 text-yellow-500" />;
      case 'parcialmente nublado':
        return <Cloud className="h-6 w-6 text-gray-400" />;
      case 'nublado':
        return <Cloud className="h-6 w-6 text-gray-500" />;
      case 'chuvoso':
        return <CloudRain className="h-6 w-6 text-blue-500" />;
      case 'neve':
        return <CloudSnow className="h-6 w-6 text-blue-200" />;
      case 'tempestade':
        return <Zap className="h-6 w-6 text-yellow-600" />;
      default:
        return <Sun className="h-6 w-6 text-yellow-500" />;
    }
  };

  const saveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    localStorage.setItem('tabsh-settings', JSON.stringify(newSettings));
  };

  const addFavorite = () => {
    if (!newFavorite.name || !newFavorite.url) return;

    const favorite = {
      id: Date.now().toString(),
      name: newFavorite.name,
      url: newFavorite.url.startsWith('http')
        ? newFavorite.url
        : `https://${newFavorite.url}`
    };

    saveSettings({
      ...settings,
      favorites: [...settings.favorites, favorite]
    });

    setNewFavorite({ name: '', url: '' });
    setIsAddDialogOpen(false);
  };

  const removeFavorite = (id: string) => {
    saveSettings({
      ...settings,
      favorites: settings.favorites.filter((f) => f.id !== id)
    });
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tabsh_favoritos.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        saveSettings(imported);
      } catch (error) {
        console.log('Erro ao importar configurações:', error);
        toast.error(
          'Erro ao importar configurações. Verifique o formato do arquivo.'
        );
      }
    };
    reader.readAsText(file);
  };

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
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

  const editFavorite = () => {
    if (!editingFavorite || !editingFavorite.name || !editingFavorite.url)
      return;

    const updatedFavorites = settings.favorites.map((f) =>
      f.id === editingFavorite.id
        ? {
            ...f,
            name: editingFavorite.name,
            url: editingFavorite.url.startsWith('http')
              ? editingFavorite.url
              : `https://${editingFavorite.url}`,
            iconUrl: editingFavorite.iconUrl || ''
          }
        : f
    );

    saveSettings({
      ...settings,
      favorites: updatedFavorites
    });

    setEditingFavorite(null);
    setIsEditDialogOpen(false);
  };

  const openEditDialog = (favorite: Favorite) => {
    setEditingFavorite({ ...favorite });
    setIsEditDialogOpen(true);
    setContextMenu(null); // Close context menu if open
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  // Drag and Drop Handlers
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    favorite: Favorite
  ) => {
    draggedItem.current = favorite;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', favorite.id);
    e.currentTarget.classList.add('opacity-50'); // Visual feedback
  };

  const handleDragEnter = (
    e: React.DragEvent<HTMLDivElement>,
    favorite: Favorite
  ) => {
    e.preventDefault();
    dragOverItem.current = favorite;
    e.currentTarget.classList.add('border-blue-500'); // Visual feedback
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('border-blue-500'); // Remove visual feedback
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500'); // Remove visual feedback

    if (
      draggedItem.current &&
      dragOverItem.current &&
      draggedItem.current.id !== dragOverItem.current.id
    ) {
      const newFavorites = [...settings.favorites];
      const draggedIndex = newFavorites.findIndex(
        (f) => f.id === draggedItem.current?.id
      );
      const dragOverIndex = newFavorites.findIndex(
        (f) => f.id === dragOverItem.current?.id
      );

      if (draggedIndex !== -1 && dragOverIndex !== -1) {
        const [removed] = newFavorites.splice(draggedIndex, 1);
        newFavorites.splice(dragOverIndex, 0, removed);
        saveSettings({ ...settings, favorites: newFavorites });
      }
    }
    draggedItem.current = null;
    dragOverItem.current = null;
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50'); // Remove visual feedback
    // Ensure all dragOverItem borders are removed in case of cancelled drag
    const allFavoriteElements = document.querySelectorAll('.favorite-item');
    allFavoriteElements.forEach((el) => el.classList.remove('border-blue-500'));
  };

  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, favorite: Favorite) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, favorite });
    },
    []
  );

  const handleRemoveFavoriteFromContext = (id: string) => {
    removeFavorite(id);
    setContextMenu(null);
  };

  // Close context menu when clicking anywhere else
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
    };
    if (contextMenu) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenu]);

  const handleResetBackgroundColor = () => {
    saveSettings({
      ...settings,
      backgroundColor: defaultSettings.backgroundColor
    });
  };

  const handleResetBackgroundImage = () => {
    saveSettings({
      ...settings,
      backgroundImage: defaultSettings.backgroundImage
    });
  };

  return (
    <div className="min-h-screen w-full" style={getBackgroundStyle()}>
      {/* Overlay para melhor legibilidade quando há imagem de fundo */}
      {settings.backgroundType === 'image' && settings.backgroundImage && (
        <div className="absolute inset-0 bg-black/10 dark:bg-black/30" />
      )}

      {/* Widget do clima no canto superior direito */}
      <div className="absolute top-6 right-6 z-10">
        <div className="flex min-h-36 min-w-[220px] items-center justify-center rounded-lg border border-gray-200/50 bg-white/90 p-4 text-gray-800 shadow-lg backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/90 dark:text-gray-100">
          {weatherLoading ? (
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-current" />
          ) : weather ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getWeatherIcon(weather.condition)}
                  <span className="text-2xl font-bold">
                    {weather.temperature}°
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    {formatTime(currentTime)}
                  </div>
                  <div className="text-xs opacity-75">
                    {formatDate(currentTime)}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{weather.location}</span>
                </div>
                <div className="text-xs opacity-75">{weather.condition}</div>
                <div className="flex justify-between text-xs opacity-75">
                  <span>Umidade: {weather.humidity}%</span>
                  <span>Vento: {weather.windSpeed} km/h</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-xs opacity-75">
              <CloudOff className="mx-auto mb-2 h-6 w-6 text-gray-400" />
              Clima indisponível
            </div>
          )}
        </div>
      </div>

      {/* Botão de configurações no canto inferior direito */}
      <div className="fixed right-6 bottom-6 z-10">
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogTrigger asChild>
            <button className="rounded-full bg-white/80 p-3 text-gray-500 shadow-lg backdrop-blur-sm transition-colors hover:bg-white/90 hover:text-gray-700 dark:bg-gray-800/80 dark:text-gray-300 dark:hover:bg-gray-800/90 dark:hover:text-white">
              <Settings className="h-5 w-5" />
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-lg">Configurações</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-2">
              <div className="grid grid-cols-2 gap-4">
                {/* Seção de Tema */}
                <div className="space-y-3">
                  <Label className="text-foreground text-sm">Tema</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        saveSettings({
                          ...settings,
                          theme: settings.theme === 'light' ? 'dark' : 'light'
                        })
                      }
                    >
                      {settings.theme === 'light' ? (
                        <Sun className="h-4 w-4" />
                      ) : (
                        <Moon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                {/* Seção de Clima */}
                <div className="space-y-3">
                  <Label className="text-foreground text-sm">
                    Localização do Clima
                  </Label>
                  {/* Título mais descritivo */}
                  <Input
                    value={settings.weatherLocation}
                    onChange={(e) =>
                      saveSettings({
                        ...settings,
                        weatherLocation: e.target.value
                      })
                    }
                    placeholder="São Paulo, SP"
                    className="text-sm"
                  />
                  <p className="text-muted-foreground text-xs">
                    Deixe vazio para usar sua localização atual
                  </p>
                </div>
              </div>
              {/* Seção de Fundo */}
              <div className="space-y-3">
                <Label className="text-foreground text-sm">Tipo de Fundo</Label>
                <div className="flex gap-2">
                  <Button
                    variant={
                      settings.backgroundType === 'color'
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() =>
                      saveSettings({ ...settings, backgroundType: 'color' })
                    }
                    className="flex-1"
                  >
                    <Palette className="mr-1 h-4 w-4" />
                    Cor
                  </Button>
                  <Button
                    variant={
                      settings.backgroundType === 'image'
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() =>
                      saveSettings({ ...settings, backgroundType: 'image' })
                    }
                    className="flex-1"
                  >
                    <ImageIcon className="mr-1 h-4 w-4" />
                    Imagem
                  </Button>
                </div>

                {settings.backgroundType === 'color' ? (
                  <div className="space-y-2">
                    <Label className="text-foreground text-sm">Cor</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={settings.backgroundColor}
                        onChange={(e) =>
                          saveSettings({
                            ...settings,
                            backgroundColor: e.target.value
                          })
                        }
                        className="flex-1"
                      />
                      <Input
                        type="text"
                        value={settings.backgroundColor}
                        onChange={(e) =>
                          saveSettings({
                            ...settings,
                            backgroundColor: e.target.value
                          })
                        }
                        placeholder="#000000"
                        className="flex-3 text-sm"
                      />
                      <Button
                        className="flex-1"
                        variant="outline"
                        onClick={handleResetBackgroundColor}
                      >
                        Redefinir
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label className="text-foreground text-sm">
                      URL da Imagem
                    </Label>

                    <div className="flex gap-2">
                      <Input
                        value={settings.backgroundImage}
                        onChange={(e) =>
                          saveSettings({
                            ...settings,
                            backgroundImage: e.target.value
                          })
                        }
                        placeholder="https://exemplo.com/imagem.jpg"
                        className="text-sm"
                      />
                      <Button
                        variant="outline"
                        onClick={handleResetBackgroundImage}
                      >
                        Redefinir
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              {/* Seção de Dados */}
              <div className="space-y-4">
                <Label className="text-foreground text-sm">
                  Gerenciamento de Dados
                </Label>
                {/* Novo título para a seção */}
                <Button
                  onClick={exportSettings}
                  variant="outline"
                  className="w-full bg-transparent text-sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Favoritos
                </Button>
                <div>
                  <input
                    id="import-file"
                    type="file"
                    accept=".json"
                    onChange={importSettings}
                    className="hidden"
                  />
                  <Button
                    onClick={() =>
                      document.getElementById('import-file')?.click()
                    }
                    variant="outline"
                    className="w-full text-sm"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Importar Favoritos
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Conteúdo central */}
      <div className="relative flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-8">
            {settings.favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="group relative min-h-20 min-w-24 rounded-lg border border-gray-100/50 bg-white/90 backdrop-blur-sm transition-all hover:bg-white hover:shadow-sm dark:border-gray-700/50 dark:bg-gray-800/90 dark:hover:bg-gray-800"
                draggable
                onDragStart={(e) => handleDragStart(e, favorite)}
                onDragEnter={(e) => handleDragEnter(e, favorite)}
                onDragLeave={handleDragLeave}
                onDragEnd={handleDragEnd}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onContextMenu={(e) => handleContextMenu(e, favorite)}
              >
                <div className="absolute -top-1 -right-1 z-20 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => openEditDialog(favorite)}
                    className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-white transition hover:cursor-pointer hover:bg-blue-600"
                  >
                    <span className="text-[8px]">✎</span>
                  </button>
                  <button
                    onClick={() => removeFavorite(favorite.id)}
                    className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-400 text-white transition hover:cursor-pointer hover:bg-red-600"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>

                <a
                  href={favorite.url}
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex flex-col items-center justify-center text-center"
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  tabIndex={-1}
                >
                  <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                    <img
                      src={
                        favorite.iconUrl ||
                        getFaviconUrl(favorite.url) ||
                        '/placeholder.svg'
                      }
                      alt={favorite.name}
                      className="h-5 w-5"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const sibling = e.currentTarget
                          .nextElementSibling as HTMLElement;
                        if (sibling) sibling.style.display = 'block';
                      }}
                      draggable={false}
                    />
                    <span
                      className="hidden text-xs font-medium text-gray-600 dark:text-gray-300"
                      style={{ display: 'none' }}
                    >
                      {favorite.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="block text-xs leading-tight font-medium text-gray-700 dark:text-gray-200">
                    {favorite.name}
                  </span>
                </a>
              </div>
            ))}

            {/* Botão adicionar */}
            <Dialog
              open={isAddDialogOpen}
              onOpenChange={() => {
                setIsAddDialogOpen(!isAddDialogOpen);
                setNewFavorite({ name: '', url: '' }); // TODO: Verificar se é necessário limpar o estado aqui
              }}
            >
              <DialogTrigger asChild>
                <Button className="flex min-h-[80px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200/60 bg-gray-50/80 text-gray-500 backdrop-blur-sm transition-colors hover:bg-gray-100/80 dark:border-gray-600/60 dark:bg-gray-800/80 dark:text-gray-400 dark:hover:bg-gray-700/80">
                  <Plus className="mb-1 h-5 w-5" />
                  <span className="text-xs">Adicionar</span>
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle className="text-lg">Novo site</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">Nome</Label>
                    <Input
                      value={newFavorite.name}
                      onChange={(e) =>
                        setNewFavorite({ ...newFavorite, name: e.target.value })
                      }
                      placeholder="Google"
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">URL</Label>
                    <Input
                      value={newFavorite.url}
                      onChange={(e) =>
                        setNewFavorite({ ...newFavorite, url: e.target.value })
                      }
                      placeholder="google.com"
                      className="text-sm"
                    />
                  </div>

                  <Button
                    type="submit"
                    onClick={addFavorite}
                    className="w-full"
                  >
                    Adicionar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Dialog de edição */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle className="text-lg">Editar site</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">
                      Ícone personalizado (URL)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={editingFavorite?.iconUrl || ''}
                        onChange={(e) =>
                          setEditingFavorite(
                            editingFavorite
                              ? { ...editingFavorite, iconUrl: e.target.value }
                              : null
                          )
                        }
                        placeholder="https://exemplo.com/favicon.png"
                        className="flex-1 text-sm"
                      />
                      <div className="flex h-8 w-8 items-center justify-center rounded border bg-gray-100">
                        {editingFavorite?.iconUrl ? (
                          <img
                            src={editingFavorite.iconUrl}
                            alt="Prévia do ícone"
                            className="h-5 w-5"
                            onError={(e) =>
                              (e.currentTarget.style.display = 'none')
                            }
                          />
                        ) : (
                          <span className="text-xs text-gray-400">?</span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Deixe vazio para usar o favicon automático do site.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">Nome</Label>
                    <Input
                      value={editingFavorite?.name || ''}
                      onChange={(e) =>
                        setEditingFavorite(
                          editingFavorite
                            ? { ...editingFavorite, name: e.target.value }
                            : null
                        )
                      }
                      placeholder="Google"
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">URL</Label>
                    <Input
                      value={editingFavorite?.url || ''}
                      onChange={(e) =>
                        setEditingFavorite(
                          editingFavorite
                            ? { ...editingFavorite, url: e.target.value }
                            : null
                        )
                      }
                      placeholder="google.com"
                      className="text-sm"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={editFavorite} className="flex-1">
                      Salvar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Menu de Contexto Personalizado */}
      {contextMenu && (
        <div
          className="absolute z-50 overflow-hidden rounded-md border bg-white text-gray-800 shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()} // Evita que o clique no menu feche-o imediatamente
        >
          <button
            className="block w-full px-4 py-2 text-left text-sm hover:cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => {
              if (contextMenu.favorite) {
                window.open(
                  contextMenu.favorite.url,
                  '_blank',
                  'noopener,noreferrer'
                );
              }
              setContextMenu(null);
            }}
          >
            Abrir link em uma nova guia
          </button>
          <button
            className="block w-full px-4 py-2 text-left text-sm hover:cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => {
              if (contextMenu.favorite) {
                navigator.clipboard.writeText(contextMenu.favorite.url);
                toast.success('URL copiada!');
              }
              setContextMenu(null);
            }}
          >
            Copiar URL
          </button>
          <button
            className="block w-full px-4 py-2 text-left text-sm hover:cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => openEditDialog(contextMenu.favorite)}
          >
            Editar
          </button>
          <button
            className="block w-full bg-red-800 px-4 py-2 text-left text-sm text-white hover:cursor-pointer hover:bg-red-700"
            onClick={() =>
              handleRemoveFavoriteFromContext(contextMenu.favorite.id)
            }
          >
            Excluir
          </button>
        </div>
      )}
    </div>
  );
}
