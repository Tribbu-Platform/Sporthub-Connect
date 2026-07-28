'use client';

/**
 * BDD Test Page: Input Fields (US-006 / F024)
 *
 * Renders the Input component in all states so Playwright + Cucumber
 * can verify: default appearance, focus glow, error border, disabled,
 * placeholder styling, transition smoothness, React Hook Form
 * compatibility, and Label-Input accessibility.
 *
 * Route: /bdd-inputs
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';

// ── Zod schema for React Hook Form validation ──────────────────────
const rhfSchema = z.object({
  email: z.string().min(1, 'Email es requerido').email('Email no valido'),
  nombre: z.string().min(2, 'Minimo 2 caracteres'),
});

type RhfFormValues = z.infer<typeof rhfSchema>;

function RhfExample() {
  const {
    register,
    formState: { errors },
    trigger,
  } = useForm<RhfFormValues>({
    resolver: zodResolver(rhfSchema),
    mode: 'onChange',
    defaultValues: { email: '', nombre: '' },
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Email field with RHF binding */}
      <div>
        <label
          htmlFor="rhf-email"
          style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#e2e2e6' }}
        >
          Email
        </label>
        <Input
          id="rhf-email"
          data-testid="input-rhf-email"
          placeholder="correo@ejemplo.com"
          error={!!errors.email}
          aria-invalid={!!errors.email}
          {...register('email')}
        />
        {errors.email && (
          <p
            data-testid="input-rhf-email-error"
            style={{ color: '#ffb4ab', fontSize: '12px', marginTop: '4px' }}
          >
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Nombre field with RHF binding */}
      <div>
        <label
          htmlFor="rhf-nombre"
          style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#e2e2e6' }}
        >
          Nombre
        </label>
        <Input
          id="rhf-nombre"
          data-testid="input-rhf-nombre"
          placeholder="Tu nombre"
          error={!!errors.nombre}
          aria-invalid={!!errors.nombre}
          {...register('nombre')}
        />
        {errors.nombre && (
          <p
            data-testid="input-rhf-nombre-error"
            style={{ color: '#ffb4ab', fontSize: '12px', marginTop: '4px' }}
          >
            {errors.nombre.message}
          </p>
        )}
      </div>

      {/* Trigger button for validation (hidden visually but accessible) */}
      <button
        type="button"
        data-testid="btn-rhf-validate"
        onClick={() => trigger()}
        style={{
          padding: '8px 16px',
          background: '#00ff9d',
          color: '#000',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 600,
        }}
      >
        Validar Formulario
      </button>
    </div>
  );
}

export default function InputFieldsBDDPage() {
  const [focusedInputId, setFocusedInputId] = useState<string | null>(null);

  return (
    <div
      style={{
        padding: '32px',
        maxWidth: '600px',
        margin: '0 auto',
        fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)',
      }}
      data-testid="bdd-inputs-page"
    >
      <h1 style={{ color: '#e2e2e6', marginBottom: '24px' }}>
        BDD — Input Fields (US-006)
      </h1>

      {/* ── Scenario 1 & 2: Default + Focus ── */}
      <section data-testid="section-default" style={{ marginBottom: '32px' }}>
        <h2 style={{ color: '#b9cbbc', fontSize: '16px', marginBottom: '8px' }}>
          Default / Focus State
        </h2>
        <label
          htmlFor="input-default"
          style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#e2e2e6' }}
        >
          Email
        </label>
        <Input
          id="input-default"
          data-testid="input-default"
          placeholder="Email"
          onFocus={() => setFocusedInputId('default')}
          onBlur={() => setFocusedInputId(null)}
        />
        {focusedInputId === 'default' && (
          <span data-testid="focus-indicator-default" style={{ display: 'none' }} aria-hidden="true">
            focused
          </span>
        )}
      </section>

      {/* ── Scenario 3: Error ── */}
      <section data-testid="section-error" style={{ marginBottom: '32px' }}>
        <h2 style={{ color: '#b9cbbc', fontSize: '16px', marginBottom: '8px' }}>
          Error State
        </h2>
        <Input
          data-testid="input-error"
          placeholder="Email invalido"
          error
          aria-invalid
          defaultValue="not-an-email"
        />
      </section>

      {/* ── Scenario 4: Disabled ── */}
      <section data-testid="section-disabled" style={{ marginBottom: '32px' }}>
        <h2 style={{ color: '#b9cbbc', fontSize: '16px', marginBottom: '8px' }}>
          Disabled State
        </h2>
        <Input
          data-testid="input-disabled"
          placeholder="No editable"
          disabled
        />
      </section>

      {/* ── Scenario 5: Placeholder (distinct section) ── */}
      <section data-testid="section-placeholder" style={{ marginBottom: '32px' }}>
        <h2 style={{ color: '#b9cbbc', fontSize: '16px', marginBottom: '8px' }}>
          Placeholder Styling
        </h2>
        <Input
          data-testid="input-placeholder"
          placeholder="Buscar..."
        />
      </section>

      {/* ── Scenario 6: Transition ── */}
      <section data-testid="section-transition" style={{ marginBottom: '32px' }}>
        <h2 style={{ color: '#b9cbbc', fontSize: '16px', marginBottom: '8px' }}>
          Transition Smoothness
        </h2>
        <Input
          id="input-transition"
          data-testid="input-transition"
          placeholder="Transicion suave"
          onFocus={() => setFocusedInputId('transition')}
          onBlur={() => setFocusedInputId(null)}
        />
        {focusedInputId === 'transition' && (
          <span data-testid="focus-indicator-transition" style={{ display: 'none' }} aria-hidden="true">
            focused
          </span>
        )}
      </section>

      {/* ── Scenario 7: React Hook Form ── */}
      <section data-testid="section-rhf" style={{ marginBottom: '32px' }}>
        <h2 style={{ color: '#b9cbbc', fontSize: '16px', marginBottom: '8px' }}>
          React Hook Form
        </h2>
        <RhfExample />
      </section>

      {/* ── Scenario 8: Accessibility ── */}
      <section data-testid="section-accessibility" style={{ marginBottom: '32px' }}>
        <h2 style={{ color: '#b9cbbc', fontSize: '16px', marginBottom: '8px' }}>
          Accessibility (Label + Input)
        </h2>
        <div>
          <label
            htmlFor="input-a11y"
            data-testid="label-a11y"
            style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#e2e2e6' }}
          >
            Email
          </label>
          <Input
            id="input-a11y"
            data-testid="input-a11y"
            placeholder="correo@ejemplo.com"
          />
        </div>
      </section>
    </div>
  );
}
