import type { Metadata } from 'next';

import {
  ClerkProvider,
} from '@clerk/nextjs';

import './globals.css';

export const metadata: Metadata = {
  title: 'Finance App',
  description: 'Controle financeiro pessoal',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <ClerkProvider>

      <html lang="pt-BR">

        <body>
          {children}
        </body>

      </html>

    </ClerkProvider>
  );
}