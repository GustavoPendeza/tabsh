/* eslint-disable @next/next/no-img-element */
import { cn } from '@/lib/utils';
import { FavoriteFormSchema } from '@/lib/validations/favorite';
import { PointerActivationConstraints } from '@dnd-kit/dom';
import {
  DragDropProvider,
  PointerSensor,
  useDragDropMonitor
} from '@dnd-kit/react';
import { isSortable, useSortable } from '@dnd-kit/react/sortable';
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

function arrayMove<T>(array: T[], from: number, to: number): T[] {
  const result = [...array];
  result.splice(to, 0, result.splice(from, 1)[0]);
  return result;
}

interface SortableItemProps {
  favorite: Favorite;
  index: number;
  getFaviconUrl: (url: string) => string | null;
  getNameUrl: (url: string) => string;
  openEditDialog: (favorite: Favorite) => void;
  removeFavorite: (id: string) => void;
}

function SortableFavoriteItem({
  favorite,
  index,
  getFaviconUrl,
  getNameUrl,
  openEditDialog,
  removeFavorite
}: SortableItemProps) {
  const { ref, isDragging } = useSortable({ id: favorite.id, index });

  const wasDragged = useRef(false);

  useDragDropMonitor({
    onDragEnd() {
      wasDragged.current = true;
      setTimeout(() => {
        wasDragged.current = false;
      }, 50);
    }
  });

  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      style={{
        opacity: isDragging ? 0.4 : undefined,
        zIndex: isDragging ? 10 : undefined
      }}
    >
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="group relative min-h-24 min-w-28 cursor-grab rounded-lg border border-gray-300/70 bg-white/95 backdrop-blur-sm transition-all select-none hover:bg-white hover:shadow-sm active:cursor-grabbing dark:border-gray-700/50 dark:bg-gray-800/90 dark:hover:bg-gray-800">
            <div className="absolute -top-1 -right-1 z-20 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => openEditDialog(favorite)}
                onPointerDown={(e) => e.stopPropagation()}
                className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-white transition hover:cursor-pointer hover:bg-blue-600"
              >
                <span className="text-[8px]">
                  <Pencil className="h-2.5 w-2.5" />
                </span>
              </button>
              <button
                onClick={() => removeFavorite(favorite.id)}
                onPointerDown={(e) => e.stopPropagation()}
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
              tabIndex={-1}
              onClick={(e) => {
                if (wasDragged.current) {
                  e.preventDefault();
                }
              }}
            >
              <div className="mx-auto flex h-full w-full items-center justify-center bg-gray-200 dark:bg-gray-700">
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
                title={favorite.name.trim() || getNameUrl(favorite.url)}
              >
                {favorite.name.trim() || getNameUrl(favorite.url)}
              </span>
            </a>
          </div>
        </ContextMenuTrigger>

        <ContextMenuContent>
          <ContextMenuItem
            className="cursor-pointer"
            onClick={() => {
              window.open(favorite.url, '_blank', 'noopener,noreferrer');
            }}
          >
            <SquareArrowOutUpRight size={16} /> Abrir link em uma nova guia
          </ContextMenuItem>
          <ContextMenuItem
            className="cursor-pointer"
            onClick={() => {
              navigator.clipboard.writeText(favorite.url);
              toast.success('URL copiada!');
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
            onClick={() => removeFavorite(favorite.id)}
          >
            <Trash size={16} /> Excluir
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}

interface Props {
  settings: Settings;
  saveSettings: (settings: Settings) => void;
}

export default function Favorites({ settings, saveSettings }: Props) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingFavorite, setEditingFavorite] = useState<Favorite | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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
    const originalIndex = settings.favorites.findIndex(
      (f) => f.id === favorite.id
    );
    const newFavorites = [...updatedFavorites];
    if (originalIndex >= 0) {
      newFavorites.splice(originalIndex, 0, favorite);
    } else {
      newFavorites.push(favorite);
    }

    saveSettings({ ...settings, favorites: newFavorites });

    toast.dismiss();
    toast(`${favorite.name || getNameUrl(favorite.url)} foi restaurado.`);
  };

  const removeFavorite = (id: string) => {
    const favoriteToRemove = settings.favorites.find((f) => f.id === id);
    if (!favoriteToRemove) return;

    const updatedFavorites = settings.favorites.filter((f) => f.id !== id);
    saveSettings({ ...settings, favorites: updatedFavorites });

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

  const handleDragEnd = (event: any) => {
    const { source } = event.operation;
    if (!source || event.operation.canceled) return;
    if (!isSortable(source)) return;

    const from = source.initialIndex as number;
    const to = source.index as number;
    if (from === to) return;

    saveSettings({
      ...settings,
      favorites: arrayMove(settings.favorites, from, to)
    });
  };

  return (
    <>
      <DragDropProvider
        sensors={[
          PointerSensor.configure({
            activationConstraints: [
              new PointerActivationConstraints.Distance({ value: 8 })
            ],
            preventActivation: (event, source) => {
              const el = source.handle ?? source.element;
              return !el?.contains(event.target as Node);
            }
          })
        ]}
        onDragEnd={handleDragEnd}
      >
        <div className="relative flex flex-1 items-center justify-center p-6 2xl:min-h-screen">
          <div className="w-full max-w-5xl">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 2xl:grid-cols-8">
              {settings.favorites.length > 0 &&
                settings.favorites.map((favorite, index) => (
                  <SortableFavoriteItem
                    key={favorite.id}
                    favorite={favorite}
                    index={index}
                    getFaviconUrl={getFaviconUrl}
                    getNameUrl={getNameUrl}
                    openEditDialog={openEditDialog}
                    removeFavorite={removeFavorite}
                  />
                ))}

              {/* Botão adicionar */}
              <button
                type="button"
                onClick={() => setIsAddDialogOpen(true)}
                className={cn(
                  settings.favorites.length > 0
                    ? 'flex min-h-24 min-w-28 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-400/60 bg-gray-100/80 text-gray-500 backdrop-blur-sm transition-colors select-none hover:bg-gray-200/80 dark:border-gray-600/60 dark:bg-gray-800/80 dark:text-gray-400 dark:hover:bg-gray-700/80'
                    : 'hidden'
                )}
              >
                <Plus size={22} />
                <span className="text-sm">Adicionar</span>
              </button>
            </div>
          </div>

          {settings.favorites.length === 0 && (
            <div className="fixed right-6 bottom-20 z-10">
              <button
                className="relative cursor-pointer rounded-full bg-white p-3 text-gray-600 shadow-lg backdrop-blur-sm transition-colors hover:bg-gray-100 hover:text-gray-800 dark:bg-gray-800/80 dark:text-gray-300 dark:hover:bg-gray-800/90 dark:hover:text-white"
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
      </DragDropProvider>
    </>
  );
}
