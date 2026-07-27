import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from '../badge';

// ================================================================
// TDD: Componente Badge – US-005
// Variantes: owner, captain, coach, member, success, warning, error, info
// Tamanos: sm, default, lg
// Forma: pill (rounded-full / 9999px)
// Accesibilidad: color no es el unico medio de informacion
// ================================================================

describe('Badge – Role variants (T004)', () => {
  // ------------------------------------------------------------
  // Scenario: Should_RenderOwnerBadge_When_VariantIsOwner
  // ------------------------------------------------------------
  it('should render owner badge with gold/amber colors and pill shape', () => {
    render(<Badge variant="owner">Owner</Badge>);

    const badge = screen.getByText('Owner');

    // Texto visible
    expect(badge).toBeInTheDocument();
    expect(badge.textContent).toBe('Owner');

    // Forma pill: border-radius 9999px
    const style = window.getComputedStyle(badge);
    expect(style.borderRadius).toBe('9999px');

    // Padding horizontal >= 12px
    const paddingLeft = parseFloat(style.paddingLeft);
    const paddingRight = parseFloat(style.paddingRight);
    expect(paddingLeft).toBeGreaterThanOrEqual(12);
    expect(paddingRight).toBeGreaterThanOrEqual(12);

    // Fondo semitransparente (alpha < 1, i.e., no solido)
    const bgColor = style.backgroundColor;
    const hasAlpha = bgColor.includes('rgba') || bgColor.includes('hsla');
    expect(hasAlpha).toBe(true);

    // Texto saturado (color visible, no transparente)
    const textColor = style.color;
    expect(textColor).toBeTruthy();
    // El color de texto no debe ser igual al fondo
    expect(textColor).not.toBe(bgColor);
  });

  // ------------------------------------------------------------
  // Scenario: Should_RenderCaptainBadge_When_VariantIsCaptain
  // ------------------------------------------------------------
  it('should render captain badge with emerald colors and pill shape', () => {
    render(<Badge variant="captain">Captain</Badge>);

    const badge = screen.getByText('Captain');
    expect(badge).toBeInTheDocument();

    const style = window.getComputedStyle(badge);

    // Forma pill
    expect(style.borderRadius).toBe('9999px');

    // Fondo esmeralda semitransparente (~15% opacity)
    const bgColor = style.backgroundColor;
    expect(bgColor).toBeTruthy();

    // Texto esmeralda saturado
    const textColor = style.color;
    expect(textColor).toBeTruthy();
    expect(textColor).not.toBe(bgColor);

    // Padding horizontal >= 12px
    expect(parseFloat(style.paddingLeft)).toBeGreaterThanOrEqual(12);
    expect(parseFloat(style.paddingRight)).toBeGreaterThanOrEqual(12);
  });

  // ------------------------------------------------------------
  // Scenario: Should_RenderCoachBadge_When_VariantIsCoach
  // ------------------------------------------------------------
  it('should render coach badge with tertiary (blue/green) colors and pill shape', () => {
    render(<Badge variant="coach">Coach</Badge>);

    const badge = screen.getByText('Coach');
    expect(badge).toBeInTheDocument();

    const style = window.getComputedStyle(badge);

    // Forma pill
    expect(style.borderRadius).toBe('9999px');

    // Fondo tertiary semitransparente
    const bgColor = style.backgroundColor;
    expect(bgColor).toBeTruthy();

    // Texto tertiary saturado
    const textColor = style.color;
    expect(textColor).toBeTruthy();
    expect(textColor).not.toBe(bgColor);

    // Padding horizontal >= 12px
    expect(parseFloat(style.paddingLeft)).toBeGreaterThanOrEqual(12);
    expect(parseFloat(style.paddingRight)).toBeGreaterThanOrEqual(12);
  });

  // ------------------------------------------------------------
  // Scenario: Should_RenderMemberBadge_When_VariantIsMember
  // ------------------------------------------------------------
  it('should render member badge with secondary (gray) colors and pill shape', () => {
    render(<Badge variant="member">Member</Badge>);

    const badge = screen.getByText('Member');
    expect(badge).toBeInTheDocument();

    const style = window.getComputedStyle(badge);

    // Forma pill
    expect(style.borderRadius).toBe('9999px');

    // Fondo secondary semitransparente
    const bgColor = style.backgroundColor;
    expect(bgColor).toBeTruthy();

    // Texto secondary saturado
    const textColor = style.color;
    expect(textColor).toBeTruthy();
    expect(textColor).not.toBe(bgColor);

    // Padding horizontal >= 12px
    expect(parseFloat(style.paddingLeft)).toBeGreaterThanOrEqual(12);
    expect(parseFloat(style.paddingRight)).toBeGreaterThanOrEqual(12);
  });
});

describe('Badge – Status variants (T005)', () => {
  // ------------------------------------------------------------
  // Scenario: Should_RenderSuccessBadge_When_VariantIsSuccess
  // ------------------------------------------------------------
  it('should render success badge with emerald colors and pill shape', () => {
    render(<Badge variant="success">Activo</Badge>);

    const badge = screen.getByText('Activo');
    expect(badge).toBeInTheDocument();

    const style = window.getComputedStyle(badge);

    // Forma pill
    expect(style.borderRadius).toBe('9999px');

    // Fondo esmeralda semitransparente
    const bgColor = style.backgroundColor;
    expect(bgColor).toBeTruthy();

    // Texto esmeralda saturado
    const textColor = style.color;
    expect(textColor).toBeTruthy();
    expect(textColor).not.toBe(bgColor);
  });

  // ------------------------------------------------------------
  // Scenario: Should_RenderWarningBadge_When_VariantIsWarning
  // ------------------------------------------------------------
  it('should render warning badge with amber colors and pill shape', () => {
    render(<Badge variant="warning">Pendiente</Badge>);

    const badge = screen.getByText('Pendiente');
    expect(badge).toBeInTheDocument();

    const style = window.getComputedStyle(badge);

    // Forma pill
    expect(style.borderRadius).toBe('9999px');

    // Fondo ambar semitransparente
    const bgColor = style.backgroundColor;
    expect(bgColor).toBeTruthy();

    // Texto ambar saturado
    const textColor = style.color;
    expect(textColor).toBeTruthy();
    expect(textColor).not.toBe(bgColor);

    // Padding horizontal >= 12px
    expect(parseFloat(style.paddingLeft)).toBeGreaterThanOrEqual(12);
    expect(parseFloat(style.paddingRight)).toBeGreaterThanOrEqual(12);
  });

  // ------------------------------------------------------------
  // Scenario: Should_RenderErrorBadge_When_VariantIsError
  // ------------------------------------------------------------
  it('should render error badge with red colors and pill shape', () => {
    render(<Badge variant="error">Error</Badge>);

    const badge = screen.getByText('Error');
    expect(badge).toBeInTheDocument();

    const style = window.getComputedStyle(badge);

    // Forma pill
    expect(style.borderRadius).toBe('9999px');

    // Fondo rojo semitransparente
    const bgColor = style.backgroundColor;
    expect(bgColor).toBeTruthy();

    // Texto rojo saturado
    const textColor = style.color;
    expect(textColor).toBeTruthy();
    expect(textColor).not.toBe(bgColor);

    // Padding horizontal >= 12px
    expect(parseFloat(style.paddingLeft)).toBeGreaterThanOrEqual(12);
    expect(parseFloat(style.paddingRight)).toBeGreaterThanOrEqual(12);
  });

  // ------------------------------------------------------------
  // Scenario: Should_RenderInfoBadge_When_VariantIsInfo
  // ------------------------------------------------------------
  it('should render info badge with tertiary colors and pill shape', () => {
    render(<Badge variant="info">Informacion</Badge>);

    const badge = screen.getByText('Informacion');
    expect(badge).toBeInTheDocument();

    const style = window.getComputedStyle(badge);

    // Forma pill
    expect(style.borderRadius).toBe('9999px');

    // Fondo tertiary semitransparente
    const bgColor = style.backgroundColor;
    expect(bgColor).toBeTruthy();

    // Texto tertiary saturado
    const textColor = style.color;
    expect(textColor).toBeTruthy();
    expect(textColor).not.toBe(bgColor);
  });
});

describe('Badge – Sizes (T005)', () => {
  // ------------------------------------------------------------
  // Scenario: Should_SupportDifferentSizes_When_SizePropIsProvided
  // ------------------------------------------------------------
  it('should render sm size with smaller font and padding than default', () => {
    render(
      <>
        <Badge variant="success" size="sm" data-testid="badge-sm">
          Pequeno
        </Badge>
        <Badge variant="success" size="default" data-testid="badge-default">
          Default
        </Badge>
      </>,
    );

    const smBadge = screen.getByTestId('badge-sm');
    const defaultBadge = screen.getByTestId('badge-default');

    const smFontSize = parseFloat(window.getComputedStyle(smBadge).fontSize);
    const defaultFontSize = parseFloat(window.getComputedStyle(defaultBadge).fontSize);

    // sm debe tener font-size menor que default
    expect(smFontSize).toBeLessThan(defaultFontSize);

    const smPaddingLeft = parseFloat(window.getComputedStyle(smBadge).paddingLeft);
    const defaultPaddingLeft = parseFloat(window.getComputedStyle(defaultBadge).paddingLeft);

    // sm debe tener padding menor que default
    expect(smPaddingLeft).toBeLessThan(defaultPaddingLeft);

    // sm debe seguir teniendo padding horizontal >= 8px para legibilidad
    expect(smPaddingLeft).toBeGreaterThanOrEqual(8);
  });

  it('should render lg size with larger font and padding than default', () => {
    render(
      <>
        <Badge variant="success" size="default" data-testid="badge-default">
          Default
        </Badge>
        <Badge variant="success" size="lg" data-testid="badge-lg">
          Grande
        </Badge>
      </>,
    );

    const defaultBadge = screen.getByTestId('badge-default');
    const lgBadge = screen.getByTestId('badge-lg');

    const lgFontSize = parseFloat(window.getComputedStyle(lgBadge).fontSize);
    const defaultFontSize = parseFloat(window.getComputedStyle(defaultBadge).fontSize);

    // lg debe tener font-size mayor que default
    expect(lgFontSize).toBeGreaterThan(defaultFontSize);

    const lgPaddingLeft = parseFloat(window.getComputedStyle(lgBadge).paddingLeft);
    const defaultPaddingLeft = parseFloat(window.getComputedStyle(defaultBadge).paddingLeft);

    // lg debe tener padding mayor que default
    expect(lgPaddingLeft).toBeGreaterThan(defaultPaddingLeft);

    // lg debe tener padding horizontal >= 12px
    expect(lgPaddingLeft).toBeGreaterThanOrEqual(12);
  });

  it('should render default size with appropriate dimensions', () => {
    render(<Badge variant="success">Default</Badge>);

    const badge = screen.getByText('Default');
    const style = window.getComputedStyle(badge);

    // Padding horizontal >= 12px
    expect(parseFloat(style.paddingLeft)).toBeGreaterThanOrEqual(12);
    expect(parseFloat(style.paddingRight)).toBeGreaterThanOrEqual(12);
  });
});

describe('Badge – Accessibility (T005)', () => {
  // ------------------------------------------------------------
  // Scenario: Should_BeAccessible_When_RenderedWithScreenReader
  // ------------------------------------------------------------
  it('should have appropriate ARIA role for status badges', () => {
    render(<Badge variant="success">Activo</Badge>);

    const badge = screen.getByText('Activo');

    // Debe tener un rol semantico (status)
    expect(badge).toHaveAttribute('role', 'status');

    // El texto debe ser directamente legible (no solo color)
    expect(badge.textContent).toBeTruthy();
    expect(badge.textContent).not.toBe('');
  });

  it('should have appropriate ARIA role for role badges', () => {
    render(<Badge variant="owner">Owner</Badge>);

    const badge = screen.getByText('Owner');

    // Debe tener un rol semantico
    expect(badge).toHaveAttribute('role', 'status');
  });

  it('should accept custom className without breaking base styles', () => {
    render(
      <Badge variant="success" className="custom-class" data-testid="custom-badge">
        Custom
      </Badge>,
    );

    const badge = screen.getByTestId('custom-badge');

    // Debe preservar la forma pill
    expect(window.getComputedStyle(badge).borderRadius).toBe('9999px');

    // Debe tener la clase custom
    expect(badge.className).toContain('custom-class');
  });

  it('should support rendering with icons inside', () => {
    render(
      <Badge variant="success">
        <span data-testid="icon-element">🏆</span>
        Campeon
      </Badge>,
    );

    const icon = screen.getByTestId('icon-element');
    expect(icon).toBeInTheDocument();

    const badge = screen.getByText(/Campeon/);
    expect(badge).toBeInTheDocument();
  });
});
