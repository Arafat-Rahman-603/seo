"use client";

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function SiteShell({
  children,
  layoutContent,
}: {
  children: React.ReactNode;
  layoutContent?: any;
}) {
  const pathname = usePathname();
  const isPreview = pathname?.startsWith('/preview');

  if (isPreview) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Navbar content={layoutContent?.navbar} />
      <div className="flex-1">{children}</div>
      <Footer content={layoutContent?.footer} />
    </div>
  );
}
