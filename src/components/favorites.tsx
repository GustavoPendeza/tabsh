/* eslint-disable @next/next/no-img-element */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Plus, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface ContextMenuState {
  x: number;
  y: number;
  favorite: Favorite;
}

interface Props {
  settings: Settings;
  saveSettings: (settings: Settings) => void;
}

export default function Favorites({ settings, saveSettings }: Props) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newFavorite, setNewFavorite] = useState({ name: '', url: '' });
  const [editingFavorite, setEditingFavorite] = useState<Favorite | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const draggedItem = useRef<Favorite | null>(null);
  const dragOverItem = useRef<Favorite | null>(null);

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

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  const handleIconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      if (editingFavorite) {
        setEditingFavorite({
          ...editingFavorite,
          iconUrl: typeof reader.result === 'string' ? reader.result : ''
        });
      }
    };
    reader.onerror = () => {
      alert('Erro ao ler o arquivo de imagem.');
    };
    reader.readAsDataURL(file); // Lê o arquivo como Data URL
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

  return (
    <>
      <div className="relative flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-8">
            {settings.favorites.length > 0 &&
              settings.favorites.map((favorite) => (
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
                        className="text-foreground hidden text-xs font-medium dark:text-gray-300"
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
                    <Label className="text-foreground text-sm">Nome</Label>
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
                    <Label className="text-foreground text-sm">URL</Label>
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
                    <Label className="text-foreground text-sm">
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
                    <p className="text-muted-foreground text-xs">
                      Deixe vazio para usar o favicon automático do site.
                    </p>

                    <Label
                      htmlFor="icon-upload"
                      className="text-foreground text-sm"
                    >
                      Ícone personalizado (Upload)
                    </Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleIconUpload}
                      id="icon-upload"
                      hidden
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        document.getElementById('icon-upload')?.click()
                      }
                      className="w-full"
                    >
                      Carregar ícone
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground text-sm">Nome</Label>
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
                    <Label className="text-foreground text-sm">URL</Label>
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
    </>
  );
}
