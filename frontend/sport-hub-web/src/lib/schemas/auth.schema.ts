import { z } from 'zod';

/**
 * Schema de validacion para el formulario de registro.
 * Aplica las mismas reglas que el backend (BR-001):
 * - Email valido
 * - Password: min 8 chars, mayuscula, minuscula, numero, caracter especial
 * - Aceptacion de terminos obligatoria
 */
export const registerSchema = z.object({
  email: z.string().email('Ingresa un email válido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número')
    .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial'),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Debes aceptar los términos y condiciones' }),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
