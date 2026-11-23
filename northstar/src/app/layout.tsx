import type { Metadata } from "next";
import "./globals.css";
import SiteShell from "@/components/SiteShell";
import { fetchResolvedContent } from "@/lib/api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Northstar Digital",
  description: "Digital solutions for modern businesses",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const layoutContent = await fetchResolvedContent("layout");

  return (
    <html lang="en">
      <body className="font-sans antialiased bg-white text-gray-900">
        <SiteShell layoutContent={layoutContent}>{children}</SiteShell>
      </body>
    </html>
  );
}
