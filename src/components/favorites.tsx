/* eslint-disable @next/next/no-img-element */
import { cn } from '@/lib/utils';
import {
  CircleAlert,
  Copy,
  Edit,
  Pencil,
  Plus,
  SquareArrowOutUpRight,
  Trash,
  X
} from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { ignoreSubs } from '../../utils/subs';
import { FavoriteFormDialog } from './dialogs/favorite-form-dialog';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from './ui/context-menu';
import { FavoriteFormSchema } from '@/lib/validations/favorite';

interface Props {
  settings: Settings;
  saveSettings: (settings: Settings) => void;
}

export default function Favorites({ settings, saveSettings }: Props) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingFavorite, setEditingFavorite] = useState<Favorite | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const draggedItem = useRef<Favorite | null>(null);
  const dragOverItem = useRef<Favorite | null>(null);

  const addFavorite = (values: FavoriteFormSchema) => {
    const favorite = {
      id: Date.now().toString(),
      name: values.name || '',
      url: values.url.startsWith('http') ? values.url : `https://${values.url}`
    };

    saveSettings({
      ...settings,
      favorites: [...settings.favorites, favorite]
    });

    setIsAddDialogOpen(false);
  };

  const undoRemoveFavorite = (
    updatedFavorites: Favorite[],
    favorite: Favorite
  ) => {
    // Adiciona o favorito de volta na posição original
    const originalIndex = settings.favorites.findIndex(
      (f) => f.id === favorite.id
    );
    const newFavorites = [...updatedFavorites];
    if (originalIndex >= 0) {
      newFavorites.splice(originalIndex, 0, favorite);
    } else {
      newFavorites.push(favorite);
    }

    saveSettings({
      ...settings,
      favorites: newFavorites
    });

    toast.dismiss();
    console.log(favorite);

    toast(`${favorite.name || getNameUrl(favorite.url)} foi restaurado.`);
  };

  const removeFavorite = (id: string) => {
    const favoriteToRemove = settings.favorites.find((f) => f.id === id);
    if (!favoriteToRemove) return;

    // Remove o favorito do estado imediatamente para feedback visual
    const updatedFavorites = settings.favorites.filter((f) => f.id !== id);
    saveSettings({
      ...settings,
      favorites: updatedFavorites
    });

    toast.dismiss();
    toast(
      `${favoriteToRemove.name || getNameUrl(favoriteToRemove.url)} removido.`,
      {
        action: {
          label: 'Desfazer',
          onClick: () => undoRemoveFavorite(updatedFavorites, favoriteToRemove)
        },
        duration: 5000
      }
    );
  };

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  const getNameUrl = (url: string) => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      const hostname = urlObj.hostname.replace(/^www\./, '');
      const parts = hostname.split('.');
      if (parts.length > 2) {
        let candidate = parts[parts.length - 2];
        if (!ignoreSubs.includes(parts[0].toLowerCase())) {
          candidate = parts[parts.length - 3] || candidate;
        }
        return candidate.charAt(0).toUpperCase() + candidate.slice(1);
      }

      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    } catch {
      return 'Sem nome';
    }
  };

  const editFavorite = (values: FavoriteFormSchema) => {
    if (!editingFavorite) return;

    const updatedFavorites = settings.favorites.map((f) =>
      f.id === editingFavorite.id
        ? {
            ...f,
            name: values.name || '',
            url: values.url.startsWith('http')
              ? values.url
              : `https://${values.url}`,
            iconUrl: values.iconUrl || ''
          }
        : f
    );

    saveSettings({ ...settings, favorites: updatedFavorites });
    setEditingFavorite(null);
    setIsEditDialogOpen(false);
  };

  const openEditDialog = (favorite: Favorite) => {
    setEditingFavorite({ ...favorite });
    setIsEditDialogOpen(true);
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

  const handleRemoveFavoriteFromContext = (id: string) => {
    removeFavorite(id);
  };

  return (
    <>
      <div className="relative flex flex-1 items-center justify-center p-6 2xl:min-h-screen">
        <div className="w-full max-w-5xl">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 2xl:grid-cols-8">
            {settings.favorites.length > 0 &&
              settings.favorites.map((favorite) => (
                <ContextMenu key={favorite.id}>
                  <ContextMenuTrigger>
                    <div
                      className="group relative min-h-24 min-w-28 rounded-lg border border-gray-100/50 bg-white/90 backdrop-blur-sm transition-all hover:bg-white hover:shadow-sm dark:border-gray-700/50 dark:bg-gray-800/90 dark:hover:bg-gray-800"
                      draggable
                      onDragStart={(e) => handleDragStart(e, favorite)}
                      onDragEnter={(e) => handleDragEnter(e, favorite)}
                      onDragLeave={handleDragLeave}
                      onDragEnd={handleDragEnd}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                    >
                      <div className="absolute -top-1 -right-1 z-20 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => openEditDialog(favorite)}
                          className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-white transition hover:cursor-pointer hover:bg-blue-600"
                        >
                          <span className="text-[8px]">
                            <Pencil className="h-2.5 w-2.5" />
                          </span>
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
                        className="absolute inset-0 flex flex-col items-center justify-center gap-y-1.5 overflow-hidden rounded-lg text-center"
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                        tabIndex={-1}
                      >
                        <div className="mx-auto flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-700">
                          <img
                            src={
                              favorite.iconUrl ||
                              getFaviconUrl(favorite.url) ||
                              '/placeholder.svg'
                            }
                            alt={favorite.name}
                            className="h-8 w-8"
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
                            {favorite.name.charAt(0).toUpperCase() ||
                              getNameUrl(favorite.url)}
                          </span>
                        </div>
                        <span
                          className="block w-full overflow-hidden px-2 pb-2.5 text-xs leading-tight font-medium text-nowrap text-ellipsis text-gray-700 dark:text-gray-200"
                          title={
                            favorite.name.trim() || getNameUrl(favorite.url)
                          }
                        >
                          {favorite.name.trim() || getNameUrl(favorite.url)}
                        </span>
                      </a>
                    </div>
                  </ContextMenuTrigger>

                  {/** Context Menu for Favorites */}
                  <ContextMenuContent>
                    <ContextMenuItem
                      className="cursor-pointer"
                      onClick={() => {
                        if (favorite) {
                          window.open(
                            favorite.url,
                            '_blank',
                            'noopener,noreferrer'
                          );
                        }
                      }}
                    >
                      <SquareArrowOutUpRight size={16} /> Abrir link em uma nova
                      guia
                    </ContextMenuItem>
                    <ContextMenuItem
                      className="cursor-pointer"
                      onClick={() => {
                        if (favorite) {
                          navigator.clipboard.writeText(favorite.url);
                          toast.success('URL copiada!');
                        }
                      }}
                    >
                      <Copy size={16} /> Copiar URL
                    </ContextMenuItem>
                    <ContextMenuItem
                      className="cursor-pointer"
                      onClick={() => openEditDialog(favorite)}
                    >
                      <Edit size={16} /> Editar
                    </ContextMenuItem>
                    <ContextMenuItem
                      variant="destructive"
                      className="cursor-pointer"
                      onClick={() =>
                        handleRemoveFavoriteFromContext(favorite.id)
                      }
                    >
                      <Trash size={16} /> Excluir
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}

            {/* Botão adicionar */}
            <button
              type="button"
              onClick={() => setIsAddDialogOpen(true)}
              className={cn(
                settings.favorites.length > 0
                  ? 'flex min-h-24 min-w-28 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-200/60 bg-gray-50/80 text-gray-500 backdrop-blur-sm transition-colors hover:bg-gray-100/80 dark:border-gray-600/60 dark:bg-gray-800/80 dark:text-gray-400 dark:hover:bg-gray-700/80'
                  : 'hidden'
              )}
            >
              <Plus size={22} />
              <span className="text-sm">Adicionar</span>
            </button>

            <FavoriteFormDialog
              open={isAddDialogOpen}
              onOpenChange={setIsAddDialogOpen}
              mode="add"
              onSubmit={addFavorite}
            />

            <FavoriteFormDialog
              open={isEditDialogOpen}
              onOpenChange={setIsEditDialogOpen}
              mode="edit"
              defaultValues={{
                url: editingFavorite?.url || '',
                name: editingFavorite?.name || '',
                iconUrl: editingFavorite?.iconUrl || ''
              }}
              onSubmit={editFavorite}
              getFaviconUrl={getFaviconUrl}
            />
          </div>
        </div>

        {settings.favorites.length === 0 && (
          <div className="fixed right-6 bottom-20 z-10">
            <button
              className="relative cursor-pointer rounded-full bg-white/80 p-3 text-gray-500 shadow-lg backdrop-blur-sm transition-colors hover:bg-white/90 hover:text-gray-700 dark:bg-gray-800/80 dark:text-gray-300 dark:hover:bg-gray-800/90 dark:hover:text-white"
              type="button"
              onClick={() => {
                setIsAddDialogOpen(true);
                if (settings.showAddFirstUrlAlert) {
                  saveSettings({ ...settings, showAddFirstUrlAlert: false });
                }
              }}
            >
              {settings.showAddFirstUrlAlert && (
                <span
                  className="absolute right-0 bottom-7 animate-bounce text-yellow-400"
                  style={{ animationDuration: '1s' }}
                >
                  <CircleAlert size={24} />
                </span>
              )}
              <Plus className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
