import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verifica tu email | SportHub Connect',
  description: 'Te hemos enviado un email de verificación. Revisa tu bandeja de entrada.',
};

interface VerifyEmailPageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { email } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center py-12">
      {/* Icon and title */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <svg
            className="h-8 w-8 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Verifica tu email</h1>
        <p className="mt-2 text-muted-foreground">
          Te enviamos un email de verificacion a <strong>{email || 'tu correo'}</strong>
        </p>
      </div>

      {/* Info card */}
      <div className="w-full rounded-lg border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <svg
            className="mt-0.5 h-5 w-5 shrink-0 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <div>
            <p className="text-sm font-medium">Revisa tu bandeja de entrada</p>
            <p className="text-sm text-muted-foreground mt-1">
              Haz clic en el enlace que te enviamos para activar tu cuenta.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <svg
            className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-sm font-medium">¿No recibiste el email?</p>
            <p className="text-sm text-muted-foreground mt-1">
              Revisa tu carpeta de spam o solicita{' '}
              <span className="font-medium text-primary underline">
                reenviar email de verificacion
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
