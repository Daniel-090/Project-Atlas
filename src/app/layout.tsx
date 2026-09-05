import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Atlas · Gestión de comunidades",
  description: "Plataforma para gestorías: comunidades, vecinos, incidencias y comunicaciones en un solo lugar.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" data-theme="dark" suppressHydrationWarning>
      <head>
        {/* Restaura el tema oro (claro/oscuro) elegido en las pantallas públicas antes de pintar */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('atlas-public-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
