import type { Metadata } from 'next';
import RegisterForm from './RegisterForm';

export const metadata: Metadata = {
  title: 'Registro | SportHub Connect',
  description:
    'Crea tu cuenta en SportHub Connect y forma parte de la comunidad deportiva más grande. Registro rápido con email y contraseña.',
  openGraph: {
    title: 'Registro | SportHub Connect',
    description: 'Crea tu cuenta y únete a la comunidad deportiva.',
    url: '/auth/register',
  },
};

export default function RegisterPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center py-12">
      {/* Logo and title */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <span className="text-3xl" role="img" aria-label="SportHub logo">
            ⚽
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Crear tu cuenta</h1>
        <p className="mt-2 text-muted-foreground">
          Completa el formulario para registrarte en SportHub Connect
        </p>
      </div>

      {/* Register form card */}
      <div className="w-full rounded-lg border bg-card p-6 shadow-sm">
        <RegisterForm />
      </div>
    </div>
  );
}
