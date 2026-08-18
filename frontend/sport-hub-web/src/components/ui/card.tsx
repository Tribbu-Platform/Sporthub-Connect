import * as React from 'react';
import { cn } from '@/lib/utils';

// ============================================================
// Card Component — "Apex Athletic Intelligence" Design System
// Elevation levels 0-3 with glassmorphism
// Feature: F024 - US-004
// ============================================================

export type ElevationLevel = 0 | 1 | 2 | 3;

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Nivel de elevacion (0-3). Default: 2 (glassmorphism standard) */
  elevation?: ElevationLevel;
  /** Si el header debe tener gradiente oscuro (secondary dark gradient para anclar titulos) */
  gradientHeader?: boolean;
  /** Contenido de la card */
  children: React.ReactNode;
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Mapa de estilos por nivel de elevacion.
 * Level 0: Base canvas (#0c0e11, sin blur ni sombra)
 * Level 1: Sidebar/navegacion (#111317, shadow-level-1, sin blur)
 * Level 2: Cards glassmorphism (60% opacity, blur 20px, borde #1a1c1f)
 * Level 3: Modales/popovers (80% opacity, blur 30px, borde tint esmeralda 20%)
 */
const elevationStyles: Record<ElevationLevel, string> = {
  0: 'bg-[#0c0e11] shadow-none',
  1: 'bg-[#111317] shadow-level-1',
  2: 'glass-2 shadow-level-2',
  3: 'glass-3 shadow-level-3',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ elevation = 2, children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col rounded-lg border',
          elevationStyles[elevation],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

// ============================================================
// Card Sub-components
// ============================================================

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col space-y-1.5 p-6', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardHeader.displayName = 'CardHeader';

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn('text-headline-sm', className)}
        {...props}
      >
        {children}
      </h3>
    );
  }
);
CardTitle.displayName = 'CardTitle';

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  className?: string;
}

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('text-body-md text-on-surface-variant', className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);
CardDescription.displayName = 'CardDescription';

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('p-6 pt-0', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardContent.displayName = 'CardContent';

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center p-6 pt-0', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardFooter.displayName = 'CardFooter';

export { CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
