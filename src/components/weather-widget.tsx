/* eslint-disable react-hooks/exhaustive-deps */
import { getWeatherHumidity } from '@/lib/weather';
import {
  Cloud,
  CloudOff,
  CloudRain,
  CloudSnow,
  MapPin,
  Sun,
  Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Props {
  settings: Settings;
}

export default function WeatherWidget({ settings }: Props) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

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

      const weatherData = await getWeatherData(
        parseFloat(lat),
        parseFloat(lon)
      );
      weatherData.location = weatherData.location || city;

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
      const weatherData = await getWeatherData(lat, lon);

      setWeather(weatherData);
    } catch (error) {
      console.error('Erro ao buscar clima:', error);
      toast.error('Erro ao buscar clima.');
    } finally {
      setWeatherLoading(false);
    }
  };

  const getWeatherData = async (lat: number, lon: number) => {
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

    const humidity = await fetchWeatherHumidity(lat.toString(), lon.toString());

    const weatherData: WeatherData = {
      temperature: temp,
      condition,
      location: locationName,
      humidity,
      windSpeed: wind,
      icon: 'sun'
    };

    return weatherData;
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date: Date) => {
    const formattedDate = date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });

    const returnDate =
      formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

    return returnDate;
  };

  const getWeatherWidgetBackgroundStyle = () => {
    // Estes são os componentes OKLCH brutos de --card em globals.css
    const lightCardOklchComponents = '1 0 0'; // De oklch(1 0 0)
    const darkCardOklchComponents = '27.8% 0.033 256.848'; // De oklch(27.8% 0.033 256.848)

    const currentOklchComponents =
      settings.theme === 'dark'
        ? darkCardOklchComponents
        : lightCardOklchComponents;

    return {
      backgroundColor: `oklch(${currentOklchComponents} / ${settings.weatherOpacity})`
    };
  };

  return (
    <div className="absolute top-6 right-6 z-10">
      <div
        className="bg-card flex min-h-40 min-w-60 items-center justify-center rounded-lg border border-gray-200/50 p-4 text-gray-800 shadow-lg backdrop-blur-sm dark:border-gray-700/50 dark:text-gray-100"
        style={getWeatherWidgetBackgroundStyle()}
      >
        {weatherLoading ? (
          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-current" />
        ) : weather ? (
          <div className="w-full">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {getWeatherIcon(weather.condition)}
                <span className="text-2xl font-bold">
                  {weather.temperature}°
                </span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold">
                  {formatTime(currentTime)}
                </div>
                <div className="flex flex-col text-xs opacity-75">
                  <span>{formatDate(currentTime).split(',')[0]}</span>
                  <span>{formatDate(currentTime).split(',')[1]}</span>
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
  );
}
