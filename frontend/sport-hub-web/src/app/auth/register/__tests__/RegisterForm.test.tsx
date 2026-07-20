import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RegisterForm from '../RegisterForm';

// Mocks
const mockPush = vi.fn();
const mockRegisterUser = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('@/services/auth.service', () => ({
  registerUser: (...args: unknown[]) => mockRegisterUser(...args),
  AuthApiError: class AuthApiError extends Error {
    status: number;
    detail?: string;
    fieldErrors?: Array<{ field: string; message: string; code: string }>;

    constructor(
      status: number,
      message: string,
      detail?: string,
      fieldErrors?: Array<{ field: string; message: string; code: string }>,
    ) {
      super(message);
      this.name = 'AuthApiError';
      this.status = status;
      this.detail = detail;
      this.fieldErrors = fieldErrors;
    }
  },
}));

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test 1: Renderiza formulario con todos los campos
  it('renderiza el formulario con todos los campos requeridos', () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /términos y condiciones/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument();
  });

  // Test 2: Campos vacios muestra errores de validacion
  it('muestra errores de validacion cuando se envía con campos vacíos', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/ingresa un email válido/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/la contraseña debe tener al menos 8 caracteres/i)).toBeInTheDocument();
    expect(screen.getByText(/debes aceptar los términos/i)).toBeInTheDocument();
  });

  // Test 3: Email invalido muestra error
  it('muestra error cuando el email no es válido', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText('Correo electrónico'), 'email-invalido');
    await user.type(screen.getByLabelText('Contraseña'), 'ValidPass1!');

    const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/ingresa un email válido/i)).toBeInTheDocument();
    });
  });

  // Test 4: Password sin mayuscula muestra error
  it('muestra error cuando la contraseña no tiene mayúscula', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText('Correo electrónico'), 'test@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'sinmayuscula1!');

    const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/debe contener al menos una mayúscula/i)).toBeInTheDocument();
    });
  });

  // Test 5: Submit exitoso redirige a /auth/verify-email
  it('redirige a verify-email cuando el registro es exitoso', async () => {
    const user = userEvent.setup();
    mockRegisterUser.mockResolvedValueOnce({
      userId: 'test-id',
      email: 'test@example.com',
      message: 'Cuenta creada',
    });

    render(<RegisterForm />);

    await user.type(screen.getByLabelText('Correo electrónico'), 'test@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'ValidPass1!');
    await user.click(screen.getByRole('checkbox', { name: /términos y condiciones/i }));

    const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'ValidPass1!',
        acceptTerms: true,
      });
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        '/auth/verify-email?email=test%40example.com',
      );
    });
  });

  // Test 6: Error 409 muestra "email ya registrado"
  it('muestra mensaje de email ya registrado cuando el servidor responde 409', async () => {
    const user = userEvent.setup();

    const { AuthApiError } = await import('@/services/auth.service');
    mockRegisterUser.mockRejectedValueOnce(
      new AuthApiError(409, 'Este email ya está registrado. Intenta iniciar sesión o usa otro email.'),
    );

    render(<RegisterForm />);

    await user.type(screen.getByLabelText('Correo electrónico'), 'existente@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'ValidPass1!');
    await user.click(screen.getByRole('checkbox', { name: /términos y condiciones/i }));

    const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/este email ya está registrado/i)).toBeInTheDocument();
    });
  });

  // Test 7: Boton deshabilitado mientras loading
  it('deshabilita el botón mientras se envía el formulario', async () => {
    const user = userEvent.setup();

    // Never resolves to keep loading state
    mockRegisterUser.mockImplementationOnce(() => new Promise(() => {}));

    render(<RegisterForm />);

    await user.type(screen.getByLabelText('Correo electrónico'), 'test@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'ValidPass1!');
    await user.click(screen.getByRole('checkbox', { name: /términos y condiciones/i }));

    const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });

    // Verifica que muestra "Creando cuenta..." cuando está en loading
    expect(screen.getByText(/creando cuenta/i)).toBeInTheDocument();
  });

  // Test 8: Toggle visibilidad de contrasena
  it('alterna la visibilidad de la contraseña', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const passwordInput = screen.getByLabelText('Contraseña');
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button', { name: /mostrar contraseña/i });
    await user.click(toggleButton);

    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'text');

    const hideButton = screen.getByRole('button', { name: /ocultar contraseña/i });
    await user.click(hideButton);

    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'password');
  });
});
