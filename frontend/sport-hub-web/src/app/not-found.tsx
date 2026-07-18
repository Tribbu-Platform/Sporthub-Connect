import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <p className="text-xl text-muted-foreground mb-6">
        Pagina no encontrada
      </p>
      <Link
        href="/"
        className="text-primary hover:underline"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
