/* eslint-disable @next/next/no-img-element */
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit, Link, Upload } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FavoriteFormSchema, favoriteSchema } from '@/lib/validations/favorite';

interface FavoriteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  defaultValues?: Partial<FavoriteFormSchema>;
  onSubmit: (values: FavoriteFormSchema) => void;
  getFaviconUrl?: (url: string) => string | null;
}

export function FavoriteFormDialog({
  open,
  onOpenChange,
  mode,
  defaultValues,
  onSubmit,
  getFaviconUrl
}: FavoriteFormDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FavoriteFormSchema>({
    resolver: zodResolver(favoriteSchema),
    defaultValues: { url: '', name: '', iconUrl: '' }
  });

  useEffect(() => {
    if (open) {
      form.reset({ url: '', name: '', iconUrl: '', ...defaultValues });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_FILE_SIZE_MB = 2;
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      alert(
        `A imagem é muito grande. O tamanho máximo permitido é ${MAX_FILE_SIZE_MB}MB.`
      );
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      form.setValue(
        'iconUrl',
        typeof reader.result === 'string' ? reader.result : ''
      );
    };
    reader.onerror = () => {
      alert('Erro ao ler o arquivo de imagem.');
    };
    reader.readAsDataURL(file);
  };

  const currentIconUrl = form.watch('iconUrl');
  const currentUrl = form.watch('url');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            {mode === 'add' ? (
              <>
                <Link size={16} /> Novo site
              </>
            ) : (
              <>
                <Edit size={16} /> Editar site
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground text-sm">
                    URL*
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="google.com"
                      className="text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground text-sm">
                    Nome
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Google"
                      className="text-sm"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Deixe vazio para usar o nome automático do site. Pode não
                    funcionar direito em alguns casos.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mode === 'edit' && (
              <FormField
                control={form.control}
                name="iconUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground text-sm">
                      Ícone personalizado (URL)
                    </FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="https://exemplo.com/favicon.png"
                          className="flex-2 text-sm"
                        />
                      </FormControl>

                      <Button
                        type="button"
                        className="cursor-pointer"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        size="icon"
                      >
                        <Upload className="h-4 w-4" />
                      </Button>

                      <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-gray-100 dark:bg-gray-700">
                        {currentIconUrl ? (
                          <img
                            src={currentIconUrl}
                            alt="Prévia do ícone"
                            className="h-6 w-6"
                            onError={(e) =>
                              (e.currentTarget.style.display = 'none')
                            }
                          />
                        ) : (
                          <img
                            src={
                              getFaviconUrl?.(currentUrl || '') ||
                              '/placeholder.svg'
                            }
                            alt="Favicon"
                            className="h-6 w-6"
                            onError={(e) =>
                              (e.currentTarget.style.display = 'none')
                            }
                            draggable={false}
                          />
                        )}
                      </div>
                    </div>
                    <FormDescription className="text-xs">
                      Deixe vazio para usar o favicon automático do site.
                    </FormDescription>
                    <FormMessage />

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </FormItem>
                )}
              />
            )}

            <div className="flex gap-2">
              {mode === 'edit' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 cursor-pointer"
                >
                  Cancelar
                </Button>
              )}
              <Button
                type="submit"
                className={
                  mode === 'add'
                    ? 'w-full cursor-pointer'
                    : 'flex-1 cursor-pointer'
                }
              >
                {mode === 'add' ? 'Adicionar' : 'Salvar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
