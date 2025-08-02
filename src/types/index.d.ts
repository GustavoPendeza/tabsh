type Favorite = {
  id: string;
  name: string;
  url: string;
  iconUrl?: string;
};

type WeatherData = {
  temperature: number;
  condition: string;
  location: string;
  humidity: number;
  windSpeed: number;
  icon: string;
};

type Settings = {
  theme: 'light' | 'dark';
  backgroundType: 'color' | 'image';
  backgroundColor: string;
  backgroundImage: string;
  weatherLocation: string;
  favorites: Favorite[];
};
