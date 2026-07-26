'use client';

import { useState, useEffect } from 'react';

interface CommunityInfo {
  name: string;
  description: string;
  memberCount: number;
  createdAt: string;
  status: string;
}

export default function HomePage() {
  const [community, setCommunity] = useState<CommunityInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Usar ruta relativa: pasa por el rewrite de Next.js
    // (next.config.js redirige /api/* al backend en runtime)
    fetch('/api/community/info')
      .then((res) => {
        if (!res.ok) throw new Error(`API responded with ${res.status}`);
        return res.json();
      })
      .then((data: CommunityInfo) => {
        setCommunity(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
        Bienvenido a{' '}
        <span className="text-primary">SportHub Connect</span>
      </h1>

      {/* API Status Card */}
      <div className="w-full max-w-md mb-8">
        {loading && (
          <div className="rounded-lg border p-6 animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-3" />
            <div className="h-3 bg-muted rounded w-full mb-2" />
            <div className="h-3 bg-muted rounded w-2/3" />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-destructive text-lg">&#x26A0;</span>
              <h3 className="font-semibold text-destructive">Sin conexion al backend</h3>
            </div>
            <p className="text-sm text-muted-foreground">{error}</p>
            <p className="text-xs text-muted-foreground mt-2">
              La API debe estar corriendo en el mismo dominio via rewrite de Next.js
            </p>
          </div>
        )}

        {community && (
          <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-6 text-left">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-green-600 uppercase tracking-wider">
                Conectado a la API
              </span>
            </div>
            <h3 className="text-xl font-bold mb-1">{community.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">{community.description}</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Miembros:</span>{' '}
                <span className="font-semibold">{community.memberCount}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Creada:</span>{' '}
                <span className="font-semibold">
                  {new Date(community.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Status DB: <span className="font-mono text-green-600">{community.status}</span>
            </div>
          </div>
        )}
      </div>

      <p className="text-xl text-muted-foreground max-w-2xl mb-8">
        La plataforma que unifica la gestion de tu comunidad deportiva. Eventos,
        gamificacion, rankings y mas, todo en un solo lugar.
      </p>

      <div className="flex gap-4">
        <a
          href="/auth/register"
          className="rounded-lg bg-primary px-6 py-3 text-lg font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Comenzar ahora
        </a>
        <a
          href="/communities"
          className="rounded-lg border px-6 py-3 text-lg font-medium hover:bg-accent transition-colors"
        >
          Explorar comunidades
        </a>
      </div>

      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl">
        {[
          { icon: '&#x1F4C5;', title: 'Eventos', desc: 'Organiza partidos, torneos y entrenamientos con RSVP y check-in' },
          { icon: '&#x1F3C6;', title: 'Gamificacion', desc: 'Gana insignias, XP y compite en rankings con tu comunidad' },
          { icon: '&#x1F4B0;', title: 'SportCoins', desc: 'Moneda virtual para canjear beneficios y recompensas' },
        ].map((feature) => (
          <div key={feature.title} className="rounded-lg border p-6 hover:shadow-md transition-shadow">
            <div className="text-3xl mb-3" dangerouslySetInnerHTML={{ __html: feature.icon }} />
            <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
            <p className="text-muted-foreground text-sm">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
