import type { LoginInput, RegisterInput } from '@/lib/schemas/auth.schema';
import { apiClient } from './apiClient';

// ============================================================
// Tipos de respuesta
// ============================================================

export interface LoginResponse {
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  emailVerified: boolean;
  message: string;
}

export interface RegisterResponse {
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  emailVerified: boolean;
  message: string;
}

export interface AuthError {
  status: number;
  message: string;
  detail?: string;
  errors?: Array<{ field: string; message: string; code: string }>;
}

// ============================================================
// Errores especificos de autenticacion
// ============================================================

export class AuthApiError extends Error {
  public readonly status: number;
  public readonly detail?: string;
  public readonly fieldErrors?: Array<{ field: string; message: string; code: string }>;

  constructor(status: number, message: string, detail?: string, fieldErrors?: Array<{ field: string; message: string; code: string }>) {
    super(message);
    this.name = 'AuthApiError';
    this.status = status;
    this.detail = detail;
    this.fieldErrors = fieldErrors;
  }
}

// ============================================================
// Mapa de errores HTTP a mensajes en español
// ============================================================

const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: 'Error de validación. Revisa los campos del formulario.',
  409: 'Este email ya está registrado. Intenta iniciar sesión o usa otro email.',
  429: 'Demasiados intentos. Espera un momento y vuelve a intentarlo.',
  500: 'Error del servidor. No se pudo completar el registro. Intenta más tarde.',
};

function getErrorMessage(status: number, detail?: string): string {
  return detail || HTTP_ERROR_MESSAGES[status] || 'Ocurrió un error inesperado.';
}

/**
 * Interpreta el cuerpo del error HTTP extrayendo informacion estructurada.
 * Soporta el formato RFC 7807 del backend y otros formatos comunes.
 */
function parseErrorResponse(status: number, body: unknown): AuthApiError {
  if (body && typeof body === 'object') {
    const errorBody = body as Record<string, unknown>;

    // Formato RFC 7807 (Problem Details)
    const detail = typeof errorBody.detail === 'string' ? errorBody.detail : undefined;
    const title = typeof errorBody.title === 'string' ? errorBody.title : undefined;

    // Errores de validacion de campo (ValidationError)
    const errors = Array.isArray(errorBody.errors)
      ? (errorBody.errors as Array<{ field: string; message: string; code: string }>)
      : undefined;

    const message = title || getErrorMessage(status, detail);
    return new AuthApiError(status, message, detail, errors);
  }

  return new AuthApiError(status, getErrorMessage(status));
}

/**
 * Registra un nuevo usuario con email y contrasena.
 *
 * @param data - Datos del formulario validados (RegisterInput)
 * @returns Promise con la respuesta del servidor (RegisterResponse)
 * @throws AuthApiError con informacion estructurada del error
 *
 * Errores HTTP manejados:
 * - 400: Error de validacion
 * - 409: Email ya registrado
 * - 429: Rate limit
 * - 500: Error interno del servidor
 */
export async function registerUser(data: RegisterInput): Promise<RegisterResponse> {
  try {
    const response = await apiClient.post<RegisterResponse>('/api/identity/register', {
      email: data.email,
      password: data.password,
      acceptTerms: data.acceptTerms,
    });

    return response;
  } catch (error) {
    if (error instanceof AuthApiError) {
      throw error;
    }

    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new AuthApiError(
        0,
        'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
      );
    }

    if (error && typeof error === 'object' && 'message' in error) {
      const errMsg = (error as { message: string }).message;

      // Intenta parsear el codigo HTTP del mensaje
      const httpMatch = errMsg.match(/HTTP (\d+)/);
      if (httpMatch) {
        const status = parseInt(httpMatch[1], 10);
        throw parseErrorResponse(status, { title: errMsg });
      }

      throw new AuthApiError(0, errMsg);
    }

    throw new AuthApiError(0, 'Ocurrió un error inesperado al registrar el usuario.');
  }
}

/**
 * Inicia sesion con email y contrasena.
 *
 * @param data - Credenciales del usuario (LoginInput)
 * @returns Promise con la respuesta del servidor (LoginResponse)
 * @throws AuthApiError con informacion estructurada del error
 *
 * Errores HTTP manejados:
 * - 400: Error de validacion
 * - 401: Credenciales incorrectas
 * - 429: Rate limit
 * - 500: Error interno del servidor
 */
export async function loginUser(data: LoginInput): Promise<LoginResponse> {
  try {
    const response = await apiClient.post<LoginResponse>('/api/identity/login', {
      email: data.email,
      password: data.password,
    });

    return response;
  } catch (error) {
    if (error instanceof AuthApiError) {
      throw error;
    }

    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new AuthApiError(
        0,
        'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
      );
    }

    if (error && typeof error === 'object' && 'message' in error) {
      const errMsg = (error as { message: string }).message;
      const httpMatch = errMsg.match(/HTTP (\d+)/);
      if (httpMatch) {
        const status = parseInt(httpMatch[1], 10);
        throw parseErrorResponse(status, { title: errMsg });
      }
      throw new AuthApiError(0, errMsg);
    }

    throw new AuthApiError(0, 'Ocurrió un error inesperado al iniciar sesión.');
  }
}
