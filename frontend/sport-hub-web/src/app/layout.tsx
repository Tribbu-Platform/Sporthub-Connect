import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | SportHub Connect',
    default: 'SportHub Connect - Tu comunidad deportiva',
  },
  description:
    'Plataforma SaaS integral para gestion de comunidades deportivas. Eventos, gamificacion, rankings y mas.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: 'SportHub Connect',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${montserrat.variable} dark`}>
      <body className="min-h-screen bg-[#0c0e11] font-sans antialiased">
        {/* 
          The AppLayout (client component) provides the Sidebar + MainContent layout.
          It is dynamically imported to keep the root layout as a server component.
        */}
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}

/**
 * Client-side layout wrapper.
 * Uses dynamic import with ssr:false to handle browser-dependent sidebar state
 * without hydration mismatches.
 */
import dynamic from 'next/dynamic';

const LayoutWrapper = dynamic(
  () => import('@/components/layout/layout').then((mod) => mod.AppLayout),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-screen bg-[#0c0e11]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#00ff9d] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#b9cbbc]">Cargando...</p>
        </div>
      </div>
    ),
  }
);
