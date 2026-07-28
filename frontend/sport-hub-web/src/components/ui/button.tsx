import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Button variant configuration via class-variance-authority
// Design tokens: US-001 — "Apex Athletic Intelligence"
// ---------------------------------------------------------------------------

const buttonVariants = cva(
  // Base: layout + shared interactive states
  // NOTE: rounded-md is NOT in the base class because the icon variant
  // needs rounded-full, and CSS cascade order can override it unpredictably.
  // Instead, rounded-md is added explicitly to each non-icon variant.
  "inline-flex items-center justify-center gap-2 transition-all duration-[--transition-base] ease focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary:
          "rounded-md bg-primary-container text-on-primary-container border-0 font-bold hover:shadow-glow-primary-strong",
        secondary:
          "rounded-md bg-transparent border border-primary-container text-primary-container font-semibold hover:bg-primary-container/10",
        ghost:
          "rounded-md bg-transparent border border-primary-container text-primary-container font-semibold hover:bg-primary-container/10",
        icon: "bg-transparent text-on-surface-variant rounded-full border-0 hover:bg-primary-container/15",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        default: "h-10 px-5 py-2 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    compoundVariants: [
      // Icon variant without explicit icon size: force squared dimensions
      {
        variant: "icon",
        size: ["sm", "default", "lg"],
        className: "h-10 w-10 p-0",
      },
      // Icon variant + icon size: already covered by size.icon + variant.icon
    ],
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export type ButtonVariant = "primary" | "secondary" | "ghost" | "icon";
export type ButtonSize = "sm" | "default" | "lg" | "icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Permite que el boton actue como wrapper (Radix asChild) */
  asChild?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, children, ...props }, ref) => {
    // If asChild is true, render children directly with merged props
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...props,
        className: cn(
          buttonVariants({ variant, size }),
          className,
          (children.props as Record<string, unknown>)?.className as string
        ),
        ref,
      } as React.HTMLAttributes<HTMLElement>);
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
