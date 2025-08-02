import type { Metadata } from 'next';
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
        <main>{children}</main>
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}
