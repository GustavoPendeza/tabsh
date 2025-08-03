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
  ImageIcon,
  Moon,
  Palette,
  Settings,
  Sun,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';

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

                  <div>
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
                          backgroundColor: e.target.value
                        })
                      }
                      id="hex-input"
                      placeholder="#000000"
                      className="text-sm"
                    />
                    <p className="text-muted-foreground text-xs">
                      Atenção: Utilize códigos hexadecimais válidos (ex:
                      #000000).
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
                  />
                  <p className="text-muted-foreground text-xs">
                    Atenção: Imagens grandes podem não ser salvas devido ao
                    limite de 5MB do navegador.
                  </p>
                </div>
              )}
            </div>
            {/* Seção de Dados */}
            <div className="space-y-4">
              <Label className="text-foreground text-sm">
                Gerenciamento de Dados
              </Label>
              <div className="flex flex-row gap-x-4">
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
                  className="flex-1 text-sm"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Importar Favoritos
                </Button>

                <Button
                  onClick={exportSettings}
                  variant="outline"
                  className="flex-1 text-sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Favoritos
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
