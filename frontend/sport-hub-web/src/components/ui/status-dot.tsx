/**
 * StatusDot — Status Indicator Component (US-007)
 *
 * Small circular LED-style indicator with glow effect for real-time status display.
 *
 * Variants:
 * - active  (#00ff9d) — Emerald green
 * - pending (#eab308) — Amber
 * - error   (#ffb4ab) — Red
 * - inactive (#849587) — Grey
 *
 * @see DESIGN.md "Status Indicators" section
 * @see data-model.md Section 4.5
 */

import { memo } from 'react';
import { cn } from '@/lib/utils';

export type StatusDotVariant = 'active' | 'pending' | 'error' | 'inactive';
export type StatusDotSize = 'sm' | 'default' | 'lg';

export interface StatusDotProps {
  /** Variante de color del indicador */
  variant: StatusDotVariant;
  /** Tamano del circulo LED (default: 8px) */
  size?: StatusDotSize;
  /** Texto del tooltip (usa atributo title nativo como fallback) */
  tooltip?: string;
  /** Si debe animarse con pulso */
  pulsing?: boolean;
  /** Clases CSS adicionales */
  className?: string;
}

// ---------------------------------------------------------------------------
// Style maps — outside component to avoid re-creation on every render
// ---------------------------------------------------------------------------

interface VariantStyle {
  bg: string;
  glow: string;
}

const VARIANT_STYLES: Record<StatusDotVariant, VariantStyle> = {
  active: {
    bg: '#00ff9d',
    glow: '0 0 8px rgba(0, 255, 157, 0.5)',
  },
  pending: {
    bg: '#eab308',
    glow: '0 0 8px rgba(234, 179, 8, 0.5)',
  },
  error: {
    bg: '#ffb4ab',
    glow: '0 0 8px rgba(255, 180, 171, 0.5)',
  },
  inactive: {
    bg: '#849587',
    glow: '0 0 8px rgba(132, 149, 135, 0.5)',
  },
};

const SIZE_PX: Record<StatusDotSize, string> = {
  sm: '6px',
  default: '8px',
  lg: '12px',
};

const VARIANT_LABELS: Record<StatusDotVariant, string> = {
  active: 'Active',
  pending: 'Pending',
  error: 'Error',
  inactive: 'Inactive',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const StatusDot = memo(function StatusDot({
  variant,
  size = 'default',
  tooltip,
  pulsing = false,
  className,
}: StatusDotProps) {
  const { bg, glow } = VARIANT_STYLES[variant];
  const px = SIZE_PX[size];
  const label = tooltip || VARIANT_LABELS[variant];

  return (
    <span
      role="status"
      aria-label={label}
      title={tooltip}
      className={cn(
        'inline-block',
        'rounded-full',
        pulsing && 'animate-pulse',
        className,
      )}
      style={{
        width: px,
        height: px,
        backgroundColor: bg,
        boxShadow: glow,
      }}
    />
  );
});
