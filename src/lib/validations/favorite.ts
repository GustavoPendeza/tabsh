import * as z from 'zod';

export const favoriteSchema = z.object({
  url: z
    .string()
    .min(1, 'URL é obrigatória')
    .refine(
      (val) => {
        try {
          const { hostname } = new URL(
            val.startsWith('http') ? val : `https://${val}`
          );
          const parts = hostname.split('.');
          return (
            (parts.length >= 2 && parts.every((p) => p.length > 0)) ||
            hostname === 'localhost'
          );
        } catch {
          return false;
        }
      },
      { message: 'URL inválida' }
    ),
  name: z.string().optional(),
  iconUrl: z.string().optional()
});

export type FavoriteFormSchema = z.infer<typeof favoriteSchema>;
