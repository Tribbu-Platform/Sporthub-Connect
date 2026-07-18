import type { Metadata } from 'next';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
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
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        {/* Main navigation bar */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <nav className="container mx-auto flex h-16 items-center px-4">
            <Link href="/" className="flex items-center space-x-2 font-bold text-xl text-primary">
              <span className="text-2xl">⚽</span>
              <span>SportHub</span>
            </Link>
            <div className="flex-1" />
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
                Iniciar sesion
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Registrarse
              </Link>
            </div>
          </nav>
        </header>

        {/* Main content */}
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t py-8 mt-16">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} SportHub Connect. Todos los derechos reservados.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
