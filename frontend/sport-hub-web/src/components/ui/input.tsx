import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  errorMessage?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, errorMessage, ...props }, ref) => {
    return (
      <input
        ref={ref}
        data-slot="input"
        aria-invalid={error ? true : undefined}
        className={cn(
          // Base layout
          'flex h-10 w-full px-3 py-2 text-body-md',
          // Default state (dark theme using design token classes)
          'bg-surface-container-lowest',
          'text-on-surface',
          'border border-solid border-outline-variant',
          'rounded-md',
          // Placeholder: on-surface-variant at 60%, no italic
          'placeholder:text-on-surface-variant/60',
          'placeholder:not-italic',
          // Focus state: border → primary-container, glow esmeralda
          'focus:border-primary-container',
          'focus:shadow-glow-primary',
          'focus:outline-none',
          'focus:ring-0',
          // Smooth transition (200ms ease)
          'transition-[border-color,box-shadow] duration-200 ease-out',
          // Error state
          error && 'border-error shadow-[0_0_10px_rgba(255,180,171,0.2)]',
          error && 'focus:border-error focus:shadow-[0_0_10px_rgba(255,180,171,0.25)]',
          // Disabled state
          'disabled:opacity-40',
          'disabled:cursor-not-allowed',
          'disabled:pointer-events-none',
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';

export { Input };
