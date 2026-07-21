'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/lib/schemas/auth.schema';
import { loginUser, AuthApiError } from '@/services/auth.service';

// ============================================================
// Componentes UI inline (shadcn/ui style)
// ============================================================

function Input({
  id,
  type,
  placeholder,
  error,
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
}) {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        error
          ? 'border-destructive focus-visible:ring-destructive'
          : 'border-input'
      } ${className}`}
      aria-invalid={error ? 'true' : 'false'}
      {...props}
    />
  );
}

function Button({
  children,
  loading,
  disabled,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
}) {
  return (
    <button
      className={`inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Iniciando sesión...
        </span>
      ) : (
        children
      )}
    </button>
  );
}

function Label({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      {children}
    </label>
  );
}

// ============================================================
// LoginForm
// ============================================================

export default function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);

    try {
      const response = await loginUser(data);
      // Guardar tokens en localStorage para sesion automatica
      if (response.accessToken) {
        localStorage.setItem('access_token', response.accessToken);
      }
      if (response.refreshToken) {
        localStorage.setItem('refresh_token', response.refreshToken);
      }
      // Redirigir al inicio o a la pagina que intentaba acceder
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get('redirect') || '/';
      router.push(redirectTo);
    } catch (error) {
      if (error instanceof AuthApiError) {
        if (error.fieldErrors && error.fieldErrors.length > 0) {
          setServerError(error.fieldErrors[0].message);
        } else {
          setServerError(error.message);
        }
      } else {
        setServerError('Ocurrió un error inesperado. Intenta nuevamente.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Server/API Error */}
      {serverError && (
        <div
          role="alert"
          className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 shrink-0"
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
            <span>{serverError}</span>
          </div>
        </div>
      )}

      {/* Email field */}
      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          placeholder="tu@email.com"
          autoComplete="email"
          error={!!errors.email}
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-destructive" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password field */}
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="current-password"
            error={!!errors.password}
            {...register('password')}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            tabIndex={-1}
          >
            {showPassword ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878l6.243 6.242M21 12a9.96 9.96 0 01-2.242 5M21 12A9.97 9.97 0 0117.338 5.5M21 12H3" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-destructive" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Forgot password link */}
      <div className="flex justify-end">
        <a
          href="/auth/forgot-password"
          className="text-sm text-primary underline hover:text-primary/80"
        >
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      {/* Submit button */}
      <Button type="submit" loading={isSubmitting} disabled={isSubmitting} className="w-full">
        Iniciar sesión
      </Button>

      {/* Link to register */}
      <p className="text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{' '}
        <a href="/auth/register" className="font-medium text-primary underline hover:text-primary/80">
          Regístrate aquí
        </a>
      </p>
    </form>
  );
}
