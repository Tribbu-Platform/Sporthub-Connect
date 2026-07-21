import type { Metadata } from 'next';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Iniciar Sesion | SportHub Connect',
  description:
    'Accede a tu cuenta en SportHub Connect con tu correo y contrasena. Gestiona tus eventos deportivos y conecta con la comunidad.',
  openGraph: {
    title: 'Iniciar Sesion | SportHub Connect',
    description: 'Accede a tu cuenta en SportHub Connect.',
    url: '/auth/login',
  },
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center py-12">
      {/* Logo and title */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <span className="text-2xl font-bold text-primary">SH</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Iniciar Sesion</h1>
        <p className="mt-2 text-muted-foreground">
          Ingresa tus credenciales para acceder a SportHub Connect
        </p>
      </div>

      {/* Login form card */}
      <div className="w-full rounded-lg border bg-card p-6 shadow-sm">
        <LoginForm />
      </div>
    </div>
  );
}
