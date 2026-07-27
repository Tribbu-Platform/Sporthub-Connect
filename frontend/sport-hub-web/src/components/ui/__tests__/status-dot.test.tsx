/**
 * T003, T004: Unit tests for StatusDot component (US-007)
 *
 * TDD: RED phase — all tests should FAIL because the component doesn't exist yet.
 *
 * Testing strategy:
 * - Variants: active, pending, error, inactive — background color + LED glow (box-shadow)
 * - Sizes: sm (6px), default (8px), lg (12px)
 * - Tooltip: title attribute on hover
 * - Pulsing: animate-pulse CSS class
 * - Accessibility: role="status", aria-label
 * - className prop forwarding
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusDot } from '../status-dot';
import type { StatusDotVariant, StatusDotSize } from '../status-dot';

// ---------------------------------------------------------------------------
// Variant specs from DESIGN.md / data-model.md
// ---------------------------------------------------------------------------

interface VariantSpec {
  label: string;
  bg: string;
  glowRgbaSubstring: string; // substring to match in boxShadow
}

const variantSpecs: Record<string, VariantSpec> = {
  active: {
    label: 'Active',
    bg: '#00ff9d',
    glowRgbaSubstring: 'rgba(0, 255, 157, 0.5)',
  },
  pending: {
    label: 'Pending',
    bg: '#eab308',
    glowRgbaSubstring: 'rgba(234, 179, 8, 0.5)',
  },
  error: {
    label: 'Error',
    bg: '#ffb4ab',
    glowRgbaSubstring: 'rgba(255, 180, 171, 0.5)',
  },
  inactive: {
    label: 'Inactive',
    bg: '#849587',
    glowRgbaSubstring: 'rgba(132, 149, 135, 0.5)',
  },
};

const sizeSpecs: Record<string, string> = {
  sm: '6px',
  default: '8px',
  lg: '12px',
};

// ==========================================================================
// T003: Color variants — background, box-shadow (LED glow), border-radius
// ==========================================================================

describe('StatusDot — color variants (T003)', () => {
  describe.each(Object.entries(variantSpecs))('variant="%s"', (variant, spec) => {
    it(`should render a circle with background ${spec.bg}`, () => {
      render(<StatusDot variant={variant as StatusDotVariant} />);

      const dot = screen.getByRole('status');
      expect(dot).toHaveStyle({ backgroundColor: spec.bg });
    });

    it(`should have LED glow box-shadow with 50% opacity`, () => {
      render(<StatusDot variant={variant as StatusDotVariant} />);

      const dot = screen.getByRole('status');
      const boxShadow = dot.style.boxShadow || '';
      expect(boxShadow).toContain(spec.glowRgbaSubstring);
    });

    it('should have border-radius 9999px (fully rounded circle)', () => {
      render(<StatusDot variant={variant as StatusDotVariant} />);

      const dot = screen.getByRole('status');
      expect(dot.className).toContain('rounded-full');
    });

    it('should be displayed as inline-block', () => {
      render(<StatusDot variant={variant as StatusDotVariant} />);

      const dot = screen.getByRole('status');
      expect(dot.className).toContain('inline-block');
    });
  });
});

// ==========================================================================
// T004: Sizes (sm / default / lg)
// ==========================================================================

describe('StatusDot — sizes (T004)', () => {
  describe.each(Object.entries(sizeSpecs))('size="%s"', (size, expectedPx) => {
    it(`should have width and height of ${expectedPx}`, () => {
      render(<StatusDot variant="active" size={size as StatusDotSize} />);

      const dot = screen.getByRole('status');
      expect(dot).toHaveStyle({ width: expectedPx, height: expectedPx });
    });
  });

  it('should default to 8px when size is not specified', () => {
    render(<StatusDot variant="active" />);

    const dot = screen.getByRole('status');
    expect(dot).toHaveStyle({ width: '8px', height: '8px' });
  });
});

// ==========================================================================
// T004: Tooltip (title attribute)
// ==========================================================================

describe('StatusDot — tooltip (T004)', () => {
  it('should set the title attribute when tooltip prop is provided', () => {
    render(<StatusDot variant="active" tooltip="En linea" />);

    const dot = screen.getByRole('status');
    expect(dot).toHaveAttribute('title', 'En linea');
  });

  it('should not have a title attribute when tooltip is not provided', () => {
    render(<StatusDot variant="active" />);

    const dot = screen.getByRole('status');
    expect(dot).not.toHaveAttribute('title');
  });

  it('should use tooltip text as aria-label when provided', () => {
    render(<StatusDot variant="pending" tooltip="Verificando..." />);

    const dot = screen.getByRole('status');
    expect(dot).toHaveAttribute('aria-label', 'Verificando...');
  });
});

// ==========================================================================
// T004: Pulsing animation
// ==========================================================================

describe('StatusDot — pulsing (T004)', () => {
  it('should have animate-pulse class when pulsing is true', () => {
    render(<StatusDot variant="active" pulsing={true} />);

    const dot = screen.getByRole('status');
    expect(dot.className).toContain('animate-pulse');
  });

  it('should NOT have animate-pulse class when pulsing is false', () => {
    render(<StatusDot variant="active" pulsing={false} />);

    const dot = screen.getByRole('status');
    expect(dot.className).not.toContain('animate-pulse');
  });

  it('should NOT have animate-pulse class when pulsing is not provided', () => {
    render(<StatusDot variant="active" />);

    const dot = screen.getByRole('status');
    expect(dot.className).not.toContain('animate-pulse');
  });
});

// ==========================================================================
// T004: Accessibility (role="status", aria-label)
// ==========================================================================

describe('StatusDot — accessibility (T004)', () => {
  it('should have role="status"', () => {
    render(<StatusDot variant="active" />);

    const dot = screen.getByRole('status');
    expect(dot).toBeInTheDocument();
  });

  it('should have default aria-label based on variant when no tooltip is provided', () => {
    render(<StatusDot variant="active" />);

    const dot = screen.getByRole('status');
    expect(dot).toHaveAttribute('aria-label', 'Active');
  });

  it('should have default aria-label "Pending" for pending variant', () => {
    render(<StatusDot variant="pending" />);

    const dot = screen.getByRole('status');
    expect(dot).toHaveAttribute('aria-label', 'Pending');
  });

  it('should have default aria-label "Error" for error variant', () => {
    render(<StatusDot variant="error" />);

    const dot = screen.getByRole('status');
    expect(dot).toHaveAttribute('aria-label', 'Error');
  });

  it('should have default aria-label "Inactive" for inactive variant', () => {
    render(<StatusDot variant="inactive" />);

    const dot = screen.getByRole('status');
    expect(dot).toHaveAttribute('aria-label', 'Inactive');
  });
});

// ==========================================================================
// T004: className prop forwarding
// ==========================================================================

describe('StatusDot — className (T004)', () => {
  it('should merge additional className with base classes', () => {
    render(<StatusDot variant="active" className="my-custom-class" />);

    const dot = screen.getByRole('status');
    expect(dot.className).toContain('my-custom-class');
    // Base classes should still be present
    expect(dot.className).toContain('rounded-full');
    expect(dot.className).toContain('inline-block');
  });

  it('should render correctly with all props combined', () => {
    render(
      <StatusDot
        variant="error"
        size="lg"
        tooltip="Error critico"
        pulsing={true}
        className="ml-2"
      />
    );

    const dot = screen.getByRole('status');
    expect(dot).toHaveStyle({ width: '12px', height: '12px' });
    expect(dot).toHaveStyle({ backgroundColor: '#ffb4ab' });
    expect(dot).toHaveAttribute('title', 'Error critico');
    expect(dot).toHaveAttribute('aria-label', 'Error critico');
    expect(dot.className).toContain('animate-pulse');
    expect(dot.className).toContain('ml-2');
  });
});
