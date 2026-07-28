import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, type InputProps } from '../input';

// ============================================================
// US-006: Componentes Base - Input Fields
// Tests follow class-based pattern (same as button.test.tsx)
// ============================================================

// -----------------------------------------------------------
// Helpers
// -----------------------------------------------------------
function renderInput(props: Partial<InputProps> = {}) {
  return render(<Input placeholder="Email" {...props} />);
}

// ============================================================
// T004: Tests para estados default y focus
// ============================================================

describe('Input — Default state', () => {
  it('Should_RenderDefaultInput (Scenario 1)', () => {
    renderInput({ placeholder: 'Email' });

    const input = screen.getByPlaceholderText('Email') as HTMLInputElement;
    const classes = input.className;

    // Background color: surface-container-lowest (#0c0e11)
    expect(classes).toMatch(/bg-surface-container-lowest/);

    // Border: outline-variant (#3b4a3f)
    expect(classes).toMatch(/border-outline-variant/);

    // Border style: solid
    expect(classes).toMatch(/border-solid/);

    // Text color: on-surface (#e2e2e6)
    expect(classes).toMatch(/text-on-surface/);

    // Border radius: rounded-md (0.75rem)
    expect(classes).toMatch(/rounded-md/);

    // Placeholder value
    expect(input.placeholder).toBe('Email');
  });

  it('Should_RenderAsTextInputByDefault', () => {
    renderInput();
    const input = screen.getByPlaceholderText('Email') as HTMLInputElement;
    // Input elements default to type="text" (input.type property, not attribute)
    expect(input.type).toBe('text');
  });

  it('Should_SupportCustomType', () => {
    render(<Input type="password" placeholder="Password" />);
    const input = screen.getByPlaceholderText('Password');
    expect(input.getAttribute('type')).toBe('password');
  });
});

describe('Input — Focus state', () => {
  it('Should_HaveFocusClasses (Scenario 2)', () => {
    // Verifies focus-related Tailwind classes exist
    renderInput();
    const input = screen.getByPlaceholderText('Email');
    const classes = input.className;

    // Focus: border changes to primary-container (#00ff9d)
    expect(classes).toMatch(/focus:border-primary-container/);

    // Focus: glow (shadow-glow-primary)
    expect(classes).toMatch(/focus:shadow-glow-primary/);

    // Focus: outline suppressed
    expect(classes).toMatch(/focus:outline-none/);
    expect(classes).toMatch(/focus:ring-0/);
  });

  it('Should_ReceiveFocusOnClick', async () => {
    const user = userEvent.setup();
    renderInput();

    const input = screen.getByPlaceholderText('Email');
    await user.click(input);

    expect(document.activeElement).toBe(input);
  });

  it('Should_ReceiveFocusOnTab', async () => {
    const user = userEvent.setup();
    renderInput();

    const input = screen.getByPlaceholderText('Email');
    await user.tab();

    expect(document.activeElement).toBe(input);
  });

  it('Should_HaveTransitionClasses (Scenario 6)', () => {
    renderInput();
    const input = screen.getByPlaceholderText('Email');
    const classes = input.className;

    // Transition: 200ms on border-color and box-shadow
    expect(classes).toMatch(/transition-\[border-color,box-shadow\]/);
    expect(classes).toMatch(/duration-200/);
  });

  it('Should_LoseFocusOnBlur', async () => {
    const user = userEvent.setup();
    renderInput();

    const input = screen.getByPlaceholderText('Email');

    await user.click(input);
    expect(document.activeElement).toBe(input);

    await user.tab();
    expect(document.activeElement).not.toBe(input);
  });
});

// ============================================================
// T005: Tests para estados error, disabled y placeholder
// ============================================================

describe('Input — Error state', () => {
  it('Should_ShowErrorState (Scenario 3)', () => {
    renderInput({ error: true });

    const input = screen.getByPlaceholderText('Email');
    const classes = input.className;

    // Border changes to error color (#ffb4ab)
    expect(classes).toMatch(/border-error/);

    // aria-invalid attribute
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('Should_HaveErrorGlowClass', () => {
    renderInput({ error: true });

    const input = screen.getByPlaceholderText('Email');
    const classes = input.className;

    // Should have a red shadow (not esmeralda)
    expect(classes).toMatch(/shadow-\[0_0_10px_rgba\(255,180,171/);
  });

  it('Should_NotHaveErrorClasses_When_ErrorIsFalse', () => {
    renderInput({ error: false });

    const input = screen.getByPlaceholderText('Email');
    const classes = input.className;

    expect(classes).not.toMatch(/border-error/);
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });

  it('Should_HaveFocusErrorBorderClass', () => {
    renderInput({ error: true });

    const input = screen.getByPlaceholderText('Email');
    const classes = input.className;

    // Focus should keep error border
    expect(classes).toMatch(/focus:border-error/);
  });
});

describe('Input — Disabled state', () => {
  it('Should_ShowDisabledState (Scenario 4)', () => {
    renderInput({ disabled: true, placeholder: 'No editable' });

    const input = screen.getByPlaceholderText('No editable');
    const classes = input.className;

    // Opacity 40%
    expect(classes).toMatch(/disabled:opacity-40/);

    // Cursor not-allowed
    expect(classes).toMatch(/disabled:cursor-not-allowed/);

    // Disabled attribute
    expect(input).toBeDisabled();
  });

  it('Should_HavePointerEventsNone_WhenDisabled', () => {
    renderInput({ disabled: true });

    const input = screen.getByPlaceholderText('Email');
    const classes = input.className;

    expect(classes).toMatch(/disabled:pointer-events-none/);
  });

  it('Should_NotBeFocusable_WhenDisabled', async () => {
    const user = userEvent.setup();
    renderInput({ disabled: true });

    const input = screen.getByPlaceholderText('Email');

    await user.click(input);
    expect(document.activeElement).not.toBe(input);
  });
});

describe('Input — Placeholder', () => {
  it('Should_StylePlaceholder (Scenario 5)', () => {
    renderInput({ placeholder: 'Buscar...' });

    const input = screen.getByPlaceholderText('Buscar...');
    const classes = input.className;

    // Placeholder color: on-surface-variant at 60% opacity
    expect(classes).toMatch(/placeholder:text-on-surface-variant\/60/);

    // Placeholder not italic
    expect(classes).toMatch(/placeholder:not-italic/);
  });

  it('Should_RenderPlaceholderText', () => {
    renderInput({ placeholder: 'Buscar...' });
    const input = screen.getByPlaceholderText('Buscar...');
    expect(input).toBeInTheDocument();
  });
});

// ============================================================
// T005 extended: React Hook Form compatibility
// ============================================================

const emailSchema = z.object({
  email: z.string().email('Email invalido'),
});

type EmailForm = z.infer<typeof emailSchema>;

function TestForm({ onSubmit }: { onSubmit: (data: EmailForm) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} data-testid="test-form">
      <label htmlFor="email">Email</label>
      <Input
        id="email"
        placeholder="correo@ejemplo.com"
        error={!!errors.email}
        {...register('email')}
      />
      {errors.email && (
        <span role="alert" data-testid="error-message">
          {errors.email.message}
        </span>
      )}
      <button type="submit">Submit</button>
    </form>
  );
}

describe('Input — React Hook Form compatibility', () => {
  it('Should_BeCompatibleWithReactHookForm (Scenario 7)', async () => {
    render(<TestForm onSubmit={() => {}} />);

    const input = screen.getByPlaceholderText('correo@ejemplo.com');
    expect(input).toBeInTheDocument();
    expect(input.getAttribute('name')).toBe('email');
  });

  it('Should_ForwardRefToRHF', () => {
    render(<TestForm onSubmit={() => {}} />);

    const input = screen.getByPlaceholderText('correo@ejemplo.com');
    // RHF register sets the name attribute
    expect(input.getAttribute('name')).toBe('email');
  });

  it('Should_ShowErrorState_OnInvalidInput', async () => {
    const user = userEvent.setup();
    render(<TestForm onSubmit={() => {}} />);

    const input = screen.getByPlaceholderText('correo@ejemplo.com');
    const submitBtn = screen.getByRole('button', { name: /submit/i });

    // Submit with invalid email
    await user.type(input, 'invalid-email');
    await user.click(submitBtn);

    // Error message should appear
    const errorMsg = screen.getByTestId('error-message');
    expect(errorMsg).toHaveTextContent('Email invalido');

    // Input should have error class
    const classes = input.className;
    expect(classes).toMatch(/border-error/);
  });

  it('Should_NotShowError_OnValidInput', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<TestForm onSubmit={handleSubmit} />);

    const input = screen.getByPlaceholderText('correo@ejemplo.com');
    const submitBtn = screen.getByRole('button', { name: /submit/i });

    // Submit with valid email
    await user.type(input, 'test@example.com');
    await user.click(submitBtn);

    // Form should be submitted
    expect(handleSubmit).toHaveBeenCalledWith(
      { email: 'test@example.com' },
      expect.anything(),
    );
  });

  it('Should_PropagateOnChange', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Input placeholder="Email" onChange={handleChange} />);

    const input = screen.getByPlaceholderText('Email');
    await user.type(input, 'a');

    expect(handleChange).toHaveBeenCalled();
  });

  it('Should_PropagateOnBlur', async () => {
    const handleBlur = vi.fn();
    const user = userEvent.setup();

    render(<Input placeholder="Email" onBlur={handleBlur} />);

    const input = screen.getByPlaceholderText('Email');
    await user.click(input);
    await user.tab();

    expect(handleBlur).toHaveBeenCalled();
  });
});

// ============================================================
// T006: Tests de accesibilidad
// ============================================================

describe('Input — Accessibility', () => {
  it('Should_BeAccessible_When_UsedWithLabel (Scenario 8)', () => {
    render(
      <div>
        <label htmlFor="email-input">Email</label>
        <Input id="email-input" placeholder="correo@ejemplo.com" />
      </div>,
    );

    const label = screen.getByText('Email');
    expect(label.tagName).toBe('LABEL');
    expect(label.getAttribute('for')).toBe('email-input');

    const input = screen.getByPlaceholderText('correo@ejemplo.com');
    expect(input.getAttribute('id')).toBe('email-input');
  });

  it('Should_HaveDataSlotAttribute', () => {
    renderInput();
    const input = screen.getByPlaceholderText('Email');
    expect(input.getAttribute('data-slot')).toBe('input');
  });

  it('Should_BeFocusableViaKeyboard', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <label htmlFor="email-input">Email</label>
        <Input id="email-input" placeholder="correo@ejemplo.com" />
      </div>,
    );

    // Tab to the input
    await user.tab();

    const input = screen.getByPlaceholderText('correo@ejemplo.com');
    expect(document.activeElement).toBe(input);
  });

  it('Should_HaveAriaInvalid_WhenError', () => {
    renderInput({ error: true });

    const input = screen.getByPlaceholderText('Email');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('Should_NotHaveAriaInvalid_WhenNoError', () => {
    renderInput();

    const input = screen.getByPlaceholderText('Email');
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });

  it('Should_SupportCustomClassName', () => {
    render(<Input placeholder="Custom" className="my-custom-class" />);

    const input = screen.getByPlaceholderText('Custom');
    expect(input.className).toContain('my-custom-class');
  });

  it('Should_ExposeDisplayName', () => {
    expect(Input.displayName).toBe('Input');
  });
});
