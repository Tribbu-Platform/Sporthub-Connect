import { cn } from '@/lib/utils';

// ==========================================================================
// MainContent Props
// ==========================================================================

export interface MainContentProps {
  /** Contenido principal de la pagina */
  children: React.ReactNode;
  /** Clases CSS adicionales */
  className?: string;
}

// ==========================================================================
// MainContent Component
// ==========================================================================

export function MainContent({ children, className }: MainContentProps) {
  return (
    <main
      role="main"
      className={cn(
        // Base: transition for smooth layout changes
        'flex flex-col transition-all duration-300 ease-in-out',
        // Desktop: offset by sidebar width (260px) + padding 32px
        'lg:ml-[260px] lg:p-[32px]',
        // Mobile: full width + padding 16px
        'ml-0 p-[16px]',
        // Gutter between children
        'gap-[24px]',
        // Allow custom classes
        className,
      )}
    >
      {children}
    </main>
  );
}
