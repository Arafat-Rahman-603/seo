import { Inter } from 'next/font/google';
import './globals.css';
import { ReactNode } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Central SEO Platform',
  description: 'Manage your website content and SEO',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-gray-900 h-screen overflow-hidden`}>
        {children}
      </body>
    </html>
  );
}
