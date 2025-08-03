/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';

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
import {
  Download,
  Github,
  ImageIcon,
  Info,
  Moon,
  Palette,
  Settings,
  Sun,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';

interface Props {
  defaultSettings: Settings;
  settings: Settings;
  saveSettings: (settings: Settings) => void;
}

export default function Configs({
  defaultSettings,
  settings,
  saveSettings
}: Props) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [dataScope, setDataScope] = useState<'all' | 'favorites' | 'settings'>(
    'all'
  );

  const exportSettings = (scope: 'all' | 'favorites' | 'settings') => {
    let dataToExport: Partial<Settings> | Favorite[];
    let filename = 'favoritos.json';

    if (scope === 'all') {
      dataToExport = settings;
      filename = 'tabsh-tudo.json';
    } else if (scope === 'favorites') {
      dataToExport = settings.favorites;
      filename = 'tabsh-favoritos.json';
    } else {
      // scope === "settings"
      const { favorites, ...configsOnly } = settings;
      dataToExport = configsOnly;
      filename = 'tabsh-configuracoes.json';
    }

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (
    event: React.ChangeEvent<HTMLInputElement>,
    scope: 'all' | 'favorites' | 'settings'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);

        if (scope === 'all') {
          // Para 'all', substitui todas as configurações
          // Verifica se importedData possui as propriedades essenciais de Settings
          if (
            importedData &&
            typeof importedData === 'object' &&
            'favorites' in importedData &&
            Array.isArray(importedData.favorites) &&
            'backgroundType' in importedData &&
            'backgroundColor' in importedData &&
            'backgroundImage' in importedData &&
            'theme' in importedData &&
            'weather' in importedData &&
            'weatherLocation' in importedData
          ) {
            saveSettings(importedData);
          } else {
            toast.error(
              'O arquivo importado não está no formato correto de configurações.'
            );
            return;
          }
        } else if (scope === 'favorites') {
          // Para 'favorites', atualiza apenas o array de favoritos
          if (Array.isArray(importedData)) {
            saveSettings({ ...settings, favorites: importedData });
          } else if (
            importedData.favorites &&
            Array.isArray(importedData.favorites)
          ) {
            saveSettings({ ...settings, favorites: importedData.favorites });
          } else {
            toast.error(
              'Formato de arquivo inválido para importação de favoritos.'
            );
            return;
          }
        } else {
          // Para 'settings', atualiza tudo exceto os favoritos
          // Verifica se importedData possui as propriedades essenciais de Settings, exceto 'favorites'
          if (
            importedData &&
            typeof importedData === 'object' &&
            'backgroundType' in importedData &&
            'backgroundColor' in importedData &&
            'backgroundImage' in importedData &&
            'theme' in importedData &&
            'weather' in importedData &&
            'weatherLocation' in importedData
          ) {
            const { favorites: _, ...importedConfigsOnly } = importedData;
            saveSettings({ ...settings, ...importedConfigsOnly });
          } else {
            toast.error(
              'O arquivo importado não está no formato correto de configurações.'
            );
            return;
          }
        }

        toast.success(
          `${dataScope === 'favorites' ? 'Favoritos importados' : 'Configurações importadas'} com sucesso!`
        );
      } catch (error) {
        console.error('Erro ao importar arquivo:', error);
        toast.error(
          'Erro ao importar arquivo. Verifique se o formato está correto.'
        );
      }
    };
    reader.readAsText(file);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verifica o tamanho do arquivo (ex: 2MB = 2 * 1024 * 1024 bytes)
    const MAX_FILE_SIZE_MB = 2;
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      alert(
        `A imagem é muito grande. O tamanho máximo permitido é ${MAX_FILE_SIZE_MB}MB.`
      );
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      // reader.result conterá a imagem como uma Data URL (Base64)
      saveSettings({
        ...settings,
        backgroundImage: reader.result as string,
        backgroundType: 'image'
      });
    };
    reader.onerror = () => {
      alert('Erro ao ler o arquivo de imagem.');
    };
    reader.readAsDataURL(file); // Lê o arquivo como Data URL
  };

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
              {/* Seção de Dados */}
              <div className="space-y-4">
                <Label className="text-foreground text-sm">
                  Gerenciamento de Dados
                </Label>

                <div className="flex items-center gap-2">
                  <Select
                    value={dataScope}
                    onValueChange={(value: 'all' | 'favorites' | 'settings') =>
                      setDataScope(value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o escopo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tudo</SelectItem>
                      <SelectItem value="favorites">Favoritos</SelectItem>
                      <SelectItem value="settings">Configurações</SelectItem>
                    </SelectContent>
                  </Select>

                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Info className="h-5 w-5" />
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80 space-y-2">
                      <p className="text-sm">
                        Selecione o escopo dos dados a serem exportados ou
                        importados.
                      </p>
                      <ul className="list-disc pl-5">
                        <li>
                          <strong>Tudo:</strong> Todas as configurações e
                          favoritos.
                        </li>
                        <li>
                          <strong>Favoritos:</strong> Apenas os seus links
                          favoritos.
                        </li>
                        <li>
                          <strong>Configurações:</strong> Somente as
                          configurações gerais (como preferências de tema).
                        </li>
                      </ul>
                    </HoverCardContent>
                  </HoverCard>
                </div>

                <div className="flex flex-col gap-2">
                  <input
                    id="import-file"
                    type="file"
                    accept=".json"
                    onChange={(e) => importSettings(e, dataScope)}
                    className="hidden"
                  />
                  <Button
                    onClick={() =>
                      document.getElementById('import-file')?.click()
                    }
                    variant="outline"
                    className="flex-1 text-sm"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Importar
                  </Button>

                  <Button
                    onClick={() => exportSettings(dataScope)}
                    variant="outline"
                    className="flex-1 text-sm"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                </div>
              </div>

              {/* Seção de Clima */}
              <div className="space-y-3">
                <Label className="text-foreground text-sm">Clima</Label>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={settings.weather}
                    onCheckedChange={(checked) =>
                      saveSettings({ ...settings, weather: checked })
                    }
                    id="weather-toggle"
                  />
                  <Label htmlFor="weather-toggle" className="text-sm">
                    Ativar Widget do Clima
                  </Label>
                </div>

                <div className="flex flex-col gap-1">
                  <Input
                    value={settings.weatherLocation}
                    onChange={(e) =>
                      saveSettings({
                        ...settings,
                        weatherLocation: e.target.value
                      })
                    }
                    placeholder="São Paulo"
                    className="text-sm"
                  />
                  <p className="text-muted-foreground text-xs">
                    Insira o nome da cidade. Deixe vazio para usar sua
                    localização atual
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Opacidade</Label>

                  <div className="flex items-center gap-2">
                    <Slider
                      min={0}
                      max={1}
                      step={0.05}
                      value={[settings.weatherOpacity]}
                      onValueChange={(value) =>
                        saveSettings({ ...settings, weatherOpacity: value[0] })
                      }
                      className="w-full"
                    />
                    <span className="w-10 text-right text-sm font-medium">
                      {Math.round(settings.weatherOpacity * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Seção de Fundo */}
            <div className="space-y-3">
              <Label className="text-foreground text-sm">Tipo de Fundo</Label>
              <div className="flex gap-2">
                <Button
                  variant={
                    settings.backgroundType === 'color' ? 'default' : 'outline'
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
                    settings.backgroundType === 'image' ? 'default' : 'outline'
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
                  <Label
                    className="text-foreground text-sm"
                    htmlFor="color-input"
                  >
                    Cor
                  </Label>
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
                      id="color-input"
                    />
                    <Button
                      variant="outline"
                      onClick={handleResetBackgroundColor}
                    >
                      Redefinir
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label
                      className="text-muted-foreground text-sm"
                      htmlFor="hex-input"
                    >
                      Ou digite um código de cor
                    </Label>
                    <Input
                      type="text"
                      value={settings.backgroundColor}
                      onChange={(e) =>
                        saveSettings({
                          ...settings,
                          backgroundColor: e.target.value.slice(0, 7)
                        })
                      }
                      id="hex-input"
                      placeholder="#000000"
                      className="text-sm"
                    />
                    <p className="text-muted-foreground text-xs">
                      Utilize códigos hexadecimais válidos (ex: #000000).
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label
                    className="text-foreground text-sm"
                    htmlFor="image-url"
                  >
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
                      id="image-url"
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
                  <Label
                    className="text-muted-foreground text-sm"
                    htmlFor="image-upload"
                  >
                    Ou fazer upload de uma imagem
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="text-sm"
                    hidden
                  />
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() =>
                      document.getElementById('image-upload')?.click()
                    }
                  >
                    <ImageIcon className="h-4 w-4" />
                    Carregar imagem
                  </Button>
                  <p className="text-muted-foreground text-xs">
                    Atenção: Imagens grandes podem não ser salvas devido ao
                    limite de 5MB do navegador.
                  </p>
                </div>
              )}
            </div>
            {/* Seção de Tema */}
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                {/* <a
                  href="https://www.linkedin.com/in/gustavo-seiki-pendeza/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="icon">
                    <Linkedin className="h-4 w-4" />
                  </Button>
                </a> */}
                <a
                  href="https://github.com/GustavoPendeza/tabsh"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="icon">
                    <Github className="h-4 w-4" />
                  </Button>
                </a>
              </div>

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
        </DialogContent>
      </Dialog>
    </div>
  );
}
