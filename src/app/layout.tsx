import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Inter } from 'next/font/google';
import type React from 'react';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nova guia',
  description: 'Tab.sh - Uma nova guia personalizada para o seu navegador'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <main>{children}</main>
          <Toaster position="bottom-center" richColors />
        </ThemeProvider>
        {process.env.NEXT_PUBLIC_NODE_ENV === 'production' && <Analytics />}
        {process.env.NEXT_PUBLIC_NODE_ENV === 'production' && <SpeedInsights />}
      </body>
    </html>
  );
}
