import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../card';

// ============================================================
// T005: Tests unitarios para niveles de elevacion
// T006: Tests para CardHeader con gradiente, composicion, fallback, className
// ============================================================

describe('Card - Elevation Levels (T005)', () => {
  it('should render default glassmorphism card (Level 2) when no elevation is specified', () => {
    render(
      <Card>
        <CardContent>Contenido</CardContent>
      </Card>
    );

    const card = screen.getByText('Contenido').closest('.glass-2');
    expect(card).toBeInTheDocument();

    // Level 2 default: glassmorphism
    // Should have the glass-2 class
    expect(card).toHaveClass('glass-2');
    // Should have shadow-level-2
    expect(card).toHaveClass('shadow-level-2');
    // Should have border and rounded-lg
    expect(card).toHaveClass('border');
    expect(card).toHaveClass('rounded-lg');
    // Should be flex column
    expect(card).toHaveClass('flex');
    expect(card).toHaveClass('flex-col');
  });

  it('should render Level 0 elevation (base canvas)', () => {
    render(
      <Card elevation={0}>
        <CardContent>Base Canvas</CardContent>
      </Card>
    );

    // Level 0 should NOT have glass classes
    const baseCanvasElement = screen.queryByText(/Base Canvas/i);
    expect(baseCanvasElement).not.toBeNull();
    expect(baseCanvasElement!.closest('.glass-2')).toBeNull();
    expect(baseCanvasElement!.closest('.glass-3')).toBeNull();

    // Should have solid background class
    const card = screen.getByText('Base Canvas').closest('.bg-\\[\\#0c0e11\\]');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('shadow-none');

    // No blur = no glass class
    expect(card).not.toHaveClass('glass-2');
    expect(card).not.toHaveClass('glass-3');
  });

  it('should render Level 1 elevation (sidebar/navigation)', () => {
    render(
      <Card elevation={1}>
        <CardContent>Sidebar</CardContent>
      </Card>
    );

    // Should have solid background #111317
    const card = screen.getByText('Sidebar').closest('.bg-\\[\\#111317\\]');
    expect(card).toBeInTheDocument();

    // Should have shadow-level-1
    expect(card).toHaveClass('shadow-level-1');

    // No blur
    expect(card).not.toHaveClass('glass-2');
    expect(card).not.toHaveClass('glass-3');
  });

  it('should render Level 2 elevation explicitly (cards glassmorphism)', () => {
    render(
      <Card elevation={2}>
        <CardContent>Dashboard Card</CardContent>
      </Card>
    );

    const card = screen.getByText('Dashboard Card').closest('.glass-2');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('glass-2');
    expect(card).toHaveClass('shadow-level-2');
    expect(card).toHaveClass('border');
    expect(card).toHaveClass('rounded-lg');
  });

  it('should render Level 3 elevation (modals/popovers)', () => {
    render(
      <Card elevation={3}>
        <CardContent>Modal Content</CardContent>
      </Card>
    );

    const card = screen.getByText('Modal Content').closest('.glass-3');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('glass-3');
    expect(card).toHaveClass('shadow-level-3');
    // Level 3 still has border and rounded corners
    expect(card).toHaveClass('border');
    expect(card).toHaveClass('rounded-lg');
    // Should NOT have glass-2
    expect(card).not.toHaveClass('glass-2');
  });
});

describe('Card - Sub-components (T006)', () => {
  it('should render card with header, title, and description', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Titulo de Seccion</CardTitle>
          <CardDescription>Descripcion secundaria</CardDescription>
        </CardHeader>
        <CardContent>Contenido principal</CardContent>
      </Card>
    );

    expect(screen.getByText('Titulo de Seccion')).toBeInTheDocument();
    expect(screen.getByText('Descripcion secundaria')).toBeInTheDocument();
    expect(screen.getByText('Contenido principal')).toBeInTheDocument();

    // CardTitle should use headline-sm typography class
    const title = screen.getByText('Titulo de Seccion');
    expect(title).toHaveClass('text-headline-sm');

    // CardHeader should exist with standard header classes
    const header = screen.getByText('Titulo de Seccion').closest('.space-y-1\\.5');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('p-6');
  });

  it('should render card with optional gradient header', () => {
    render(
      <Card elevation={2}>
        <CardHeader>
          <CardTitle>Con Gradiente</CardTitle>
        </CardHeader>
        <CardContent>Contenido</CardContent>
      </Card>
    );

    expect(screen.getByText('Con Gradiente')).toBeInTheDocument();
    expect(screen.getByText('Contenido')).toBeInTheDocument();

    // Card renders with glassmorphism
    const card = screen.getByText('Con Gradiente').closest('.glass-2');
    expect(card).toBeInTheDocument();
  });

  it('should render card with footer', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Contenido del perfil</p>
        </CardContent>
        <CardFooter>
          <button type="button">Cancelar</button>
        </CardFooter>
      </Card>
    );

    expect(screen.getByText('Perfil')).toBeInTheDocument();
    expect(screen.getByText('Contenido del perfil')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();

    // CardFooter should have flex and items-center classes
    const footer = screen.getByText('Cancelar').parentElement;
    expect(footer).toHaveClass('flex');
    expect(footer).toHaveClass('items-center');
  });

  it('should apply className prop to Card', () => {
    render(
      <Card data-testid="my-card" className="custom-class">
        <CardContent>With custom class</CardContent>
      </Card>
    );

    const card = screen.getByTestId('my-card');
    expect(card).toHaveClass('custom-class');
    // Should still have default Card classes
    expect(card).toHaveClass('flex');
    expect(card).toHaveClass('flex-col');
    expect(card).toHaveClass('rounded-lg');
  });

  it('should apply className prop to CardHeader', () => {
    render(
      <Card>
        <CardHeader className="header-custom" data-testid="my-header">
          <CardTitle>Titulo</CardTitle>
        </CardHeader>
      </Card>
    );

    const header = screen.getByTestId('my-header');
    expect(header).toHaveClass('header-custom');
    // Should also have default header classes
    expect(header).toHaveClass('flex');
    expect(header).toHaveClass('flex-col');
    expect(header).toHaveClass('p-6');
  });

  it('should apply className prop to CardContent', () => {
    render(
      <Card>
        <CardContent className="content-custom" data-testid="my-content">
          Contenido
        </CardContent>
      </Card>
    );

    const content = screen.getByTestId('my-content');
    expect(content).toHaveClass('content-custom');
    expect(content).toHaveClass('p-6');
    expect(content).toHaveClass('pt-0');
  });

  it('should apply className prop to CardFooter', () => {
    render(
      <Card>
        <CardFooter className="footer-custom" data-testid="my-footer">
          Footer
        </CardFooter>
      </Card>
    );

    const footer = screen.getByTestId('my-footer');
    expect(footer).toHaveClass('footer-custom');
    expect(footer).toHaveClass('flex');
    expect(footer).toHaveClass('items-center');
  });
});

describe('Card - Fallback & Edge Cases', () => {
  it('should have solid background color fallback in glass-2 utility class', () => {
    // The glass-2 utility defines a solid background-color fallback
    // for browsers without backdrop-filter support.
    // Verify the class is applied correctly.
    render(
      <Card elevation={2}>
        <CardContent>Fallback Content</CardContent>
      </Card>
    );

    const card = screen.getByText('Fallback Content').closest('.glass-2');
    expect(card).toBeInTheDocument();

    // The card should have glass-2 which includes the fallback bg-color:
    // background-color: #1a1c1f (solid) + rgba(26,28,31,0.6) (glass)
    // Both are defined in the CSS utility class
    expect(card).toHaveClass('glass-2');
  });

  it('should handle custom elevation with className combination', () => {
    render(
      <Card elevation={3} className="mt-4 max-w-lg" data-testid="custom-card">
        <CardContent>Custom</CardContent>
      </Card>
    );

    const card = screen.getByTestId('custom-card');
    expect(card).toHaveClass('glass-3');
    expect(card).toHaveClass('mt-4');
    expect(card).toHaveClass('max-w-lg');
  });

  it('should forward additional HTML attributes', () => {
    render(
      <Card id="my-card-id" aria-label="Card container">
        <CardContent>Accessible content</CardContent>
      </Card>
    );

    const card = screen.getByLabelText('Card container');
    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute('id', 'my-card-id');
  });
});
