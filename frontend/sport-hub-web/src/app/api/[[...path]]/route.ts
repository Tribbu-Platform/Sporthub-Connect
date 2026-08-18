/**
 * Proxy handler para /api/* que no tengan ruta especifica en el web.
 * Lee API_UPSTREAM_URL en runtime (seteado en ACA) y reenvia
 * la peticion al backend.
 *
 * Orden de resolucion del upstream (centralizado):
 *   1. API_UPSTREAM_URL      → runtime server-side (ACA, docker-compose)
 *   2. NEXT_PUBLIC_API_URL   → variable publica documentada (.env.example)
 *   3. http://localhost:5000 → fallback de desarrollo local
 *
 * NOTA: Las rutas especificas (ej. /api/health) tienen su propio
 * handler y toman prioridad sobre este catch-all.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  return proxyRequest(request, await params);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  return proxyRequest(request, await params);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  return proxyRequest(request, await params);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  return proxyRequest(request, await params);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  return proxyRequest(request, await params);
}

async function proxyRequest(request: Request, params: { path?: string[] }) {
  const upstream =
    process.env.API_UPSTREAM_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:5000';

  // Construir el path manteniendo /api/ para que coincida con las
  // rutas del backend (ej. /api/community/info)
  const apiPath = params.path?.length ? `/${params.path.join('/')}` : '';
  const targetUrl = `${upstream}/api${apiPath}`;

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: request.method !== 'GET' && request.method !== 'HEAD'
        ? await request.text()
        : undefined,
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error(`[API Proxy] Error proxying to ${targetUrl}:`, error);
    return new Response(
      JSON.stringify({
        error: 'Backend not available',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
