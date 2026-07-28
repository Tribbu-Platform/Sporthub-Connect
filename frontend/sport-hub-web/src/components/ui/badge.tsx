import * as React from 'react';
import { cn } from '@/lib/utils';

// ================================================================
// Badge Component – US-005: Badges de Roles y Estados
// "Glass-tag" pattern: fondo semitransparente (15% opacity) +
// texto de alta saturacion + forma pill (rounded-full)
// ================================================================

export type BadgeVariant =
  // Role variants
  | 'owner'
  | 'captain'
  | 'coach'
  | 'member'
  // Status variants
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

export type BadgeSize = 'sm' | 'default' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Variante de rol o estado */
  variant: BadgeVariant;
  /** Tamano del badge */
  size?: BadgeSize;
  /** Contenido (texto o icono + texto) */
  children: React.ReactNode;
  /** Clases CSS adicionales */
  className?: string;
}

// ------------------------------------------------------------------
// Paleta de colores por variante: fondo 15% opacity + texto saturado
// ------------------------------------------------------------------
const variantStyleMap: Record<
  BadgeVariant,
  { bg: string; text: string }
> = {
  // Roles
  owner: {
    bg: 'rgba(245, 158, 11, 0.15)', // amber/gold 15% opacity
    text: '#facc15', // amber-400 saturated
  },
  captain: {
    bg: 'rgba(0, 255, 157, 0.15)', // primary-container (#00ff9d) 15% opacity
    text: '#00ff9d', // primary-container saturated
  },
  coach: {
    bg: 'rgba(103, 251, 140, 0.15)', // tertiary-container (#67fb8c) 15% opacity
    text: '#67fb8c', // tertiary-container saturated
  },
  member: {
    bg: 'rgba(198, 198, 202, 0.15)', // secondary (#c6c6ca) 15% opacity
    text: '#c6c6ca', // secondary saturated
  },
  // Status
  success: {
    bg: 'rgba(0, 255, 157, 0.15)', // emerald / primary-container 15% opacity
    text: '#00ff9d', // emerald saturated
  },
  warning: {
    bg: 'rgba(245, 158, 11, 0.15)', // amber/amarillo 15% opacity
    text: '#facc15', // amber-400 saturated
  },
  error: {
    bg: 'rgba(147, 0, 10, 0.15)', // error-container (#93000a) 15% opacity
    text: '#ffb4ab', // on-error-container saturated
  },
  info: {
    bg: 'rgba(103, 251, 140, 0.15)', // tertiary-container (#67fb8c) 15% opacity
    text: '#67fb8c', // tertiary-container saturated
  },
};

// ------------------------------------------------------------------
// Sizes: font-size + padding proporcional
// Tailwind classes for browser; inline styles as fallback for jsdom tests
// ------------------------------------------------------------------
const sizeStyleMap: Record<BadgeSize, { fontSize: string; padding: string; className: string }> = {
  sm: {
    fontSize: '12px',       // text-xs
    padding: '2px 10px',    // py-0.5 px-2.5
    className: 'text-xs',
  },
  default: {
    fontSize: '14px',       // text-sm
    padding: '4px 12px',    // py-1 px-3
    className: 'text-sm',
  },
  lg: {
    fontSize: '16px',       // text-base
    padding: '6px 16px',    // py-1.5 px-4
    className: 'text-base',
  },
};

function Badge({
  variant,
  size = 'default',
  className,
  children,
  ...spanProps
}: BadgeProps): React.ReactElement {
  const colors = variantStyleMap[variant];
  const sizeStyle = sizeStyleMap[size];

  return (
    <span
      role="status"
      className={cn(
        // Base: inline-flex, font-medium, pill shape
        'inline-flex items-center font-medium rounded-full',
        // Size-dependent classes (font-size)
        sizeStyle.className,
        className,
      )}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        // Inline styles for reliable jsdom testing
        borderRadius: '9999px',
        fontSize: sizeStyle.fontSize,
        padding: sizeStyle.padding,
      }}
      {...spanProps}
    >
      {children}
    </span>
  );
}

export { Badge };
